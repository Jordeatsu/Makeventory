import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';

import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router    = Router();
const execAsync = promisify(exec);
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Returns whether origin/main is ahead of the running commit.
// Requires admin — runs `git fetch` on the server which is a privileged operation.
router.get('/system/update-check', requireAuth, requireAdmin, async (_req, res) => {
    try {
        await execAsync('git fetch origin', { cwd: REPO_ROOT, timeout: 30_000 });
        const [{ stdout: headOut }, { stdout: remoteOut }] = await Promise.all([
            execAsync('git rev-parse HEAD',        { cwd: REPO_ROOT }),
            execAsync('git rev-parse origin/main', { cwd: REPO_ROOT }),
        ]);
        const currentCommit = headOut.trim();
        const remoteCommit  = remoteOut.trim();
        res.json({
            upToDate:      currentCommit === remoteCommit,
            currentCommit: currentCommit.slice(0, 7),
            remoteCommit:  remoteCommit.slice(0, 7),
        });
    } catch {
        res.status(500).json({ error: 'Could not check for updates.' });
    }
});

// Pulls latest code, installs dependencies, then restarts the server.
// Requires admin — destructive server-side operation.
router.post('/system/update', requireAuth, requireAdmin, async (_req, res) => {
    try {
        await execAsync('git pull origin main', { cwd: REPO_ROOT, timeout: 60_000 });
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
