import { Router } from "express";

import MaterialSettings from "../models/MaterialSettings.js";
import GlobalSettings from "../models/GlobalSettings.js";
import CustomerSettings from "../models/CustomerSettings.js";
import OrderSettings from "../models/OrderSettings.js";
import ProductSettings from "../models/ProductSettings.js";
import YearInReviewSettings from "../models/YearInReviewSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createSettingsRoutes } from "../lib/settingsRoutes.js";

const router = Router();

createSettingsRoutes(router, "materials", MaterialSettings, {
    allowedFields: ["defaultLowStockThreshold", "currency", "autoDeductOnOrderComplete", "trackFractionalQuantities", "tableColumns", "numberPrefix"],
});

createSettingsRoutes(router, "customers", CustomerSettings, {
    allowedFields: ["fields", "tableColumns", "numberPrefix"],
});

createSettingsRoutes(router, "orders", OrderSettings, {
    allowedFields: ["tableColumns", "numberPrefix"],
});

createSettingsRoutes(router, "products", ProductSettings, {
    allowedFields: ["tableColumns", "numberPrefix"],
});

createSettingsRoutes(router, "year-in-review", YearInReviewSettings);

// ── Global Settings (language / currency) ──────────────────────────────────────
// GET is intentionally public — language must be readable before login for i18n

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

export default router;
