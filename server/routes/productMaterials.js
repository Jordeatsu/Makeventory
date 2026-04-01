import { Router } from "express";

import ProductMaterial from "../models/ProductMaterial.js";
import Product from "../models/Product.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId } from "../lib/helpers.js";

const router = Router();

// Deep-populate helper used in every response so the client gets materialType.name
const POPULATE_OPTS = {
    path: "materialId",
    select: "name materialType unit costPerUnit unitsPerPack",
    populate: { path: "materialType", select: "name" },
};

// Recompute and persist estimatedMaterialCost on the parent Product after any mutation.
async function syncEstimatedCost(productId) {
    const rows = await ProductMaterial.find({ productId }).populate("materialId", "costPerUnit unitsPerPack").lean();
    const total = rows.reduce((sum, row) => {
        const mat = row.materialId;
        if (!mat) return sum;
        const cpu = mat.unitsPerPack > 0 ? mat.costPerUnit / mat.unitsPerPack : mat.costPerUnit;
        return sum + cpu * (row.materialQuantityUsed ?? 0);
    }, 0);
    await Product.findByIdAndUpdate(productId, { estimatedMaterialCost: total });
}

// ── List materials for a product ──────────────────────────────────────────────
router.get("/product-materials", requireAuth, async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId || !isValidId(productId)) {
            return res.status(400).json({ error: "Valid productId is required." });
        }

        const rows = await ProductMaterial.find({ productId }).populate(POPULATE_OPTS).lean();

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
        const populated = await doc.populate(POPULATE_OPTS);
        await syncEstimatedCost(productId);
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

        const doc = await ProductMaterial.findByIdAndUpdate(id, { materialQuantityUsed: qty }, { new: true }).populate(POPULATE_OPTS);

        if (!doc) return res.status(404).json({ error: "Record not found." });
        await syncEstimatedCost(doc.productId);
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
        await syncEstimatedCost(doc.productId);
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
