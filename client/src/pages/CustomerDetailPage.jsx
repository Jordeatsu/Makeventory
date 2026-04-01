import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { STATUS_COLOURS } from "../theme";
import CustomerFormModal from "../components/modals/CustomerFormModal";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import { useModules } from "../hooks/useModules.jsx";

// Style 2 — Profile banner: full-width tinted header, details in a row below
function CustomerHeader({ customer, ordersEnabled, orders, t }) {
    const addressParts = [customer?.addressLine1, customer?.addressLine2, [customer?.city, customer?.state].filter(Boolean).join(", "), customer?.postcode, customer?.country].filter(Boolean);
    return (
        <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden", borderColor: "divider" }}>
            <Box sx={{ px: 3, py: 2.5, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" gap={1} flexWrap="wrap">
                    <Typography variant="h4" fontWeight={700}>
                        {customer?.name}
                    </Typography>
                    {ordersEnabled && (
                        <Chip
                            label={orders.length > 1 ? t("customers.returningCustomer") : t("customers.oneTimeCustomer")}
                            color={orders.length > 1 ? "success" : "default"}
                            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "inherit", borderColor: "rgba(255,255,255,0.4)", fontWeight: 600 }}
                            variant="outlined"
                        />
                    )}
                </Stack>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} gap={3} flexWrap="wrap">
                    {customer?.email && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{customer.email}</Typography>
                        </Stack>
                    )}
                    {customer?.phone && (
                        <Stack direction="row" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{customer.phone}</Typography>
                        </Stack>
                    )}
                    {addressParts.length > 0 && (
                        <Stack direction="row" alignItems="flex-start" gap={1}>
                            <LocationOnIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                            <Typography variant="body2">{addressParts.join(", ")}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}

function StatBox({ label, value, color }) {
    return (
        <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, textAlign: "center", flex: 1 }}>
            <Typography variant="h6" fontWeight={700} color={color || "text.primary"}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
        </Paper>
    );
}

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { activeModules } = useModules();
    const ordersEnabled = activeModules.includes("Orders");
    const { toast, showToast, closeToast } = useToast();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const loadCustomer = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/customers/${id}`);
            setCustomer(data.customer ?? null);
            setOrders(data.orders ?? []);
        } catch {
            setError(t("customers.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomer();
    }, [id]); // eslint-disable-line

    const handleSave = async (form) => {
        try {
            await api.put(`/customers/${id}`, form);
            setEditOpen(false);
            showToast(t("customers.updated"));
            loadCustomer();
        } catch (e) {
            showToast(e.response?.data?.error || t("customers.saveFailed"), "error");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/customers/${id}`);
            navigate("/customers");
        } catch {
            showToast(t("customers.deleteFailed"), "error");
            setDeleteOpen(false);
        }
    };

    const customerName = customer?.name ?? "";
    const totalSpent = orders.reduce((s, o) => s + (o.totalCharged || 0), 0);
    const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const avgOrder = orders.length ? totalSpent / orders.length : 0;
    const firstOrder = orders.length ? orders[orders.length - 1].orderDate : null;
    const lastOrder = orders.length ? orders[0].orderDate : null;

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")} color="inherit">
                    {t("customers.detail.allCustomers")}
                </Button>
                <Stack direction="row" gap={1}>
                    <Tooltip title={t("customers.detail.editCustomer")}>
                        <IconButton onClick={() => setEditOpen(true)} disabled={loading || !customer}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("customers.detail.deleteCustomer")}>
                        <IconButton color="error" onClick={() => setDeleteOpen(true)} disabled={loading || !customer}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Customer header */}
                    <CustomerHeader customer={customer} ordersEnabled={ordersEnabled} orders={orders} t={t} />

                    {/* Summary stats */}
                    {ordersEnabled && (
                        <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={3}>
                            <StatBox label={t("customers.stats.orders")} value={orders.length} />
                            <StatBox label={t("customers.stats.totalSpent")} value={fmt(totalSpent)} />
                            <StatBox label={t("customers.stats.avgOrderValue")} value={fmt(avgOrder)} />
                            <StatBox label={t("customers.stats.totalProfit")} value={fmt(totalProfit)} color={totalProfit >= 0 ? "success.main" : "error.main"} />
                            <StatBox label={t("customers.stats.firstOrder")} value={fmtDate(firstOrder)} />
                            <StatBox label={t("customers.stats.lastOrder")} value={fmtDate(lastOrder)} />
                        </Stack>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {ordersEnabled ? (
                        <>
                            <Typography variant="h6" mb={2}>
                                {t("customers.detail.orderHistory")}
                            </Typography>
                            {orders.length === 0 ? (
                                <Typography color="text.secondary">{t("customers.detail.noOrders")}</Typography>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                                <TableCell>{t("customers.detail.col.date")}</TableCell>
                                                <TableCell>{t("customers.detail.col.product")}</TableCell>
                                                <TableCell>{t("customers.detail.col.status")}</TableCell>
                                                <TableCell align="right">{t("customers.detail.col.charged")}</TableCell>
                                                <TableCell align="right">{t("customers.detail.col.profit")}</TableCell>
                                                <TableCell align="right" />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orders.map((o) => (
                                                <TableRow key={o._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/orders/${o._id}`)}>
                                                    <TableCell>{fmtDate(o.orderDate)}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                            {o.productDescription || "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={o.status} size="small" sx={{ bgcolor: STATUS_COLOURS[o.status] || "#ccc", color: "#fff", fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell align="right">{fmt(o.totalCharged)}</TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" color={o.profit >= 0 ? "success.main" : "error.main"}>
                                                            {fmt(o.profit)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <OpenInNewIcon fontSize="small" sx={{ color: "text.secondary" }} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    ) : null}
                </>
            )}
            <RecordInfo createdAt={customer?.createdAt} updatedAt={customer?.updatedAt} createdBy={customer?.createdBy} updatedBy={customer?.updatedBy} />

            <CustomerFormModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleSave} initial={customer} />

            {/* Delete confirmation */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{t("customers.delete.title")}</DialogTitle>
                <DialogContent>
                    <Typography>{t("customers.delete.confirm", { name: customerName })}</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteOpen(false)} color="inherit">
                        {t("common.cancel")}
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        {t("common.delete")}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
