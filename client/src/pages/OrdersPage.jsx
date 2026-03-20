import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, InputAdornment, MenuItem, Paper, Snackbar, Stack,
    Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import OrderFormDialog from "../components/modals/OrderFormDialog";
import { STATUS_COLOURS } from "../colours";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const ALL_STATUSES = ["", "Pending", "In Progress", "Completed", "Shipped", "Cancelled"];
const LOCK_MS = 45 * 24 * 60 * 60 * 1000;

const isLocked = (o) => o.locked || (o.updatedAt && Date.now() - new Date(o.updatedAt) >= LOCK_MS);

export default function OrdersPage() {
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => (typeof n === "number" ? `${sym}${n.toFixed(2)}` : "—");
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [search, setSearch]       = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [formOpen, setFormOpen]   = useState(false);
    const [editing, setEditing]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [page, setPage]           = useState(0);
    const [tab, setTab]             = useState(1);
    const ROWS = 10;

    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/orders", { params: { search, status: statusFilter } });
            setOrders(data.orders ?? []);
            setPage(0);
        } catch {
            setError("Failed to load orders. Is the server running?");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing) {
                await api.put(`/orders/${editing._id}`, form);
                showToast("Order updated.");
            } else {
                await api.post("/orders", form);
                showToast("Order created.");
            }
            setFormOpen(false);
            setEditing(null);
            await load();
        } catch (e) {
            setError(e.response?.data?.message || "Save failed.");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/orders/${deleteTarget._id}`);
            setDeleteTarget(null);
            showToast("Order deleted.", "info");
            await load();
        } catch {
            setError("Delete failed.");
        }
    };

    const pagedOrders = orders.slice(page * ROWS, page * ROWS + ROWS);

    const groupedByMonth = useMemo(() => {
        const groups = {};
        orders.forEach((o) => {
            if (!o.orderDate) return;
            const d = new Date(o.orderDate);
            const label = d.toLocaleString("en-GB", { month: "long", year: "numeric" });
            const sortKey = d.getFullYear() * 100 + d.getMonth();
            if (!groups[label]) groups[label] = { label, sortKey, orders: [] };
            groups[label].orders.push(o);
        });
        return Object.values(groups).sort((a, b) => b.sortKey - a.sortKey);
    }, [orders]);

    const renderRow = (o) => (
        <TableRow key={o._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/orders/${o._id}`)}>
            <TableCell>
                {o.origin ? (
                    <>
                        <Typography variant="body2" fontWeight={600}>{o.origin}</Typography>
                        {o.originOrderId && <Typography variant="caption" color="text.secondary">{o.originOrderId}</Typography>}
                    </>
                ) : <Typography variant="caption" color="text.disabled">—</Typography>}
            </TableCell>
            <TableCell>{fmtDate(o.orderDate)}</TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight={600}>{o.customer?.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                    {[o.customer?.city, o.customer?.postcode].filter(Boolean).join(", ")}
                </Typography>
            </TableCell>
            <TableCell>
                <Chip label={o.status} size="small" sx={{ bgcolor: STATUS_COLOURS[o.status] || "#ccc", color: "#fff", fontWeight: 600 }} />
            </TableCell>
            <TableCell>
                {o.products?.length > 0 ? (
                    <Stack spacing={0.75}>
                        {o.products.map((p, i) => (
                            <Box key={i}>
                                <Typography variant="body2" fontWeight={600}>
                                    {p.productName}{p.quantity > 1 ? ` ×${p.quantity}` : ""}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {[p.sku, p.category].filter(Boolean).join(" · ")}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : <Typography variant="caption" color="text.disabled">—</Typography>}
            </TableCell>
            <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                    {fmt(((o.totalCharged || 0) - (o.discountType === "percent"
                        ? (o.totalCharged || 0) * ((o.discount || 0) / 100)
                        : (o.discount || 0))) + (o.shippingCost || 0) + (o.buyerTax || 0))}
                </Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>{fmt((o.profit || 0) + (o.shippingCost || 0))}</Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="body2" fontWeight={700} color={o.profit >= 0 ? "success.main" : "error.main"}>
                    {fmt(o.profit)}
                </Typography>
            </TableCell>
            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                {isLocked(o) ? (
                    <Tooltip title="Locked — open order details to unlock">
                        <span><LockIcon fontSize="small" sx={{ color: "text.disabled", verticalAlign: "middle" }} /></span>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => { setEditing(o); setFormOpen(true); }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(o)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </TableCell>
        </TableRow>
    );

    const tableHead = (
        <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "background.default" } }}>
                <TableCell>Origin</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Gross Revenue</TableCell>
                <TableCell align="right">Net Revenue</TableCell>
                <TableCell align="right">Profit</TableCell>
                <TableCell align="right">Actions</TableCell>
            </TableRow>
        </TableHead>
    );

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4">Orders</Typography>
                    <Typography color="text.secondary" variant="body2">Track customer orders and profitability</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                    New Order
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={2}>
                <TextField
                    placeholder="Search by customer name or origin order ID…"
                    size="small" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 260 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
                <TextField select size="small" label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 180 }}>
                    {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s || "All statuses"}</MenuItem>)}
                </TextField>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }}>
                    <Tab label="All Orders" />
                    <Tab label="By Month" />
                </Tabs>
            </Box>

            {/* Tab 0: All Orders */}
            {tab === 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        {tableHead}
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress size={28} /></TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No orders found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : pagedOrders.map(renderRow)}
                        </TableBody>
                    </Table>
                    {!loading && orders.length > ROWS && (
                        <TablePagination
                            component="div"
                            count={orders.length}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={ROWS}
                            rowsPerPageOptions={[ROWS]}
                        />
                    )}
                </TableContainer>
            )}

            {/* Tab 1: By Month */}
            {tab === 1 && (
                loading ? (
                    <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} /></Box>
                ) : groupedByMonth.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No orders found.</Typography>
                ) : (
                    groupedByMonth.map(({ label, orders: monthOrders }) => (
                        <Box key={label} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>{label}</Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    {tableHead}
                                    <TableBody>{monthOrders.map(renderRow)}</TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    ))
                )
            )}

            <OrderFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSave} initial={editing} />

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete Order</DialogTitle>
                <DialogContent>
                    <Typography>
                        Delete order <strong>{deleteTarget?.orderNumber}</strong> for <strong>{deleteTarget?.customer?.name}</strong>? This cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast((t) => ({ ...t, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <MuiAlert variant="filled" severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
                    {toast.message}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}
