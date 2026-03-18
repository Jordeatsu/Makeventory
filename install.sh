#!/usr/bin/env bash
set -e

# ─── Detect OS ───────────────────────────────────────────────────────────────
detect_os() {
  case "$(uname -s 2>/dev/null)" in
    Darwin*)             echo "mac" ;;
    Linux*)              echo "linux" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *)                   echo "unix" ;;
  esac
}

open_browser() {
  local url="$1"
  case "$OS" in
    mac)     open "$url" ;;
    linux)   xdg-open "$url" 2>/dev/null || sensible-browser "$url" 2>/dev/null || echo "Open $url in your browser." ;;
    windows) cmd.exe /c start "$url" 2>/dev/null || echo "Open $url in your browser." ;;
    *)       xdg-open "$url" 2>/dev/null || echo "Open $url in your browser." ;;
  esac
}

OS=$(detect_os)
echo "Detected OS: $OS"

# ─── Require Node.js ─────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo ""
  echo "ERROR: Node.js is not installed."
  echo "Please install it from https://nodejs.org and re-run this script."
  exit 1
fi

# ─── Resolve script directory ────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ─── Install installer dependencies only (client & server are handled by the server) ──
echo ""
echo "Installing installer dependencies..."
cd "$SCRIPT_DIR/install" && npm install --silent

# ─── Build installer UI ──────────────────────────────────────────────────────
echo ""
echo "Building installer UI..."
cd "$SCRIPT_DIR/install" && npm run build

# ─── Start installer server ──────────────────────────────────────────────────
echo ""
echo "Starting installation wizard..."
cd "$SCRIPT_DIR/install"
MAKEVENTORY_OS="$OS" node server.js &
SERVER_PID=$!

# Wait for server to become ready (up to 15 seconds)
echo "Waiting for installer to be ready..."
for i in $(seq 1 15); do
  if node -e "
    const http = require('http');
    http.get('http://localhost:3001/api/ping', () => process.exit(0))
        .on('error', () => process.exit(1));
  " 2>/dev/null; then
    break
  fi
  sleep 1
done

# ─── Open browser ────────────────────────────────────────────────────────────
echo "Opening installer in your browser at http://localhost:3001"
open_browser "http://localhost:3001"

# Keep script alive until the installer server exits (user completes setup)
wait $SERVER_PID
echo ""
echo "Installation complete. You can now start Makeventory."
