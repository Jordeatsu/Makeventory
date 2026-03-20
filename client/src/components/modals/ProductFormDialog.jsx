import React, { useState, useEffect } from "react";
import {
    Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControlLabel, Grid, IconButton, InputAdornment,
    MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const UNITS = ["pieces", "m", "cm", "mm", "m²", "cm²", "mm²", "in", "in²"];

const EMPTY_FORM = {
    name: "", sku: "", category: "", description: "",
    basePrice: "", active: true, isTemplate: false, parentProduct: "",
};

const EMPTY_MATERIAL = {
    materialName: "", materialType: "", quantityUsed: "1", unit: "pieces",
    costPerUnit: "", packCost: "", lineCost: "",
};

export default function ProductFormDialog({ open, onClose, onSave, initial }) {
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [form, setForm]         = useState(EMPTY_FORM);
    const [materials, setMaterials] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError]       = useState("");
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    name:          initial.name ?? "",
                    sku:           initial.sku ?? "",
                    category:      initial.category ?? "",
                    description:   initial.description ?? "",
                    basePrice:     initial.basePrice ?? "",
                    active:        initial.active !== false,
                    isTemplate:    !!initial.isTemplate,
                    parentProduct: initial.parentProduct?._id ?? initial.parentProduct ?? "",
                });
                setMaterials(
                    (initial.defaultMaterials || []).map((m) => ({
                        materialName: m.materialName ?? "",
                        materialType: m.materialType ?? "",
                        quantityUsed: String(m.quantityUsed ?? 1),
                        unit:         m.unit ?? "pieces",
                        costPerUnit:  String(m.costPerUnit ?? ""),
                        packCost:     m.packCost != null ? String(m.packCost) : "",
                        lineCost:     String(m.lineCost ?? ""),
                    })),
                );
            } else {
                setForm(EMPTY_FORM);
                setMaterials([]);
            }
            setError("");
        }
    }, [open, initial]);

    useEffect(() => {
        if (open) {
            api.get("/products").then((r) => setProducts(r.data.products ?? [])).catch(() => {});
        }
    }, [open]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const setMat = (i, field) => (e) => {
        setMaterials((ms) => {
            const next = ms.map((m, idx) => idx === i ? { ...m, [field]: e.target.value } : m);
            // Auto-calc lineCost when quantity or costPerUnit changes
            const m = next[i];
            const qty  = parseFloat(m.quantityUsed) || 0;
            const cpu  = parseFloat(m.costPerUnit) || 0;
            const pack = parseFloat(m.packCost);
            const effectiveCpu = m.packCost !== "" && !isNaN(pack) && pack > 0 ? pack : cpu;
            next[i].lineCost = String((qty * effectiveCpu).toFixed(4));
            return next;
        });
    };

    const addMaterial = () => setMaterials((ms) => [...ms, { ...EMPTY_MATERIAL }]);
    const removeMaterial = (i) => setMaterials((ms) => ms.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        if (!form.name.trim()) { setError("Product name is required."); return; }
        setSaving(true);
        setError("");
        try {
            const mats = materials.map((m) => ({
                materialName: m.materialName,
                materialType: m.materialType,
                quantityUsed: parseFloat(m.quantityUsed) || 0,
                unit: m.unit,
                costPerUnit: parseFloat(m.costPerUnit) || 0,
                packCost: m.packCost !== "" ? parseFloat(m.packCost) : null,
                lineCost: parseFloat(m.lineCost) || 0,
            }));
            await onSave({
                name:             form.name.trim(),
                sku:              form.sku.trim() || null,
                category:         form.category.trim() || null,
                description:      form.description.trim() || null,
                basePrice:        parseFloat(form.basePrice) || 0,
                active:           form.active,
                isTemplate:       form.isTemplate,
                parentProduct:    form.parentProduct || null,
                defaultMaterials: mats,
            });
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const parentOptions = products.filter((p) => p._id !== initial?._id && !p.parentProduct);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial?._id ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={2}>
                    {/* Name */}
                    <Grid item xs={12} sm={8}>
                        <TextField
                            label="Product Name *"
                            fullWidth size="small"
                            value={form.name}
                            onChange={set("name")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="SKU"
                            fullWidth size="small"
                            value={form.sku}
                            onChange={set("sku")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Category"
                            fullWidth size="small"
                            value={form.category}
                            onChange={set("category")}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Base Price"
                            fullWidth size="small" type="number"
                            value={form.basePrice}
                            onChange={set("basePrice")}
                            InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            fullWidth size="small" multiline rows={2}
                            value={form.description}
                            onChange={set("description")}
                        />
                    </Grid>

                    {/* Options */}
                    <Grid item xs={12} sm={6}>
                        <FormControlLabel
                            control={<Checkbox checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />}
                            label="Active"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={form.isTemplate} onChange={(e) => setForm((f) => ({ ...f, isTemplate: e.target.checked }))} />}
                            label="Is Template"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select label="Parent Product (Variant of)"
                            fullWidth size="small"
                            value={form.parentProduct}
                            onChange={set("parentProduct")}
                        >
                            <MenuItem value="">— None —</MenuItem>
                            {parentOptions.map((p) => (
                                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                {/* Materials recipe */}
                <Divider sx={{ my: 2.5 }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>Materials Recipe</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addMaterial}>Add Material</Button>
                </Stack>

                {materials.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        No materials added. Click "Add Material" to build the recipe.
                    </Typography>
                )}

                {materials.map((m, i) => (
                    <Box key={i} sx={{ mb: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Material Name" fullWidth size="small"
                                    value={m.materialName} onChange={setMat(i, "materialName")}
                                />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField
                                    label="Qty" fullWidth size="small" type="number"
                                    value={m.quantityUsed} onChange={setMat(i, "quantityUsed")}
                                    inputProps={{ min: 0, step: "any" }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField select label="Unit" fullWidth size="small" value={m.unit} onChange={setMat(i, "unit")}>
                                    {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField
                                    label="Cost/Unit" fullWidth size="small" type="number"
                                    value={m.costPerUnit} onChange={setMat(i, "costPerUnit")}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                    inputProps={{ min: 0, step: "any" }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={1.5}>
                                <TextField
                                    label="Line Cost" fullWidth size="small"
                                    value={m.lineCost} disabled
                                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                />
                            </Grid>
                            <Grid item xs="auto">
                                <IconButton size="small" color="error" onClick={() => removeMaterial(i)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
