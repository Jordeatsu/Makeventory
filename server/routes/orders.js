import { Router } from "express";

import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import OrderSettings from "../models/OrderSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId, escapeRegex, userLabel, generateNextNumber } from "../lib/helpers.js";

const router = Router();

// Find or create a Customer document and return its _id (or null).
async function findOrCreateCustomer(c) {
    if (!c) return null;

    // Front-end sent a plain ObjectId string
    if (typeof c === "string" && isValidId(c)) return c;

    // Front-end sent an object that already has an _id (existing customer selected)
    if (c._id && isValidId(String(c._id))) return c._id;

    // Need at least a name or email to find/create
    if (!c.name?.trim() && !c.email?.trim()) return null;

    const filter = c.email?.trim() ? { email: { $regex: `^${escapeRegex(c.email.trim())}$`, $options: "i" } } : { name: { $regex: `^${escapeRegex(c.name.trim())}$`, $options: "i" } };

    const fields = {};
    const keys = ["name", "email", "phone", "addressLine1", "addressLine2", "city", "state", "postcode", "country"];
    keys.forEach((k) => {
        if (c[k]?.toString().trim()) fields[k] = c[k].toString().trim();
    });

    const doc = await Customer.findOneAndUpdate(filter, { $set: fields }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return doc._id;
}

function calcProfit(data) {
    const totalMaterialCost = (data.materials || []).reduce((s, m) => s + (m.lineCost || 0), 0);
    const discountAmt = data.discountType === "percent" ? (data.totalCharged || 0) * ((data.discount || 0) / 100) : data.discount || 0;
    const profit = (data.totalCharged || 0) - discountAmt - (data.hostingCost || 0) - (data.marketingCost || 0) - totalMaterialCost - (data.refund || 0);
    return { profit, totalMaterialCost };
}

// ── List orders ───────────────────────────────────────────────────────────────
router.get("/orders", requireAuth, async (req, res) => {
    try {
        const { search, status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (search) {
            const re = { $regex: escapeRegex(search), $options: "i" };
            const matchingCustomers = await Customer.find({ $or: [{ name: re }, { email: re }] })
                .select("_id")
                .lean();
            const customerIds = matchingCustomers.map((c) => c._id);
            filter.$or = [...(customerIds.length ? [{ customer: { $in: customerIds } }] : []), { originOrderId: re }];
        }
        const CUSTOMER_FIELDS = "name email phone addressLine1 addressLine2 city state postcode country";
        const docs = await Order.find(filter).populate("customer", CUSTOMER_FIELDS).sort({ orderDate: -1, createdAt: -1 }).lean();
        res.json({ orders: docs });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Get single order ──────────────────────────────────────────────────────────
router.get("/orders/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const CUSTOMER_FIELDS = "name email phone addressLine1 addressLine2 city state postcode country";
        const doc = await Order.findById(id).populate("customer", CUSTOMER_FIELDS).populate("createdBy", "firstName lastName").populate("updatedBy", "firstName lastName");
        if (!doc) return res.status(404).json({ error: "Order not found." });
        const o = doc.toObject();
        res.json({ order: { ...o, createdBy: userLabel(o.createdBy), updatedBy: userLabel(o.updatedBy) } });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Create order ──────────────────────────────────────────────────────────────
router.post("/orders", requireAuth, async (req, res) => {
    try {
        const body = req.body ?? {};
        if (!body.status) body.status = "Pending";
        const { profit, totalMaterialCost } = calcProfit(body);
        const [nextNumber, customerId] = await Promise.all([generateNextNumber(Order, "orderNumber", OrderSettings, "ORD-"), findOrCreateCustomer(body.customer)]);
        const doc = await Order.create({
            ...body,
            customer: customerId,
            orderNumber: nextNumber,
            profit,
            totalMaterialCost,
            createdBy: req.user.sub,
            updatedBy: req.user.sub,
        });
        res.status(201).json({ order: doc });
    } catch (e) {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Update order ──────────────────────────────────────────────────────────────
router.put("/orders/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const body = req.body ?? {};
        // Prevent overwriting the auto-assigned order number
        delete body.orderNumber;
        const { profit, totalMaterialCost } = calcProfit(body);
        const customerId = await findOrCreateCustomer(body.customer);
        const doc = await Order.findByIdAndUpdate(id, { ...body, customer: customerId, profit, totalMaterialCost, updatedBy: req.user.sub }, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ error: "Order not found." });
        res.json({ order: doc });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Delete order ──────────────────────────────────────────────────────────────
router.delete("/orders/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Order.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: "Order not found." });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Unlock order ──────────────────────────────────────────────────────────────
router.patch("/orders/:id/unlock", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Order.findByIdAndUpdate(id, { locked: false, updatedBy: req.user.sub }, { new: true });
        if (!doc) return res.status(404).json({ error: "Order not found." });
        res.json({ order: doc });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
