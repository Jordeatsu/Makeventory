import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, IconButton, InputAdornment,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import ProductFormDialog from "../components/modals/ProductFormDialog";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

export default function ProductsPage() {
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => `${sym}${Number(n || 0).toFixed(2)}`;

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState("");
    const [search, setSearch]     = useState("");
    const [tab, setTab]           = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing]       = useState(null);

    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/products", { params: search ? { search } : {} });
            setProducts(data.products ?? []);
        } catch {
            setError("Failed to load products.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (payload) => {
        try {
            if (editing?._id) {
                await api.put(`/products/${editing._id}`, payload);
                showToast("Product updated.");
            } else {
                await api.post("/products", payload);
                showToast("Product created.");
            }
            setDialogOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            setError(e.response?.data?.error || "Save failed.");
        }
    };

    const handleDuplicate = (p) => {
        const { _id, __v, createdAt, updatedAt, estimatedMaterialCost, ...rest } = p;
        setEditing(rest);
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product? It will be unlinked from any existing orders.")) return;
        try {
            await api.delete(`/products/${id}`);
            showToast("Product deleted.", "info");
            load();
        } catch {
            setError("Failed to delete product.");
        }
    };

    const groupedByType = useMemo(() => {
        const groups = { Standard: [], Template: [], Variant: [] };
        products.forEach((p) => {
            if (p.isTemplate) groups.Template.push(p);
            else if (p.parentProduct) groups.Variant.push(p);
            else groups.Standard.push(p);
        });
        return ["Standard", "Template", "Variant"]
            .map((type) => ({ type, items: groups[type] }))
            .filter((g) => g.items.length > 0);
    }, [products]);

    const tableHead = (
        <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "background.default" } }}>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Est. Material Cost</TableCell>
                <TableCell align="right">Base Price</TableCell>
                <TableCell align="right">Est. Margin</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
            </TableRow>
        </TableHead>
    );

    const renderRow = (p) => {
        const inherited = p.parentProduct?.estimatedMaterialCost || 0;
        const totalCost = (p.estimatedMaterialCost || 0) + inherited;
        const margin = p.basePrice > 0
            ? (((p.basePrice - totalCost) / p.basePrice) * 100).toFixed(1)
            : null;
        return (
            <TableRow key={p._id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/products/${p._id}`)}>
                <TableCell sx={{ fontWeight: 600 }}>
                    {p.name}
                    {p.isTemplate && <Chip label="Template" size="small" color="secondary" sx={{ ml: 1 }} />}
                    {p.parentProduct && !p.isTemplate && (
                        <Tooltip title={`Variant of: ${typeof p.parentProduct === "object" ? p.parentProduct.name : p.parentProduct}`}>
                            <Chip label="Variant" size="small" variant="outlined" color="secondary" sx={{ ml: 1 }} />
                        </Tooltip>
                    )}
                </TableCell>
                <TableCell sx={{ color: "text.secondary" }}>{p.sku || "—"}</TableCell>
                <TableCell>{p.category || "—"}</TableCell>
                <TableCell align="right">{fmt(totalCost)}</TableCell>
                <TableCell align="right">{fmt(p.basePrice)}</TableCell>
                <TableCell align="right">
                    {margin !== null ? (
                        <Typography variant="body2" fontWeight={600} color={Number(margin) >= 0 ? "success.main" : "error.main"}>
                            {margin}%
                        </Typography>
                    ) : "—"}
                </TableCell>
                <TableCell>
                    <Chip label={p.active ? "Active" : "Inactive"} size="small" color={p.active ? "success" : "default"} variant="outlined" />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View details">
                            <IconButton size="small" onClick={() => navigate(`/products/${p._id}`)}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                            <IconButton size="small" onClick={() => handleDuplicate(p)}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4">Products</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your product catalogue and materials recipes
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
                    New Product
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={2} mb={3}>
                <TextField
                    size="small"
                    placeholder="Search by name, SKU or category…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); }}
                    sx={{ minWidth: 280 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => { setTab(v); }}>
                    <Tab label="All Products" />
                    <Tab label="By Type" />
                </Tabs>
            </Box>

            {/* Tab 0: All */}
            {tab === 0 && (
                loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
                ) : (
                    <Paper>
                        <TableContainer>
                            <Table size="small">
                                {tableHead}
                                <TableBody>
                                    {products.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                No products found. Create your first product to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : products.map(renderRow)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )
            )}

            {/* Tab 1: By Type */}
            {tab === 1 && (
                loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
                ) : groupedByType.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No products found.</Typography>
                ) : (
                    groupedByType.map(({ type, items }) => (
                        <Box key={type} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>{type}</Typography>
                            <Paper>
                                <TableContainer>
                                    <Table size="small">{tableHead}<TableBody>{items.map(renderRow)}</TableBody></Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    ))
                )
            )}

            <ProductFormDialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setEditing(null); }}
                onSave={handleSave}
                initial={editing}
            />

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
