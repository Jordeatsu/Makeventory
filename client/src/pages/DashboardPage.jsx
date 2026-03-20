import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper, Chip, Stack, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Button, Divider, LinearProgress, Tooltip } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import api from "../api";
import { STATUS_COLOURS, SEMANTIC, BRAND } from "../colours";

// Types whose cost is expressed per-pack rather than per-unit
const BULK_TYPES = ["Bulk Pack", "Multipack"];

/**
 * Compact KPI card used in the top stats row.
 *
 * @param {Object}      props
 * @param {JSX.Element} props.icon  - MUI SvgIcon element
 * @param {string}      props.label - Metric name
 * @param {string}      props.value - Formatted metric value
 * @param {string}      [props.sub] - Optional sub-label beneath the value
 * @param {string}      [props.color="primary.main"] - MUI colour token for value and icon tint
 * @returns {JSX.Element}
 */
function StatCard({ icon, label, value, sub, color = "primary.main" }) {
    return (
        <Paper sx={{ p: 3, height: "100%" }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color={color}>
                        {value}
                    </Typography>
                    {sub && (
                        <Typography variant="caption" color="text.secondary">
                            {sub}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ p: 1.5, bgcolor: `${color}18`, borderRadius: 2, color }}>{icon}</Box>
            </Stack>
        </Paper>
    );
}

/**
 * @component
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { settings } = useGlobalSettings();
    const [materials, setMaterials] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Currency symbol derived from GlobalSettings
    const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => `${currencySymbol}${Number(n || 0).toFixed(2)}`;
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

    useEffect(() => {
        // Each call resolves to [] if the endpoint doesn't exist yet, so the
        // page renders with empty states rather than a full error screen.
        const safeFetch = (path) =>
            api.get(path).then((r) => r.data?.items ?? r.data?.materials ?? r.data?.orders ?? []).catch(() => []);

        Promise.all([safeFetch("/materials"), safeFetch("/orders")])
            .then(([mats, ords]) => {
                setMaterials(mats);
                setOrders(ords);
            })
            .catch(() => setError(t("dashboard.loadError")))
            .finally(() => setLoading(false));
    }, [t]);

    if (loading)
        return (
            <Box display="flex" justifyContent="center" pt={8}>
                <CircularProgress />
            </Box>
        );

    const totalRevenue = orders.reduce((s, o) => s + (o.totalCharged || 0), 0);
    const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const activeOrders = orders.filter((o) => !["Completed", "Shipped", "Cancelled"].includes(o.status));
    const lowStock = materials.filter((m) => m.quantity <= m.lowStockThreshold);
    const recentOrders = [...orders].slice(0, 5);

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});
    const chartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    const totalStockValue = materials.reduce((s, m) => {
        const effectiveCost = BULK_TYPES.includes(m.type) && m.unitsPerPack > 0 ? m.costPerUnit / m.unitsPerPack : m.costPerUnit;
        return s + m.quantity * effectiveCost;
    }, 0);

    return (
        <Box>
            <Typography variant="h4" mb={0.5}>
                {t("dashboard.title")}
            </Typography>
            <Typography color="text.secondary" variant="body2" mb={3}>
                {t("dashboard.subtitle")}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* KPI cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<ReceiptLongIcon />} label={t("dashboard.totalOrders")} value={orders.length} sub={t("dashboard.activeOrders", { count: activeOrders.length })} color="primary.main" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<AttachMoneyIcon />} label={t("dashboard.totalRevenue")} value={fmt(totalRevenue)} sub={t("dashboard.allTime")} color={SEMANTIC.info} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<TrendingUpIcon />} label={t("dashboard.netProfit")} value={fmt(totalProfit)} sub={t("dashboard.margin", { value: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0 })} color={totalProfit >= 0 ? SEMANTIC.success : SEMANTIC.error} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<InventoryIcon />} label={t("dashboard.materialsInStock")} value={materials.length} sub={t("dashboard.lowStockCount", { count: lowStock.length })} color={lowStock.length > 0 ? SEMANTIC.warning : "primary.main"} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Orders by status chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                            {t("dashboard.ordersByStatus")}
                        </Typography>
                        {chartData.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                {t("dashboard.noOrderData")}
                            </Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} barSize={36}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <RechartsTip />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry) => (
                                            <Cell key={entry.status} fill={STATUS_COLOURS[entry.status] || BRAND.mid} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Stock value */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">{t("dashboard.stockOverview")}</Typography>
                            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/materials")}>
                                {t("dashboard.viewAll")}
                            </Button>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                            {t("dashboard.totalStockValue")}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
                            {fmt(totalStockValue)}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {lowStock.length === 0 ? (
                            <Typography variant="body2" color="success.main" fontWeight={600}>
                                {t("dashboard.allStocked")}
                            </Typography>
                        ) : (
                            <>
                                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                    <WarningAmberIcon color="warning" fontSize="small" />
                                    <Typography variant="subtitle2" color="warning.main">
                                        {lowStock.length === 1
                                            ? t("dashboard.lowStockWarning", { count: lowStock.length })
                                            : t("dashboard.lowStockWarningPlural", { count: lowStock.length })}
                                    </Typography>
                                </Stack>
                                {lowStock.slice(0, 5).map((m) => (
                                    <Box key={m._id} mb={1}>
                                        <Stack direction="row" justifyContent="space-between" mb={0.25}>
                                            <Typography variant="body2">{m.name}</Typography>
                                            <Typography variant="caption" color="warning.main">
                                                {m.quantity} / {m.lowStockThreshold} {m.unit}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={Math.min(100, (m.quantity / Math.max(m.lowStockThreshold, 1)) * 100)} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                                    </Box>
                                ))}
                            </>
                        )}
                    </Paper>
                </Grid>

                {/* Recent orders */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">{t("dashboard.recentOrders")}</Typography>
                            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate("/orders")}>
                                {t("dashboard.viewAll")}
                            </Button>
                        </Stack>
                        {recentOrders.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                {t("dashboard.noOrders")}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("dashboard.colDate")}</TableCell>
                                        <TableCell>{t("dashboard.colCustomer")}</TableCell>
                                        <TableCell>{t("dashboard.colStatus")}</TableCell>
                                        <TableCell align="right">{t("dashboard.colTotalCharged")}</TableCell>
                                        <TableCell align="right">{t("dashboard.colProfit")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentOrders.map((o) => (
                                        <TableRow key={o._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/orders/${o._id}`)}>
                                            <TableCell>{fmtDate(o.orderDate)}</TableCell>
                                            <TableCell>{o.customer?.name}</TableCell>
                                            <TableCell>
                                                <Chip label={o.status} size="small" sx={{ bgcolor: STATUS_COLOURS[o.status], color: "#fff", fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={t("dashboard.totalChargedTooltip")}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {fmt(o.totalCharged)}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={700} color={o.profit >= 0 ? "success.main" : "error.main"}>
                                                    {fmt(o.profit)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
