import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import OrderFormModal from "../components/modals/OrderFormModal";
import { STATUS_COLOURS } from "../theme";
import { useCurrencyFormatter, fmtDateLong } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import { InfoRow as DetailRow } from "../components/common/DetailRow";

const LOCK_MS = 45 * 24 * 60 * 60 * 1000;

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const fmtDate = fmtDateLong;
    const { toast, showToast, closeToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data.order);
        } catch {
            setError(t("orders.detail.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id]); // eslint-disable-line

    const handleSave = async (form) => {
        try {
            await api.put(`/orders/${id}`, form);
            setEditOpen(false);
            showToast(t("orders.updated"));
            await load();
        } catch (e) {
            showToast(e.response?.data?.message || t("orders.saveFailed"), "error");
        }
    };

    const handleUnlock = async () => {
        try {
            const { data } = await api.patch(`/orders/${id}/unlock`);
            setOrder(data.order);
            showToast(t("orders.unlocked"));
        } catch (e) {
            showToast(e.response?.data?.message || t("orders.unlockFailed"), "error");
        }
    };

    if (loading)
        return (
            <Box display="flex" justifyContent="center" pt={8}>
                <CircularProgress />
            </Box>
        );
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!order) return null;

    const c = order.customer || {};
    const addressParts = [c.addressLine1, c.addressLine2, c.city, c.state, c.postcode, c.country].filter(Boolean);
    const discountAmt = order.discountType === "percent" ? (order.totalCharged || 0) * ((order.discount || 0) / 100) : order.discount || 0;
    const totalPaid = (order.totalCharged || 0) - discountAmt + (order.shippingCost || 0) + (order.buyerTax || 0);
    const locked = order.locked || (order.updatedAt && Date.now() - new Date(order.updatedAt) >= LOCK_MS);

    return (
        <Box>
            {/* Header — status-tinted banner */}
            <Paper
                variant="outlined"
                sx={{
                    mb: 3,
                    overflow: "hidden",
                    borderColor: "divider",
                }}
            >
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        bgcolor: `${STATUS_COLOURS[order.status] || "#ccc"}22`,
                        borderBottom: 1,
                        borderColor: "divider",
                    }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} flexWrap="wrap">
                        <Tooltip title={t("orders.detail.backToOrders")}>
                            <IconButton size="small" onClick={() => navigate("/orders")}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Tooltip>
                        <Stack direction="row" alignItems="center" gap={1.5} flex={1} flexWrap="wrap">
                            <Typography variant="h4">{order.orderNumber || "Order"}</Typography>
                            <Chip label={order.status} size="small" sx={{ bgcolor: STATUS_COLOURS[order.status] || "#ccc", color: "#fff", fontWeight: 700 }} />
                            <Typography variant="body2" color="text.secondary">
                                {t("orders.detail.placed", { date: fmtDate(order.orderDate) })}
                            </Typography>
                        </Stack>
                        {locked ? (
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Chip icon={<LockIcon />} label={t("orders.detail.locked")} size="small" variant="outlined" color="default" />
                                <Tooltip title={t("orders.lockedResetTooltip")}>
                                    <Button variant="outlined" size="small" startIcon={<LockOpenIcon />} onClick={handleUnlock}>
                                        {t("orders.detail.unlock")}
                                    </Button>
                                </Tooltip>
                            </Stack>
                        ) : (
                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                                {t("orders.detail.editOrder")}
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* Customer card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                        <Typography variant="h6" mb={2}>
                            {t("orders.detail.customer")}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>
                            {c.name}
                        </Typography>
                        {c.email && (
                            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">{c.email}</Typography>
                            </Stack>
                        )}
                        {c.phone && (
                            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{c.phone}</Typography>
                            </Stack>
                        )}
                        {addressParts.length > 0 && (
                            <Stack direction="row" alignItems="flex-start" gap={1} mt={1}>
                                <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                                <Box>
                                    {c.addressLine1 && <Typography variant="body2">{c.addressLine1}</Typography>}
                                    {c.addressLine2 && <Typography variant="body2">{c.addressLine2}</Typography>}
                                    {(c.city || c.state) && <Typography variant="body2">{[c.city, c.state].filter(Boolean).join(", ")}</Typography>}
                                    {c.postcode && <Typography variant="body2">{c.postcode}</Typography>}
                                    {c.country && <Typography variant="body2">{c.country}</Typography>}
                                </Box>
                            </Stack>
                        )}
                    </Paper>
                </Grid>

                {/* Order Summary */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                            {t("orders.detail.orderSummary")}
                        </Typography>
                        {order.productDescription && (
                            <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>
                                    {t("orders.detail.productDescription")}
                                </Typography>
                                <Typography variant="body2">{order.productDescription}</Typography>
                            </Box>
                        )}
                        <Box>
                            {order.origin && <DetailRow label={t("orders.detail.origin")} value={order.origin} />}
                            {order.originOrderId && <DetailRow label={t("orders.detail.originOrderId")} value={order.originOrderId} />}
                            <DetailRow label={t("orders.detail.orderDate")} value={fmtDate(order.orderDate)} />
                            <DetailRow label={t("orders.detail.status")} value={order.status} />
                            <DetailRow label={t("orders.detail.materialsUsed")} value={t("orders.detail.materialsUsedCount", { count: order.materials?.length || 0 })} />
                            {order.notes && <DetailRow label={t("orders.detail.notes")} value={order.notes} />}
                            {order.trackingNumber && <DetailRow label={t("orders.detail.trackingNumber")} value={order.trackingNumber} />}
                        </Box>
                    </Paper>
                </Grid>

                {/* Products ordered */}
                {order.products?.length > 0 && (
                    <Grid size={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>
                                {t("orders.detail.productsOrdered")}
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>{t("orders.detail.col.product")}</TableCell>
                                        <TableCell>{t("orders.detail.col.sku")}</TableCell>
                                        <TableCell>{t("orders.detail.col.category")}</TableCell>
                                        <TableCell align="right">{t("orders.detail.col.qty")}</TableCell>
                                        <TableCell align="right">{t("orders.detail.col.basePrice")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.products.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ fontWeight: 600 }}>{p.productName}</TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>{p.sku || "—"}</TableCell>
                                            <TableCell>{p.category || "—"}</TableCell>
                                            <TableCell align="right">{p.quantity}</TableCell>
                                            <TableCell align="right">{p.basePrice != null ? fmt(p.basePrice * p.quantity) : "—"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}

                {/* Materials used */}
                <Grid size={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                            {t("orders.detail.materialsInOrder")}
                        </Typography>
                        {!order.materials || order.materials.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                {t("orders.detail.noMaterials")}
                            </Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>{t("orders.detail.col.material")}</TableCell>
                                        <TableCell>{t("orders.detail.col.type")}</TableCell>
                                        <TableCell align="right">{t("orders.detail.col.qtyUsed")}</TableCell>
                                        <TableCell>{t("orders.detail.col.unit")}</TableCell>
                                        <TableCell align="right">{t("orders.detail.col.costPerUnit")}</TableCell>
                                        <TableCell align="right">{t("orders.detail.col.lineCost")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...order.materials]
                                        .sort((a, b) => (a.materialType || "").localeCompare(b.materialType || ""))
                                        .map((m, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {m.materialName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{m.materialType && <Chip label={m.materialType} size="small" variant="outlined" />}</TableCell>
                                                <TableCell align="right">{m.quantityUsed}</TableCell>
                                                <TableCell>{m.unit}</TableCell>
                                                <TableCell align="right">{fmt(m.costPerUnit)}</TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight={600}>{fmt(m.lineCost)}</Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </Paper>
                </Grid>

                {/* Financial breakdown — invoice ledger style */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 0, overflow: "hidden" }}>
                        <Box sx={{ px: 3, py: 2, bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }}>
                            <Typography variant="h6">{t("orders.detail.financialBreakdown")}</Typography>
                        </Box>
                        <Box sx={{ px: 3, py: 2 }}>
                            {[
                                { label: t("orders.detail.itemPrice"), value: fmt(order.totalCharged) },
                                order.buyerTax > 0 && { label: t("orders.detail.buyerTax"), value: `+${fmt(order.buyerTax)}`, color: "success.main" },
                                order.discount > 0 && { label: order.discountType === "percent" ? t("orders.detail.discountPercent", { value: order.discount }) : t("orders.detail.discount"), value: `–${fmt(discountAmt)}`, color: "error.main" },
                                { label: t("orders.detail.shippingCost"), value: fmt(order.shippingCost) },
                                { label: t("orders.detail.hostingFees"), value: `–${fmt(order.hostingCost)}`, color: "error.main" },
                                order.marketingCost > 0 && { label: t("orders.detail.marketingCosts"), value: `–${fmt(order.marketingCost)}`, color: "error.main" },
                                { label: t("orders.detail.materialCost"), value: `–${fmt(order.totalMaterialCost)}`, color: "error.main" },
                                order.refund > 0 && { label: t("orders.detail.refund"), value: `–${fmt(order.refund)}`, color: "error.main" },
                            ]
                                .filter(Boolean)
                                .map((row, i) => (
                                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" py={0.75}>
                                        <Typography variant="body2" color="text.secondary">
                                            {row.label}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500} color={row.color || "text.primary"}>
                                            {row.value}
                                        </Typography>
                                    </Stack>
                                ))}
                        </Box>
                        <Divider />
                        <Box sx={{ px: 3, py: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.5}>
                                <Typography variant="body2" fontWeight={700}>
                                    {t("orders.detail.grossRevenue")}
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {fmt(totalPaid)}
                                </Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" py={0.5}>
                                <Typography variant="body2" fontWeight={700} color={order.profit + (order.shippingCost || 0) >= 0 ? "success.main" : "error.main"}>
                                    {t("orders.detail.netRevenue")}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} color={order.profit + (order.shippingCost || 0) >= 0 ? "success.main" : "error.main"}>
                                    {fmt((order.profit || 0) + (order.shippingCost || 0))}
                                </Typography>
                            </Stack>
                        </Box>
                        <Box sx={{ px: 3, py: 2, bgcolor: order.profit >= 0 ? "#C1D7AE22" : "#FFCAB122", borderTop: 2, borderColor: order.profit >= 0 ? "success.main" : "error.main" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={700} color={order.profit >= 0 ? "success.main" : "error.main"}>
                                    {t("orders.detail.netProfit")}
                                </Typography>
                                <Typography variant="h5" fontWeight={700} color={order.profit >= 0 ? "success.main" : "error.main"}>
                                    {fmt(order.profit)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Record Info */}
            <RecordInfo createdAt={order.createdAt} updatedAt={order.updatedAt} createdBy={order.createdBy} updatedBy={order.updatedBy} />

            <OrderFormModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={order} />

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
