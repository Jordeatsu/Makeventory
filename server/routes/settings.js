import { Router } from "express";

import MaterialSettings from "../models/MaterialSettings.js";
import GlobalSettings from "../models/GlobalSettings.js";
import CustomerSettings from "../models/CustomerSettings.js";
import OrderSettings from "../models/OrderSettings.js";
import ProductSettings from "../models/ProductSettings.js";
import YearInReviewSettings from "../models/YearInReviewSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

// ── Material Settings (singleton) ──────────────────────────────────────────────

// Get (or initialise with defaults if none exist yet)
router.get("/settings/materials", requireAuth, async (_req, res) => {
    try {
        let settings = await MaterialSettings.findOne().lean();
        if (!settings) {
            settings = await MaterialSettings.create({});
        }
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// Upsert
router.put("/settings/materials", requireAuth, async (req, res) => {
    try {
        const { defaultLowStockThreshold, currency, autoDeductOnOrderComplete, trackFractionalQuantities, tableColumns } = req.body ?? {};
        const update = {};
        if (defaultLowStockThreshold !== undefined) update.defaultLowStockThreshold = defaultLowStockThreshold;
        if (currency !== undefined) update.currency = currency;
        if (autoDeductOnOrderComplete !== undefined) update.autoDeductOnOrderComplete = autoDeductOnOrderComplete;
        if (trackFractionalQuantities !== undefined) update.trackFractionalQuantities = trackFractionalQuantities;
        if (tableColumns !== undefined) update.tableColumns = tableColumns;
        const settings = await MaterialSettings.findOneAndUpdate({}, update, { new: true, upsert: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Global Settings (language / currency) ──────────────────────────────────────

// Public — language must be readable before login so the UI can apply i18n
router.get("/settings/global", async (_req, res) => {
    try {
        const settings = await GlobalSettings.findOne().lean();
        res.json({ settings: settings ?? { language: "en", currency: "GBP" } });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

router.put("/settings/global", requireAuth, async (req, res) => {
    try {
        const { language, currency } = req.body ?? {};
        const settings = await GlobalSettings.findOneAndUpdate({}, { language, currency }, { new: true, upsert: true, runValidators: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Customer Settings (singleton) ────────────────────────────────────────────

router.get("/settings/customers", requireAuth, async (_req, res) => {
    try {
        let settings = await CustomerSettings.findOne().lean();
        if (!settings) settings = await CustomerSettings.create({});
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

router.put("/settings/customers", requireAuth, async (req, res) => {
    try {
        const { fields, tableColumns } = req.body ?? {};
        const update = {};
        if (fields !== undefined) update.fields = fields;
        if (tableColumns !== undefined) update.tableColumns = tableColumns;
        const settings = await CustomerSettings.findOneAndUpdate({}, update, { new: true, upsert: true, runValidators: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Order Settings (singleton) ────────────────────────────────────────────────

router.get("/settings/orders", requireAuth, async (_req, res) => {
    try {
        let settings = await OrderSettings.findOne().lean();
        if (!settings) settings = await OrderSettings.create({});
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

router.put("/settings/orders", requireAuth, async (req, res) => {
    try {
        const settings = await OrderSettings.findOneAndUpdate({}, { ...(req.body ?? {}) }, { new: true, upsert: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Product Settings (singleton) ──────────────────────────────────────────────

router.get("/settings/products", requireAuth, async (_req, res) => {
    try {
        let settings = await ProductSettings.findOne().lean();
        if (!settings) settings = await ProductSettings.create({});
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

router.put("/settings/products", requireAuth, async (req, res) => {
    try {
        const settings = await ProductSettings.findOneAndUpdate({}, { ...(req.body ?? {}) }, { new: true, upsert: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Year In Review Settings (singleton) ───────────────────────────────────────

router.get("/settings/year-in-review", requireAuth, async (_req, res) => {
    try {
        let settings = await YearInReviewSettings.findOne().lean();
        if (!settings) settings = await YearInReviewSettings.create({});
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

router.put("/settings/year-in-review", requireAuth, async (req, res) => {
    try {
        const settings = await YearInReviewSettings.findOneAndUpdate({}, { ...(req.body ?? {}) }, { new: true, upsert: true });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
