import { Router } from "express";
import mongoose from "mongoose";

import Order from "../models/Order.js";
import Overhead from "../models/Overhead.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { isValidId } from "../lib/helpers.js";

const router = Router();

// ── GET /year-review/stats/:year ─────────────────────────────────────────────
router.get("/year-review/stats/:year", requireAuth, async (req, res) => {
    const year = parseInt(req.params.year, 10);
    if (isNaN(year)) return res.status(400).json({ message: "Invalid year." });

    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    try {
        const [summaryResult, monthly, statusBreakdown, countries, origins, topCustomers, topProducts, orderMaterials, overheads, availableYears] = await Promise.all([
            // ── Summary KPIs ──────────────────────────────────────────────────
            Order.aggregate([
                { $match: { orderDate: { $gte: start, $lt: end } } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalGrossRevenue: { $sum: "$totalCharged" },
                        totalShipping: { $sum: "$shippingCost" },
                        totalBuyerTax: { $sum: "$buyerTax" },
                        totalHostingFees: { $sum: "$hostingCost" },
                        totalMarketingCost: { $sum: "$marketingCost" },
                        totalRefunds: { $sum: "$refund" },
                        totalMaterialCost: { $sum: "$totalMaterialCost" },
                        totalProfit: { $sum: "$profit" },
                    },
                },
                {
                    $addFields: {
                        totalRevenue: {
                            $subtract: ["$totalGrossRevenue", { $add: ["$totalShipping", "$totalBuyerTax", "$totalRefunds"] }],
                        },
                        avgOrderValue: {
                            $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalGrossRevenue", "$totalOrders"] }, 0],
                        },
                        avgProfit: {
                            $cond: [{ $gt: ["$totalOrders", 0] }, { $divide: ["$totalProfit", "$totalOrders"] }, 0],
                        },
                    },
                },
            ]),

            // ── Monthly breakdown ─────────────────────────────────────────────
            Order.aggregate([
                { $match: { orderDate: { $gte: start, $lt: end } } },
                {
                    $group: {
                        _id: { $month: "$orderDate" },
                        orders: { $sum: 1 },
                        grossRevenue: { $sum: "$totalCharged" },
                        revenue: {
                            $sum: {
                                $subtract: ["$totalCharged", { $add: ["$shippingCost", "$buyerTax", "$refund"] }],
                            },
                        },
                        profit: { $sum: "$profit" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            // ── Status breakdown ──────────────────────────────────────────────
            Order.aggregate([{ $match: { orderDate: { $gte: start, $lt: end } } }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

            // ── Top countries ─────────────────────────────────────────────────
            Order.aggregate([
                { $match: { orderDate: { $gte: start, $lt: end }, customer: { $ne: null } } },
                { $lookup: { from: "customers", localField: "customer", foreignField: "_id", as: "_c" } },
                { $set: { _c: { $arrayElemAt: ["$_c", 0] } } },
                { $match: { "_c.country": { $nin: [null, ""] } } },
                {
                    $group: {
                        _id: "$_c.country",
                        orders: { $sum: 1 },
                        revenue: { $sum: "$totalCharged" },
                    },
                },
                { $sort: { orders: -1 } },
                { $limit: 10 },
            ]),

            // ── Sales channels (origins) ──────────────────────────────────────
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: start, $lt: end },
                        origin: { $nin: [null, ""] },
                    },
                },
                {
                    $group: {
                        _id: "$origin",
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalCharged" },
                    },
                },
                { $sort: { count: -1 } },
            ]),

            // ── Top customers ─────────────────────────────────────────────────
            Order.aggregate([
                {
                    $match: {
                        orderDate: { $gte: start, $lt: end },
                        "customer.name": { $nin: [null, ""] },
                    },
                },
                {
                    $group: {
                        _id: "$customer.name",
                        orders: { $sum: 1 },
                        grossRevenue: { $sum: "$totalCharged" },
                        revenue: {
                            $sum: {
                                $subtract: ["$totalCharged", { $add: ["$shippingCost", "$buyerTax", "$refund"] }],
                            },
                        },
                        profit: { $sum: "$profit" },
                    },
                },
                { $sort: { grossRevenue: -1 } },
                { $limit: 10 },
            ]),

            // ── Top products ──────────────────────────────────────────────────
            Order.aggregate([
                { $match: { orderDate: { $gte: start, $lt: end } } },
                { $lookup: { from: "customers", localField: "customer", foreignField: "_id", as: "_c" } },
                { $set: { _c: { $arrayElemAt: ["$_c", 0] } } },
                { $addFields: { _productCount: { $size: { $ifNull: ["$products", []] } } } },
                { $match: { _productCount: { $gt: 0 } } },
                { $unwind: "$products" },
                {
                    $group: {
                        _id: "$products.productName",
                        sku: { $first: "$products.sku" },
                        category: { $first: "$products.category" },
                        totalQty: { $sum: "$products.quantity" },
                        orderCount: { $sum: 1 },
                        // Net revenue proportional to product's share of order
                        netRevenue: {
                            $sum: {
                                $multiply: ["$products.basePrice", "$products.quantity"],
                            },
                        },
                        netProfit: { $sum: { $divide: ["$profit", "$_productCount"] } },
                        byCountry: {
                            $push: {
                                country: "$_c.country",
                                totalQty: "$products.quantity",
                                orderCount: 1,
                                netRevenue: {
                                    $multiply: ["$products.basePrice", "$products.quantity"],
                                },
                                netProfit: "$profit",
                            },
                        },
                    },
                },
                { $sort: { totalQty: -1 } },
                { $limit: 15 },
                // Aggregate byCountry array
                {
                    $addFields: {
                        byCountry: {
                            $reduce: {
                                input: "$byCountry",
                                initialValue: [],
                                in: {
                                    $let: {
                                        vars: {
                                            existing: {
                                                $filter: {
                                                    input: "$$value",
                                                    as: "e",
                                                    cond: { $eq: ["$$e.country", "$$this.country"] },
                                                },
                                            },
                                        },
                                        in: {
                                            $cond: [
                                                { $gt: [{ $size: "$$existing" }, 0] },
                                                {
                                                    $map: {
                                                        input: "$$value",
                                                        as: "e",
                                                        in: {
                                                            $cond: [
                                                                { $eq: ["$$e.country", "$$this.country"] },
                                                                {
                                                                    country: "$$e.country",
                                                                    totalQty: { $add: ["$$e.totalQty", "$$this.totalQty"] },
                                                                    orderCount: { $add: ["$$e.orderCount", "$$this.orderCount"] },
                                                                    netRevenue: { $add: ["$$e.netRevenue", "$$this.netRevenue"] },
                                                                    netProfit: { $add: ["$$e.netProfit", "$$this.netProfit"] },
                                                                },
                                                                "$$e",
                                                            ],
                                                        },
                                                    },
                                                },
                                                { $concatArrays: ["$$value", ["$$this"]] },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ]),

            // ── Order materials used (aggregated by material name) ────────────
            Order.aggregate([
                { $match: { orderDate: { $gte: start, $lt: end } } },
                { $unwind: "$materials" },
                {
                    $group: {
                        _id: "$materials.materialName",
                        materialType: { $first: "$materials.materialType" },
                        unit: { $first: "$materials.unit" },
                        totalQuantity: { $sum: "$materials.quantityUsed" },
                        timesUsed: { $sum: 1 },
                        totalCost: { $sum: "$materials.lineCost" },
                    },
                },
                { $sort: { totalCost: -1 } },
            ]),

            // ── Overhead records for this year ────────────────────────────────
            Overhead.find({ year }).lean(),

            // ── All years that have orders ────────────────────────────────────
            Order.aggregate([{ $match: { orderDate: { $ne: null } } }, { $group: { _id: { $year: "$orderDate" } } }, { $sort: { _id: 1 } }]),
        ]);

        // Merge order materials and overhead records into a single sorted array
        const overheadMapped = overheads.map((o) => ({
            _id: o.name,
            materialType: o.category,
            totalQuantity: null,
            unit: null,
            timesUsed: null,
            totalCost: o.cost,
            isOverhead: true,
            overheadId: o._id,
            notes: o.notes,
        }));

        const materials = [...orderMaterials, ...overheadMapped].sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0));

        const summary = summaryResult[0] ?? {
            totalOrders: 0,
            totalGrossRevenue: 0,
            totalRevenue: 0,
            totalShipping: 0,
            totalBuyerTax: 0,
            totalHostingFees: 0,
            totalMarketingCost: 0,
            totalRefunds: 0,
            totalMaterialCost: 0,
            totalProfit: 0,
            avgOrderValue: 0,
            avgProfit: 0,
        };
        delete summary._id;

        res.json({
            summary,
            monthly,
            statusBreakdown,
            countries,
            origins,
            topCustomers,
            topProducts,
            materials,
            availableYears: availableYears.map((y) => y._id),
        });
    } catch (err) {
        console.error("[year-review] stats error:", err);
        res.status(500).json({ message: "Failed to load yearly stats." });
    }
});

// ── POST /year-review/overhead ────────────────────────────────────────────────
router.post("/year-review/overhead", requireAuth, async (req, res) => {
    const { name, category, cost, purchaseDate, notes } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Name is required." });
    if (cost == null || isNaN(Number(cost)) || Number(cost) < 0) return res.status(400).json({ message: "A valid cost is required." });
    if (!purchaseDate) return res.status(400).json({ message: "Purchase date is required." });

    try {
        const overhead = await Overhead.create({
            name: name.trim(),
            category: category?.trim() || "General",
            cost: Number(cost),
            purchaseDate: new Date(purchaseDate),
            notes: notes?.trim() || "",
            createdBy: req.user._id,
        });
        res.status(201).json(overhead);
    } catch (err) {
        console.error("[year-review] create overhead error:", err);
        res.status(500).json({ message: "Failed to save overhead purchase." });
    }
});

// ── DELETE /year-review/overhead/:id ─────────────────────────────────────────
router.delete("/year-review/overhead/:id", requireAuth, async (req, res) => {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid ID." });

    try {
        const deleted = await Overhead.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Overhead not found." });
        res.json({ message: "Deleted." });
    } catch (err) {
        console.error("[year-review] delete overhead error:", err);
        res.status(500).json({ message: "Failed to delete overhead." });
    }
});

export default router;
