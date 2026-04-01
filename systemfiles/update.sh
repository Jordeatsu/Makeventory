#!/usr/bin/env bash
# update.sh — restarts the app after an in-app update.
# Called by the Node /system/update route AFTER it has already run:
#   git reset --hard <tag>  +  npm install  +  npm run build
# So this script only needs to kill the old processes and start fresh ones.
# It intentionally does NOT open a browser — the existing tab reloads itself
# via the polling logic in AppUpdateBanner.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── OS detection ─────────────────────────────────────────────────────────────
detect_os() {
    case "$(uname -s 2>/dev/null)" in
        Darwin*)
            echo "mac"
        ;;
        Linux*)
            echo "linux"
        ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "windows"
        ;;
        *)
            echo "unix"
        ;;
    esac
}

OS=$(detect_os)

# ── Kill any process bound to a TCP port ─────────────────────────────────────
kill_port() {
    local port="$1"
    if command -v lsof &>/dev/null; then
        lsof -ti ":${port}" 2>/dev/null | xargs kill -9 2>/dev/null || true
    elif [[ "$OS" == "windows" ]]; then
        powershell -Command "\
            \$c = Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue;\
            if (\$c) { Stop-Process -Id \$c.OwningProcess -Force -ErrorAction SilentlyContinue }\
            " 2>/dev/null || true
    fi
}

echo "🔄 Restarting Makeventory after update..."

# ── Install dependencies (ensures node_modules are current after any update) ──
echo "  → Installing dependencies..."
cd "$ROOT_DIR/server" && npm install --prefer-offline
cd "$ROOT_DIR/client" && npm install --prefer-offline --include=dev

# ── Build client ──────────────────────────────────────────────────────────────
echo "  → Building client..."
cd "$ROOT_DIR/client"
npm run build

# ── Clear any stale processes on our ports ───────────────────────────────────
kill_port 3000
kill_port 5001

# ── MongoDB: ensure it is running (may already be up) ────────────────────────
mongo_mode() {
    if command -v docker &>/dev/null && docker inspect mongodb &>/dev/null 2>&1; then
        echo "docker"
    else
        echo "local"
    fi
}
MONGO_MODE=$(mongo_mode)
echo "  → Ensuring MongoDB is running (${MONGO_MODE})..."
if [[ "$MONGO_MODE" == "docker" ]]; then
    docker start mongodb 2>/dev/null || true
else
    case "$OS" in
        mac)
            if command -v brew &>/dev/null; then
                brew services start mongodb-community 2>/dev/null || true
            else
                mongod --fork --logpath /tmp/makeventory-mongod.log 2>/dev/null || true
            fi
        ;;
        linux)
            sudo systemctl start mongod 2>/dev/null ||
            sudo service mongod start 2>/dev/null ||
            mongod --fork --logpath /tmp/makeventory-mongod.log 2>/dev/null || true
        ;;
        windows)
            net start MongoDB 2>/dev/null || true
        ;;
        *)
            mongod --fork --logpath /tmp/makeventory-mongod.log 2>/dev/null || true
        ;;
    esac
fi
sleep 2

# ── API Server ────────────────────────────────────────────────────────────────
echo "  → Starting API server (port 5001)..."
cd "$ROOT_DIR/server"
if command -v nohup &>/dev/null; then
    nohup env PORT=5001 NODE_ENV=production npm start > "$ROOT_DIR/logs/server.log" 2>&1 &
else
    env PORT=5001 NODE_ENV=production npm start > "$ROOT_DIR/logs/server.log" 2>&1 &
fi
echo $! > "$ROOT_DIR/logs/server.pid"

# ── Client (vite preview) ─────────────────────────────────────────────────────
echo "  → Serving client build (port 3000)..."
cd "$ROOT_DIR/client"
if command -v nohup &>/dev/null; then
    nohup npm run preview > "$ROOT_DIR/logs/client.log" 2>&1 &
else
    npm run preview > "$ROOT_DIR/logs/client.log" 2>&1 &
fi
echo $! > "$ROOT_DIR/logs/client.pid"

echo ""
echo "✅ Makeventory restarted successfully."
echo "   Logs: logs/server.log | logs/client.log"
