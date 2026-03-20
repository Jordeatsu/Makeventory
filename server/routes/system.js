import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';

import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router    = Router();
const execAsync = promisify(exec);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Returns whether a newer GitHub release exists compared to the currently running tag.
// Requires admin — runs `git fetch` on the server which is a privileged operation.
router.get('/system/update-check', requireAuth, requireAdmin, async (_req, res) => {
    try {
        const ghRes = await fetch('https://api.github.com/repos/Jordeatsu/Makeventory/releases/latest', {
            headers: { 'User-Agent': 'Makeventory-UpdateCheck' },
        });
        if (!ghRes.ok) return res.status(502).json({ error: 'Could not reach GitHub API.' });
        const { tag_name: latestTag } = await ghRes.json();

        await execAsync('git fetch --tags origin', { cwd: REPO_ROOT, timeout: 30_000 });

        // Compare by SHA so multiple tags on the same commit don't trigger a false update
        const [{ stdout: headShaOut }, { stdout: tagShaOut }] = await Promise.all([
            execAsync('git rev-parse HEAD',                    { cwd: REPO_ROOT }),
            execAsync(`git rev-list -n 1 ${latestTag}`,        { cwd: REPO_ROOT }),
        ]);
        const headSha = headShaOut.trim();
        const tagSha  = tagShaOut.trim();

        // Best-effort: find a human-readable tag for the current HEAD
        let currentTag = null;
        try {
            const { stdout } = await execAsync('git describe --tags --exact-match HEAD', { cwd: REPO_ROOT });
            currentTag = stdout.trim();
        } catch { /* HEAD is untagged */ }

        res.json({
            upToDate:   headSha === tagSha,
            currentTag: currentTag ?? headSha.slice(0, 7),
            remoteTag:  latestTag,
        });
    } catch {
        res.status(500).json({ error: 'Could not check for updates.' });
    }
});

// Checks out the latest GitHub release tag, installs dependencies, then restarts the server.
// Requires admin — destructive server-side operation.
router.post('/system/update', requireAuth, requireAdmin, async (_req, res) => {
    try {
        const ghRes = await fetch('https://api.github.com/repos/Jordeatsu/Makeventory/releases/latest', {
            headers: { 'User-Agent': 'Makeventory-UpdateCheck' },
        });
        if (!ghRes.ok) throw new Error('Could not reach GitHub API.');
        const { tag_name: latestTag } = await ghRes.json();

        await execAsync('git fetch --tags origin', { cwd: REPO_ROOT, timeout: 30_000 });
        // Ensure we are on main (not detached HEAD) then move to the release commit
        await execAsync('git checkout main',               { cwd: REPO_ROOT, timeout: 15_000 });
        await execAsync(`git reset --hard ${latestTag}`,   { cwd: REPO_ROOT, timeout: 15_000 });
        await execAsync('npm install', { cwd: path.join(REPO_ROOT, 'server'), timeout: 120_000 });
        await execAsync('npm install', { cwd: path.join(REPO_ROOT, 'client'), timeout: 120_000 });
        // Send response before the process is killed by the restart script
        res.json({ ok: true });
        const child = spawn('bash', [path.join(REPO_ROOT, 'systemfiles', 'restart.sh')], {
            detached: true,
            stdio:    'ignore',
            cwd:      REPO_ROOT,
        });
        child.unref();
    } catch (err) {
        res.status(500).json({ error: err.message || 'Update failed.' });
    }
});

export default router;