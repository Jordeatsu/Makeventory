import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton,
    Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    Tooltip, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import PublicIcon from "@mui/icons-material/Public";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import ProductFormModal from "../components/modals/ProductFormModal";
import { STATUS_COLOURS } from "../theme";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import { InfoRow } from "../components/common/DetailRow";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;
    const { toast, showToast, closeToast } = useToast();

    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [editOpen, setEditOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/products/${id}/stats`);
            setStats(data);
        } catch {
            setError(t('products.detail.loadFailed'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (payload) => {
        try {
            await api.put(`/products/${id}`, payload);
            setEditOpen(false);
            showToast(t('products.detail.updated'));
            load();
        } catch (e) {
            showToast(e.response?.data?.message || t('products.detail.saveFailed'), "error");
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;
    if (!stats)  return null;

    const { product, totalOrders, totalRevenue, totalProfit, avgProfit, byCountry, recentOrders } = stats;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const estimatedMargin = product.basePrice > 0
        ? (((product.basePrice - product.estimatedMaterialCost) / product.basePrice) * 100).toFixed(1)
        : null;

    const allMaterials = [
        ...(product.parentProduct?.defaultMaterials || []),
        ...(product.defaultMaterials || []),
    ].sort((a, b) => {
        const t = (a.materialType || "").localeCompare(b.materialType || "");
        return t !== 0 ? t : (b.lineCost || 0) - (a.lineCost || 0);
    });

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <IconButton onClick={() => navigate("/products")} size="small">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1 }}>{product.name}</Typography>
                {!product.active && <Chip label={t('common.inactive')} color="default" size="small" />}
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                    {t('common.edit')}
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
                {product.category && <><strong>{product.category}</strong> · </>}
                {product.sku && <>{t('products.col.sku')}: {product.sku} · </>}
                {t('products.detail.added', { date: fmtDate(product.createdAt) })}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Grid container spacing={3}>

                {/* KPI strip — single card with 4 metrics separated by dividers */}
                <Grid item xs={12}>
                    <Paper sx={{ overflow: "hidden" }}>
                        <Stack direction={{ xs: "column", sm: "row" }} divider={<Divider orientation="vertical" flexItem />}>
                            <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>{t('products.detail.kpi.totalOrders')}</Typography>
                                <Typography variant="h4" fontWeight={700} color="primary.main">{totalOrders}</Typography>
                            </Box>
                            <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>{t('products.detail.kpi.grossRevenue')}</Typography>
                                <Typography variant="h4" fontWeight={700}>{fmt(totalRevenue)}</Typography>
                                <Typography variant="caption" color="text.secondary">{t('products.detail.kpi.incShipping')}</Typography>
                            </Box>
                            <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>{t('products.detail.kpi.totalProfit')}</Typography>
                                <Typography variant="h4" fontWeight={700} color={totalProfit >= 0 ? "success.main" : "error.main"}>{fmt(totalProfit)}</Typography>
                                {totalRevenue > 0 && (
                                    <Typography variant="caption" color="text.secondary">{t('products.detail.kpi.margin', { value: Number(profitMargin).toFixed(1) })}</Typography>
                                )}
                            </Box>
                            <Box sx={{ p: 2.5, flex: 1, textAlign: "center" }}>
                                <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={0.5}>{t('products.detail.kpi.avgProfit')}</Typography>
                                <Typography variant="h4" fontWeight={700} color={avgProfit >= 0 ? "success.main" : "error.main"}>{fmt(avgProfit)}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Product info */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: "100%", borderLeft: 4, borderColor: "primary.light" }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="h6">{t('products.detail.productInfo')}</Typography>
                        </Stack>
                        <InfoRow label={t('products.detail.infoRow.description')} value={product.description} />
                        <InfoRow label={t('products.detail.infoRow.basePrice')} value={fmt(product.basePrice)} />
                        <InfoRow label={t('products.detail.infoRow.estMaterialCost')} value={fmt(product.estimatedMaterialCost)} />
                        <InfoRow label={t('products.detail.infoRow.estMargin')} value={estimatedMargin !== null ? `${estimatedMargin}%` : "—"} />
                        {product.parentProduct && (
                            <InfoRow label={t('products.detail.infoRow.parentProduct')} value={product.parentProduct.name} />
                        )}
                    </Paper>
                </Grid>

                {/* Materials recipe */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: "100%", borderLeft: 4, borderColor: "secondary.light" }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="h6">{t('products.detail.materialsRecipe')}</Typography>
                        </Stack>
                        {allMaterials.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>{t('products.detail.col.material')}</TableCell>
                                        <TableCell>{t('products.detail.col.type')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.qty')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.costPerUnit')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.lineCost')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allMaterials.map((m, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{m.materialName}</TableCell>
                                            <TableCell>
                                                {m.materialType && <Chip label={m.materialType} size="small" variant="outlined" />}
                                            </TableCell>
                                            <TableCell align="right">{m.quantityUsed} {m.unit}</TableCell>
                                            <TableCell align="right">{fmt(m.costPerUnit || 0)}</TableCell>
                                            <TableCell align="right">{fmt(m.lineCost || 0)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, borderTop: "2px solid", borderColor: "divider" }}>
                                            {t('products.detail.totalEstCost')}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, borderTop: "2px solid", borderColor: "divider" }}>
                                            {fmt(allMaterials.reduce((s, m) => s + (m.lineCost || 0), 0))}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                {t('products.detail.noMaterials')}
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Revenue by country */}
                {byCountry?.length > 0 && (
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <PublicIcon color="primary" fontSize="small" />
                                <Typography variant="h6">{t('products.detail.revenueByCountry')}</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>{t('products.detail.col.country')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.orders')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.revenue')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.profit')}</TableCell>
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
                {recentOrders?.length > 0 && (
                    <Grid item xs={12} md={byCountry?.length > 0 ? 7 : 12}>
                        <Paper sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <ReceiptLongIcon color="primary" fontSize="small" />
                                <Typography variant="h6">{t('products.detail.recentOrders')}</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('products.detail.col.customer')}</TableCell>
                                        <TableCell>{t('products.detail.col.date')}</TableCell>
                                        <TableCell>{t('products.detail.col.status')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.revenue')}</TableCell>
                                        <TableCell align="right">{t('products.detail.col.profit')}</TableCell>
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

                {totalOrders === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: "center" }}>
                            <TrendingUpIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                            <Typography color="text.secondary">
                                {t('products.detail.noOrders')}
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Record Info */}
            <RecordInfo
                createdAt={product.createdAt}
                updatedAt={product.updatedAt}
                createdBy={product.createdBy}
                updatedBy={product.updatedBy}
            />

            <ProductFormModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={product} />

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
