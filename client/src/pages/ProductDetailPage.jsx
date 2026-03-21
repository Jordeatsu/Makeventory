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
import ProductFormDialog from "../components/modals/ProductFormDialog";
import { STATUS_COLOURS } from "../colours";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import StatCard from "../components/common/StatCard";
import { InfoRow } from "../components/common/DetailRow";

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
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
            setError("Failed to load product.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (payload) => {
        try {
            await api.put(`/products/${id}`, payload);
            setEditOpen(false);
            showToast("Product updated.");
            load();
        } catch (e) {
            showToast(e.response?.data?.message || "Save failed.", "error");
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
                {!product.active && <Chip label="Inactive" color="default" size="small" />}
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                    Edit
                </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
                {product.category && <><strong>{product.category}</strong> · </>}
                {product.sku && <>SKU: {product.sku} · </>}
                Added {fmtDate(product.createdAt)}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Grid container spacing={3}>

                {/* Stats */}
                <Grid item xs={6} sm={3}>
                    <StatCard label="Total Orders" value={totalOrders} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Gross Revenue" value={fmt(totalRevenue)} sub="inc. shipping" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        label="Total Profit"
                        value={fmt(totalProfit)}
                        color={totalProfit >= 0 ? "success.main" : "error.main"}
                        sub={totalRevenue > 0 ? `${fmtPct(profitMargin)} margin` : undefined}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard
                        label="Avg Profit / Order"
                        value={fmt(avgProfit)}
                        color={avgProfit >= 0 ? "success.main" : "error.main"}
                    />
                </Grid>

                {/* Product info */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="h6">Product Info</Typography>
                        </Stack>
                        <InfoRow label="Description" value={product.description} />
                        <InfoRow label="Base Price" value={fmt(product.basePrice)} />
                        <InfoRow label="Est. Material Cost" value={fmt(product.estimatedMaterialCost)} />
                        <InfoRow label="Est. Margin" value={estimatedMargin !== null ? `${estimatedMargin}%` : "—"} />
                        {product.parentProduct && (
                            <InfoRow label="Parent Product" value={product.parentProduct.name} />
                        )}
                    </Paper>
                </Grid>

                {/* Materials recipe */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="h6">Materials Recipe</Typography>
                        </Stack>
                        {allMaterials.length > 0 ? (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Cost/Unit</TableCell>
                                        <TableCell align="right">Line Cost</TableCell>
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
                                            Total Est. Cost
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, borderTop: "2px solid", borderColor: "divider" }}>
                                            {fmt(allMaterials.reduce((s, m) => s + (m.lineCost || 0), 0))}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No materials recipe defined. Edit the product to add materials.
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
                                <Typography variant="h6">Revenue by Country</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Country</TableCell>
                                        <TableCell align="right">Orders</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                        <TableCell align="right">Profit</TableCell>
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
                                <Typography variant="h6">Recent Orders</Typography>
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                        <TableCell align="right">Profit</TableCell>
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
                                No orders linked to this product yet. Link orders by selecting this product when creating an order.
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

            <ProductFormDialog open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={product} />

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
