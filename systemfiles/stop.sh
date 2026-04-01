#!/usr/bin/env bash

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

# ── MongoDB: Docker container 'mongodb' vs local install ─────────────────────
mongo_mode() {
    if command -v docker &>/dev/null && docker inspect mongodb &>/dev/null 2>&1; then
        echo "docker"
    else
        echo "local"
    fi
}

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

echo "🛑 Stopping Makeventory (production)..."

# ── React Client ──────────────────────────────────────────────────────────────
if [[ -f "$ROOT_DIR/logs/client.pid" ]]; then
    CLIENT_PID=$(cat "$ROOT_DIR/logs/client.pid")
    echo "  → Stopping React client (PID $CLIENT_PID)..."
    kill "$CLIENT_PID" 2>/dev/null || true
    rm -f "$ROOT_DIR/logs/client.pid"
else
    echo "  → No client PID file found — trying pkill..."
fi
pkill -f "node_modules/.bin/vite preview" 2>/dev/null || true
pkill -f "vite preview" 2>/dev/null || true

# ── API Server ────────────────────────────────────────────────────────────────
if [[ -f "$ROOT_DIR/logs/server.pid" ]]; then
    SERVER_PID=$(cat "$ROOT_DIR/logs/server.pid")
    echo "  → Stopping API server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    rm -f "$ROOT_DIR/logs/server.pid"
else
    echo "  → No server PID file found — trying pkill..."
fi
pkill -f "nodemon server.js" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_MODE=$(mongo_mode)
echo "  → Stopping MongoDB (${MONGO_MODE})..."

if [[ "$MONGO_MODE" == "docker" ]]; then
    docker stop mongodb 2>/dev/null || true
else
    case "$OS" in
        mac)
            if command -v brew &>/dev/null; then
                brew services stop mongodb-community 2>/dev/null || true
            else
                pkill -x mongod 2>/dev/null || true
            fi
        ;;
        linux)
            sudo systemctl stop mongod 2>/dev/null ||
            sudo service mongod stop 2>/dev/null ||
            pkill -x mongod 2>/dev/null || true
        ;;
        windows)
            net stop MongoDB 2>/dev/null || true
        ;;
        *)
            pkill -x mongod 2>/dev/null || true
        ;;
    esac
fi

# ── Clear ports (catch anything leftover) ────────────────────────────────────
echo "  → Clearing ports 3000 and 5001..."
kill_port 3000
kill_port 5001

echo ""
echo "✅ Makeventory stopped."
