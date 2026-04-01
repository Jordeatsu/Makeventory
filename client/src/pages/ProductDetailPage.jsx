import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Divider, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import PublicIcon from "@mui/icons-material/Public";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import ProductFormModal from "../components/modals/ProductFormModal";
import ProductMaterialsModal from "../components/modals/ProductMaterialsModal";
import { STATUS_COLOURS } from "../theme";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import { InfoRow } from "../components/common/DetailRow";
import { useModules } from "../hooks/useModules.jsx";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { activeModules } = useModules();
    const inventoryEnabled = activeModules.includes("Inventory");
    const ordersEnabled = activeModules.includes("Orders");
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;
    const { toast, showToast, closeToast } = useToast();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [matsOpen, setMatsOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/products/${id}/stats`);
            setStats(data);
        } catch {
            setError(t("products.detail.loadFailed"));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (payload) => {
        try {
            await api.put(`/products/${id}`, payload);
            setEditOpen(false);
            showToast(t("products.detail.updated"));
            load();
        } catch (e) {
            showToast(e.response?.data?.message || t("products.detail.saveFailed"), "error");
        }
    };

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!stats) return null;

    const { product, totalOrders, totalRevenue, totalProfit, avgProfit, byCountry, recentOrders } = stats;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const estimatedMargin = product.basePrice > 0 ? (((product.basePrice - product.estimatedMaterialCost) / product.basePrice) * 100).toFixed(1) : null;

    return (
        <Box>
            {/* Action bar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/products")} color="inherit">
                    {t("products.detail.allProducts")}
                </Button>
                <Stack direction="row" gap={1}>
                    {inventoryEnabled && (
                        <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => setMatsOpen(true)}>
                            {t("products.detail.materials")}
                        </Button>
                    )}
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                        {t("common.edit")}
                    </Button>
                </Stack>
            </Stack>

            {/* Header card */}
            <Paper variant="outlined" sx={{ mb: 3, borderLeft: 4, borderLeftColor: "primary.main", borderColor: "divider" }}>
                <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1} flexWrap="wrap">
                        <Box>
                            <Typography variant="h4" fontWeight={700}>
                                {product.name}
                            </Typography>
                            {product.description && (
                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                    {product.description}
                                </Typography>
                            )}
                        </Box>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            {!product.active && <Chip label={t("common.inactive")} color="default" size="small" />}
                            {product.category && <Chip label={product.category} size="small" variant="outlined" color="primary" />}
                        </Stack>
                    </Stack>
                </Box>
                <Divider />
                <Box sx={{ px: 3, py: 1.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={3} flexWrap="wrap">
                        {product.sku && (
                            <Typography variant="body2" color="text.secondary">
                                {t("products.col.sku")}: <strong>{product.sku}</strong>
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {t("products.detail.added", { date: fmtDate(product.createdAt) })}
                        </Typography>
                    </Stack>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* KPI strip — only meaningful when Orders is enabled */}
                {ordersEnabled && (
                    <Grid size={12}>
                        <Paper sx={{ overflow: "hidden" }}>
                            <Stack direction={{ xs: "column", sm: "row" }} divider={<Divider orientation="vertical" flexItem />}>
                                <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                    <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>
                                        {t("products.detail.kpi.totalOrders")}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color="primary.main">
                                        {totalOrders}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                    <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>
                                        {t("products.detail.kpi.grossRevenue")}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {fmt(totalRevenue)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t("products.detail.kpi.incShipping")}
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                    <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>
                                        {t("products.detail.kpi.totalProfit")}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color={totalProfit >= 0 ? "success.main" : "error.main"}>
                                        {fmt(totalProfit)}
                                    </Typography>
                                    {totalRevenue > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                            {t("products.detail.kpi.margin", { value: Number(profitMargin).toFixed(1) })}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                    <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>
                                        {t("products.detail.kpi.avgProfit")}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color={avgProfit >= 0 ? "success.main" : "error.main"}>
                                        {fmt(avgProfit)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                )}

                {/* Product info */}
                <Grid size={{ xs: 12, md: inventoryEnabled ? 5 : 12 }}>
                    <Paper sx={{ p: 3, height: "100%", borderLeft: 4, borderColor: "primary.light" }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="h6">{t("products.detail.productInfo")}</Typography>
                        </Stack>
                        <InfoRow label={t("products.detail.infoRow.description")} value={product.description} />
                        <InfoRow label={t("products.detail.infoRow.basePrice")} value={fmt(product.basePrice)} />
                        <InfoRow label={t("products.detail.infoRow.estMaterialCost")} value={fmt(product.estimatedMaterialCost)} />
                        <InfoRow label={t("products.detail.infoRow.estMargin")} value={estimatedMargin !== null ? `${estimatedMargin}%` : "—"} />
                        {product.parentProduct && <InfoRow label={t("products.detail.infoRow.parentProduct")} value={product.parentProduct.name} />}
                    </Paper>
                </Grid>

                {/* Materials */}
                {inventoryEnabled && (
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper sx={{ p: 3, height: "100%", borderLeft: 4, borderColor: "secondary.light", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <BuildIcon color="primary" fontSize="small" />
                                <Typography variant="h6">{t("products.detail.materialsRecipe")}</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                Materials are managed via the dedicated Materials view.
                            </Typography>
                            <Button variant="outlined" startIcon={<BuildIcon />} onClick={() => setMatsOpen(true)}>
                                View / Manage Materials
                            </Button>
                        </Paper>
                    </Grid>
                )}

                {/* Revenue by country */}
                {ordersEnabled && byCountry?.length > 0 && (
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <PublicIcon color="primary" fontSize="small" />
                                <Typography variant="h6">{t("products.detail.revenueByCountry")}</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>{t("products.detail.col.country")}</TableCell>
                                        <TableCell align="right">{t("products.detail.col.orders")}</TableCell>
                                        <TableCell align="right">{t("products.detail.col.revenue")}</TableCell>
                                        <TableCell align="right">{t("products.detail.col.profit")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {byCountry.map((c) => (
                                        <TableRow key={c.country}>
                                            <TableCell>{c.country}</TableCell>
                                            <TableCell align="right">{c.orders}</TableCell>
                                            <TableCell align="right">{fmt(c.revenue)}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" color={c.profit >= 0 ? "success.main" : "error.main"} fontWeight={600}>
                                                    {fmt(c.profit)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}

                {/* Recent orders */}
                {ordersEnabled && recentOrders?.length > 0 && (
                    <Grid size={{ xs: 12, md: byCountry?.length > 0 ? 7 : 12 }}>
                        <Paper sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <ReceiptLongIcon color="primary" fontSize="small" />
                                <Typography variant="h6">{t("products.detail.recentOrders")}</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("products.detail.col.customer")}</TableCell>
                                        <TableCell>{t("products.detail.col.date")}</TableCell>
                                        <TableCell>{t("products.detail.col.status")}</TableCell>
                                        <TableCell align="right">{t("products.detail.col.revenue")}</TableCell>
                                        <TableCell align="right">{t("products.detail.col.profit")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentOrders.map((o) => (
                                        <TableRow key={o._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/orders/${o._id}`)}>
                                            <TableCell>{o.customer?.name}</TableCell>
                                            <TableCell>{fmtDate(o.orderDate)}</TableCell>
                                            <TableCell>
                                                <Chip label={o.status} size="small" sx={{ bgcolor: STATUS_COLOURS[o.status] || "#ccc", color: "#fff", fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell align="right">{fmt((o.profit || 0) + (o.shippingCost || 0))}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600} color={o.profit >= 0 ? "success.main" : "error.main"}>
                                                    {fmt(o.profit)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}

                {ordersEnabled && totalOrders === 0 && (
                    <Grid size={12}>
                        <Paper sx={{ p: 4, textAlign: "center" }}>
                            <TrendingUpIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                            <Typography color="text.secondary">{t("products.detail.noOrders")}</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Record Info */}
            <RecordInfo createdAt={product.createdAt} updatedAt={product.updatedAt} createdBy={product.createdBy} updatedBy={product.updatedBy} />

            <ProductFormModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={product} />
            {inventoryEnabled && <ProductMaterialsModal open={matsOpen} onClose={() => setMatsOpen(false)} product={product} />}

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
