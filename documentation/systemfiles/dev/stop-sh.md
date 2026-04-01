[🏠 Home](../../README.md) · [↑ Systemfiles](../README.md)

---

# systemfiles/dev/stop.sh

## What does this file do?

This is the **development stop script** for Makeventory. It shuts down the development version of the application — the Vite dev server, the nodemon-managed API server, and MongoDB.

It is functionally identical to the production `stop.sh`, with one key difference: it targets Vite's development server process rather than the production preview server.

---

## Difference From Production stop.sh

| Detail | `stop.sh` (production) | `dev/stop.sh` (development) |
|---|---|---|
| Client process to kill | `vite preview` | `vite` (dev server) |
| Server process to kill | `node server.js` | `nodemon server.js` |
| MongoDB handling | Identical | Identical |
| Log message | "Stopping Makeventory (production)..." | "Stopping Makeventory (development)..." |

The key difference is in the `pkill` fallback commands:
- Production targets `"vite preview"` (the built-file serving mode)
- Development targets `"node_modules/.bin/vite"` (the live source-serving mode)

---

## What the Script Does — Step by Step

### 1. Detect OS
Same `detect_os()` function as all other scripts.

### 2. Stop the React Client
1. Reads `logs/client.pid` → kills that process
2. Deletes the PID file
3. Fallback: `pkill -f "node_modules/.bin/vite"`

### 3. Stop the API Server
1. Reads `logs/server.pid` → kills that process
2. Deletes the PID file
3. Fallback: `pkill -f "nodemon server.js"` and `pkill -f "node server.js"`

### 4. Stop MongoDB
Same detection and stop logic as all other scripts — Docker or local, matched to the OS.

### 5. Clear Ports
Runs `kill_port` on ports 3000 and 5001.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/dev/start.sh` | Creates the processes that this script stops |
| `systemfiles/dev/restart.sh` | Calls this script, then calls `dev/start.sh` |
| `systemfiles/stop.sh` | The production equivalent |
| `logs/server.pid` | Read by this script to find the API server process |
| `logs/client.pid` | Read by this script to find the client dev server process |
