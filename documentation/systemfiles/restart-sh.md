[🏠 Home](../README.md) · [↑ Systemfiles](README.md)

---

# systemfiles/restart.sh

## What does this file do?

This is the **production restart script** for Makeventory. It stops everything, waits 3 seconds for processes to fully exit, and then starts everything again.

It's a convenience wrapper — instead of running `stop.sh` and then `start.sh` manually, you can just run `restart.sh`.

---

## When to Use It

Run this script when:
- You've made a change to the application and want to pick up the new version
- Something isn't responding correctly and you want a clean restart
- You've updated settings that require a restart to take effect

---

## What the Script Does

```bash
bash "$SCRIPT_DIR/stop.sh"
sleep 3
bash "$SCRIPT_DIR/start.sh"
```

1. Runs `stop.sh` — stops the client, API server, and MongoDB
2. Waits 3 seconds — gives the operating system time to fully release the ports and clean up processes
3. Runs `start.sh` — restarts everything (including rebuilding the React client)

---

## The 3-Second Wait

The `sleep 3` is important. If `start.sh` tried to bind to port 3000 or 5001 immediately after `stop.sh` released them, the OS might not have finished freeing those ports yet, causing a "port already in use" error. The brief pause prevents this.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `systemfiles/stop.sh` | Called first by this script |
| `systemfiles/start.sh` | Called second by this script |
| `systemfiles/dev/restart.sh` | The equivalent script for development mode |
