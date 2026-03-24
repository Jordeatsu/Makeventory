[🏠 Home](../../README.md) · [↑ Systemfiles](../README.md)

---

# systemfiles/dev/start.sh

## What does this file do?

This is the **development start script** for Makeventory. It starts the application in "development mode" — a special configuration that makes it easier and faster to work on the code.

Unlike the production `start.sh`, this script does **not** build the React app first. Instead, it runs Vite's development server which:
- Serves the React application directly from source files
- Automatically refreshes the browser when you save a code change (Hot Module Replacement / HMR)
- Shows detailed error messages in the browser

Similarly, the API server runs with `nodemon` which automatically restarts the server whenever you save a server-side code file.

---

## Key Concepts

### Development Mode vs Production Mode

| Feature | Production (`start.sh`) | Development (`dev/start.sh`) |
|---|---|---|
| React build | Pre-built (compile step required) | No build — served live from source |
| Browser refresh | Manual | Automatic (Hot Module Replacement) |
| Server restart | Manual | Automatic (nodemon file watching) |
| Speed | Faster for users | Faster for developers |
| Port (client) | 3000 | 3000 |
| Port (API) | 5001 | 5001 |

### `nodemon`
A development tool that watches your server files for changes. When it detects a saved change, it automatically restarts the Node.js server. This means you can edit `server/server.js` and the changes take effect immediately without manually running stop/start.

### Hot Module Replacement (HMR)
Vite's development server watches your React source files. When you save a change, it pushes just the changed module to the browser instantly — often without even losing the current page state. This dramatically speeds up the development feedback loop.

### `nohup`
Normally, when you close a terminal, all processes started from it are killed. `nohup` (short for "no hang up") detaches the process from the terminal session so it keeps running in the background. The `&` at the end means "run in the background."

---

## What the Script Does — Step by Step

### 1. Detect OS and Set Up Helpers
Same helper functions as `start.sh`: `detect_os()`, `open_browser()`, `mongo_mode()`, `kill_port()`, `get_ip()`.

### 2. Clear Stale Ports
Kills anything on ports 3000 and 5001 from a previous session.

### 3. Start MongoDB
Same logic as production — detects Docker vs local and starts MongoDB using the appropriate command for the OS.

### 4. Start the API Server (Dev Mode)
```bash
nohup env PORT=5001 NODE_ENV=development npm run dev > logs/server.log 2>&1 &
```
- `NODE_ENV=development` — tells the server it's in development mode
- `npm run dev` — runs nodemon (auto-restart on file changes)
- Logs to `logs/server.log`
- Saves PID to `logs/server.pid`

### 5. Start the React Client (Dev Mode)
```bash
nohup npm run dev > logs/client.log 2>&1 &
```
- Runs Vite's dev server with HMR
- Logs to `logs/client.log`
- Saves PID to `logs/client.pid`

### 6. Open the Browser
Automatically opens `http://<your-local-ip>:3000`.

### 7. Print a Summary
Shows:
```
✅ Makeventory is running (development)!
   API:  http://192.168.x.x:5001/api
   App:  http://192.168.x.x:3000

   Logs: logs/server.log | logs/client.log
   Run ./systemfiles/dev/stop.sh to shut everything down.
```

---

## Ports Used

| Port | Service |
|---|---|
| 3000 | React client (Vite dev server with HMR) |
| 5001 | Node.js API server (with nodemon) |

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/dev/stop.sh` | Stops everything this script starts |
| `systemfiles/dev/restart.sh` | Calls stop then start |
| `systemfiles/start.sh` | The production equivalent |
| `server/package.json` | Defines the `npm run dev` command (nodemon) |
| `client/package.json` | Defines the `npm run dev` command (Vite dev server) |
