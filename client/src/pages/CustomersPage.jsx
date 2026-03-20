import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, IconButton,
    InputAdornment, Paper, Snackbar, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import CustomerFormDialog from "../components/modals/CustomerFormDialog";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

export default function CustomersPage() {
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => `${sym}${Number(n || 0).toFixed(2)}`;
    const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [search, setSearch]       = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing]       = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/customers", { params: search ? { search } : {} });
            setCustomers(data.customers ?? []);
        } catch {
            setError("Failed to load customers. Is the server running?");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            if (editing?._id) {
                await api.put(`/customers/${editing._id}`, form);
                showToast("Customer updated.");
            } else {
                await api.post("/customers", form);
                showToast("Customer created.");
            }
            setDialogOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            showToast(e.response?.data?.error || "Save failed.", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/customers/${deleteTarget._id}`);
            showToast("Customer deleted.", "info");
            setDeleteTarget(null);
            load();
        } catch {
            showToast("Failed to delete customer.", "error");
            setDeleteTarget(null);
        }
    };

    return (
        <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4">Customers</Typography>
                    <Typography color="text.secondary" variant="body2">
                        Manage customers and view their order history
                    </Typography>
                </Box>
                <Stack direction="row" gap={1} alignItems="center">
                    <Chip
                        icon={<PeopleIcon />}
                        label={`${customers.length} customer${customers.length !== 1 ? "s" : ""}`}
                        color="primary" variant="outlined"
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
                        New Customer
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Stack direction="row" gap={2} mb={3}>
                <TextField
                    placeholder="Search by name or email…"
                    size="small" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 280 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
            </Stack>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : customers.length === 0 ? (
                <Paper sx={{ py: 8, textAlign: "center" }}>
                    <PeopleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary">
                        {search ? "No customers match your search." : "No customers yet — add your first customer."}
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "background.default" } }}>
                                <TableCell>Customer</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell align="center">Orders</TableCell>
                                <TableCell align="right">Total Spent</TableCell>
                                <TableCell align="right">Total Profit</TableCell>
                                <TableCell>First Order</TableCell>
                                <TableCell>Last Order</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customers.map((c) => (
                                <TableRow
                                    key={c._id}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/customers/${c._id}`)}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                        {c.email && <Typography variant="caption" color="text.secondary" display="block">{c.email}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {[c.city, c.state, c.postcode, c.country].filter(Boolean).join(", ") || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={c.orderCount}
                                            size="small"
                                            color={c.orderCount > 1 ? "success" : "default"}
                                            variant={c.orderCount > 1 ? "filled" : "outlined"}
                                        />
                                        {c.orderCount > 1 && (
                                            <Typography variant="caption" color="success.main" display="block">returning</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={500}>{fmt(c.totalSpent)}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight={500} color={c.totalProfit >= 0 ? "success.main" : "error.main"}>
                                            {fmt(c.totalProfit)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell><Typography variant="body2">{fmtDate(c.firstOrder)}</Typography></TableCell>
                                    <TableCell><Typography variant="body2">{fmtDate(c.lastOrder)}</Typography></TableCell>
                                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => navigate(`/customers/${c._id}`)}>
                                                    <ArrowForwardIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => { setEditing(c); setDialogOpen(true); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <CustomerFormDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setEditing(null); }}
                onSave={handleSave}
                initial={editing}
            />

            {/* Delete confirmation */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete Customer?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? Their order history will be preserved.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

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
