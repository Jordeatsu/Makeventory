import { Router } from "express";

import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import CustomerSettings from "../models/CustomerSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId, escapeRegex, generateNextNumber } from "../lib/helpers.js";

const router = Router();

// ── List customers ────────────────────────────────────────────────────────────
router.get("/customers", requireAuth, async (req, res) => {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) {
            const re = { $regex: escapeRegex(search), $options: "i" };
            filter.$or = [{ name: re }, { email: re }];
        }

        const customers = await Customer.find(filter).sort({ updatedAt: -1 }).lean();

        // Bulk aggregation to get order stats for all customers in one query
        const customerIds = customers.map((c) => c._id);

        const pipeline = [
            { $match: { customer: { $in: customerIds } } },
            {
                $group: {
                    _id: "$customer",
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: "$totalCharged" },
                    totalProfit: { $sum: "$profit" },
                    firstOrder: { $min: "$orderDate" },
                    lastOrder: { $max: "$orderDate" },
                },
            },
        ];

        const statsArr = customerIds.length ? await Order.aggregate(pipeline) : [];

        const statsMap = Object.fromEntries(statsArr.map((s) => [s._id.toString(), s]));

        const enriched = customers.map((c) => {
            const s = statsMap[c._id.toString()] ?? {};
            return {
                ...c,
                orderCount: s.orderCount ?? 0,
                totalSpent: s.totalSpent ?? 0,
                totalProfit: s.totalProfit ?? 0,
                firstOrder: s.firstOrder ?? null,
                lastOrder: s.lastOrder ?? null,
            };
        });

        res.json({ customers: enriched });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Get single customer + their orders ───────────────────────────────────────
router.get("/customers/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });

        const customer = await Customer.findById(id).lean();
        if (!customer) return res.status(404).json({ error: "Customer not found." });

        const orders = await Order.find({ customer: id }).sort({ orderDate: -1 }).lean();

        res.json({ customer, orders });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Create customer ───────────────────────────────────────────────────────────
router.post("/customers", requireAuth, async (req, res) => {
    try {
        const { name } = req.body ?? {};
        if (!name) return res.status(400).json({ error: "Name is required." });
        const customerNumber = await generateNextNumber(Customer, "customerNumber", CustomerSettings, "CST-");
        const doc = await Customer.create({ ...req.body, customerNumber });
        res.status(201).json({ customer: doc });
    } catch (e) {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Update customer ───────────────────────────────────────────────────────────
router.put("/customers/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Customer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: "Customer not found." });
        res.json({ customer: doc });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Delete customer ───────────────────────────────────────────────────────────
router.delete("/customers/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Customer.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: "Customer not found." });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
