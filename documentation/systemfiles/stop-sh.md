[🏠 Home](../README.md) · [↑ Systemfiles](README.md)

---

# systemfiles/stop.sh

## What does this file do?

This is the **production stop script** for Makeventory. Running this script gracefully shuts down all parts of the running application — the React client server, the API server, and the MongoDB database.

Run this when you want to close down Makeventory at the end of the day or before restarting.

---

## Key Concepts

### Graceful Shutdown
Rather than just cutting power to everything, this script tries to stop processes in a polite, ordered way using their saved process IDs (PIDs). If that doesn't work, it falls back to more forceful methods.

### PID File
When the application starts, `start.sh` saves the process IDs of the running services to `logs/server.pid` and `logs/client.pid`. This script reads those files to know exactly which processes to stop. If the PID files don't exist (perhaps they were manually deleted), the script falls back to pattern-matching (`pkill`) to find and stop the processes.

### `|| true`
Many commands in this script end with `|| true`. This means "even if this command fails (e.g., the process is already stopped), continue without error." This makes the stop script safe to run multiple times without crashing.

---

## What the Script Does — Step by Step

### 1. Detect the Operating System
Same OS detection as `start.sh` — determines macOS, Linux, Windows, or Unix to use the right commands.

### 2. Stop the React Client
1. Reads `logs/client.pid` to find the client's process ID
2. Sends a stop signal to that process (`kill PID`)
3. Deletes the PID file
4. As a fallback, also runs `pkill -f "vite preview"` in case the PID file approach missed anything

### 3. Stop the API Server
1. Reads `logs/server.pid` to find the server's process ID
2. Sends a stop signal to that process
3. Deletes the PID file
4. As a fallback, also runs `pkill -f "node server.js"` and `pkill -f "nodemon server.js"`

### 4. Stop MongoDB
Detects whether MongoDB is Docker-managed or locally installed, then stops it using the appropriate OS command:

| Method | macOS | Linux | Windows |
|---|---|---|---|
| Docker | `docker stop mongodb` | — | — |
| Homebrew | `brew services stop mongodb-community` | — | — |
| Systemd | — | `systemctl stop mongod` | — |
| Windows Service | — | — | `net stop MongoDB` |
| Fallback | `pkill -x mongod` | `pkill -x mongod` | `pkill -x mongod` |

### 5. Clear Ports
Runs `kill_port` on ports 3000 and 5001 as a final cleanup, to ensure no lingering process holds those ports open.

---

## Helper Functions

The same three helper functions appear in all the systemfiles scripts:

### `detect_os()`
Returns `mac`, `linux`, `windows`, or `unix`.

### `mongo_mode()`
Returns `"docker"` if the `mongodb` Docker container exists, otherwise `"local"`.

### `kill_port(port)`
Kills any process bound to the specified port number.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/start.sh` | Creates the processes that this script stops |
| `systemfiles/restart.sh` | Calls this script, then calls `start.sh` |
| `systemfiles/dev/stop.sh` | The equivalent script for development mode |
| `logs/server.pid` | Read by this script to find the API server process |
| `logs/client.pid` | Read by this script to find the client server process |
