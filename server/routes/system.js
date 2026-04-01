import { Router } from "express";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import path from "path";

import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();
const execAsync = promisify(exec);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Allowlist: git tag names must be "v1.2.3" or "v1.2.3-suffix" style.
const SAFE_TAG_RE = /^v?\d+\.\d+(\.\d+)?(-[\w.]+)?$/;
function assertSafeTag(tag) {
    if (typeof tag !== "string" || !SAFE_TAG_RE.test(tag)) {
        throw new Error("Invalid or unsafe tag name received from GitHub API.");
    }
}

// Returns whether a newer GitHub release exists compared to the currently running tag.
// Requires admin — runs `git fetch` on the server which is a privileged operation.
router.get("/system/update-check", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const ghRes = await fetch("https://api.github.com/repos/Jordeatsu/Makeventory/releases/latest", {
            headers: { "User-Agent": "Makeventory-UpdateCheck" },
        });
        if (!ghRes.ok) return res.status(502).json({ error: "Could not reach GitHub API." });
        const { tag_name: latestTag, body: releaseBody } = await ghRes.json();
        assertSafeTag(latestTag);

        await execAsync("git fetch --tags origin", { cwd: REPO_ROOT, timeout: 30_000 });

        // Compare by SHA so multiple tags on the same commit don't trigger a false update
        // Use spawn (no shell) to avoid any risk of shell-metacharacter injection from the tag name.
        const spawnAsync = (cmd, args, opts) =>
            new Promise((resolve, reject) => {
                let stdout = "";
                const child = spawn(cmd, args, { ...opts, shell: false });
                child.stdout.on("data", (d) => {
                    stdout += d;
                });
                child.on("close", (code) => (code === 0 ? resolve({ stdout }) : reject(new Error(`${cmd} exited ${code}`))));
                child.on("error", reject);
            });
        const [{ stdout: headShaOut }, { stdout: tagShaOut }] = await Promise.all([spawnAsync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT }), spawnAsync("git", ["rev-list", "-n", "1", latestTag], { cwd: REPO_ROOT })]);
        const headSha = headShaOut.trim();
        const tagSha = tagShaOut.trim();

        // Best-effort: find a human-readable tag for the current HEAD
        let currentTag = null;
        try {
            const { stdout } = await execAsync("git describe --tags --exact-match HEAD", { cwd: REPO_ROOT });
            currentTag = stdout.trim();
        } catch {
            /* HEAD is untagged */
        }

        res.json({
            upToDate: headSha === tagSha,
            currentTag: currentTag ?? headSha.slice(0, 7),
            remoteTag: latestTag,
            releaseNotes: releaseBody ?? null,
        });
    } catch {
        res.status(500).json({ error: "Could not check for updates." });
    }
});

// Checks out the latest GitHub release tag, installs dependencies, then restarts the server.
// Requires admin — destructive server-side operation.
router.post("/system/update", requireAuth, requireAdmin, async (_req, res) => {
    try {
        const ghRes = await fetch("https://api.github.com/repos/Jordeatsu/Makeventory/releases/latest", {
            headers: { "User-Agent": "Makeventory-UpdateCheck" },
        });
        if (!ghRes.ok) throw new Error("Could not reach GitHub API.");
        const { tag_name: latestTag } = await ghRes.json();
        assertSafeTag(latestTag);

        await execAsync("git fetch --tags origin", { cwd: REPO_ROOT, timeout: 30_000 });
        // Ensure we are on main (not detached HEAD) then move to the release commit
        await execAsync("git checkout main", { cwd: REPO_ROOT, timeout: 15_000 });
        // Use spawn (no shell) to avoid shell-metacharacter injection from the tag name.
        await new Promise((resolve, reject) => {
            const child = spawn("git", ["reset", "--hard", latestTag], { cwd: REPO_ROOT, shell: false, stdio: "inherit" });
            child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`git reset exited ${code}`))));
            child.on("error", reject);
        });
        await execAsync("npm install", { cwd: path.join(REPO_ROOT, "server"), timeout: 120_000 });
        await execAsync("npm install --include=dev", { cwd: path.join(REPO_ROOT, "client"), timeout: 120_000 });
        await execAsync("npm run build", { cwd: path.join(REPO_ROOT, "client"), timeout: 300_000 });
        // Send response before triggering the restart
        res.json({ ok: true });

        // Spawn update.sh as a fully detached process so it survives this Node process
        // being killed by kill_port inside update.sh.
        // update.sh skips npm install/build (already done above) and does NOT open a
        // browser — the existing tab reloads itself via AppUpdateBanner's polling logic.
        const startScript = path.join(REPO_ROOT, "systemfiles", "update.sh");
        const updateLog = path.join(REPO_ROOT, "logs", "update.log");
        const isWindows = process.platform === "win32";
        let child;
        if (isWindows) {
            // On Windows (Git Bash assumed) use start /B to background bash
            child = spawn("cmd.exe", ["/C", `start /B bash "${startScript}" >> "${updateLog}" 2>&1`], { detached: true, stdio: "ignore", cwd: REPO_ROOT, shell: false });
        } else {
            // On macOS/Linux: run via bash -c with nohup so the grandchild is
            // reparented to init/launchd before this process is killed.
            child = spawn("bash", ["-c", `nohup bash "${startScript}" >> "${updateLog}" 2>&1 &`], { detached: true, stdio: "ignore", cwd: REPO_ROOT });
        }
        child.unref();
    } catch (err) {
        res.status(500).json({ error: err.message || "Update failed." });
    }
});

export default router;
