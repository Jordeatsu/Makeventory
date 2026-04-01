[🏠 Home](../../README.md) · [↑ Systemfiles](../README.md)

---

# systemfiles/dev/restart.sh

## What does this file do?

This is the **development restart script** for Makeventory. It stops the running development environment, waits 3 seconds, and starts it again.

It's a convenience wrapper that saves you from running `dev/stop.sh` and `dev/start.sh` separately.

---

## When to Use It

- When you want a completely clean restart of the development environment
- After changing environment variables or configuration that requires a full restart
- When processes seem stuck and a fresh start is needed (even though `nodemon` and HMR normally handle code changes automatically)

---

## What the Script Does

```bash
bash "$SCRIPT_DIR/stop.sh"
sleep 3
bash "$SCRIPT_DIR/start.sh"
```

1. Runs `dev/stop.sh` — stops the Vite dev server, nodemon API server, and MongoDB
2. Waits 3 seconds — allows ports and processes to fully release
3. Runs `dev/start.sh` — starts everything back up in development mode

---

## Note on Automatic Reloading

In most development workflows, you won't need to use this script often:
- **Code changes to React files** → Vite's HMR automatically updates the browser
- **Code changes to server files** → nodemon automatically restarts the server

Use the restart script for configuration-level changes, or when HMR/nodemon becomes unresponsive.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/dev/stop.sh` | Called first by this script |
| `systemfiles/dev/start.sh` | Called second by this script |
| `systemfiles/restart.sh` | The production equivalent |
