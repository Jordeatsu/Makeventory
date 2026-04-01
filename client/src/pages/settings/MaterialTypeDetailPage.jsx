import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, Paper, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import api from "../../api";
import MaterialTypeModal from "../../components/modals/MaterialTypeModal";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const USAGE_KEY = { "Whole Item": "wholeItem", Percentage: "percentage", Bulk: "bulk" };

function DetailRow({ label, value }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
                {value}
            </Typography>
        </Grid>
    );
}

export default function MaterialTypeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [type, setType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/material-types/${id}`);
            setType(res.data.type);
        } catch (e) {
            setError(e.response?.status === 404 ? t("settings.materialTypes.notFound", "Material type not found.") : t("settings.materialTypes.loadError", "Failed to load material type."));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSaved = () => {
        setEditOpen(false);
        showToast(t("settings.materialTypes.updated", "Material type updated successfully"));
        load();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 860, mx: "auto" }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/settings/material-types")} sx={{ mb: 2 }}>
                    {t("settings.materialTypes.backToTypes", "Back to Material Types")}
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const mt = type;
    const unitLabel = mt.unitOfMeasure ? t(`units.${mt.unitOfMeasure}`, mt.unitOfMeasure) : "—";
    const hasDefaults = mt.defaultStockQty != null || mt.lowStockThreshold != null || mt.defaultCostPrice != null || mt.purchaseQty != null;

    return (
        <Box sx={{ maxWidth: 860, mx: "auto" }}>
            {/* Back + title */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Tooltip title={t("settings.materialTypes.backToTypes", "Back to Material Types")}>
                        <IconButton onClick={() => navigate("/settings/material-types")} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Box>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="h5" fontWeight={600}>
                                {mt.name}
                            </Typography>
                            <Chip label={mt.isActive ? t("common.active") : t("common.inactive")} color={mt.isActive ? "success" : "default"} size="small" variant="outlined" />
                        </Stack>
                        {mt.description && (
                            <Typography variant="body2" color="text.secondary" mt={0.25}>
                                {mt.description}
                            </Typography>
                        )}
                    </Box>
                </Stack>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                    {t("settings.materialTypes.editButton", "Edit Type")}
                </Button>
            </Stack>

            {/* Summary cards */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("settings.materialTypes.table.usageType", "Usage Type")}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                            {USAGE_KEY[mt.usageType] ? t(`usageTypes.${USAGE_KEY[mt.usageType]}`) : mt.usageType}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("settings.materialTypes.table.unit", "Unit of Measure")}
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                            {unitLabel}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("common.status", "Status")}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={mt.isActive ? "success.main" : "text.secondary"}>
                            {mt.isActive ? t("common.active") : t("common.inactive")}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Default values */}
            {hasDefaults && (
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        {t("settings.materialTypes.modal.defaultsSection", "Default Values")}
                    </Typography>
                    <Grid container spacing={2}>
                        <DetailRow label={t("settings.materialTypes.modal.defaultStockQty", "Default Stock Qty")} value={mt.defaultStockQty != null ? `${mt.defaultStockQty} ${unitLabel}` : null} />
                        <DetailRow label={t("settings.materialTypes.modal.lowStockThreshold", "Low Stock Threshold")} value={mt.lowStockThreshold != null ? `${mt.lowStockThreshold} ${unitLabel}` : null} />
                        <DetailRow label={t("settings.materialTypes.modal.defaultCostPrice", "Default Cost Price")} value={mt.defaultCostPrice != null ? `${currencySymbol}${Number(mt.defaultCostPrice).toFixed(2)}` : null} />
                        <DetailRow label={t("settings.materialTypes.modal.purchaseQty", "Purchase Qty")} value={mt.purchaseQty != null ? `${mt.purchaseQty} ${unitLabel}` : null} />
                    </Grid>
                </Paper>
            )}

            {/* Record info */}
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                    {t("materials.detail.systemInfo", "Record Info")}
                </Typography>
                <Grid container spacing={2}>
                    {mt.createdAt && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {t("materials.detail.created", "Created")}
                            </Typography>
                            {mt.createdBy?.name && (
                                <Typography variant="body1" fontWeight={600}>
                                    {mt.createdBy.name}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(mt.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                    {mt.updatedAt && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {t("materials.detail.updated", "Last Updated")}
                            </Typography>
                            {mt.updatedBy?.name && (
                                <Typography variant="body1" fontWeight={600}>
                                    {mt.updatedBy.name}
                                </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(mt.updatedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Edit modal */}
            <MaterialTypeModal open={editOpen} initial={mt} onClose={() => setEditOpen(false)} onSaved={handleSaved} />

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={() => setToast((p) => ({ ...p, open: false }))} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
