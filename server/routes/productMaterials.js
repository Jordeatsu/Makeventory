import { Router } from "express";

import ProductMaterial from "../models/ProductMaterial.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId } from "../lib/helpers.js";

const router = Router();

// ── List materials for a product ──────────────────────────────────────────────
router.get("/product-materials", requireAuth, async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId || !isValidId(productId)) {
            return res.status(400).json({ error: "Valid productId is required." });
        }

        const rows = await ProductMaterial.find({ productId }).populate("materialId", "name materialType unit costPerUnit unitsPerPack").lean();

        res.json({ productMaterials: rows });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Create a product-material link ────────────────────────────────────────────
router.post("/product-materials", requireAuth, async (req, res) => {
    try {
        const { productId, materialId, materialQuantityUsed } = req.body ?? {};

        if (!productId || !isValidId(productId)) return res.status(400).json({ error: "Valid productId is required." });
        if (!materialId || !isValidId(materialId)) return res.status(400).json({ error: "Valid materialId is required." });

        const qty = Number(materialQuantityUsed);
        if (!Number.isFinite(qty) || qty <= 0) {
            return res.status(400).json({ error: "materialQuantityUsed must be a positive number." });
        }

        const doc = await ProductMaterial.create({ productId, materialId, materialQuantityUsed: qty });
        const populated = await doc.populate("materialId", "name materialType unit costPerUnit unitsPerPack");
        res.status(201).json({ productMaterial: populated.toObject() });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "This material is already linked to the product." });
        }
        res.status(500).json({ error: "Server error." });
    }
});

// ── Update quantity ───────────────────────────────────────────────────────────
router.put("/product-materials/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid id." });

        const qty = Number(req.body?.materialQuantityUsed);
        if (!Number.isFinite(qty) || qty <= 0) {
            return res.status(400).json({ error: "materialQuantityUsed must be a positive number." });
        }

        const doc = await ProductMaterial.findByIdAndUpdate(id, { materialQuantityUsed: qty }, { new: true }).populate("materialId", "name materialType unit costPerUnit unitsPerPack");

        if (!doc) return res.status(404).json({ error: "Record not found." });
        res.json({ productMaterial: doc.toObject() });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Delete a product-material link ────────────────────────────────────────────
router.delete("/product-materials/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid id." });

        const doc = await ProductMaterial.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: "Record not found." });
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
