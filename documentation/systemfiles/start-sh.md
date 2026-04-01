[🏠 Home](../README.md) · [↑ Systemfiles](README.md)

---

# systemfiles/start.sh

## What does this file do?

This is the **production start script** for Makeventory. Running this script starts the entire application stack — the database, the API server, and the client — and opens the app in your browser automatically.

It is the script you run in your day-to-day use of Makeventory when you want to launch the application for actual work (as opposed to development/testing, which uses a different script).

---

## Key Concepts

### Bash Script
This file is a shell script written in Bash (a common scripting language for Unix/macOS/Linux terminals). It runs a sequence of commands automatically, so you don't have to start each part of the application manually.

### Production Mode
"Production" means the application is running the way real users should use it — with an optimised, pre-built version of the React front end. The React code is compiled into plain HTML, CSS, and JavaScript files before being served, which makes it faster and more efficient than development mode.

### `set -e`
This is a safety option at the top of the script. It means "stop immediately if any command fails." Without this, a script might silently continue even after an important step (like the database starting) has failed.

### PID File
A PID (Process ID) file stores the unique number assigned to a running process by the operating system. Scripts save PIDs to files so they can later stop those specific processes. This script saves PIDs to `logs/server.pid` and `logs/client.pid`.

---

## What the Script Does — Step by Step

### 1. Detect the Operating System
Determines whether we're on macOS (`mac`), Linux (`linux`), Windows (`windows`), or another Unix system (`unix`). Used throughout to pick the right command for each OS.

### 2. Install Dependencies
Runs `npm install` in both `server/` and `client/` to make sure all packages are up to date. Uses `--prefer-offline` to use cached packages when possible (faster).

### 3. Build the React Client
Runs `npm run build` in `client/`. This compiles the React application into static HTML/CSS/JS files in `client/dist/`. This step is what makes it "production mode."

### 4. Clear Stale Ports
Kills any processes already occupying ports 3000 or 5001, so the app can start cleanly.

### 5. Start MongoDB
Detects whether MongoDB is managed by Docker or installed locally, then starts it using the appropriate command for the current OS:

| Method | macOS | Linux | Windows |
|---|---|---|---|
| Docker | `docker start mongodb` | — | — |
| Homebrew | `brew services start mongodb-community` | — | — |
| Systemd | — | `systemctl start mongod` | — |
| Service | — | `service mongod start` | — |
| Windows Service | — | — | `net start MongoDB` |
| Fallback | `mongod --fork ...` | `mongod --fork ...` | `mongod --fork ...` |

### 6. Start the API Server
Starts `server/server.js` with `NODE_ENV=production` on port 5001.
- Uses `nohup` to keep it running after the terminal closes
- Logs output to `logs/server.log`
- Saves the process ID to `logs/server.pid`

### 7. Start the Client Server
Runs `npm run preview` in `client/` — Vite's production preview server that serves the pre-built files on port 3000.
- Uses `nohup` to keep it running after the terminal closes
- Logs output to `logs/client.log`
- Saves the process ID to `logs/client.pid`

### 8. Open the Browser
Automatically opens `http://<your-local-ip>:3000` in your default web browser.

### 9. Print a Summary
Displays the URLs for the app and API, and reminds you how to stop the application.

---

## Helper Functions

### `detect_os()`
Uses `uname -s` to determine the operating system. Returns a short string: `mac`, `linux`, `windows`, or `unix`.

### `open_browser(url)`
Opens a URL in the default browser using the OS-appropriate command:
- macOS: `open`
- Linux: `xdg-open` or `sensible-browser`
- Windows: `cmd.exe /c start`

### `mongo_mode()`
Returns `"docker"` if Docker is installed and the `mongodb` container exists, otherwise returns `"local"`. Used to determine how MongoDB should be started/stopped.

### `kill_port(port)`
Kills any process currently bound to the given port number. Uses `lsof` on Unix/macOS, or PowerShell on Windows.

### `get_ip()`
Attempts to find your machine's local network IP address (e.g., `192.168.1.10`). Falls back to `localhost`. Used to construct the app URL shown at the end of startup.

---

## Ports Used

| Port | Service |
|---|---|
| 3000 | React client (Vite preview) |
| 5001 | Node.js API server |
| 27017 | MongoDB (managed separately) |

---

## Log Files

| File | Contents |
|---|---|
| `logs/server.log` | API server output |
| `logs/client.log` | React client server output |
| `logs/server.pid` | PID of the running API server |
| `logs/client.pid` | PID of the running React client server |

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/stop.sh` | Stops everything this script starts |
| `systemfiles/restart.sh` | Calls `stop.sh` then `start.sh` |
| `systemfiles/dev/start.sh` | The equivalent script for development mode |
| `install.sh` | The script run before this one, during initial setup |
| `server/server.js` | The API server process that this script starts |
| `client/` | The React app that this script builds and serves |
