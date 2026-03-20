#!/usr/bin/env bash
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

open_browser() {
    local url="$1"
    case "$OS" in
        mac)
            open "$url"
        ;;
        linux)
            xdg-open "$url" 2>/dev/null || sensible-browser "$url" 2>/dev/null || echo "Open $url in your browser."
        ;;
        windows)
            cmd.exe /c start "$url" 2>/dev/null || echo "Open $url in your browser."
        ;;
        *)
            xdg-open "$url" 2>/dev/null || echo "Open $url in your browser."
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

# ── Resolve local IP address ─────────────────────────────────────────────────
get_ip() {
    case "$OS" in
        mac)
            ipconfig getifaddr en0 2>/dev/null ||
            ipconfig getifaddr en1 2>/dev/null ||
            echo "localhost"
        ;;
        linux)
            hostname -I 2>/dev/null | awk '{print $1}' ||
            echo "localhost"
        ;;
        windows)
            powershell -Command \
            "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { \$_.IPAddress -notmatch '^(127|169)' } | Select-Object -First 1).IPAddress" \
            2>/dev/null || echo "localhost"
        ;;
        *)
            hostname -I 2>/dev/null | awk '{print $1}' ||
            echo "localhost"
        ;;
    esac
}
IP=$(get_ip)

echo "🚀 Starting Makeventory (production)..."

# ── Install dependencies (ensures node_modules are current after any update) ──
echo "  → Installing dependencies..."
cd "$ROOT_DIR/server" && npm install --prefer-offline
cd "$ROOT_DIR/client" && npm install --prefer-offline

# ── Build client ──────────────────────────────────────────────────────────────
echo "  → Building client..."
cd "$ROOT_DIR/client"
npm run build

# ── Clear any stale processes on our ports ───────────────────────────────────
kill_port 3000
kill_port 5001

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGO_MODE=$(mongo_mode)
echo "  → Starting MongoDB (${MONGO_MODE})..."

if [[ "$MONGO_MODE" == "docker" ]]; then
    docker start mongodb
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

# ── API Server (production: node server.js) ───────────────────────────────────
echo "  → Starting API server (port 5001)..."
cd "$ROOT_DIR/server"
if command -v nohup &>/dev/null; then
    nohup env PORT=5001 NODE_ENV=production npm start > "$ROOT_DIR/logs/server.log" 2>&1 &
else
    env PORT=5001 NODE_ENV=production npm start > "$ROOT_DIR/logs/server.log" 2>&1 &
fi
echo $! > "$ROOT_DIR/logs/server.pid"

# ── Client (production: vite preview) ────────────────────────────────────────
echo "  → Serving client build (port 3000)..."
cd "$ROOT_DIR/client"
if command -v nohup &>/dev/null; then
    nohup npm run preview > "$ROOT_DIR/logs/client.log" 2>&1 &
else
    npm run preview > "$ROOT_DIR/logs/client.log" 2>&1 &
fi
echo $! > "$ROOT_DIR/logs/client.pid"


echo ""
echo "✅ Makeventory is running (production)!"
echo "   API:  http://${IP}:5001/api"
echo "   App:  http://${IP}:3000"
echo ""
echo "   Logs: logs/server.log | logs/client.log"
echo "   Run ./systemfiles/stop.sh to shut everything down."

open_browser "http://${IP}:3000"