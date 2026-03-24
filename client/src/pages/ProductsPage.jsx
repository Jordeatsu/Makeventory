import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, IconButton, InputAdornment,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import ProductFormModal from "../components/modals/ProductFormModal";
import { useCurrencyFormatter } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "react-i18next";
import ToastSnackbar from "../components/common/ToastSnackbar";

export default function ProductsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { toast, showToast, closeToast } = useToast();

    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState("");
    const [search, setSearch]     = useState("");
    const [tab, setTab]           = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing]       = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/products", { params: search ? { search } : {} });
            setProducts(data.products ?? []);
        } catch {
            setError(t('products.loadError'));
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (payload) => {
        try {
            if (editing?._id) {
                await api.put(`/products/${editing._id}`, payload);
                showToast(t('products.updated'));
            } else {
                await api.post("/products", payload);
                showToast(t('products.created'));
            }
            setDialogOpen(false);
            setEditing(null);
            load();
        } catch (e) {
            setError(e.response?.data?.error || t('products.saveFailed'));
        }
    };

    const handleDuplicate = (p) => {
        const { _id, __v, createdAt, updatedAt, estimatedMaterialCost, ...rest } = p;
        setEditing(rest);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/products/${deleteTarget._id}`);
            setDeleteTarget(null);
            showToast(t('products.deleted'), "info");
            load();
        } catch {
            setError(t('products.deleteFailed'));
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
                <TableCell>{t('products.col.name')}</TableCell>
                <TableCell>{t('products.col.sku')}</TableCell>
                <TableCell>{t('products.col.category')}</TableCell>
                <TableCell align="right">{t('products.col.estMaterialCost')}</TableCell>
                <TableCell align="right">{t('products.col.basePrice')}</TableCell>
                <TableCell align="right">{t('products.col.estMargin')}</TableCell>
                <TableCell>{t('products.col.status')}</TableCell>
                <TableCell align="right">{t('products.col.actions')}</TableCell>
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
                        <Tooltip title={t('products.variantOf', { name: typeof p.parentProduct === "object" ? p.parentProduct.name : p.parentProduct })}>
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
                    <Chip label={p.active ? t('common.active') : t('common.inactive')} size="small" color={p.active ? "success" : "default"} variant="outlined" />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={t('common.view')}>
                            <IconButton size="small" onClick={() => navigate(`/products/${p._id}`)}>
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.duplicate')}>
                            <IconButton size="small" onClick={() => handleDuplicate(p)}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.edit')}>
                            <IconButton size="small" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}>
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
                    <Typography variant="h4">{t('products.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('products.subtitle')}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
                    {t('products.newProduct')}
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={2} mb={3}>
                <TextField
                    size="small"
                    placeholder={t('products.searchPlaceholder')}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); }}
                    sx={{ minWidth: 280 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => { setTab(v); }}>
                    <Tab label={t('products.tabs.all')} />
                    <Tab label={t('products.tabs.byType')} />
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
                                            {t('products.noProducts')}
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
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>{t('products.noResult')}</Typography>
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

            <ProductFormModal
                open={dialogOpen}
                onClose={() => { setDialogOpen(false); setEditing(null); }}
                onSave={handleSave}
                initial={editing}
            />

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{t('products.delete.title')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('products.delete.confirm', { name: deleteTarget?.name })}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">{t('common.cancel')}</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>{t('common.delete')}</Button>
                </DialogActions>
            </Dialog>

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
