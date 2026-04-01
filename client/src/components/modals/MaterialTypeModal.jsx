import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const USAGE_TYPES = ["Whole Item", "Percentage", "Bulk"];
const UNITS = ["mm", "mm2", "cm", "cm2", "m", "m2", "in", "in2"];
const USAGE_I18N = { "Whole Item": "wholeItem", Percentage: "percentage", Bulk: "bulk" };
const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const EMPTY_FORM = {
    name: "",
    description: "",
    usageType: "Whole Item",
    unitOfMeasure: "",
    isActive: true,
    defaultStockQty: "",
    lowStockThreshold: "",
    defaultCostPrice: "",
    purchaseQty: "",
};

export default function MaterialTypeModal({ open, initial, onClose, onSaved }) {
    const isEdit = Boolean(initial);
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setForm(
                initial
                    ? {
                          name: initial.name,
                          description: initial.description || "",
                          usageType: initial.usageType,
                          unitOfMeasure: initial.unitOfMeasure || "",
                          isActive: initial.isActive,
                          defaultStockQty: initial.defaultStockQty ?? "",
                          lowStockThreshold: initial.lowStockThreshold ?? "",
                          defaultCostPrice: initial.defaultCostPrice ?? "",
                          purchaseQty: initial.purchaseQty ?? "",
                      }
                    : EMPTY_FORM,
            );
            setError(null);
        }
    }, [open, initial]);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    // The unit suffix shown in stock quantity fields
    const unitSuffix = form.usageType === "Percentage" ? form.unitOfMeasure || "" : "pcs";

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setError(t("settings.materialTypes.modal.nameRequired"));
            return;
        }
        if (form.usageType === "Percentage" && !form.unitOfMeasure) {
            setError(t("settings.materialTypes.modal.unitRequired"));
            return;
        }

        setSaving(true);
        setError(null);
        try {
            // Whole Item and Bulk always use 'piece'; Percentage uses the selected unit
            const unitOfMeasure = form.usageType !== "Percentage" ? "piece" : form.unitOfMeasure;
            const parseNum = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : null);

            const payload = {
                ...form,
                unitOfMeasure,
                defaultStockQty: parseNum(form.defaultStockQty),
                lowStockThreshold: parseNum(form.lowStockThreshold),
                defaultCostPrice: parseNum(form.defaultCostPrice),
                purchaseQty: parseNum(form.purchaseQty),
            };

            const url = isEdit ? `/api/material-types/${initial._id}` : "/api/material-types";
            const method = isEdit ? "PUT" : "POST";

            const r = await fetch(url, {
                method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.error || "Save failed.");
            onSaved(body.type, isEdit);
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const stockAdornment = unitSuffix ? { endAdornment: <InputAdornment position="end">{unitSuffix}</InputAdornment> } : undefined;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? t("settings.materialTypes.modal.editTitle") : t("settings.materialTypes.modal.createTitle")}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField label={t("common.name")} value={form.name} onChange={set("name")} required fullWidth />
                <TextField label={t("common.description")} value={form.description} onChange={set("description")} fullWidth multiline minRows={2} />
                <FormControl fullWidth required>
                    <InputLabel>{t("settings.materialTypes.modal.usageTypeLabel")}</InputLabel>
                    <Select value={form.usageType} label={t("settings.materialTypes.modal.usageTypeLabel")} onChange={set("usageType")}>
                        {USAGE_TYPES.map((u) => (
                            <MenuItem key={u} value={u}>
                                {t(`usageTypes.${USAGE_I18N[u]}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Unit of measure — only shown and required for Percentage */}
                {form.usageType === "Percentage" && (
                    <FormControl fullWidth required error={!form.unitOfMeasure}>
                        <InputLabel>{t("settings.materialTypes.modal.unitLabel")} *</InputLabel>
                        <Select value={form.unitOfMeasure} label={`${t("settings.materialTypes.modal.unitLabel")} *`} onChange={set("unitOfMeasure")}>
                            {UNITS.map((u) => (
                                <MenuItem key={u} value={u}>
                                    {t(`units.${u}`, u)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {/* ── Default stock values ─────────────────────────────────── */}
                <Box>
                    <Divider sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                            {t("settings.materialTypes.modal.defaultsSection")}
                        </Typography>
                    </Divider>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("settings.materialTypes.modal.defaultStockQty")}
                                value={form.defaultStockQty}
                                onChange={set("defaultStockQty")}
                                type="number"
                                inputProps={{ min: 0, step: "any" }}
                                fullWidth
                                helperText={t("settings.materialTypes.modal.defaultStockQtyHelp")}
                                InputProps={stockAdornment}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("settings.materialTypes.modal.lowStockThreshold")}
                                value={form.lowStockThreshold}
                                onChange={set("lowStockThreshold")}
                                type="number"
                                inputProps={{ min: 0, step: "any" }}
                                fullWidth
                                helperText={t("settings.materialTypes.modal.lowStockThresholdHelp")}
                                InputProps={stockAdornment}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("settings.materialTypes.modal.defaultCostPrice")}
                                value={form.defaultCostPrice}
                                onChange={set("defaultCostPrice")}
                                type="number"
                                inputProps={{ min: 0, step: "any" }}
                                fullWidth
                                helperText={t("settings.materialTypes.modal.defaultCostPriceHelp")}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={t("settings.materialTypes.modal.purchaseQty")}
                                value={form.purchaseQty}
                                onChange={set("purchaseQty")}
                                type="number"
                                inputProps={{ min: 0, step: "any" }}
                                fullWidth
                                helperText={t("settings.materialTypes.modal.purchaseQtyHelp")}
                                InputProps={stockAdornment}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />} label={t("settings.materialTypes.modal.activeLabel")} />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={saving}>
                    {t("common.cancel")}
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
                    {isEdit ? t("common.saveChanges") : t("common.create")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
