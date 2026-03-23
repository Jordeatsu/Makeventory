/**
 * @file YearReviewPage.js
 * @description Year-in-review analytics page shown at /year-review.
 *
 * Loads GET /api/orders/stats/yearly/:year which returns a rich aggregate
 * object. The user can step forward/back through years with chevron buttons.
 *
 * Sections displayed
 * ------------------
 * - Financial summary KPI cards (gross revenue, net profit, shipping,
 *   hosting fees, marketing cost, refunds, material cost, avg order value).
 * - Monthly revenue/profit table for all 12 months (zeros for empty months).
 * - Order status breakdown chips.
 * - Top 5 customers by revenue.
 * - Top countries by order count.
 * - Top products with expandable per-country breakdown.
 * - Materials used (sorted by total cost).
 */
import React, { useState, useEffect, useCallback } from "react";
import {
    Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, CircularProgress, Alert, Stack, Divider,
    IconButton, Tooltip, LinearProgress, Collapse, TextField, Button,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CampaignIcon from "@mui/icons-material/Campaign";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { getYearlyStats, createOverhead, deleteOverhead } from "../services/api";
import { STATUS_COLORS } from "../colors";

const fmt  = (n) => `£${Number(n || 0).toFixed(2)}`;
const fmtN = (n) => Number(n || 0).toLocaleString("en-GB", { maximumFractionDigits: 2 });

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Reusable stat card ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "primary.main", bgcolor }) {
    return (
        <Paper sx={{ p: 2.5, height: "100%", bgcolor: bgcolor || "background.paper" }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={color} mt={0.5}>
                        {value}
                    </Typography>
                    {sub && (
                        <Typography variant="caption" color="text.secondary">
                            {sub}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ color, opacity: 0.25, mt: 0.5 }}>{icon}</Box>
            </Stack>
        </Paper>
    );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
    return (
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
            <Box sx={{ color: "primary.main" }}>{icon}</Box>
            <Typography variant="h6" fontWeight={700}>
                {title}
            </Typography>
        </Stack>
    );
}

/**
 * @component
 * @returns {JSX.Element}
 */
export default function YearReviewPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedProducts, setExpandedProducts] = useState(new Set());

    // Overhead purchase form state
    const [overheadForm, setOverheadForm] = useState({ name: "", category: "General", cost: "", purchaseDate: "", notes: "" });
    const [overheadSaving, setOverheadSaving] = useState(false);
    const [overheadError, setOverheadError] = useState("");
    const toggleProductExpand = (id) => setExpandedProducts((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const handleAddOverhead = async () => {
        setOverheadError("");
        if (!overheadForm.name.trim()) { setOverheadError("Name is required"); return; }
        if (!overheadForm.cost || isNaN(Number(overheadForm.cost)) || Number(overheadForm.cost) < 0) { setOverheadError("Enter a valid cost"); return; }
        if (!overheadForm.purchaseDate) { setOverheadError("Purchase date is required"); return; }
        setOverheadSaving(true);
        try {
            await createOverhead({ ...overheadForm, cost: Number(overheadForm.cost) });
            setOverheadForm({ name: "", category: "General", cost: "", purchaseDate: "", notes: "" });
            await load();
        } catch (e) {
            setOverheadError(e?.response?.data?.message || "Failed to save");
        } finally {
            setOverheadSaving(false);
        }
    };

    const handleDeleteOverhead = async (id) => {
        try {
            await deleteOverhead(id);
            await load();
        } catch {
            // silently ignore
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await getYearlyStats(year);
            setData(result);
        } catch {
            setError("Failed to load yearly stats. Is the server running?");
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        load();
    }, [load]);

    const s = data?.summary || {};
    const hasData = (s.totalOrders || 0) > 0;

    // Build complete 12-month array filling in zeros for missing months
    const monthlyMap = {};
    (data?.monthly || []).forEach((m) => { monthlyMap[m._id] = m; });
    const monthlyFull = Array.from({ length: 12 }, (_, i) => ({
        month:        i + 1,
        orders:       monthlyMap[i + 1]?.orders       || 0,
        grossRevenue: monthlyMap[i + 1]?.grossRevenue || 0,
        revenue:      monthlyMap[i + 1]?.revenue      || 0,
        profit:       monthlyMap[i + 1]?.profit       || 0,
    }));

    const bestMonthRevenue = monthlyFull.reduce((best, m) => (m.grossRevenue > best.grossRevenue ? m : best), monthlyFull[0]);
    const maxRevenue = Math.max(...monthlyFull.map((m) => m.grossRevenue), 1);

    return (
        <Box>
            {/* ── Header + Year Picker ── */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4">Year in Review</Typography>
                    <Typography color="text.secondary" variant="body2">
                        A full breakdown of your business performance for the selected year
                    </Typography>
                </Box>

                {/* Year selector */}
                <Paper sx={{ px: 1, py: 0.5, display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <Tooltip title="Previous year">
                        <IconButton size="small" onClick={() => setYear((y) => y - 1)}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" fontWeight={700} sx={{ minWidth: 52, textAlign: "center" }}>
                        {year}
                    </Typography>
                    <Tooltip title="Next year">
                        <IconButton size="small" onClick={() => setYear((y) => y + 1)} disabled={year >= new Date().getFullYear()}>
                            <ChevronRightIcon />
                        </IconButton>
                    </Tooltip>
                </Paper>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : !hasData ? (
                <Paper sx={{ py: 8, textAlign: "center" }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">No orders found for {year}.</Typography>
                </Paper>
            ) : (
                <Box>
                    {/* ── Overview Cards ── */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={6} md>
                            <StatCard icon={<ShoppingBagIcon sx={{ fontSize: 40 }} />} label="Total Orders" value={s.totalOrders || 0} color="primary.main" />
                        </Grid>
                        <Grid item xs={12} sm={6} md>
                            <StatCard icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />} label="Gross Revenue" value={fmt(s.totalGrossRevenue)} sub={`Avg ${fmt((s.totalGrossRevenue || 0) / Math.max(s.totalOrders || 1, 1))} / order`} color="info.main" />
                        </Grid>
                        <Grid item xs={12} sm={6} md>
                            <StatCard icon={<TrendingUpIcon sx={{ fontSize: 40 }} />} label="Net Revenue" value={fmt(s.totalRevenue)} sub={`Avg ${fmt(s.avgOrderValue)} / order`} color="info.dark" />
                        </Grid>
                        <Grid item xs={12} sm={6} md>
                            <StatCard icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />} label="Total Profit" value={fmt(s.totalProfit)} sub={`Avg ${fmt(s.avgProfit)} / order`} color={s.totalProfit >= 0 ? "success.main" : "error.main"} />
                        </Grid>
                        <Grid item xs={12} sm={6} md>
                            <StatCard
                                icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
                                label="Profit Margin"
                                value={(s.totalGrossRevenue || 0) > 0 ? `${((s.totalProfit / s.totalGrossRevenue) * 100).toFixed(1)}%` : "—"}
                                sub="Profit ÷ Gross Revenue"
                                color={s.totalProfit >= 0 ? "success.main" : "error.main"}
                            />
                        </Grid>
                    </Grid>

                    {/* ── Cost Breakdown ── */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <SectionHeader icon={<AttachMoneyIcon />} title="Cost Breakdown" />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <LocalShippingIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5}>{fmt(s.totalShipping)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Shipping Paid</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <ReceiptIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5}>{fmt(s.totalBuyerTax)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Buyer Tax Collected</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <StorefrontIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5}>{fmt(s.totalHostingFees)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Hosting Fees</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <CampaignIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5}>{fmt(s.totalMarketingCost)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Marketing Costs</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <MoneyOffIcon sx={{ color: "error.light", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5} color={s.totalRefunds > 0 ? "error.main" : "text.primary"}>{fmt(s.totalRefunds)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Refunds Issued</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4} lg>
                                <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <BuildIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                                    <Typography variant="h6" fontWeight={700} mt={0.5}>{fmt(s.totalMaterialCost)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Material Costs</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ── Monthly Breakdown ── */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <SectionHeader icon={<ReceiptIcon />} title="Monthly Breakdown" />
                        {bestMonthRevenue.grossRevenue > 0 && (
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Best month by gross revenue: <strong>{MONTHS[bestMonthRevenue.month - 1]}</strong> ({fmt(bestMonthRevenue.grossRevenue)})
                            </Typography>
                        )}
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        <TableCell align="center">Orders</TableCell>
                                        <TableCell align="right">Gross Revenue</TableCell>
                                        <TableCell align="right">Net Revenue</TableCell>
                                        <TableCell align="right">Profit</TableCell>
                                        <TableCell sx={{ minWidth: 140 }}>Revenue Share</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyFull.map((m) => (
                                        <TableRow key={m.month} sx={{ opacity: m.orders === 0 ? 0.4 : 1 }}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={m.month === bestMonthRevenue.month && m.grossRevenue > 0 ? 700 : 400}>
                                                    {MONTHS[m.month - 1]}
                                                    {m.month === bestMonthRevenue.month && m.grossRevenue > 0 && (
                                                        <Chip label="Best" size="small" color="success" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                                                    )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">{m.orders || "—"}</TableCell>
                                            <TableCell align="right">{m.grossRevenue > 0 ? fmt(m.grossRevenue) : "—"}</TableCell>
                                            <TableCell align="right">{m.revenue > 0 ? fmt(m.revenue) : "—"}</TableCell>
                                            <TableCell align="right">
                                                {m.profit !== 0 ? (
                                                    <Typography variant="body2" color={m.profit >= 0 ? "success.main" : "error.main"} fontWeight={600}>
                                                        {fmt(m.profit)}
                                                    </Typography>
                                                ) : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(m.grossRevenue / maxRevenue) * 100}
                                                    sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: "primary.main" } }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* ── Three-column row ── */}
                    <Grid container spacing={2} mb={3}>
                        {/* Order Status */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: "100%" }}>
                                <SectionHeader icon={<ReceiptIcon />} title="Order Status" />
                                <Stack spacing={1.5}>
                                    {(data?.statusBreakdown || []).map((s) => (
                                        <Stack key={s._id} direction="row" justifyContent="space-between" alignItems="center">
                                            <Chip label={s._id} size="small" sx={{ bgcolor: STATUS_COLORS[s._id] || "#ccc", color: "#fff", fontWeight: 600 }} />
                                            <Typography variant="body2" fontWeight={700}>
                                                {s.count}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Top Countries */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: "100%" }}>
                                <SectionHeader icon={<PublicIcon />} title="Top Countries" />
                                {(data?.countries || []).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">No country data recorded.</Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {(data?.countries || []).map((c, i) => (
                                            <Stack key={c._id} direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 18 }}>
                                                        #{i + 1}
                                                    </Typography>
                                                    <Typography variant="body2">{c._id}</Typography>
                                                </Stack>
                                                <Stack alignItems="flex-end">
                                                    <Typography variant="body2" fontWeight={700}>{c.orders} order{c.orders !== 1 ? "s" : ""}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{fmt(c.revenue)}</Typography>
                                                </Stack>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Grid>

                        {/* Sales Channel */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, height: "100%" }}>
                                <SectionHeader icon={<StorefrontIcon />} title="Sales Channels" />
                                <Stack spacing={1.5}>
                                    {(data?.origins || []).map((o) => (
                                        <Stack key={o._id} direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2">{o._id}</Typography>
                                            <Stack alignItems="flex-end">
                                                <Typography variant="body2" fontWeight={700}>{o.count} order{o.count !== 1 ? "s" : ""}</Typography>
                                                <Typography variant="caption" color="text.secondary">{fmt(o.revenue)}</Typography>
                                            </Stack>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* ── Top Customers ── */}
                    {(data?.topCustomers || []).length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <SectionHeader icon={<PeopleIcon />} title="Top Customers" />
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell align="center">Orders</TableCell>
                                            <TableCell align="right">Gross Revenue</TableCell>
                                            <TableCell align="right">Net Revenue</TableCell>
                                            <TableCell align="right">Profit</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.topCustomers || []).map((c, i) => (
                                            <TableRow key={c._id}>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">#{i + 1}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{c._id}</Typography>
                                                </TableCell>
                                                <TableCell align="center">{c.orders}</TableCell>
                                                <TableCell align="right"><Typography variant="body2" fontWeight={600}>{fmt(c.grossRevenue)}</Typography></TableCell>
                                                <TableCell align="right"><Typography variant="body2" fontWeight={600}>{fmt(c.revenue)}</Typography></TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color={c.profit >= 0 ? "success.main" : "error.main"}>
                                                        {fmt(c.profit)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* ── Most Purchased Products ── */}
                    {(data?.topProducts || []).length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <SectionHeader icon={<ShoppingBagIcon />} title="Most Purchased Products" />
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: 36, p: 0.5 }} />
                                            <TableCell sx={{ width: 36 }}>#</TableCell>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Units Sold</TableCell>
                                            <TableCell align="center">Orders</TableCell>
                                            <TableCell align="right">Net Revenue</TableCell>
                                            <TableCell align="right">Profit</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.topProducts || []).map((p, i) => {
                                            const isExpanded = expandedProducts.has(p._id);
                                            const sortedCountries = [...(p.byCountry || [])].sort((a, b) => b.totalQty - a.totalQty);
                                            const hasCountries = sortedCountries.length > 1;
                                            return (
                                                <React.Fragment key={p._id}>
                                                    <TableRow sx={{ "& > *": { borderBottom: isExpanded ? "unset" : undefined } }}>
                                                        <TableCell sx={{ p: 0.5 }}>
                                                            {hasCountries && (
                                                                <IconButton size="small" onClick={() => toggleProductExpand(p._id)}>
                                                                    {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">#{i + 1}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>{p._id}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {[p.sku, p.category].filter(Boolean).join(" · ")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" fontWeight={600}>{p.totalQty}</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">{p.orderCount}</TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {p.netRevenue > 0 ? fmt(p.netRevenue) : "—"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" fontWeight={600} color={p.netProfit >= 0 ? "success.main" : "error.main"}>
                                                                {fmt(p.netProfit)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                    {hasCountries && (
                                                        <TableRow>
                                                            <TableCell colSpan={7} sx={{ py: 0, border: isExpanded ? undefined : "none" }}>
                                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                                    <Table size="small" sx={{ mb: 1 }}>
                                                                        <TableHead>
                                                                            <TableRow>
                                                                                <TableCell sx={{ pl: 8, color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>Country</TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>Units Sold</TableCell>
                                                                                <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>Orders</TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>Net Revenue</TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>Profit</TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {sortedCountries.map((c) => (
                                                                                <TableRow key={c.country} sx={{ bgcolor: "action.hover" }}>
                                                                                    <TableCell sx={{ pl: 8 }}>
                                                                                        <Typography variant="caption" fontWeight={600}>{c.country}</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Typography variant="caption">{c.totalQty}</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="center">
                                                                                        <Typography variant="caption">{c.orderCount}</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Typography variant="caption">{c.netRevenue > 0 ? fmt(c.netRevenue) : "—"}</Typography>
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        <Typography variant="caption" fontWeight={600} color={c.netProfit >= 0 ? "success.main" : "error.main"}>
                                                                                            {fmt(c.netProfit)}
                                                                                        </Typography>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </Collapse>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* ── Materials Used ── */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <SectionHeader icon={<BuildIcon />} title="Materials Used" />
                        {(data?.materials || []).length > 0 && (
                        <TableContainer sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Total Quantity</TableCell>
                                        <TableCell align="center">Times Used</TableCell>
                                        <TableCell align="right">Total Cost</TableCell>
                                        <TableCell sx={{ width: 40 }} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(data?.materials || []).map((m) => (
                                        <TableRow key={m.isOverhead ? `overhead-${m.overheadId}` : m._id} sx={m.isOverhead ? { bgcolor: "action.hover" } : {}}>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <Typography variant="body2" fontWeight={600}>{m._id}</Typography>
                                                    {m.isOverhead && <Chip label="Overhead" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
                                                </Stack>
                                                {m.isOverhead && m.notes && (
                                                    <Typography variant="caption" color="text.secondary">{m.notes}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={m.materialType || "—"} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell align="right">
                                                {m.isOverhead ? <Typography variant="body2" color="text.disabled">—</Typography> : <Typography variant="body2">{fmtN(m.totalQuantity)} {m.unit}</Typography>}
                                            </TableCell>
                                            <TableCell align="center">
                                                {m.isOverhead ? <Typography variant="body2" color="text.disabled">—</Typography> : <Typography variant="body2">{m.timesUsed}</Typography>}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600} color="error.main">{fmt(m.totalCost)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {m.isOverhead && (
                                                    <Tooltip title="Remove overhead">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteOverhead(m.overheadId)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        )}

                        {/* Add overhead purchase */}
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                            Add Overhead Purchase
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                            Record a one-off business cost (e.g. printer ink, packaging tape) that isn’t tracked in inventory but should count against this year’s costs.
                        </Typography>
                        {overheadError && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setOverheadError("")}>{overheadError}</Alert>}
                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} flexWrap="wrap">
                            <TextField
                                label="Name"
                                size="small"
                                value={overheadForm.name}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, name: e.target.value }))}
                                sx={{ flex: 2, minWidth: 160 }}
                                placeholder="e.g. Black Printer Ink"
                            />
                            <TextField
                                label="Category"
                                size="small"
                                value={overheadForm.category}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, category: e.target.value }))}
                                sx={{ flex: 1, minWidth: 130 }}
                                placeholder="e.g. Office Supplies"
                            />
                            <TextField
                                label="Cost (£)"
                                size="small"
                                type="number"
                                value={overheadForm.cost}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, cost: e.target.value }))}
                                sx={{ width: 110 }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                            <TextField
                                label="Purchase Date"
                                size="small"
                                type="date"
                                value={overheadForm.purchaseDate}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, purchaseDate: e.target.value }))}
                                sx={{ width: 160 }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Notes (optional)"
                                size="small"
                                value={overheadForm.notes}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, notes: e.target.value }))}
                                sx={{ flex: 3, minWidth: 160 }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddOverhead}
                                disabled={overheadSaving}
                                sx={{ alignSelf: "flex-start", mt: { xs: 0, sm: 0.3 } }}
                            >
                                Add
                            </Button>
                        </Stack>
                    </Paper>

                    {/* ── Available Years hint ── */}
                    {(data?.availableYears || []).length > 1 && (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                Years with orders:{" "}
                                {data.availableYears.map((y, i) => (
                                    <Typography
                                        key={y}
                                        component="span"
                                        variant="caption"
                                        onClick={() => setYear(y)}
                                        sx={{ cursor: "pointer", fontWeight: y === year ? 700 : 400, color: y === year ? "primary.main" : "text.secondary", mx: 0.5, "&:hover": { textDecoration: "underline" } }}
                                    >
                                        {y}
                                    </Typography>
                                ))}
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}
