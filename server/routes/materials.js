import { Router } from "express";

import Material from "../models/Material.js";
import MaterialType from "../models/MaterialType.js";
import MaterialSettings from "../models/MaterialSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId, escapeRegex, userLabel, generateNextNumber } from "../lib/helpers.js";

const router = Router();

function materialToClient(doc) {
    const m = doc.toObject ? doc.toObject() : doc;
    return {
        ...m,
        type: m.materialType?.name ?? null,
        materialType: m.materialType?._id ?? m.materialType,
        createdBy: userLabel(m.createdBy),
        updatedBy: userLabel(m.updatedBy),
    };
}

// List — supports ?search= and ?type= (type name string)
router.get("/materials", requireAuth, async (req, res) => {
    try {
        const { search, type } = req.query;
        const filter = {};
        if (type) {
            const mt = await MaterialType.findOne({ name: type }).lean();
            if (!mt) return res.json({ materials: [] });
            filter.materialType = mt._id;
        }
        if (search) {
            // escapeRegex prevents ReDoS from user-supplied search strings
            filter.name = { $regex: escapeRegex(search), $options: "i" };
        }
        const docs = await Material.find(filter).populate("materialType", "name").sort({ name: 1 }).lean();
        const materials = docs.map((m) => ({
            ...m,
            type: m.materialType?.name ?? null,
            materialType: m.materialType?._id ?? m.materialType,
        }));
        res.json({ materials });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// Get single material by ID
router.get("/materials/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Material.findById(id).populate("materialType", "name").populate("createdBy", "firstName lastName").populate("updatedBy", "firstName lastName");
        if (!doc) return res.status(404).json({ error: "Material not found." });
        res.json({ material: materialToClient(doc) });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// Create
router.post("/materials", requireAuth, async (req, res) => {
    try {
        const { name, type, color, quantity, unit, costPerUnit, unitsPerPack, lowStockThreshold, supplier, sku, description } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: "Name is required." });
        if (!type?.trim()) return res.status(400).json({ error: "Type is required." });
        const mt = await MaterialType.findOne({ name: type.trim() });
        if (!mt) return res.status(400).json({ error: `Material type "${type}" not found.` });
        const userId = req.user.sub;
        const materialNumber = await generateNextNumber(Material, "materialNumber", MaterialSettings, "MTL-");
        const doc = await Material.create({
            materialNumber,
            name: name.trim(),
            materialType: mt._id,
            color: color?.trim() || null,
            quantity: Number(quantity) || 0,
            unit: unit?.trim() || "pieces",
            costPerUnit: Number(costPerUnit) || 0,
            unitsPerPack: Number(unitsPerPack) || 0,
            lowStockThreshold: Number(lowStockThreshold) || 1,
            supplier: supplier?.trim() || null,
            sku: sku?.trim() || null,
            description: description?.trim() || null,
            createdBy: userId,
            updatedBy: userId,
        });
        await doc.populate("materialType", "name");
        await doc.populate("createdBy", "firstName lastName");
        await doc.populate("updatedBy", "firstName lastName");
        res.status(201).json({ material: materialToClient(doc) });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: "A material with that name already exists." });
        res.status(500).json({ error: "Server error." });
    }
});

// Update
router.put("/materials/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const { name, type, color, quantity, unit, costPerUnit, unitsPerPack, lowStockThreshold, supplier, sku, description } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: "Name is required." });
        const update = {
            name: name.trim(),
            color: color?.trim() || null,
            quantity: Number(quantity) || 0,
            unit: unit?.trim() || "pieces",
            costPerUnit: Number(costPerUnit) || 0,
            unitsPerPack: Number(unitsPerPack) || 0,
            lowStockThreshold: Number(lowStockThreshold) || 1,
            supplier: supplier?.trim() || null,
            sku: sku?.trim() || null,
            description: description?.trim() || null,
            updatedBy: req.user.sub,
        };
        if (type?.trim()) {
            const mt = await MaterialType.findOne({ name: type.trim() });
            if (!mt) return res.status(400).json({ error: `Material type "${type}" not found.` });
            update.materialType = mt._id;
        }
        const doc = await Material.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate("materialType", "name").populate("createdBy", "firstName lastName").populate("updatedBy", "firstName lastName");
        if (!doc) return res.status(404).json({ error: "Material not found." });
        res.json({ material: materialToClient(doc) });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// Delete
router.delete("/materials/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Material.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: "Material not found." });
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// Adjust stock — increment or decrement quantity by delta
router.post("/materials/:id/adjust-stock", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const delta = Number(req.body?.delta);
        if (isNaN(delta)) return res.status(400).json({ error: "delta must be a number." });
        const doc = await Material.findByIdAndUpdate(id, { $inc: { quantity: delta }, $set: { updatedBy: req.user.sub } }, { new: true, runValidators: true })
            .populate("materialType", "name")
            .populate("createdBy", "firstName lastName")
            .populate("updatedBy", "firstName lastName");
        if (!doc) return res.status(404).json({ error: "Material not found." });
        res.json({ material: materialToClient(doc) });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
