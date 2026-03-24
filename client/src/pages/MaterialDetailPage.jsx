import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Divider,
    Grid, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import api from "../api";
import MaterialFormModal from "../components/modals/MaterialFormModal";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { useCurrencyFormatter } from "../utils/formatting";
import { useToast } from "../hooks/useToast";
import ToastSnackbar from "../components/common/ToastSnackbar";
import RecordInfo from "../components/common/RecordInfo";
import { DetailRow } from "../components/common/DetailRow";

const UNIT_LABELS = {
    mm: "mm", mm2: "mm²", cm: "cm", cm2: "cm²",
    m: "m",   m2: "m²",  in: "in", in2: "in²", piece: "pcs",
};

export default function MaterialDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    const { toast, showToast, closeToast } = useToast();

    const [material, setMaterial]         = useState(null);
    const [materialTypes, setMaterialTypes] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState("");
    const [editOpen, setEditOpen]         = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [matRes, typesRes] = await Promise.all([
                api.get(`/materials/${id}`),
                api.get("/material-types"),
            ]);
            setMaterial(matRes.data.material);
            setMaterialTypes(typesRes.data.types ?? []);
        } catch (e) {
            setError(e.response?.status === 404
                ? t("materials.detail.notFound", "Material not found.")
                : t("materials.detail.loadError", "Failed to load material."));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        try {
            await api.put(`/materials/${id}`, form);
            setEditOpen(false);
            showToast(t("materials.toast.updated", "Material updated"));
            await load();
        } catch (e) {
            showToast(e.response?.data?.message || t("materials.toast.saveFailed", "Save failed."), "error");
        }
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
            <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/materials")} sx={{ mb: 2 }}>
                    {t("materials.detail.back", "Back to Materials")}
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const m = material;
    const isLow = m.quantity <= m.lowStockThreshold;
    const unitLabel = UNIT_LABELS[m.unit] ?? m.unit;
    const hasPackQty = m.unitsPerPack > 0;
    const costPerUnit = hasPackQty ? m.costPerUnit / m.unitsPerPack : m.costPerUnit;

    return (
        <Box>
            {/* Back + title row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Tooltip title={t("materials.detail.back", "Back to Materials")}>
                        <IconButton onClick={() => navigate("/materials")} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                    <Box>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="h4">{m.name}</Typography>
                            {isLow && (
                                <Tooltip title={t("materials.lowStockTip", "Low stock! Threshold") + `: ${m.lowStockThreshold} ${unitLabel}`}>
                                    <WarningAmberIcon color="warning" />
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack direction="row" gap={1} mt={0.5} flexWrap="wrap">
                            <Chip label={m.type} size="small" variant="outlined" />
                            {m.color && <Chip label={m.color} size="small" />}
                        </Stack>
                    </Box>
                </Stack>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                    {t("materials.detail.edit", "Edit Material")}
                </Button>
            </Stack>

                {/* Metric bar — single card with 4 stats and stock level indicator */}
            <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
                {isLow && (
                    <Alert severity="warning" sx={{ borderRadius: 0 }}>
                        {t("materials.detail.lowStockAlert", "This material is low on stock.")}{" "}
                        {m.quantity} {unitLabel} {t("materials.detail.remaining", "remaining")} ({t("materials.detail.threshold", "threshold")}: {m.lowStockThreshold} {unitLabel})
                    </Alert>
                )}
                <Stack direction={{ xs: "column", sm: "row" }} divider={<Divider orientation="vertical" flexItem />}>
                    <Box sx={{ p: 3, flex: 1, textAlign: "center" }}>
                        <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={1}>
                            {t("materials.detail.inStock", "In Stock")}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color={isLow ? "error.main" : "primary.main"} lineHeight={1}>
                            {m.quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>{unitLabel}</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (m.quantity / Math.max(m.lowStockThreshold * 4, 1)) * 100)}
                            color={isLow ? "error" : "primary"}
                            sx={{ height: 6, borderRadius: 3 }}
                        />
                    </Box>
                    <Box sx={{ p: 3, flex: 1, textAlign: "center" }}>
                        <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={1}>
                            {t("materials.detail.lowStockThreshold", "Low Stock Threshold")}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} lineHeight={1}>{m.lowStockThreshold}</Typography>
                        <Typography variant="caption" color="text.secondary">{unitLabel}</Typography>
                    </Box>
                    <Box sx={{ p: 3, flex: 1, textAlign: "center" }}>
                        <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={1}>
                            {hasPackQty
                                ? t("materials.detail.costPerPurchase", "Cost per Purchase")
                                : t("materials.detail.costPerItem", "Cost per Item")}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} lineHeight={1}>{fmt(m.costPerUnit)}</Typography>
                        {hasPackQty && (
                            <Typography variant="caption" color="text.secondary">{t("materials.detail.perPurchase", { qty: m.unitsPerPack, unit: unitLabel })}</Typography>
                        )}
                    </Box>
                    <Box sx={{ p: 3, flex: 1, textAlign: "center" }}>
                        <Typography variant="overline" color="text.secondary" display="block" lineHeight={1} mb={1}>
                            {t("materials.detail.costPerUnit", "Cost per") + " " + unitLabel}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} lineHeight={1}>
                            {costPerUnit < 0.001
                                ? fmt(costPerUnit).replace(/0+$/, "").replace(/\.$/, "")
                                : fmt(costPerUnit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t("materials.detail.effectiveCost", "effective unit cost")}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Details — two‑column split: attributes left, supplier/notes right */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                        <Typography variant="overline" color="primary.main" display="block" mb={1.5}>
                            {t("materials.detail.details", "Details")}
                        </Typography>
                        <Grid container spacing={2}>
                            <DetailRow label={t("materials.col.name", "Name")} value={m.name} />
                            <DetailRow label={t("materials.col.type", "Type")} value={m.type} />
                            <DetailRow label={t("materials.form.colour", "Colour / Shade")} value={m.color} />
                            <DetailRow label={t("materials.form.sku", "SKU / Reference")} value={m.sku} />
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
                        <Typography variant="overline" color="primary.main" display="block" mb={1.5}>
                            {t("materials.detail.supplierNotes")}
                        </Typography>
                        <Grid container spacing={2}>
                            <DetailRow label={t("materials.form.supplier", "Supplier")} value={m.supplier} />
                            <DetailRow label={t("materials.form.description", "Description / Notes")} value={m.description} />
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Record Info */}
            <RecordInfo
                createdAt={m.createdAt}
                updatedAt={m.updatedAt}
                createdBy={m.createdBy}
                updatedBy={m.updatedBy}
            />

            {/* Edit dialog */}
            <MaterialFormModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
                initial={m}
                materialTypes={materialTypes}
            />

            <ToastSnackbar toast={toast} onClose={closeToast} />
        </Box>
    );
}
