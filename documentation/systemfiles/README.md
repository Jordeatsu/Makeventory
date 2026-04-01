[🏠 Documentation Home](../README.md)

---

# Systemfiles Documentation

Shell scripts that control the running state of the application in both production and development environments.

---

## Production Scripts

Run from the repository root. Manage the main Node.js processes.

| File | Command | What it does |
|---|---|---|
| [start.sh](start-sh.md) | `./start.sh` | Starts the main server and client build watcher |
| [stop.sh](stop-sh.md) | `./stop.sh` | Gracefully stops all running application processes |
| [restart.sh](restart-sh.md) | `./restart.sh` | Stops then immediately starts (calls stop + start) |

---

## Development Scripts (`dev/`)

Run from the repository root. Manage the dev-mode processes with hot reload.

| File | Command | What it does |
|---|---|---|
| [dev/start.sh](dev/start-sh.md) | `./dev/start.sh` | Starts server + client in dev mode (watch mode, HMR) |
| [dev/stop.sh](dev/stop-sh.md) | `./dev/stop.sh` | Stops all dev-mode processes |
| [dev/restart.sh](dev/restart-sh.md) | `./dev/restart.sh` | Stops then starts dev mode |
