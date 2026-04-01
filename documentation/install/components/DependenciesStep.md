[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/DependenciesStep.jsx

## What does this file do?

This is **Step 2 of the install wizard** — Installing Dependencies. It automatically runs `npm install` for the `client/` and `server/` directories of the application and shows a real-time progress display while that happens.

The user doesn't need to do anything on this step — it runs completely automatically. They just watch the progress bars fill up and then the wizard moves on when everything is done.

---

## Key Concepts

### npm install
`npm install` is a command that downloads and installs all the code libraries ("packages" or "dependencies") that an application needs to run. Before you can use a Node.js or React application, all its dependencies must be installed first.

### SSE (Server-Sent Events)
This step uses a browser technology called Server-Sent Events to receive live updates from the server. The install server (`install/server.js`) runs `npm install` in the background and broadcasts progress updates. This component connects to that stream and updates the display as messages arrive.

Think of it like a radio — the server is broadcasting, and this component is listening.

### `EventSource`
`EventSource` is the browser's built-in class for connecting to an SSE stream. The component creates one pointing at `/api/npm-progress` and listens for messages.

### `useRef` for preventing double-firing
The component uses a `useRef` to track whether `onComplete` has already been called. This prevents a bug where navigating back to this step and then forward again would fire the completion callback twice.

---

## The Three Packages Being Tracked

```js
const PACKAGES = [
  { id: "install", label: "Installer",        desc: "install/" },
  { id: "client",  label: "Client (React)",    desc: "client/" },
  { id: "server",  label: "Server (Node.js)",  desc: "server/" },
];
```

The `install/` package is always already complete when this step shows (since the install wizard itself is already running). The `client/` and `server/` packages are what actually get installed here.

---

## Sub-Component: `PackageRow`

Each of the three packages is rendered by a `PackageRow` component. It shows:
- A folder icon and the package name/path
- A status badge or icon on the right
- A progress bar at the bottom

### Visual States

| Status | Badge | Progress Bar | Background |
|---|---|---|---|
| `"pending"` | "Waiting" chip (grey) | Empty | Neutral |
| `"running"` | "Installing…" chip (blue) | Animated indeterminate | Slight blue tint |
| `"complete"` | Green check icon | Full (100%) | Slight green tint |
| `"error"` | Red error icon | Empty | Slight red tint |

### Props

| Prop | Type | Description |
|---|---|---|
| `label` | string | Human-readable package name (e.g., "Client (React)") |
| `desc` | string | The directory path (e.g., `"client/"`) |
| `status` | string | One of: `"pending"`, `"running"`, `"complete"`, `"error"` |

---

## State: `jobs`

```js
const [jobs, setJobs] = useState({
  install: { status: "complete" },
  client:  { status: "pending" },
  server:  { status: "pending" },
});
```

Each time an SSE message arrives from the server, `jobs` is updated with the new statuses for all three packages.

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `alreadyComplete` | boolean | No | If `true`, the wizard has already passed through this step. Prevents `onComplete` from being called again. |
| `onComplete` | function | Yes | Called automatically when both `client` and `server` reach `"complete"` status |

---

## How the Step Completes

This step completes **automatically** — there is no button for the user to click. When the SSE stream reports that both `client` and `server` have status `"complete"`, the component waits 900 ms and then calls `onComplete()`, advancing the wizard to Step 3.

If an error occurs, the step shows an error alert and does **not** advance. The user is instructed to re-run `./install.sh`.

---

## Cleanup

When the component unmounts (e.g., the user navigates away), the SSE connection is closed:
```js
return () => es.close();
```

This is important for preventing stale connections.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 2; provides `alreadyComplete` and `onComplete` props |
| `install/server.js` | Runs `npm install` and broadcasts progress via the `/api/npm-progress` SSE endpoint |
| `install/src/api.js` | Not directly used by this step (SSE is a raw browser API, not Axios) |
