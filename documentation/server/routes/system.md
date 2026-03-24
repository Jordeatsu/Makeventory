[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/system.js

## What is this file?

Handles **system-level operations** — specifically checking for application updates on GitHub and applying them.

These routes are restricted to **admin users only** because they execute code on the server.

## Routes

### `GET /api/system/update-check`

**Authentication required:** Yes + Admin only.

**Purpose:** Checks whether a newer release version of Makeventory is available on GitHub.

**How it works:**
1. Calls the GitHub Releases API to find the latest release tag (e.g. `v0.3.0`)
2. Runs `git fetch --tags` on the server to ensure the local repo knows about all tags
3. Compares the SHA (commit hash) of the current running code against the latest GitHub release
4. Returns whether the app is up to date, and what the current/remote version tags are

**Returns:**
```json
{
  "upToDate": false,
  "currentTag": "v0.2.0",
  "remoteTag": "v0.3.0"
}
```

**Note:** Using SHA comparison (rather than version string comparison) means even if multiple tags point to the same commit, it won't falsely report an update as available.

---

### `POST /api/system/update`

**Authentication required:** Yes + Admin only.

**Purpose:** Applies the latest release — pulls the new code from GitHub, installs dependencies, builds the client, then restarts the server.

**What it does step-by-step:**
1. Fetches the latest release tag from GitHub API
2. `git fetch --tags`
3. `git checkout main`
4. `git reset --hard <latestTag>` — moves the code to the exact release commit
5. `npm install` in the `server/` directory
6. `npm install --include=dev` in the `client/` directory
7. `npm run build` in the `client/` directory (builds the React app for production)
8. Sends `{ ok: true }` to the front-end
9. Spawns `systemfiles/start.sh` as a **detached background process** — fully independent of the current Node.js process
10. The `start.sh` script kills the old server process and starts the new one

**Why the detached spawn?** The update script needs to kill and restart the Node.js process that is currently running. If the restart command was tied to the current process, killing the process would also kill the restart command. By using `nohup` and a detached child process, the restart survives the parent process being killed.

**Cross-platform:** The spawn code handles macOS/Linux (`nohup bash`) and Windows (`cmd.exe /C start /B bash`) differently.

## Security considerations

- Both routes require both `requireAuth` and `requireAdmin` — non-admins cannot trigger updates
- `git reset --hard` is destructive — it discards any local uncommitted changes
- Only fetches from the official Makeventory GitHub repository

## Relationship to other files

- Used by `AppUpdateBanner.jsx` in the client — polls the update-check endpoint every 10 minutes
- Depends on `systemfiles/start.sh` for the restart mechanism
- Requires git to be installed on the server
