import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton,
    Paper, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    Tooltip, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import OrderFormDialog from "../components/modals/OrderFormDialog";
import { STATUS_COLOURS } from "../colours";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const LOCK_MS = 45 * 24 * 60 * 60 * 1000;

function DetailRow({ label, value, valueColor }) {
    return (
        <Grid container sx={{ py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
            <Grid item xs={6} sm={5}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Grid>
            <Grid item xs={6} sm={7}>
                <Typography variant="body2" fontWeight={600} color={valueColor}>{value || "—"}</Typography>
            </Grid>
        </Grid>
    );
}

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => `${sym}${Number(n || 0).toFixed(2)}`;
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—");

    const [order, setOrder]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

    const load = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data.order);
        } catch {
            setError("Failed to load order.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]); // eslint-disable-line

    const handleSave = async (form) => {
        try {
            await api.put(`/orders/${id}`, form);
            setEditOpen(false);
            showToast("Order updated.");
            await load();
        } catch (e) {
            showToast(e.response?.data?.message || "Save failed.", "error");
        }
    };

    const handleUnlock = async () => {
        try {
            const { data } = await api.patch(`/orders/${id}/unlock`);
            setOrder(data.order);
            showToast("Order unlocked.");
        } catch (e) {
            showToast(e.response?.data?.message || "Unlock failed.", "error");
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" pt={8}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;
    if (!order)  return null;

    const c = order.customer || {};
    const addressParts = [c.addressLine1, c.addressLine2, c.city, c.state, c.postcode, c.country].filter(Boolean);
    const discountAmt = order.discountType === "percent"
        ? (order.totalCharged || 0) * ((order.discount || 0) / 100)
        : (order.discount || 0);
    const totalPaid = ((order.totalCharged || 0) - discountAmt) + (order.shippingCost || 0) + (order.buyerTax || 0);
    const locked = order.locked || (order.updatedAt && Date.now() - new Date(order.updatedAt) >= LOCK_MS);

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" alignItems="center" gap={1} mb={3}>
                <Tooltip title="Back to Orders">
                    <IconButton onClick={() => navigate("/orders")}><ArrowBackIcon /></IconButton>
                </Tooltip>
                <Box flex={1}>
                    <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Typography variant="h4">{order.orderNumber || "Order"}</Typography>
                        <Chip label={order.status} size="small" sx={{ bgcolor: STATUS_COLOURS[order.status] || "#ccc", color: "#fff", fontWeight: 600 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Placed {fmtDate(order.orderDate)}</Typography>
                </Box>
                {locked ? (
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Chip icon={<LockIcon />} label="Locked" size="small" variant="outlined" color="default" />
                        <Tooltip title="Resets the 45-day lock window so the order can be edited again">
                            <Button variant="outlined" size="small" startIcon={<LockOpenIcon />} onClick={handleUnlock}>
                                Unlock
                            </Button>
                        </Tooltip>
                    </Stack>
                ) : (
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                        Edit Order
                    </Button>
                )}
            </Stack>

            <Grid container spacing={3}>
                {/* Customer card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                        <Typography variant="h6" mb={2}>Customer</Typography>
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>{c.name}</Typography>
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
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Order Summary</Typography>
                        {order.productDescription && (
                            <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" mb={0.5}>Product / Description</Typography>
                                <Typography variant="body2">{order.productDescription}</Typography>
                            </Box>
                        )}
                        <Grid container spacing={0}>
                            {order.origin && <DetailRow label="Origin" value={order.origin} />}
                            {order.originOrderId && <DetailRow label="Origin Order ID" value={order.originOrderId} />}
                            <DetailRow label="Order Date" value={fmtDate(order.orderDate)} />
                            <DetailRow label="Status" value={order.status} />
                            <DetailRow label="Materials Used" value={`${order.materials?.length || 0} item${order.materials?.length !== 1 ? "s" : ""}`} />
                            {order.notes && <DetailRow label="Notes" value={order.notes} />}
                            {order.trackingNumber && <DetailRow label="Tracking Number" value={order.trackingNumber} />}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Products ordered */}
                {order.products?.length > 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Products Ordered</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>SKU</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Base Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.products.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell sx={{ fontWeight: 600 }}>{p.productName}</TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>{p.sku || "—"}</TableCell>
                                            <TableCell>{p.category || "—"}</TableCell>
                                            <TableCell align="right">{p.quantity}</TableCell>
                                            <TableCell align="right">
                                                {p.basePrice != null ? `${sym}${(p.basePrice * p.quantity).toFixed(2)}` : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                )}

                {/* Materials used */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Materials Used in This Order</Typography>
                        {!order.materials || order.materials.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">No materials recorded for this order.</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Qty Used</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell align="right">Cost / Unit</TableCell>
                                        <TableCell align="right">Line Cost</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...order.materials]
                                        .sort((a, b) => (a.materialType || "").localeCompare(b.materialType || ""))
                                        .map((m, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>{m.materialName}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {m.materialType && <Chip label={m.materialType} size="small" variant="outlined" />}
                                                </TableCell>
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

                {/* Financial breakdown */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Financial Breakdown</Typography>
                        <Grid container>
                            <DetailRow label="Item Price" value={fmt(order.totalCharged)} />
                            {order.buyerTax > 0 && <DetailRow label="+ Buyer Tax" value={`+${fmt(order.buyerTax)}`} valueColor="success.main" />}
                            {order.discount > 0 && (
                                <DetailRow
                                    label={order.discountType === "percent" ? `Discount (${order.discount}%)` : "Discount"}
                                    value={`–${fmt(discountAmt)}`}
                                    valueColor="error.main"
                                />
                            )}
                            <DetailRow label="Shipping Cost" value={fmt(order.shippingCost)} />
                            <DetailRow label="– Hosting Fees" value={`–${fmt(order.hostingCost)}`} valueColor="error.main" />
                            {order.marketingCost > 0 && <DetailRow label="– Marketing Costs" value={`–${fmt(order.marketingCost)}`} valueColor="error.main" />}
                            <DetailRow label="– Material Cost" value={`–${fmt(order.totalMaterialCost)}`} valueColor="error.main" />
                            {order.refund > 0 && <DetailRow label="– Refund" value={`–${fmt(order.refund)}`} valueColor="error.main" />}
                        </Grid>
                        <Divider sx={{ my: 1.5 }} />
                        <Grid container mb={1}>
                            <Grid item xs={6}><Typography variant="subtitle1" fontWeight={700}>Gross Revenue</Typography></Grid>
                            <Grid item xs={6} textAlign="right"><Typography variant="subtitle1" fontWeight={700}>{fmt(totalPaid)}</Typography></Grid>
                        </Grid>
                        <Grid container mb={1}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1" fontWeight={700} color={(order.profit + (order.shippingCost || 0)) >= 0 ? "success.main" : "error.main"}>
                                    Net Revenue
                                </Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                                <Typography variant="subtitle1" fontWeight={700} color={(order.profit + (order.shippingCost || 0)) >= 0 ? "success.main" : "error.main"}>
                                    {fmt((order.profit || 0) + (order.shippingCost || 0))}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid item xs={6}>
                                <Typography variant="subtitle1" fontWeight={700} color={order.profit >= 0 ? "success.main" : "error.main"}>
                                    Net Profit
                                </Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                                <Typography variant="subtitle1" fontWeight={700} color={order.profit >= 0 ? "success.main" : "error.main"}>
                                    {fmt(order.profit)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Record Info */}
            <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                    Record Info
                </Typography>
                <Grid container spacing={2}>
                    {order.createdAt && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Created
                            </Typography>
                            {order.createdBy?.name && (
                                <Typography variant="body1" fontWeight={600}>{order.createdBy.name}</Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                    {order.updatedAt && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Last Updated
                            </Typography>
                            {order.updatedBy?.name && (
                                <Typography variant="body1" fontWeight={600}>{order.updatedBy.name}</Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(order.updatedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <OrderFormDialog open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={order} />

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setToast((p) => ({ ...p, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
