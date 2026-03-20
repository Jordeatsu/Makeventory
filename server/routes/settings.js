import { Router } from 'express';

import MaterialSettings from '../models/MaterialSettings.js';
import GlobalSettings from '../models/GlobalSettings.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// ── Material Settings (singleton) ──────────────────────────────────────────────

// Get (or initialise with defaults if none exist yet)
router.get('/settings/materials', requireAuth, async (_req, res) => {
    try {
        let settings = await MaterialSettings.findOne().lean();
        if (!settings) {
            settings = await MaterialSettings.create({});
        }
        res.json({ settings });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Upsert
router.put('/settings/materials', requireAuth, async (req, res) => {
    try {
        const { defaultLowStockThreshold, currency, autoDeductOnOrderComplete, trackFractionalQuantities } = req.body ?? {};
        const settings = await MaterialSettings.findOneAndUpdate(
            {},
            { defaultLowStockThreshold, currency, autoDeductOnOrderComplete, trackFractionalQuantities },
            { new: true, upsert: true, runValidators: true },
        );
        res.json({ settings });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Global Settings (language / currency) ──────────────────────────────────────

// Public — language must be readable before login so the UI can apply i18n
router.get('/settings/global', async (_req, res) => {
    try {
        const settings = await GlobalSettings.findOne().lean();
        res.json({ settings: settings ?? { language: 'en', currency: 'GBP' } });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.put('/settings/global', requireAuth, async (req, res) => {
    try {
        const { language, currency } = req.body ?? {};
        const settings = await GlobalSettings.findOneAndUpdate(
            {},
            { language, currency },
            { new: true, upsert: true, runValidators: true },
        );
        res.json({ settings });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
