import { Router } from 'express';

import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isValidId, escapeRegex } from '../lib/helpers.js';

const router = Router();

// ── List customers ────────────────────────────────────────────────────────────
router.get('/customers', requireAuth, async (req, res) => {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) {
            const re = { $regex: escapeRegex(search), $options: 'i' };
            filter.$or = [{ name: re }, { email: re }];
        }

        const customers = await Customer.find(filter).sort({ updatedAt: -1 }).lean();

        // Bulk aggregation to get order stats for all customers in one query
        const emails = customers.map(c => c.email).filter(Boolean);
        const noEmailNames = customers.filter(c => !c.email).map(c => c.name);

        const pipeline = [
            {
                $match: {
                    $or: [
                        ...(emails.length        ? [{ 'customer.email': { $in: emails } }]        : []),
                        ...(noEmailNames.length  ? [{ 'customer.email': { $in: [null, ''] }, 'customer.name': { $in: noEmailNames } }] : []),
                    ],
                },
            },
            {
                $group: {
                    _id:         { $ifNull: ['$customer.email', '$customer.name'] },
                    orderCount:  { $sum: 1 },
                    totalSpent:  { $sum: '$totalCharged' },
                    totalProfit: { $sum: '$profit' },
                    firstOrder:  { $min: '$orderDate' },
                    lastOrder:   { $max: '$orderDate' },
                },
            },
        ];

        const statsArr = emails.length || noEmailNames.length
            ? await Order.aggregate(pipeline)
            : [];

        const statsMap = Object.fromEntries(statsArr.map(s => [s._id, s]));

        const enriched = customers.map(c => {
            const key = c.email || c.name;
            const s = statsMap[key] ?? {};
            return {
                ...c,
                orderCount:  s.orderCount  ?? 0,
                totalSpent:  s.totalSpent  ?? 0,
                totalProfit: s.totalProfit ?? 0,
                firstOrder:  s.firstOrder  ?? null,
                lastOrder:   s.lastOrder   ?? null,
            };
        });

        res.json({ customers: enriched });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Get single customer + their orders ───────────────────────────────────────
router.get('/customers/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });

        const customer = await Customer.findById(id).lean();
        if (!customer) return res.status(404).json({ error: 'Customer not found.' });

        const orderFilter = customer.email
            ? { 'customer.email': customer.email }
            : { 'customer.email': { $in: [null, ''] }, 'customer.name': customer.name };

        const orders = await Order.find(orderFilter).sort({ orderDate: -1 }).lean();

        res.json({ customer, orders });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Create customer ───────────────────────────────────────────────────────────
router.post('/customers', requireAuth, async (req, res) => {
    try {
        const { name } = req.body ?? {};
        if (!name) return res.status(400).json({ error: 'Name is required.' });
        const doc = await Customer.create(req.body);
        res.status(201).json({ customer: doc });
    } catch (e) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Update customer ───────────────────────────────────────────────────────────
router.put('/customers/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const doc = await Customer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: 'Customer not found.' });
        res.json({ customer: doc });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

// ── Delete customer ───────────────────────────────────────────────────────────
router.delete('/customers/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: 'Invalid ID.' });
        const doc = await Customer.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: 'Customer not found.' });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: 'Server error.' });
    }
});

export default router;

