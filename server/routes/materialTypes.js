import { Router } from 'express';

import MaterialType from '../models/MaterialType.js';
import Material from '../models/Material.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isValidId } from '../lib/helpers.js';

const router = Router();

// List all
router.get('/material-types', requireAuth, async (_req, res) => {
    try {
        const types = await MaterialType.find().sort({ name: 1 }).lean();
        res.json({ types });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Create
router.post('/material-types', requireAuth, async (req, res) => {
    try {
        const { name, description, usageType, unitOfMeasure, isActive } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
        const type = await MaterialType.create({
            name:          name.trim(),
            description:   description?.trim() || null,
            usageType,
            unitOfMeasure: unitOfMeasure || null,
            isActive:      isActive !== false,
        });
        res.status(201).json({ type });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'A material type with that name already exists.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

// Update
router.put('/material-types/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const { name, description, usageType, unitOfMeasure, isActive } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
        const type = await MaterialType.findByIdAndUpdate(
            id,
            {
                name:          name.trim(),
                description:   description?.trim() || null,
                usageType,
                unitOfMeasure: unitOfMeasure || null,
                isActive,
            },
            { new: true, runValidators: true },
        );
        if (!type) return res.status(404).json({ error: 'Material type not found.' });
        res.json({ type });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Delete — blocked if any Material references this type
router.delete('/material-types/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const inUse = await Material.find({ materialType: id }).select('name').lean();
        if (inUse.length > 0) {
            return res.status(409).json({
                error:     'This material type is in use and cannot be deleted.',
                materials: inUse.map((m) => m.name),
            });
        }
        await MaterialType.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
