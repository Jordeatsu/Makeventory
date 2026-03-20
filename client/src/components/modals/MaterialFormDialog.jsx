/**
 * @file MaterialFormDialog.js
 * @description Modal dialog used to create or edit a single material record.
 *
 * Behaviour highlights
 * --------------------
 * - Switching the `type` field pre-fills sensible defaults (quantity, cost,
 *   unitsPerPack, lowStockThreshold) for each material category.
 * - Duplicate-name detection: if a material with the same name and type already
 *   exists the dialog offers an "Add to existing" shortcut that calls
 *   adjust-stock instead of creating a duplicate record.
 * - Bulk types (Thread, Box, Bag, Needle, Hoop) show the `unitsPerPack` field
 *   so the per-unit cost can be derived from pack price.
 * - Fabric types show a dimension helper (width × length → cm²) in create mode.
 * - Exposes `onSaveMore` prop so the parent can keep the dialog open after a
 *   successful save for rapid bulk entry.
 */
import React, { useState, useEffect } from "react";
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, InputAdornment, Typography, Divider, Paper, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

// Types that are purchased by the pack and broken into individual units
const BULK_TYPES = ["Thread", "Cardboard Box", "Postage Bag", "Needle", "Hoop"];
// Types whose stock quantity is tracked as a continuous area (cm²)
const FABRIC_TYPES = ["Patterned Fabric", "White Fabric", "Aida Fabric"];

// Default values pre-filled per type when creating a new material.
// These match common type names — if the type name doesn't match, numeric
// fields start blank.
const TYPE_DEFAULTS = {
    Thread:              { quantity: "8",      costPerUnit: "1.80", unitsPerPack: "8",      lowStockThreshold: "1"    },
    "Patterned Fabric":  { quantity: "200000", costPerUnit: "15.00", unitsPerPack: "200000", lowStockThreshold: "2000" },
    "White Fabric":      { quantity: "200000", costPerUnit: "10.00", unitsPerPack: "200000", lowStockThreshold: "2000" },
    "Aida Fabric":       { quantity: "200000", costPerUnit: "12.00", unitsPerPack: "200000", lowStockThreshold: "2000" },
};

const EMPTY = {
    name: "",
    type: "",
    color: "",
    quantity: "",
    costPerUnit: "",
    unitsPerPack: "",
    lowStockThreshold: "",
    sku: "",
    supplier: "",
    description: "",
};

/**
 * @component
 * @param {Object}        props
 * @param {boolean}       props.open               - Whether the dialog is visible
 * @param {Function}      props.onClose            - Called when the user dismisses the dialog
 * @param {Function}      props.onSave             - Called with the built payload; closes dialog after
 * @param {Function}      [props.onSaveMore]       - Called with the payload but keeps dialog open
 * @param {Function}      [props.onStockAdjusted]  - Called after adjust-stock succeeds
 * @param {Object|null}   [props.initial]          - Existing material document when editing; null when creating
 * @param {Array}         [props.materialTypes]    - Array of { _id, name } from /api/material-types
 * @returns {JSX.Element}
 */
export default function MaterialFormDialog({ open, onClose, onSave, onSaveMore, onStockAdjusted, initial, materialTypes = [] }) {
    const { t } = useTranslation();
    const { currency } = useGlobalSettings();
    const currencySymbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;

    const defaultType = materialTypes.length > 0 ? materialTypes[0].name : "";
    const defaults = TYPE_DEFAULTS[defaultType] || {};
    const EMPTY_WITH_TYPE = { ...EMPTY, type: defaultType, ...defaults };

    const [form, setForm] = useState(EMPTY_WITH_TYPE);
    const [errors, setErrors] = useState({});
    const [saveError, setSaveError] = useState("");
    const [existingMaterial, setExistingMaterial] = useState(null);
    const [fabricRollW, setFabricRollW] = useState("200");
    const [fabricRollL, setFabricRollL] = useState("1000");

    const isThread = form.type === "Thread";
    const isBulk   = BULK_TYPES.includes(form.type);
    const isFabric = FABRIC_TYPES.includes(form.type);

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    ...EMPTY_WITH_TYPE,
                    ...initial,
                    unitsPerPack:      initial.unitsPerPack      ?? "",
                    lowStockThreshold: initial.lowStockThreshold ?? "",
                });
            } else {
                setForm(EMPTY_WITH_TYPE);
            }
        }
        setErrors({});
        setSaveError("");
        setExistingMaterial(null);
        setFabricRollW("200");
        setFabricRollL("1000");
    }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync roll dimensions → quantity + unitsPerPack (create mode only)
    useEffect(() => {
        if (!FABRIC_TYPES.includes(form.type) || initial) return;
        const area = Math.round(Number(fabricRollW) * Number(fabricRollL));
        if (area > 0) setForm((f) => ({ ...f, quantity: String(area), unitsPerPack: String(area) }));
    }, [form.type, fabricRollW, fabricRollL, initial]);

    const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        const newIsBulk = BULK_TYPES.includes(newType);
        const defaults = TYPE_DEFAULTS[newType] || {};
        setForm((p) => ({
            ...p,
            type: newType,
            quantity:          defaults.quantity          ?? (newIsBulk ? p.quantity          : ""),
            costPerUnit:       defaults.costPerUnit       ?? (newIsBulk ? p.costPerUnit       : ""),
            unitsPerPack:      defaults.unitsPerPack      ?? (newIsBulk ? p.unitsPerPack      : ""),
            lowStockThreshold: defaults.lowStockThreshold ?? (newIsBulk ? p.lowStockThreshold : ""),
        }));
        setExistingMaterial(null);
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = t("materials.form.nameRequired", "Required");
        else if (existingMaterial) e.name = t("materials.form.duplicate", `A material called "${form.name.trim()}" already exists`, { name: form.name.trim() });
        if (form.quantity === "" || isNaN(Number(form.quantity))) e.quantity = t("materials.form.mustBeNumber", "Must be a number");
        if (form.costPerUnit === "" || isNaN(Number(form.costPerUnit))) e.costPerUnit = t("materials.form.mustBeNumber", "Must be a number");
        if (isBulk) {
            if (!form.unitsPerPack || isNaN(Number(form.unitsPerPack)) || Number(form.unitsPerPack) <= 0)
                e.unitsPerPack = isFabric
                    ? t("materials.form.unitsPerPackFabric", "Required — enter roll dimensions above")
                    : isThread
                    ? t("materials.form.unitsPerPackThread", "Required — metres per pack")
                    : t("materials.form.unitsPerPackBulk", "Required — items per pack");
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const buildPayload = () => ({
        ...form,
        unit:              isFabric ? "cm\u00b2" : isThread ? "metres" : "pieces",
        quantity:          Number(form.quantity),
        costPerUnit:       Number(form.costPerUnit),
        unitsPerPack:      isBulk ? Number(form.unitsPerPack) : 0,
        lowStockThreshold: Number(form.lowStockThreshold) || (isThread ? 5 : isFabric ? 2000 : 2),
    });

    const handleAddToExisting = async () => {
        if (!existingMaterial || form.quantity === "" || isNaN(Number(form.quantity))) return;
        setSaveError("");
        try {
            await api.post(`/materials/${existingMaterial._id}/adjust-stock`, { delta: Number(form.quantity) });
            setForm({ ...EMPTY_WITH_TYPE, type: form.type, ...(TYPE_DEFAULTS[form.type] || {}), name: "" });
            setErrors({});
            setExistingMaterial(null);
            (onStockAdjusted || onClose)();
        } catch (e) {
            setSaveError(e.response?.data?.error || t("materials.form.updateStockFailed", "Failed to update stock"));
        }
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaveError("");
        try {
            await onSave(buildPayload());
        } catch (e) {
            setSaveError(e.response?.data?.error || e.message || t("materials.form.saveFailed", "Save failed"));
        }
    };

    const handleSaveAndMore = async () => {
        if (!validate()) return;
        setSaveError("");
        try {
            await onSaveMore(buildPayload());
            setForm({ ...EMPTY_WITH_TYPE, type: form.type, ...(TYPE_DEFAULTS[form.type] || {}), name: "" });
            setErrors({});
        } catch (e) {
            setSaveError(e.response?.data?.error || e.message || t("materials.form.saveFailed", "Save failed"));
        }
    };

    const costPerUse =
        isBulk && form.costPerUnit !== "" && form.unitsPerPack !== "" && Number(form.unitsPerPack) > 0
            ? (Number(form.costPerUnit) / Number(form.unitsPerPack)).toFixed(4)
            : null;

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
                        {t("materials.form.duplicateAlert", "{{name}} already exists with {{qty}} in stock. Add {{add}} to it instead?", {
                            name:  existingMaterial.name,
                            qty:   existingMaterial.quantity,
                            add:   form.quantity || 0,
                        })}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ pt: 0.5 }}>
                    {/* ── Basic Info ── */}
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label={t("materials.form.name", "Name *")}
                            fullWidth
                            value={form.name}
                            onChange={(e) => {
                                const val = e.target.value;
                                setExistingMaterial(null);
                                setErrors((prev) => ({ ...prev, name: undefined }));
                                setForm((p) => ({
                                    ...p,
                                    name: val,
                                    ...(isThread && { sku: val }),
                                }));
                            }}
                            onBlur={async () => {
                                if (!form.name.trim() || !form.type) return;
                                try {
                                    const res = await api.get("/materials", {
                                        params: { type: form.type, search: form.name.trim() },
                                    });
                                    const match = (res.data.materials || []).find(
                                        (m) => m.name.toLowerCase() === form.name.trim().toLowerCase() && m._id !== initial?._id
                                    );
                                    setExistingMaterial(match || null);
                                    if (match) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            name: t("materials.form.duplicate", `A material called "${form.name.trim()}" already exists`, { name: form.name.trim() }),
                                        }));
                                    }
                                } catch {
                                    // silently ignore network errors during duplicate check
                                }
                            }}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField select label={t("materials.form.type", "Type *")} fullWidth value={form.type} onChange={handleTypeChange}>
                            {materialTypes.map((mt) => (
                                <MenuItem key={mt._id} value={mt.name}>
                                    {mt.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label={t("materials.form.colour", "Colour / Shade")} fullWidth value={form.color} onChange={set("color")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label={t("materials.form.sku", "SKU / Reference")} fullWidth value={form.sku} onChange={set("sku")} />
                    </Grid>

                    {/* ── Stock ── */}
                    <Grid item xs={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.stockSection", "Stock")}
                            </Typography>
                        </Divider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        {isFabric ? (
                            !initial ? (
                                <>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                        {t("materials.form.rollDimensionsHint", "Enter the dimensions of the roll you are adding")}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                        <TextField
                                            label={t("materials.form.width", "Width (cm)")}
                                            type="number"
                                            value={fabricRollW}
                                            onChange={(e) => setFabricRollW(e.target.value)}
                                            inputProps={{ min: 1, step: 1 }}
                                            helperText={t("materials.form.widthHint", "e.g. 200 for 2 m")}
                                        />
                                        <Typography sx={{ pt: 2, px: 0.5 }}>×</Typography>
                                        <TextField
                                            label={t("materials.form.length", "Length (cm)")}
                                            type="number"
                                            value={fabricRollL}
                                            onChange={(e) => setFabricRollL(e.target.value)}
                                            inputProps={{ min: 1, step: 1 }}
                                            helperText={t("materials.form.lengthHint", "e.g. 1000 for 10 m")}
                                        />
                                    </Box>
                                    {Number(fabricRollW) > 0 && Number(fabricRollL) > 0 && (
                                        <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: "block" }}>
                                            {t("materials.form.rollArea", "Roll area")}: {(Number(fabricRollW) * Number(fabricRollL)).toLocaleString()} cm² — {t("materials.form.stockSetTo", "stock will be set to this value")}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <TextField
                                    label={t("materials.form.currentArea", "Current Area in Stock (cm²) *")}
                                    type="number"
                                    fullWidth
                                    value={form.quantity}
                                    onChange={set("quantity")}
                                    error={!!errors.quantity}
                                    helperText={errors.quantity || t("materials.form.remainingArea", "Remaining fabric area in stock")}
                                    InputProps={{ endAdornment: <InputAdornment position="end">cm²</InputAdornment> }}
                                    inputProps={{ min: 0, step: 1 }}
                                />
                            )
                        ) : (
                            <TextField
                                label={isThread ? t("materials.form.lengthInStock", "Total Length in Stock (metres) *") : t("materials.form.quantityInStock", "Quantity in Stock *")}
                                type="number"
                                fullWidth
                                value={form.quantity}
                                onChange={set("quantity")}
                                error={!!errors.quantity}
                                helperText={errors.quantity || (isThread ? t("materials.form.totalMetres", "Total metres across all packs you own") : t("materials.form.numItems", "Number of individual items"))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{isThread ? "m" : t("materials.form.items", "items")}</InputAdornment>,
                                }}
                                inputProps={{ min: 0, step: isThread ? 0.1 : 1 }}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label={isFabric ? t("materials.form.lowStockCm2", "Low-stock Alert (cm²)") : isThread ? t("materials.form.lowStockMetres", "Low-stock Alert (metres)") : t("materials.form.lowStockItems", "Low-stock Alert (items)")}
                            type="number"
                            fullWidth
                            value={form.lowStockThreshold}
                            onChange={set("lowStockThreshold")}
                            inputProps={{ min: 0 }}
                            helperText={t("materials.form.lowStockHint", "Alert when quantity falls below this")}
                        />
                    </Grid>

                    {/* ── Pricing ── */}
                    <Grid item xs={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.pricingSection", "Pricing")}
                            </Typography>
                        </Divider>
                    </Grid>

                    {isFabric ? (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t("materials.form.costPerRoll", "Cost per Roll *")}
                                    type="number"
                                    fullWidth
                                    value={form.costPerUnit}
                                    onChange={set("costPerUnit")}
                                    error={!!errors.costPerUnit}
                                    helperText={errors.costPerUnit || t("materials.form.costPerRollHint", "What you paid for the full roll")}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>
                            {initial && Number(form.unitsPerPack) > 0 && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label={t("materials.form.rollArea", "Roll Area (cm²)")}
                                        fullWidth
                                        value={Number(form.unitsPerPack).toLocaleString()}
                                        disabled
                                        helperText={t("materials.form.rollAreaHint", "Area of one full roll — set when this material was created")}
                                        InputProps={{ endAdornment: <InputAdornment position="end">cm²</InputAdornment> }}
                                    />
                                </Grid>
                            )}
                            {costPerUse !== null && (
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "background.default" }}>
                                        <Box display="flex" gap={4} flexWrap="wrap">
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">{t("materials.form.costPerCm2", "Cost per cm²")}</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">{currencySymbol}{costPerUse}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">{t("materials.form.costPiece", "20 × 15 cm piece costs")}</Typography>
                                                <Typography variant="subtitle1" fontWeight={700}>{currencySymbol}{(Number(costPerUse) * 300).toFixed(4)}</Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </>
                    ) : isBulk ? (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t("materials.form.costPerPack", "Cost per Pack *")}
                                    type="number"
                                    fullWidth
                                    value={form.costPerUnit}
                                    onChange={set("costPerUnit")}
                                    error={!!errors.costPerUnit}
                                    helperText={errors.costPerUnit || t("materials.form.costPerPackHint", "What you paid for one full pack")}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={isThread ? t("materials.form.metresPerPack", "Metres per Pack *") : t("materials.form.itemsPerPack", "Items per Pack *")}
                                    type="number"
                                    fullWidth
                                    value={form.unitsPerPack}
                                    onChange={set("unitsPerPack")}
                                    error={!!errors.unitsPerPack}
                                    helperText={errors.unitsPerPack || (isThread ? t("materials.form.metresPerPackHint", "Length of thread in one pack (e.g. 8)") : t("materials.form.itemsPerPackHint", "How many items in one pack (e.g. 100)"))}
                                    InputProps={{ endAdornment: <InputAdornment position="end">{isThread ? "m" : t("materials.form.items", "items")}</InputAdornment> }}
                                    inputProps={{ min: 0.01, step: isThread ? 0.5 : 1 }}
                                />
                            </Grid>
                            {costPerUse !== null && (
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "background.default" }}>
                                        <Box display="flex" gap={4}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isThread ? t("materials.form.costPerMetre", "Cost per metre") : t("materials.form.costPerItem", "Cost per item")}
                                                </Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                                    {currencySymbol}{costPerUse}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isThread ? t("materials.form.using1m", "Using 1 m costs") : t("materials.form.using1item", "Using 1 item costs")}
                                                </Typography>
                                                <Typography variant="subtitle1" fontWeight={700}>
                                                    {currencySymbol}{Number(costPerUse).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={t("materials.form.costPerItem", "Cost per Item *")}
                                type="number"
                                fullWidth
                                value={form.costPerUnit}
                                onChange={set("costPerUnit")}
                                error={!!errors.costPerUnit}
                                helperText={errors.costPerUnit || t("materials.form.costPerItemHint", "What you paid per individual item")}
                                InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                    )}

                    {/* ── Extra Details ── */}
                    <Grid item xs={12}>
                        <Divider>
                            <Typography variant="caption" color="text.secondary">
                                {t("materials.form.extraSection", "Extra Details")}
                            </Typography>
                        </Divider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label={t("materials.form.supplier", "Supplier")} fullWidth value={form.supplier} onChange={set("supplier")} />
                    </Grid>
                    <Grid item xs={12}>
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
