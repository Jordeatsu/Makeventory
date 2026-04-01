/**
 * @file MaterialFormModal.jsx
 * @description Modal dialog for creating or editing a material record.
 *
 * Adapts dynamically to the selected MaterialType's usageType:
 *   - Whole Item  → cost per item, no pack concept
 *   - Percentage  → continuous measurement (cut from roll/sheet); cost = pack price / pack qty
 *   - Bulk        → counted discrete items; cost = pack price / items per pack
 *
 * Pre-fills defaults from the MaterialType when a type is selected.
 * Offers "Add to existing" shortcut when a duplicate name is detected.
 */
import React, { useState, useEffect } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

// Human-readable labels for each unitOfMeasure key
const UNIT_LABELS = {
    mm: "mm",
    mm2: "mm²",
    cm: "cm",
    cm2: "cm²",
    m: "m",
    m2: "m²",
    in: "in",
    in2: "in²",
    piece: "pcs",
};

// Reference quantities shown in the cost-insight panel (secondary figure)
const INSIGHT_REF = {
    mm: { qty: 100, label: "100 mm (10 cm)" },
    cm: { qty: 10, label: "10 cm" },
    m: { qty: 1, label: "1 m" },
    in: { qty: 12, label: "1 ft (12 in)" },
    mm2: { qty: 100, label: "10 mm × 10 mm" },
    cm2: { qty: 100, label: "10 cm × 10 cm" },
    m2: { qty: 1, label: "1 m × 1 m" },
    in2: { qty: 144, label: "1 ft × 1 ft" },
};

const EMPTY_FORM = {
    name: "",
    typeId: "",
    color: "",
    quantity: "",
    costPerUnit: "",
    unitsPerPack: "",
    lowStockThreshold: "",
    sku: "",
    supplier: "",
    description: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MaterialFormModal({ open, onClose, onSave, onSaveMore, onStockAdjusted, initial, materialTypes = [] }) {
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saveError, setSaveError] = useState("");
    const [existingMaterial, setExisting] = useState(null);

    // ── Derived from selected type ───────────────────────────────────────────
    const selectedType = materialTypes.find((mt) => mt._id === form.typeId) ?? null;
    const usageType = selectedType?.usageType ?? "Whole Item";
    const isPercentage = usageType === "Percentage";
    const isBulk = usageType === "Bulk";
    const isWhole = usageType === "Whole Item";
    const needsPack = isPercentage || isBulk;

    // Unit of measure for this material: type's unit for Percentage, 'piece' otherwise
    const unitKey = isPercentage ? (selectedType?.unitOfMeasure ?? "piece") : "piece";
    const unitLabel = UNIT_LABELS[unitKey] ?? unitKey;

    // ── Initialise form on open ──────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;

        if (initial) {
            // In edit mode: resolve typeId from the materialType ObjectId
            const typeId = typeof initial.materialType === "string" ? initial.materialType : (initial.materialType?._id ?? "");
            setForm({
                name: initial.name ?? "",
                typeId,
                color: initial.color ?? "",
                quantity: initial.quantity ?? "",
                costPerUnit: initial.costPerUnit ?? "",
                unitsPerPack: initial.unitsPerPack ?? "",
                lowStockThreshold: initial.lowStockThreshold ?? "",
                sku: initial.sku ?? "",
                supplier: initial.supplier ?? "",
                description: initial.description ?? "",
            });
        } else {
            // In create mode: seed from first active type's defaults
            const first = materialTypes.find((mt) => mt.isActive) ?? materialTypes[0];
            setForm({
                ...EMPTY_FORM,
                typeId: first?._id ?? "",
                quantity: first?.defaultStockQty ?? "",
                lowStockThreshold: first?.lowStockThreshold ?? "",
                costPerUnit: first?.defaultCostPrice ?? "",
                unitsPerPack: first?.purchaseQty ?? "",
            });
        }

        setErrors({});
        setSaveError("");
        setExisting(null);
    }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Helpers ──────────────────────────────────────────────────────────────
    const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleTypeChange = (e) => {
        const typeId = e.target.value;
        const mt = materialTypes.find((t) => t._id === typeId);
        setForm((p) => ({
            ...p,
            typeId,
            quantity: mt?.defaultStockQty ?? "",
            lowStockThreshold: mt?.lowStockThreshold ?? "",
            costPerUnit: mt?.defaultCostPrice ?? "",
            unitsPerPack: mt?.purchaseQty ?? "",
        }));
        setExisting(null);
    };

    // Duplicate-name check on blur
    const handleNameBlur = async () => {
        if (!form.name.trim() || !selectedType) return;
        try {
            const res = await api.get("/materials", {
                params: { type: selectedType.name, search: form.name.trim() },
            });
            const match = (res.data.materials ?? []).find((m) => m.name.toLowerCase() === form.name.trim().toLowerCase() && m._id !== initial?._id);
            setExisting(match ?? null);
            if (match) {
                setErrors((p) => ({
                    ...p,
                    name: t("materials.form.duplicate", `"${form.name.trim()}" already exists.`, { name: form.name.trim() }),
                }));
            }
        } catch {
            // silently ignore network errors
        }
    };

    const handleAddToExisting = async () => {
        if (!existingMaterial || form.quantity === "" || isNaN(Number(form.quantity))) return;
        setSaveError("");
        try {
            await api.post(`/materials/${existingMaterial._id}/adjust-stock`, { delta: Number(form.quantity) });
            setExisting(null);
            setErrors({});
            setForm((p) => ({ ...p, name: "" }));
            (onStockAdjusted ?? onClose)();
        } catch (e) {
            setSaveError(e.response?.data?.error ?? t("materials.form.updateStockFailed", "Failed to update stock"));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = t("materials.form.nameRequired", "Required");
        else if (existingMaterial) e.name = t("materials.form.duplicate", `"${form.name.trim()}" already exists.`, { name: form.name.trim() });
        if (!form.typeId) e.type = t("materials.form.typeRequired", "Required");
        if (form.quantity === "" || isNaN(Number(form.quantity))) e.quantity = t("materials.form.mustBeNumber", "Must be a number");
        if (form.costPerUnit === "" || isNaN(Number(form.costPerUnit))) e.costPerUnit = t("materials.form.mustBeNumber", "Must be a number");
        if (needsPack && (!form.unitsPerPack || isNaN(Number(form.unitsPerPack)) || Number(form.unitsPerPack) <= 0)) e.unitsPerPack = t("materials.form.purchaseQtyRequired", "Required — enter the purchase quantity per pack");
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildPayload = () => ({
        name: form.name.trim(),
        type: selectedType?.name ?? "",
        color: form.color.trim() || null,
        quantity: Number(form.quantity),
        unit: unitKey,
        costPerUnit: Number(form.costPerUnit),
        unitsPerPack: needsPack ? Number(form.unitsPerPack) : 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 1,
        sku: form.sku.trim() || null,
        supplier: form.supplier.trim() || null,
        description: form.description.trim() || null,
    });

    const handleSave = async () => {
        if (!validate()) return;
        setSaveError("");
        try {
            await onSave(buildPayload());
        } catch (e) {
            setSaveError(e.response?.data?.error ?? e.message ?? t("materials.form.saveFailed", "Save failed"));
        }
    };

    const handleSaveAndMore = async () => {
        if (!validate()) return;
        setSaveError("");
        try {
            await onSaveMore(buildPayload());
            // Keep dialog open; clear name & quantity only
            setForm((p) => ({
                ...p,
                name: "",
                quantity: selectedType?.defaultStockQty ?? "",
            }));
            setErrors({});
            setExisting(null);
        } catch (e) {
            setSaveError(e.response?.data?.error ?? e.message ?? t("materials.form.saveFailed", "Save failed"));
        }
    };

    // ── Cost insight ─────────────────────────────────────────────────────────
    const costNum = parseFloat(form.costPerUnit);
    const packNum = parseFloat(form.unitsPerPack);
    const validCost = !isNaN(costNum) && costNum > 0;
    const validPack = !isNaN(packNum) && packNum > 0;

    let insight = null;
    if (isWhole && validCost) {
        insight = {
            primary: { label: "Cost per item", value: costNum.toFixed(2) },
            secondary: null,
        };
    } else if (needsPack && validCost && validPack) {
        const perUnit = costNum / packNum;
        const ref = INSIGHT_REF[unitKey];
        insight = {
            primary: {
                label: `Cost per ${unitLabel}`,
                value: perUnit < 0.001 ? perUnit.toFixed(6) : perUnit < 0.01 ? perUnit.toFixed(5) : perUnit.toFixed(4),
            },
            secondary: ref
                ? {
                      label: `${ref.label} costs`,
                      value: (perUnit * ref.qty).toFixed(2),
                  }
                : null,
        };
    }

    // ── Dynamic labels ───────────────────────────────────────────────────────
    const stockLabel = isPercentage ? `Current Stock (${unitLabel})` : "Quantity in Stock";
    const stockHelp = isPercentage ? `How many ${unitLabel} you currently have available` : isBulk ? "Number of individual items in stock" : "How many complete items you have";

    const packLabel = isPercentage ? `Purchase Quantity (${unitLabel} per purchase)` : "Items per Pack";
    const packHelp = isPercentage ? `How much you receive per purchase — e.g. 10${unitLabel} per roll` : "How many individual items come in one pack";

    const costLabel = isPercentage ? "Cost per Purchase" : isBulk ? "Cost per Pack" : "Cost per Item";
    const costHelp = isPercentage ? "What you paid for the full purchase (e.g. one roll or sheet)" : isBulk ? "What you paid for one full pack" : "What you paid for one individual item";

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initial ? t("materials.form.editTitle", "Edit Material") : t("materials.form.addTitle", "Add New Material")}</DialogTitle>

            <DialogContent dividers>
                {saveError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError("")}>
                        {saveError}
                    </Alert>
                )}

                {existingMaterial && !initial && (
                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                        action={
                            <Button color="inherit" size="small" variant="outlined" onClick={handleAddToExisting}>
                                {t("materials.form.addToExisting", "Add {{qty}} to existing", { qty: form.quantity || 0 })}
                            </Button>
                        }
                    >
                        {t("materials.form.duplicateAlert", "{{name}} already exists with {{qty}} in stock. Add {{add}} to it instead?", { name: existingMaterial.name, qty: existingMaterial.quantity, add: form.quantity || 0 })}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ pt: 0.5 }}>
                    {/* ── Basic Info ──────────────────────────────────────── */}
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField
                            label={t("materials.form.name", "Name")}
                            fullWidth
                            value={form.name}
                            onChange={(e) => {
                                setExisting(null);
                                setErrors((p) => ({ ...p, name: undefined }));
                                set("name")(e);
                            }}
                            onBlur={handleNameBlur}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label={t("materials.form.type", "Type")} fullWidth value={form.typeId} onChange={handleTypeChange} error={!!errors.type} helperText={errors.type}>
                            {materialTypes
                                .filter((mt) => mt.isActive)
                                .map((mt) => (
                                    <MenuItem key={mt._id} value={mt._id}>
                                        {mt.name}
                                    </MenuItem>
                                ))}
                        </TextField>
                    </Grid>

                    {/* Usage type badge */}
                    {selectedType && (
                        <Grid size={12}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Usage type:
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="primary.main">
                                    {selectedType.usageType}
                                    {isPercentage && unitLabel !== "pcs" ? ` · measured in ${unitLabel}` : ""}
                                </Typography>
                                {selectedType.description && (
                                    <Typography variant="caption" color="text.secondary">
                                        — {selectedType.description}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    )}

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label={t("materials.form.colour", "Colour / Shade")} fullWidth value={form.color} onChange={set("color")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label={t("materials.form.sku", "SKU / Reference")} fullWidth value={form.sku} onChange={set("sku")} />
                    </Grid>

                    {/* ── Stock ───────────────────────────────────────────── */}
                    <Grid size={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.stockSection", "Stock")}
                            </Typography>
                        </Divider>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label={stockLabel + " *"}
                            type="number"
                            fullWidth
                            value={form.quantity}
                            onChange={set("quantity")}
                            error={!!errors.quantity}
                            helperText={errors.quantity ?? stockHelp}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: isPercentage ? 0.01 : 1 }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label={t("materials.form.lowStockAlert", "Low Stock Alert")}
                            type="number"
                            fullWidth
                            value={form.lowStockThreshold}
                            onChange={set("lowStockThreshold")}
                            inputProps={{ min: 0, step: isPercentage ? 0.01 : 1 }}
                            helperText={t("materials.form.lowStockHint", "Alert when stock falls below this")}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* ── Pricing ─────────────────────────────────────────── */}
                    <Grid size={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.pricingSection", "Pricing")}
                            </Typography>
                        </Divider>
                    </Grid>

                    <Grid size={{ xs: 12, sm: needsPack ? 6 : 6 }}>
                        <TextField
                            label={costLabel + " *"}
                            type="number"
                            fullWidth
                            value={form.costPerUnit}
                            onChange={set("costPerUnit")}
                            error={!!errors.costPerUnit}
                            helperText={errors.costPerUnit ?? costHelp}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
                            }}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>

                    {needsPack && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={packLabel + " *"}
                                type="number"
                                fullWidth
                                value={form.unitsPerPack}
                                onChange={set("unitsPerPack")}
                                error={!!errors.unitsPerPack}
                                helperText={errors.unitsPerPack ?? packHelp}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{unitLabel}</InputAdornment>,
                                }}
                                inputProps={{ min: 0.001, step: isPercentage ? 0.1 : 1 }}
                            />
                        </Grid>
                    )}

                    {/* ── Cost insight panel ───────────────────────────────── */}
                    {insight && (
                        <Grid size={12}>
                            <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "background.default", borderRadius: 2 }}>
                                <Box display="flex" gap={4} flexWrap="wrap" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {insight.primary.label}
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                            {currencySymbol}
                                            {insight.primary.value}
                                        </Typography>
                                    </Box>
                                    {insight.secondary && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {insight.secondary.label}
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {currencySymbol}
                                                {insight.secondary.value}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    )}

                    {/* ── Extra Details ────────────────────────────────────── */}
                    <Grid size={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.extraSection", "Extra Details")}
                            </Typography>
                        </Divider>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label={t("materials.form.supplier", "Supplier")} fullWidth value={form.supplier} onChange={set("supplier")} />
                    </Grid>
                    <Grid size={12}>
                        <TextField label={t("materials.form.description", "Description / Notes")} fullWidth multiline rows={2} value={form.description} onChange={set("description")} />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    {t("common.cancel", "Cancel")}
                </Button>
                {!initial && onSaveMore && (
                    <Button variant="outlined" onClick={handleSaveAndMore}>
                        {t("materials.form.addMore", "Add More")}
                    </Button>
                )}
                <Button variant="contained" onClick={handleSave}>
                    {initial ? t("materials.form.saveChanges", "Save Changes") : t("materials.form.addMaterial", "Add Material")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
