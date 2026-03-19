#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔄 Restarting Makeventory (development)..."
echo ""

bash "$SCRIPT_DIR/stop.sh"

echo ""
echo "  → Waiting for processes to fully stop..."
sleep 3

bash "$SCRIPT_DIR/start.sh"
