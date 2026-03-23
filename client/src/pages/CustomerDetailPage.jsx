import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider,
    IconButton, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tooltip, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { STATUS_COLOURS } from "../theme";
import CustomerFormDialog from "../components/modals/CustomerFormDialog";
import { useCurrencyFormatter, fmtDate } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import ToastSnackbar from "../components/common/ToastSnackbar";

function StatBox({ label, value, color }) {
    return (
        <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, textAlign: "center", flex: 1 }}>
            <Typography variant="h6" fontWeight={700} color={color || "text.primary"}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
        </Paper>
    );
}

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { toast, showToast, closeToast } = useToast();

    const [customer, setCustomer] = useState(null);
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");
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
            setError("Failed to load customer.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCustomer(); }, [id]); // eslint-disable-line

    const handleSave = async (form) => {
        try {
            await api.put(`/customers/${id}`, form);
            setEditOpen(false);
            showToast("Customer updated.");
            loadCustomer();
        } catch (e) {
            showToast(e.response?.data?.error || "Save failed.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/customers/${id}`);
            navigate("/customers");
        } catch {
            showToast("Failed to delete customer.", "error");
            setDeleteOpen(false);
        }
    };

    const customerName = customer?.name ?? "";
    const totalSpent  = orders.reduce((s, o) => s + (o.totalCharged || 0), 0);
    const totalProfit = orders.reduce((s, o) => s + (o.profit || 0), 0);
    const avgOrder    = orders.length ? totalSpent / orders.length : 0;
    const firstOrder  = orders.length ? orders[orders.length - 1].orderDate : null;
    const lastOrder   = orders.length ? orders[0].orderDate : null;

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/customers")} color="inherit">
                    All Customers
                </Button>
                <Stack direction="row" gap={1}>
                    <Tooltip title="Edit customer">
                        <IconButton onClick={() => setEditOpen(true)} disabled={loading || !customer}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete customer">
                        <IconButton color="error" onClick={() => setDeleteOpen(true)} disabled={loading || !customer}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : (
                <>
                    {/* Customer header */}
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} mb={3} gap={2}>
                        <Box>
                            <Typography variant="h4">{customerName}</Typography>
                            {customer?.email && <Typography color="text.secondary" variant="body2">{customer.email}</Typography>}
                            {customer?.phone && <Typography color="text.secondary" variant="body2">{customer.phone}</Typography>}
                            {(customer?.addressLine1 || customer?.city || customer?.country) && (
                                <Box mt={0.5}>
                                    {customer.addressLine1 && <Typography color="text.secondary" variant="body2">{customer.addressLine1}</Typography>}
                                    {customer.addressLine2 && <Typography color="text.secondary" variant="body2">{customer.addressLine2}</Typography>}
                                    {(customer.city || customer.state) && (
                                        <Typography color="text.secondary" variant="body2">{[customer.city, customer.state].filter(Boolean).join(", ")}</Typography>
                                    )}
                                    {customer.postcode && <Typography color="text.secondary" variant="body2">{customer.postcode}</Typography>}
                                    {customer.country && <Typography color="text.secondary" variant="body2">{customer.country}</Typography>}
                                </Box>
                            )}
                        </Box>
                        <Chip
                            label={orders.length > 1 ? "Returning customer" : "One-time customer"}
                            color={orders.length > 1 ? "success" : "default"}
                            variant="outlined"
                        />
                    </Stack>

                    {/* Summary stats */}
                    <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={3}>
                        <StatBox label="Orders" value={orders.length} />
                        <StatBox label="Total Spent" value={fmt(totalSpent)} />
                        <StatBox label="Avg Order Value" value={fmt(avgOrder)} />
                        <StatBox label="Total Profit" value={fmt(totalProfit)} color={totalProfit >= 0 ? "success.main" : "error.main"} />
                        <StatBox label="First Order" value={fmtDate(firstOrder)} />
                        <StatBox label="Last Order" value={fmtDate(lastOrder)} />
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="h6" mb={2}>Order History</Typography>
                    {orders.length === 0 ? (
                        <Typography color="text.secondary">No orders found for this customer.</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Charged</TableCell>
                                        <TableCell align="right">Profit</TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((o) => (
                                        <TableRow
                                            key={o._id}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => navigate(`/orders/${o._id}`)}
                                        >
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
            )}
            <CustomerFormDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
                initial={customer}
            />

            {/* Delete confirmation */}
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Customer</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{customerName}</strong>? Their order history will be preserved. This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
