import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, InputAdornment, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TuneIcon from "@mui/icons-material/Tune";
import { useTranslation } from "react-i18next";
import api from "../api";
import MaterialFormModal from "../components/modals/MaterialFormModal";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { useCurrencyFormatter } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import ToastSnackbar from "../components/common/ToastSnackbar";

export default function MaterialsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { toast, showToast, closeToast } = useToast();

    const [materials, setMaterials] = useState([]);
    const [materialTypes, setMaterialTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [lowStockMaterials, setLowStockMaterials] = useState([]);

    // Load material types for filter dropdown
    useEffect(() => {
        api.get("/material-types").then((res) => {
            setMaterialTypes(res.data.types || []);
        }).catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            const [filtered, all] = await Promise.all([
                api.get("/materials", { params }),
                api.get("/materials"),
            ]);
            setMaterials(filtered.data.materials);
            setLowStockMaterials(
                (all.data.materials || []).filter((m) => m.quantity <= m.lowStockThreshold)
            );
        } catch {
            setError(t("materials.loadError", "Failed to load materials. Is the server running?"));
        } finally {
            setLoading(false);
        }
    }, [search, typeFilter, t]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSave = async (form) => {
        const wasEditing = !!editing;
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/materials/${editing._id}`, form);
            } else {
                await api.post("/materials", form);
            }
            setFormOpen(false);
            setEditing(null);
            showToast(wasEditing ? t("materials.toast.updated", "Material updated") : t("materials.toast.created", "Material added successfully"));
            await load();
        } catch (e) {
            throw e; // let the dialog display the error inline
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMore = async (form) => {
        setSaving(true);
        try {
            await api.post("/materials", form);
            showToast(t("materials.toast.created", "Material added successfully"));
            await load();
        } catch (e) {
            throw e;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/materials/${deleteTarget._id}`);
            setDeleteTarget(null);
            showToast(t("materials.toast.deleted", "Material deleted"));
            await load();
        } catch {
            setError(t("materials.deleteError", "Delete failed"));
        }
    };

    return (
        <Box>
            {/* Header */}
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} mb={3} gap={2}>
                <Box>
                    <Typography variant="h4">{t("materials.title", "Materials")}</Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t("materials.subtitle", "Manage threads, fabrics, and all crafting materials")}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                    }}
                >
                    {t("materials.addMaterial", "Add Material")}
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Low Stock Alert Table */}
            {lowStockMaterials.length > 0 && (
                <Box mb={4}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <WarningAmberIcon color="warning" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight={700} color="warning.dark">
                            {t("materials.lowStock", "Low Stock")} ({lowStockMaterials.length})
                        </Typography>
                    </Stack>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderColor: "warning.main" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "warning.light" }}>
                                    <TableCell>{t("materials.col.name", "Name")}</TableCell>
                                    <TableCell>{t("materials.col.type", "Type")}</TableCell>
                                    <TableCell>{t("materials.col.colour", "Colour")}</TableCell>
                                    <TableCell align="right">{t("materials.col.inStock", "In Stock")}</TableCell>
                                    <TableCell align="right">{t("materials.col.threshold", "Threshold")}</TableCell>
                                    <TableCell>{t("materials.col.supplier", "Supplier")}</TableCell>
                                    <TableCell align="right">{t("materials.col.actions", "Actions")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lowStockMaterials.map((m) => (
                                    <TableRow key={m._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{m.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={m.type} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{m.color || "—"}</TableCell>
                                        <TableCell align="right">
                                            <Typography component="span" variant="body2" color="error.main" fontWeight={700}>
                                                {m.quantity}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                {m.unit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {m.lowStockThreshold}
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                {m.unit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{m.supplier || "—"}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={t("materials.edit", "Edit")}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditing(m);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Filters */}
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={2} mb={3}>
                <TextField
                    placeholder={t("materials.searchPlaceholder", "Search by name…")}
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 240 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    size="small"
                    label={t("materials.filterByType", "Filter by type")}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{ minWidth: 180 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <TuneIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                >
                    <MenuItem value="">{t("materials.allTypes", "All types")}</MenuItem>
                    {materialTypes.map((mt) => (
                        <MenuItem key={mt._id} value={mt.name}>
                            {mt.name}
                        </MenuItem>
                    ))}
                </TextField>
                {typeFilter &&
                    (() => {
                        const totalValue = materials.reduce((s, m) => {
                            const effectiveCost = m.unitsPerPack > 0
                                ? m.costPerUnit / m.unitsPerPack
                                : m.costPerUnit;
                            return s + m.quantity * effectiveCost;
                        }, 0);
                        const totalQty = materials.reduce((s, m) => s + m.quantity, 0);
                        return (
                            <Paper variant="outlined" sx={{ px: 2, py: 0.75, ml: { sm: "auto" }, whiteSpace: "nowrap" }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {materials.length} {typeFilter}{materials.length !== 1 ? "s" : ""} &middot; {totalQty} {t("materials.units", "units")}
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {t("materials.totalValue", "Total value")}: {fmt(totalValue)}
                                </Typography>
                            </Paper>
                        );
                    })()}
            </Stack>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'background.default' } }}>
                            <TableCell>{t("materials.col.name", "Name")}</TableCell>
                            <TableCell>{t("materials.col.type", "Type")}</TableCell>
                            <TableCell>{t("materials.col.colour", "Colour")}</TableCell>
                            <TableCell align="right">{t("materials.col.inStock", "In Stock")}</TableCell>
                            <TableCell align="right">{t("materials.col.actions", "Actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                    {t("materials.empty", "No materials found. Add one to get started.")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((m) => {
                                const isLow = m.quantity <= m.lowStockThreshold;
                                return (
                                    <TableRow key={m._id} hover sx={{ bgcolor: isLow ? "warning.light" : undefined, opacity: isLow ? 0.95 : 1 }}>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" gap={0.5}>
                                                {isLow && (
                                                    <Tooltip title={`${t("materials.lowStockTip", "Low stock! Threshold")}: ${m.lowStockThreshold} ${m.unit}`}>
                                                        <WarningAmberIcon fontSize="small" color="warning" />
                                                    </Tooltip>
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    sx={{ cursor: "pointer", "&:hover": { color: "primary.main", textDecoration: "underline" } }}
                                                    onClick={() => navigate(`/materials/${m._id}`)}
                                                >
                                                    {m.name}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={m.type} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{m.color || "—"}</TableCell>
                                        <TableCell align="right">
                                            {m.quantity}
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                {m.unit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={t("materials.edit", "Edit")}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setEditing(m);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t("materials.delete", "Delete")}>
                                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(m)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Summary */}
            {!loading && materials.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {materials.length} {t("materials.materialShown", "material")}{materials.length !== 1 ? "s" : ""} {t("materials.shown", "shown")}
                    {materials.filter((m) => m.quantity <= m.lowStockThreshold).length > 0 &&
                        ` · ${materials.filter((m) => m.quantity <= m.lowStockThreshold).length} ${t("materials.lowStockCount", "low stock")}`
                    }
                </Typography>
            )}

            {/* Form dialog */}
            <MaterialFormModal
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                onSave={handleSave}
                onSaveMore={handleSaveMore}
                onStockAdjusted={() => {
                    load();
                }}
                initial={editing}
                saving={saving}
                materialTypes={materialTypes}
            />

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{t("materials.deleteTitle", "Delete Material")}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t("materials.deleteConfirm", "Are you sure you want to delete")} <strong>{deleteTarget?.name}</strong>? {t("materials.deleteWarning", "This cannot be undone.")}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} color="inherit">
                        {t("common.cancel", "Cancel")}
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        {t("common.delete", "Delete")}
                    </Button>
                </DialogActions>
            </Dialog>
            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
