import { Router } from "express";

import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ProductSettings from "../models/ProductSettings.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId, escapeRegex, userLabel } from "../lib/helpers.js";

const router = Router();

function productToClient(doc) {
    const p = doc.toObject ? doc.toObject() : doc;
    return {
        ...p,
        createdBy: userLabel(p.createdBy),
        updatedBy: userLabel(p.updatedBy),
    };
}

// ── List products ─────────────────────────────────────────────────────────────
router.get("/products", requireAuth, async (req, res) => {
    try {
        const { search, category } = req.query;
        const filter = {};
        if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };
        if (category) filter.category = { $regex: escapeRegex(category), $options: "i" };

        const docs = await Product.find(filter).populate("parentProduct", "name estimatedMaterialCost defaultMaterials").sort({ name: 1 }).lean();
        res.json({ products: docs });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Get single product + aggregated sales stats ───────────────────────────────
router.get("/products/:id/stats", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });

        const product = await Product.findById(id).populate("parentProduct", "name defaultMaterials estimatedMaterialCost").populate("createdBy", "firstName lastName").populate("updatedBy", "firstName lastName").lean();
        if (!product) return res.status(404).json({ error: "Product not found." });

        // Aggregate orders that reference this product
        const orders = await Order.find({ "products.productId": id }).lean();

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((s, o) => s + (o.totalCharged || 0), 0);
        const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
        const avgProfit = totalOrders > 0 ? totalProfit / totalOrders : 0;

        // Revenue by country
        const countryMap = {};
        orders.forEach((o) => {
            const country = o.customer?.country || "Unknown";
            if (!countryMap[country]) countryMap[country] = { country, orders: 0, revenue: 0, profit: 0 };
            countryMap[country].orders += 1;
            countryMap[country].revenue += o.totalCharged || 0;
            countryMap[country].profit += o.profit || 0;
        });
        const byCountry = Object.values(countryMap).sort((a, b) => b.revenue - a.revenue);

        // 20 most recent orders
        const recentOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).slice(0, 20);

        res.json({
            product: { ...product, createdBy: userLabel(product.createdBy), updatedBy: userLabel(product.updatedBy) },
            totalOrders,
            totalRevenue,
            totalProfit,
            avgProfit,
            byCountry,
            recentOrders,
        });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Create product ────────────────────────────────────────────────────────────
router.post("/products", requireAuth, async (req, res) => {
    try {
        const { name, sku, category, description, basePrice, active, isTemplate, parentProduct, defaultMaterials } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: "Name is required." });

        const estimatedMaterialCost = (defaultMaterials || []).reduce((s, m) => s + (m.lineCost || 0), 0);
        // Auto-assign next product number using the configurable prefix from settings
        const prodSettings = await ProductSettings.findOne().lean();
        const prefix = prodSettings?.numberPrefix || "PRD-";
        const latestProd = await Product.findOne({ productNumber: { $ne: null } })
            .sort({ createdAt: -1 })
            .select("productNumber")
            .lean();
        const lastSeq = latestProd?.productNumber ? parseInt(latestProd.productNumber.match(/(\d+)$/)?.[1], 10) || 0 : 0;
        const productNumber = `${prefix}${String(lastSeq + 1).padStart(8, "0")}`;
        const doc = await Product.create({
            productNumber,
            name: name.trim(),
            sku,
            category,
            description,
            basePrice: Number(basePrice) || 0,
            active: active !== false,
            isTemplate: !!isTemplate,
            parentProduct: isValidId(parentProduct) ? parentProduct : null,
            defaultMaterials: defaultMaterials || [],
            estimatedMaterialCost,
            createdBy: req.user.sub,
            updatedBy: req.user.sub,
        });
        res.status(201).json({ product: productToClient(doc) });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Update product ────────────────────────────────────────────────────────────
router.put("/products/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });

        const { name, sku, category, description, basePrice, active, isTemplate, parentProduct, defaultMaterials } = req.body ?? {};
        if (!name?.trim()) return res.status(400).json({ error: "Name is required." });

        const update = {
            name: name.trim(),
            sku,
            category,
            description,
            basePrice: Number(basePrice) || 0,
            active: active !== false,
            isTemplate: !!isTemplate,
            parentProduct: isValidId(parentProduct) ? parentProduct : null,
            updatedBy: req.user.sub,
        };
        // Only overwrite the materials recipe when the client explicitly sends it.
        // If omitted (e.g. from ProductFormModal which doesn't carry the recipe),
        // the existing defaultMaterials and estimatedMaterialCost are preserved.
        if (defaultMaterials !== undefined) {
            update.defaultMaterials = defaultMaterials || [];
            update.estimatedMaterialCost = (defaultMaterials || []).reduce((s, m) => s + (m.lineCost || 0), 0);
        }
        const doc = await Product.findByIdAndUpdate(id, update, { new: true });
        if (!doc) return res.status(404).json({ error: "Product not found." });
        res.json({ product: productToClient(doc) });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

// ── Delete product ────────────────────────────────────────────────────────────
router.delete("/products/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ error: "Invalid ID." });
        const doc = await Product.findByIdAndDelete(id);
        if (!doc) return res.status(404).json({ error: "Product not found." });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Server error." });
    }
});

export default router;
