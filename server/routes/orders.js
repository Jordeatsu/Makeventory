import { Router } from 'express';

import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isValidId, escapeRegex, userLabel } from '../lib/helpers.js';

const router = Router();

async function upsertCustomer(c) {
    if (!c?.name?.trim() && !c?.email?.trim()) return;

    // Build a case-insensitive match: prioritise email, fall back to name
    let filter;
    if (c.email?.trim()) {
        // Match any existing customer with this email (case-insensitive)
        filter = { email: { $regex: `^${c.email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } };
    } else {
        // No email — match by exact name (case-insensitive) where email is also blank,
        // so two "John Smith" entries without emails merge into one.
        filter = {
            name:  { $regex: `^${c.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
            email: { $in: [null, ''] },
        };
    }

    const fields = {};
    const keys = ['name', 'email', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postcode', 'country'];
    keys.forEach(k => { if (c[k]?.toString().trim()) fields[k] = c[k].toString().trim(); });
    await Customer.findOneAndUpdate(filter, { $set: fields }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

function calcProfit(data) {
    const totalMaterialCost = (data.materials || []).reduce((s, m) => s + (m.lineCost || 0), 0);
    const discountAmt = data.discountType === 'percent'
        ? (data.totalCharged || 0) * ((data.discount || 0) / 100)
        : (data.discount || 0);
    const profit = ((data.totalCharged || 0) - discountAmt)
        - (data.hostingCost || 0)
        - (data.marketingCost || 0)
        - totalMaterialCost
        - (data.refund || 0);
    return { profit, totalMaterialCost };
}

// ── List orders ───────────────────────────────────────────────────────────────
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            const re = { $regex: escapeRegex(search), $options: 'i' };
            filter.$or = [{ 'customer.name': re }, { originOrderId: re }];
        }
        const docs = await Order.find(filter).sort({ orderDate: -1, createdAt: -1 }).lean();
        res.json({ orders: docs });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Get single order ──────────────────────────────────────────────────────────
router.get('/orders/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const doc = await Order.findById(id)
            .populate('createdBy', 'firstName lastName')
            .populate('updatedBy', 'firstName lastName');
        if (!doc) return res.status(404).json({ error: 'Order not found.' });
        const o = doc.toObject();
        res.json({ order: { ...o, createdBy: userLabel(o.createdBy), updatedBy: userLabel(o.updatedBy) } });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Create order ──────────────────────────────────────────────────────────────
router.post('/orders', requireAuth, async (req, res) => {
    try {
        const body = req.body ?? {};
        if (!body.status) body.status = 'Pending';
        const { profit, totalMaterialCost } = calcProfit(body);
        const doc = await Order.create({
            ...body,
            profit,
            totalMaterialCost,
            createdBy: req.user.sub,
            updatedBy: req.user.sub,
        });
        await upsertCustomer(body.customer);
        res.status(201).json({ order: doc });
    } catch (e) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Update order ──────────────────────────────────────────────────────────────
router.put('/orders/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const body = req.body ?? {};
        const { profit, totalMaterialCost } = calcProfit(body);
        const doc = await Order.findByIdAndUpdate(
            id,
            { ...body, profit, totalMaterialCost, updatedBy: req.user.sub },
            { new: true, runValidators: true },
        );
        if (!doc) return res.status(404).json({ error: 'Order not found.' });
        await upsertCustomer(body.customer);
        res.json({ order: doc });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Delete order ──────────────────────────────────────────────────────────────
router.delete('/orders/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const doc = await Order.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: 'Order not found.' });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Unlock order ──────────────────────────────────────────────────────────────
router.patch('/orders/:id/unlock', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const doc = await Order.findByIdAndUpdate(
            id,
            { locked: false, updatedBy: req.user.sub },
            { new: true },
        );
        if (!doc) return res.status(404).json({ error: 'Order not found.' });
        res.json({ order: doc });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;
