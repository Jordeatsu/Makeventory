import { Router } from 'express';

import Module from '../models/Module.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isValidId } from '../lib/helpers.js';

const router = Router();

// Active modules — drives the client navigation
router.get('/modules', requireAuth, async (_req, res) => {
    try {
        const modules = await Module.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .select('name displayOrder')
            .lean();
        res.json({ modules });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// All modules — for the settings screen
router.get('/modules/all', requireAuth, async (_req, res) => {
    try {
        const modules = await Module.find()
            .sort({ displayOrder: 1 })
            .select('name description isActive displayOrder')
            .lean();
        res.json({ modules });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Bulk update module active states
router.patch('/modules', requireAuth, async (req, res) => {
    try {
        const updates = req.body?.updates;
        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: 'updates must be an array.' });
        }
        await Promise.all(
            updates.map(({ id, isActive }) => {
                if (!isValidId(id)) return Promise.resolve();
                return Module.findByIdAndUpdate(id, { isActive: Boolean(isActive) });
            }),
        );
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
