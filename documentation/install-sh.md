[🏠 Home](README.md)

---

# install.sh (root)

## What does this file do?

This is the **entry point for installing Makeventory** — it's the very first script you run on a fresh machine. When you run `./install.sh` from the terminal, this script:

1. Checks that Node.js is available
2. Installs the install wizard's own dependencies
3. Builds the install wizard's React interface
4. Launches the install wizard server on port 3000
5. Opens the browser to the wizard automatically
6. Waits for you to complete the wizard
7. Once you finish, launches the main application in production mode

Think of it as the "setup assistant" — the single command that takes you from a fresh download to a fully running application.

---

## Key Concepts

### Bash Script
A shell script (`.sh` file) is a text file containing a sequence of terminal commands. Running `./install.sh` executes those commands in order. The `#!/usr/bin/env bash` line at the top tells the operating system which interpreter to use.

### `set -e`
This safety option at the top of the script means "stop immediately if any command fails." Without it, the script might silently continue even if a critical step (like building the UI) failed.

### Background Process (`&`)
The `&` at the end of `node server.js &` starts the server in the background, so the script can continue executing while the server runs. The PID (process ID) is saved as `SERVER_PID`.

### `wait $SERVER_PID`
After opening the browser, the script waits here until the installer server process exits. The installer server exits automatically once installation is complete (or you kill it). This means the root `install.sh` doesn't move to the next step until the wizard is done.

---

## Prerequisites Checked

The script checks for **Node.js** before doing anything else:
```bash
if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js is not installed."
    exit 1
fi
```

If Node.js isn't installed, it prints an error and stops. You need Node.js v18 or later from [nodejs.org](https://nodejs.org).

MongoDB is not checked here — that's handled inside the wizard by the `DatabaseStep` component.

---

## What the Script Does — Step by Step

### 1. Detect the Operating System
Same OS detection as all the other scripts: `mac`, `linux`, `windows`, or `unix`.

### 2. Check Node.js Is Installed
Exits with an error if `node` isn't found in the system path.

### 3. Install Install Wizard Dependencies
```bash
cd install && npm install --silent
```
Installs the packages that the install wizard itself needs to run (its own `node_modules`). The `client/` and `server/` node_modules are installed later, by the wizard's server in the background.

### 4. Build the Install Wizard UI
```bash
cd install && npm run build
```
Compiles the install wizard's React interface into static files in `install/dist/`. These are what the installer server will serve to the browser.

### 5. Start the Install Wizard Server
```bash
MAKEVENTORY_OS="$OS" node server.js &
SERVER_PID=$!
```
Starts the Express server from `install/server.js` in the background on port 3000. Sets the `MAKEVENTORY_OS` environment variable so the server knows what OS it's running on.

### 6. Wait for the Server to Be Ready
The script pings `http://localhost:3000/api/ping` every second for up to 15 seconds, waiting for the server to respond. This prevents opening the browser before the server is ready to serve the page.

### 7. Open the Browser
Opens `http://localhost:3000` in your default browser.

### 8. Wait for Installation to Complete
```bash
wait $SERVER_PID
```
The script pauses here until the install wizard server exits. The wizard server exits after you complete all seven setup steps.

### 9. Launch the Main Application
```bash
bash "$SCRIPT_DIR/systemfiles/start.sh"
```
Once the installer server exits (installation complete), this line automatically starts the full Makeventory application in production mode.

---

## How to Run It

```bash
chmod +x install.sh
./install.sh
```

- `chmod +x` makes the file executable (only needed once)
- `./install.sh` runs it

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/server.js` | The server this script starts |
| `install/src/App.jsx` | The wizard UI rendered in the browser |
| `systemfiles/start.sh` | Called automatically after installation completes |
| `README.md` | Documents how to run this script |
