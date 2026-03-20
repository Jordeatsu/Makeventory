import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert, Box, Button, Chip, CircularProgress, Divider,
    Grid, IconButton, Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import api from "../api";
import MaterialFormDialog from "../components/modals/MaterialFormDialog";
import { useGlobalSettings } from "../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const UNIT_LABELS = {
    mm: "mm", mm2: "mm²", cm: "cm", cm2: "cm²",
    m: "m",   m2: "m²",  in: "in", in2: "in²", piece: "pcs",
};

function DetailRow({ label, value, mono = false }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body1" fontFamily={mono ? "monospace" : undefined} fontWeight={500}>
                {value}
            </Typography>
        </Grid>
    );
}

export default function MaterialDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const fmt = (n) => `${currencySymbol}${Number(n).toFixed(2)}`;

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
        await api.put(`/materials/${id}`, form);
        setEditOpen(false);
        await load();
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

            {isLow && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {t("materials.detail.lowStockAlert", "This material is low on stock.")} {m.quantity} {unitLabel} {t("materials.detail.remaining", "remaining")} ({t("materials.detail.threshold", "threshold")}: {m.lowStockThreshold} {unitLabel})
                </Alert>
            )}

            {/* Stock card */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("materials.detail.inStock", "In Stock")}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color={isLow ? "error.main" : "primary.main"}>
                            {m.quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{unitLabel}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("materials.detail.lowStockThreshold", "Low Stock Threshold")}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {m.lowStockThreshold}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{unitLabel}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {hasPackQty
                                ? t("materials.detail.costPerPurchase", "Cost per Purchase")
                                : t("materials.detail.costPerItem", "Cost per Item")}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {fmt(m.costPerUnit)}
                        </Typography>
                        {hasPackQty && (
                            <Typography variant="caption" color="text.secondary">
                                {m.unitsPerPack} {unitLabel} / purchase
                            </Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {t("materials.detail.costPerUnit", "Cost per") + " " + unitLabel}
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                            {costPerUnit < 0.001
                                ? fmt(costPerUnit).replace(/0+$/, "").replace(/\.$/, "")
                                : fmt(costPerUnit)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t("materials.detail.effectiveCost", "effective unit cost")}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Details */}
            <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    {t("materials.detail.details", "Details")}
                </Typography>
                <Grid container spacing={2}>
                    <DetailRow label={t("materials.col.name", "Name")} value={m.name} />
                    <DetailRow label={t("materials.col.type", "Type")} value={m.type} />
                    <DetailRow label={t("materials.form.colour", "Colour / Shade")} value={m.color} />
                    <DetailRow label={t("materials.form.sku", "SKU / Reference")} value={m.sku} />
                    <DetailRow label={t("materials.form.supplier", "Supplier")} value={m.supplier} />
                    <DetailRow label={t("materials.form.description", "Description / Notes")} value={m.description} />
                </Grid>

                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                    {t("materials.detail.systemInfo", "Record Info")}
                </Typography>
                <Grid container spacing={2}>
                    {m.createdAt && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {t("materials.detail.created", "Created")}
                            </Typography>
                            {m.createdBy?.name && (
                                <Typography variant="body1" fontWeight={600}>{m.createdBy.name}</Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(m.createdAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                    {m.updatedAt && (
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {t("materials.detail.updated", "Last Updated")}
                            </Typography>
                            {m.updatedBy?.name && (
                                <Typography variant="body1" fontWeight={600}>{m.updatedBy.name}</Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {new Date(m.updatedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Edit dialog */}
            <MaterialFormDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
                initial={m}
                materialTypes={materialTypes}
            />
        </Box>
    );
}
