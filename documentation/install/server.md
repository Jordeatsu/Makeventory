[🏠 Home](../README.md) · [↑ Install Wizard](README.md)

---

# install/server.js

## What does this file do?

This is the **backend server for the install wizard**. It is a small, temporary Node.js/Express web server that runs only during the installation process (on port 3000). Once the installation is complete, this server is no longer needed — the main Makeventory application has its own separate server.

Think of it as the "installer program" you'd run before using a piece of software. It:

1. Automatically installs Node.js packages (dependencies) for all three parts of the app (the installer itself, the client, and the server).
2. Streams real-time progress back to the browser so you can see what's happening.
3. Handles all the setup API calls made by the install wizard steps (database creation, user creation, business profile, etc.).
4. Serves the install wizard's web interface.

---

## Key Concepts

### Express
Express is a framework that makes it easy to build web servers in Node.js. You define "routes" (URL paths) and what happens when someone visits them.

### SSE (Server-Sent Events)
This is a browser technology that keeps a connection open between the browser and the server so the server can push updates in real time — like a live progress feed. It's one-directional (server → browser only). Used here to show npm install progress.

### `child_process.spawn`
A Node.js built-in that lets you run shell commands (like `npm install`) from inside a JavaScript file, and stream the output.

### Port
A number that identifies which program on the server should receive a network request. The install server listens on port 3000.

---

## File Structure

```
install/server.js
```

This is a single file — the entire install back-end lives here.

---

## How It Starts Up

When the install wizard launches (via `install.sh`), this file is run with Node.js. On startup it:

1. Checks whether port 3000 is available using `checkPort()`.
2. Immediately spawns `npm install` for both `client/` and `server/` directories in the background.
3. Starts the Express server and begins listening for requests.

---

## Important Functions

### `checkPort(port)`
- **What it does:** Tests whether a given port number is available by briefly trying to bind to it.
- **Returns:** A Promise that resolves to `true` (port is free) or `false` (port is in use).
- **Used for:** Making sure the install server can actually start on port 3000.

### `broadcast(data)`
- **What it does:** Sends a JSON message to all browsers currently connected to the SSE endpoint.
- **Parameters:** `data` — a JavaScript object that gets converted to JSON.
- **Used for:** Pushing npm install progress updates to the browser.

---

## API Routes

### `GET /`
Serves the install wizard's HTML/JavaScript interface (the built React app from `install/dist/`).

### `GET /api/npm-progress`
**SSE Endpoint** — opens a long-lived connection and streams JSON messages as npm install progresses.

Each message looks like:
```json
{
  "install": { "status": "complete" },
  "client":  { "status": "running" },
  "server":  { "status": "pending" }
}
```

Statuses: `"pending"` → `"running"` → `"complete"` or `"error"`.

The browser (specifically the `DependenciesStep` component) listens to this stream and updates the progress bars in real time.

### `POST /api/*` (all other API routes)
These handle calls from the install wizard steps:
- Database creation
- Admin account creation
- Business profile creation
- Module configuration
- Installation completion flag

These mirror the main application's API but are served by this small temporary server.

---

## Configuration

| Setting | Value |
|---|---|
| Port | 3000 |
| JSON body size limit | 10 MB (to accommodate base64-encoded logo images) |
| Static files | Served from `install/dist/` (the compiled React app) |

---

## OS Detection

The server checks `process.platform` to know what operating system it's running on:
- `darwin` → macOS
- `linux` → Linux
- `win32` → Windows

This is used to adjust any system-level commands that differ between operating systems.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | The React wizard that talks to this server |
| `install/src/api.js` | Defines all the API calls the wizard makes to this server |
| `install/src/components/DependenciesStep.jsx` | Connects to the `/api/npm-progress` SSE stream |
| `server/` | Gets `npm install` run on it by this file at startup |
| `client/` | Gets `npm install` run on it by this file at startup |

---

## Lifecycle

```
install.sh runs
    → starts install/server.js
        → spawns npm install for client/ and server/
        → listens on port 3000
        → serves the wizard UI
        → handles API calls from wizard
            → database created
            → admin account created
            → business profile saved
            → modules configured
            → install marked complete
    → install server is no longer needed
```

Once the user completes all wizard steps, the install wizard marks the installation as complete, and the main application can be started with `start.sh`.
