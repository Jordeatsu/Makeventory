import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, Stack, Divider, IconButton, Tooltip, LinearProgress, Collapse, TextField, Button } from "@mui/material";
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

import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { STATUS_COLOURS } from "../theme";
import { useCurrencyFormatter } from "../utils/formatting";
import { useTranslation } from "react-i18next";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtN = (n) => Number(n || 0).toLocaleString("en-GB", { maximumFractionDigits: 2 });

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = "primary.main", bgcolor }) {
    return (
        <Paper elevation={2} sx={{ p: 2.5, height: "100%", bgcolor: bgcolor || "background.paper", borderRadius: 2 }}>
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
                <Box sx={{ color, opacity: 0.22, mt: 0.5 }}>{icon}</Box>
            </Stack>
        </Paper>
    );
}

// ── Section header ───────────────────────────────────────────────────────────
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

// ── Styled table head ────────────────────────────────────────────────────────
const HEAD_SX = {
    "& .MuiTableCell-head": {
        bgcolor: "primary.main",
        color: "white",
        fontWeight: 700,
    },
};

// ────────────────────────────────────────────────────────────────────────────
export default function YearReviewPage() {
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { t } = useTranslation();

    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedProducts, setExpandedProducts] = useState(new Set());

    // Overhead form state
    const [overheadForm, setOverheadForm] = useState({ name: "", category: "General", cost: "", purchaseDate: "", notes: "" });
    const [overheadSaving, setOverheadSaving] = useState(false);
    const [overheadError, setOverheadError] = useState("");

    const toggleProductExpand = (id) =>
        setExpandedProducts((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleAddOverhead = async () => {
        setOverheadError("");
        if (!overheadForm.name.trim()) {
            setOverheadError(t("yearReview.overhead.nameRequired"));
            return;
        }
        if (!overheadForm.cost || isNaN(Number(overheadForm.cost)) || Number(overheadForm.cost) < 0) {
            setOverheadError(t("yearReview.overhead.validCost"));
            return;
        }
        if (!overheadForm.purchaseDate) {
            setOverheadError(t("yearReview.overhead.dateRequired"));
            return;
        }

        setOverheadSaving(true);
        try {
            await api.post("/year-review/overhead", { ...overheadForm, cost: Number(overheadForm.cost) });
            setOverheadForm({ name: "", category: "General", cost: "", purchaseDate: "", notes: "" });
            await load();
        } catch (e) {
            setOverheadError(e?.response?.data?.message || t("yearReview.overhead.saveFailed"));
        } finally {
            setOverheadSaving(false);
        }
    };

    const handleDeleteOverhead = async (id) => {
        try {
            await api.delete(`/year-review/overhead/${id}`);
            await load();
        } catch {
            // silently ignore
        }
    };

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data: result } = await api.get(`/year-review/stats/${year}`);
            setData(result);
        } catch {
            setError(t("yearReview.loadError"));
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        load();
    }, [load]);

    const s = data?.summary || {};
    const hasData = (s.totalOrders || 0) > 0;

    const monthlyMap = {};
    (data?.monthly || []).forEach((m) => {
        monthlyMap[m._id] = m;
    });
    const monthlyFull = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        orders: monthlyMap[i + 1]?.orders || 0,
        grossRevenue: monthlyMap[i + 1]?.grossRevenue || 0,
        revenue: monthlyMap[i + 1]?.revenue || 0,
        profit: monthlyMap[i + 1]?.profit || 0,
    }));

    const bestMonth = monthlyFull.reduce((best, m) => (m.grossRevenue > best.grossRevenue ? m : best), monthlyFull[0]);
    const maxRevenue = Math.max(...monthlyFull.map((m) => m.grossRevenue), 1);

    return (
        <Box>
            {/* ── Header + year picker ─────────────────────────────────────── */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        {t("yearReview.title")}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t("yearReview.subtitle")}
                    </Typography>
                </Box>

                <Paper elevation={1} sx={{ px: 1, py: 0.5, display: "inline-flex", alignItems: "center", gap: 1, borderRadius: 2 }}>
                    <Tooltip title={t("yearReview.previousYear")}>
                        <IconButton size="small" onClick={() => setYear((y) => y - 1)}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Tooltip>
                    <Typography variant="h6" fontWeight={700} sx={{ minWidth: 52, textAlign: "center" }}>
                        {year}
                    </Typography>
                    <Tooltip title={t("yearReview.nextYear")}>
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
                <Paper elevation={1} sx={{ py: 8, textAlign: "center", borderRadius: 2 }}>
                    <ReceiptIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">{t("yearReview.noData", { year })}</Typography>
                </Paper>
            ) : (
                <Box>
                    {/* ── Overview KPI cards ─────────────────────────────── */}
                    <Grid container spacing={2} mb={3}>
                        <Grid size={{ xs: 12, sm: 6, md: true }}>
                            <StatCard icon={<ShoppingBagIcon sx={{ fontSize: 40 }} />} label={t("yearReview.kpi.totalOrders")} value={s.totalOrders || 0} color="primary.main" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: true }}>
                            <StatCard icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />} label={t("yearReview.kpi.grossRevenue")} value={fmt(s.totalGrossRevenue)} sub={t("yearReview.kpi.avgPerOrder", { value: fmt((s.totalGrossRevenue || 0) / Math.max(s.totalOrders || 1, 1)) })} color="info.main" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: true }}>
                            <StatCard icon={<TrendingUpIcon sx={{ fontSize: 40 }} />} label={t("yearReview.kpi.netRevenue")} value={fmt(s.totalRevenue)} sub={t("yearReview.kpi.avgPerOrder", { value: fmt(s.avgOrderValue) })} color="info.dark" />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: true }}>
                            <StatCard icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />} label={t("yearReview.kpi.totalProfit")} value={fmt(s.totalProfit)} sub={t("yearReview.kpi.avgPerOrder", { value: fmt(s.avgProfit) })} color={s.totalProfit >= 0 ? "success.main" : "error.main"} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: true }}>
                            <StatCard
                                icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
                                label={t("yearReview.kpi.profitMargin")}
                                value={(s.totalGrossRevenue || 0) > 0 ? `${((s.totalProfit / s.totalGrossRevenue) * 100).toFixed(1)}%` : "—"}
                                sub={t("yearReview.kpi.profitOverRevenue")}
                                color={s.totalProfit >= 0 ? "success.main" : "error.main"}
                            />
                        </Grid>
                    </Grid>

                    {/* ── Cost breakdown ─────────────────────────────────── */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <SectionHeader icon={<AttachMoneyIcon />} title={t("yearReview.sections.costBreakdown")} />
                        <Grid container spacing={2}>
                            {[
                                { icon: <LocalShippingIcon sx={{ fontSize: 28 }} />, value: fmt(s.totalShipping), label: t("yearReview.costs.shippingPaid"), color: "text.secondary" },
                                { icon: <ReceiptIcon sx={{ fontSize: 28 }} />, value: fmt(s.totalBuyerTax), label: t("yearReview.costs.buyerTaxCollected"), color: "text.secondary" },
                                { icon: <StorefrontIcon sx={{ fontSize: 28 }} />, value: fmt(s.totalHostingFees), label: t("yearReview.costs.hostingFees"), color: "text.secondary" },
                                { icon: <CampaignIcon sx={{ fontSize: 28 }} />, value: fmt(s.totalMarketingCost), label: t("yearReview.costs.marketingCosts"), color: "text.secondary" },
                                {
                                    icon: <MoneyOffIcon sx={{ fontSize: 28 }} />,
                                    value: fmt(s.totalRefunds),
                                    label: t("yearReview.costs.refundsIssued"),
                                    color: s.totalRefunds > 0 ? "error.main" : "text.primary",
                                },
                                { icon: <BuildIcon sx={{ fontSize: 28 }} />, value: fmt(s.totalMaterialCost), label: t("yearReview.costs.materialCosts"), color: "text.secondary" },
                            ].map(({ icon, value, label, color }) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={label}>
                                    <Box sx={{ textAlign: "center", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                        <Box sx={{ color: "text.secondary" }}>{icon}</Box>
                                        <Typography variant="h6" fontWeight={700} mt={0.5} color={color}>
                                            {value}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    {/* ── Monthly breakdown ──────────────────────────────── */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <SectionHeader icon={<ReceiptIcon />} title={t("yearReview.sections.monthlyBreakdown")} />
                        {bestMonth.grossRevenue > 0 && (
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {t("yearReview.bestMonth", { month: MONTHS[bestMonth.month - 1], revenue: fmt(bestMonth.grossRevenue) })}
                            </Typography>
                        )}
                        <TableContainer>
                            <Table size="small" sx={HEAD_SX}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("yearReview.monthly.month")}</TableCell>
                                        <TableCell align="center">{t("yearReview.monthly.orders")}</TableCell>
                                        <TableCell align="right">{t("yearReview.monthly.grossRevenue")}</TableCell>
                                        <TableCell align="right">{t("yearReview.monthly.netRevenue")}</TableCell>
                                        <TableCell align="right">{t("yearReview.monthly.profit")}</TableCell>
                                        <TableCell sx={{ minWidth: 140 }}>{t("yearReview.monthly.revenueShare")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {monthlyFull.map((m) => (
                                        <TableRow key={m.month} sx={{ opacity: m.orders === 0 ? 0.4 : 1 }}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={m.month === bestMonth.month && m.grossRevenue > 0 ? 700 : 400}>
                                                    {MONTHS[m.month - 1]}
                                                    {m.month === bestMonth.month && m.grossRevenue > 0 && <Chip label={t("yearReview.monthly.best")} size="small" color="success" sx={{ ml: 1, height: 18, fontSize: 10 }} />}
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
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(m.grossRevenue / maxRevenue) * 100}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: "action.hover",
                                                        "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* ── Three-column row ───────────────────────────────── */}
                    <Grid container spacing={2} mb={3}>
                        {/* Order status */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper elevation={2} sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                                <SectionHeader icon={<ReceiptIcon />} title={t("yearReview.sections.orderStatus")} />
                                <Stack spacing={1.5}>
                                    {(data?.statusBreakdown || []).map((st) => (
                                        <Stack key={st._id} direction="row" justifyContent="space-between" alignItems="center">
                                            <Chip label={st._id} size="small" sx={{ bgcolor: STATUS_COLOURS[st._id] || "#ccc", color: "#fff", fontWeight: 600 }} />
                                            <Typography variant="body2" fontWeight={700}>
                                                {st.count}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Top countries */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper elevation={2} sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                                <SectionHeader icon={<PublicIcon />} title={t("yearReview.sections.topCountries")} />
                                {(data?.countries || []).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {t("yearReview.noCountryData")}
                                    </Typography>
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
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {c.orders} {t("yearReview.order", { count: c.orders })}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {fmt(c.revenue)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Grid>

                        {/* Sales channels */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper elevation={2} sx={{ p: 3, height: "100%", borderRadius: 2 }}>
                                <SectionHeader icon={<StorefrontIcon />} title={t("yearReview.sections.salesChannels")} />
                                {(data?.origins || []).length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {t("yearReview.noChannelData")}
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {(data?.origins || []).map((o) => (
                                            <Stack key={o._id} direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2">{o._id}</Typography>
                                                <Stack alignItems="flex-end">
                                                    <Typography variant="body2" fontWeight={700}>
                                                        {o.count} {t("yearReview.order", { count: o.count })}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {fmt(o.revenue)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* ── Top customers ──────────────────────────────────── */}
                    {(data?.topCustomers || []).length > 0 && (
                        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <SectionHeader icon={<PeopleIcon />} title={t("yearReview.sections.topCustomers")} />
                            <TableContainer>
                                <Table size="small" sx={HEAD_SX}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t("yearReview.topCustomers.rank")}</TableCell>
                                            <TableCell>{t("yearReview.topCustomers.customer")}</TableCell>
                                            <TableCell align="center">{t("yearReview.topCustomers.orders")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topCustomers.grossRevenue")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topCustomers.netRevenue")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topCustomers.profit")}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.topCustomers || []).map((c, i) => (
                                            <TableRow key={c._id}>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        #{i + 1}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {c._id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{c.orders}</TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {fmt(c.grossRevenue)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {fmt(c.revenue)}
                                                    </Typography>
                                                </TableCell>
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

                    {/* ── Most purchased products ────────────────────────── */}
                    {(data?.topProducts || []).length > 0 && (
                        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <SectionHeader icon={<ShoppingBagIcon />} title={t("yearReview.sections.mostPurchasedProducts")} />
                            <TableContainer>
                                <Table size="small" sx={HEAD_SX}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: 36, p: 0.5 }} />
                                            <TableCell sx={{ width: 36 }}>{t("yearReview.topCustomers.rank")}</TableCell>
                                            <TableCell>{t("yearReview.topProducts.product")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topProducts.unitsSold")}</TableCell>
                                            <TableCell align="center">{t("yearReview.topProducts.orders")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topProducts.netRevenue")}</TableCell>
                                            <TableCell align="right">{t("yearReview.topProducts.profit")}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.topProducts || []).map((p, i) => {
                                            const isExpanded = expandedProducts.has(p._id);
                                            const sortedCountries = [...(p.byCountry || [])].sort((a, b) => b.totalQty - a.totalQty).filter((c) => c.country);
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
                                                            <Typography variant="body2" color="text.secondary">
                                                                #{i + 1}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {p._id}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {[p.sku, p.category].filter(Boolean).join(" · ")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {p.totalQty}
                                                            </Typography>
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
                                                                                <TableCell sx={{ pl: 8, color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>{t("yearReview.topProducts.country")}</TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>
                                                                                    {t("yearReview.topProducts.unitsSold")}
                                                                                </TableCell>
                                                                                <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>
                                                                                    {t("yearReview.topProducts.orders")}
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>
                                                                                    {t("yearReview.topProducts.netRevenue")}
                                                                                </TableCell>
                                                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.7rem", fontWeight: 700 }}>
                                                                                    {t("yearReview.topProducts.profit")}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </TableHead>
                                                                        <TableBody>
                                                                            {sortedCountries.map((c) => (
                                                                                <TableRow key={c.country} sx={{ bgcolor: "action.hover" }}>
                                                                                    <TableCell sx={{ pl: 8 }}>
                                                                                        <Typography variant="caption" fontWeight={600}>
                                                                                            {c.country}
                                                                                        </Typography>
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

                    {/* ── Materials & overheads ──────────────────────────── */}
                    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <SectionHeader icon={<BuildIcon />} title={t("yearReview.sections.materialsUsed")} />

                        {(data?.materials || []).length > 0 && (
                            <TableContainer sx={{ mb: 3 }}>
                                <Table size="small" sx={HEAD_SX}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t("yearReview.materials.material")}</TableCell>
                                            <TableCell>{t("yearReview.materials.type")}</TableCell>
                                            <TableCell align="right">{t("yearReview.materials.totalQuantity")}</TableCell>
                                            <TableCell align="center">{t("yearReview.materials.timesUsed")}</TableCell>
                                            <TableCell align="right">{t("yearReview.materials.totalCost")}</TableCell>
                                            <TableCell sx={{ width: 40 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(data?.materials || []).map((m) => (
                                            <TableRow key={m.isOverhead ? `overhead-${m.overheadId}` : m._id} sx={m.isOverhead ? { bgcolor: "action.hover" } : {}}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {m._id}
                                                        </Typography>
                                                        {m.isOverhead && <Chip label={t("yearReview.materials.overhead")} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />}
                                                    </Stack>
                                                    {m.isOverhead && m.notes && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {m.notes}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={m.materialType || "—"} size="small" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {m.isOverhead ? (
                                                        <Typography variant="body2" color="text.disabled">
                                                            —
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2">
                                                            {fmtN(m.totalQuantity)} {m.unit}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {m.isOverhead ? (
                                                        <Typography variant="body2" color="text.disabled">
                                                            —
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2">{m.timesUsed}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="body2" fontWeight={600} color="error.main">
                                                        {fmt(m.totalCost)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {m.isOverhead && (
                                                        <Tooltip title={t("yearReview.materials.removeOverhead")}>
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

                        {/* Add overhead form */}
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                            {t("yearReview.sections.addOverhead")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                            {t("yearReview.overhead.description")}
                        </Typography>

                        {overheadError && (
                            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setOverheadError("")}>
                                {overheadError}
                            </Alert>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} flexWrap="wrap">
                            <TextField label={t("yearReview.overhead.nameLabel")} size="small" value={overheadForm.name} onChange={(e) => setOverheadForm((f) => ({ ...f, name: e.target.value }))} sx={{ flex: 2, minWidth: 160 }} placeholder={t("yearReview.overhead.namePlaceholder")} />
                            <TextField
                                label={t("yearReview.overhead.categoryLabel")}
                                size="small"
                                value={overheadForm.category}
                                onChange={(e) => setOverheadForm((f) => ({ ...f, category: e.target.value }))}
                                sx={{ flex: 1, minWidth: 130 }}
                                placeholder={t("yearReview.overhead.categoryPlaceholder")}
                            />
                            <TextField label={t("yearReview.overhead.costLabel")} size="small" type="number" value={overheadForm.cost} onChange={(e) => setOverheadForm((f) => ({ ...f, cost: e.target.value }))} sx={{ width: 110 }} inputProps={{ min: 0, step: 0.01 }} />
                            <TextField label={t("yearReview.overhead.dateLabel")} size="small" type="date" value={overheadForm.purchaseDate} onChange={(e) => setOverheadForm((f) => ({ ...f, purchaseDate: e.target.value }))} sx={{ width: 160 }} InputLabelProps={{ shrink: true }} />
                            <TextField label={t("yearReview.overhead.notesLabel")} size="small" value={overheadForm.notes} onChange={(e) => setOverheadForm((f) => ({ ...f, notes: e.target.value }))} sx={{ flex: 3, minWidth: 160 }} />
                            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddOverhead} disabled={overheadSaving} sx={{ alignSelf: "flex-start", mt: { xs: 0, sm: 0.3 } }}>
                                {t("yearReview.overhead.addButton")}
                            </Button>
                        </Stack>
                    </Paper>

                    {/* ── Available years hint ───────────────────────────── */}
                    {(data?.availableYears || []).length > 1 && (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="caption" color="text.secondary">
                                {t("yearReview.yearsWithOrders")}{" "}
                                {data.availableYears.map((y) => (
                                    <Typography
                                        key={y}
                                        component="span"
                                        variant="caption"
                                        onClick={() => setYear(y)}
                                        sx={{
                                            cursor: "pointer",
                                            fontWeight: y === year ? 700 : 400,
                                            color: y === year ? "primary.main" : "text.secondary",
                                            mx: 0.5,
                                            "&:hover": { textDecoration: "underline" },
                                        }}
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
