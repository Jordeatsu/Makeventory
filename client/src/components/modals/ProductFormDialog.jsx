import React, { useState, useEffect } from "react";
import {
    Alert, Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, FormControlLabel, Grid, IconButton,
    InputAdornment, MenuItem, Paper, Switch, Tab, Table, TableBody, TableCell,
    TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const UNITS = ["pieces", "m", "cm", "mm", "m²", "cm²", "mm²", "in", "in²"];
const BULK_TYPES = ["Bulk Pack", "Multipack"];

const EMPTY_FORM = {
    name: "", sku: "", category: "", description: "", basePrice: "", active: true,
};


export default function ProductFormDialog({ open, onClose, onSave, initial }) {
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    // 0 = Standard, 1 = Parent (Template), 2 = Variant
    const [tab, setTab]             = useState(0);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [materials, setMaterials] = useState([]);
    const [parentId, setParentId]   = useState("");

    const [allMaterials, setAllMaterials] = useState([]);
    const [allParents, setAllParents]     = useState([]);

    const [error, setError]   = useState("");
    const [saving, setSaving] = useState(false);
    const [newLine, setNewLine]     = useState({ material: null, quantityUsed: "" });
    const [lineError, setLineError] = useState("");

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTab(initial.isTemplate ? 1 : initial.parentProduct ? 2 : 0);
            setForm({
                name:        initial.name ?? "",
                sku:         initial.sku ?? "",
                category:    initial.category ?? "",
                description: initial.description ?? "",
                basePrice:   initial.basePrice ?? "",
                active:      initial.active !== false,
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
            setParentId(initial.parentProduct?._id ?? initial.parentProduct ?? "");
        } else {
            setTab(0);
            setForm(EMPTY_FORM);
            setMaterials([]);
            setParentId("");
        }
        setNewLine({ material: null, quantityUsed: "" });
        setLineError("");
        setError("");
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        api.get("/materials").then((r) => setAllMaterials(r.data.materials ?? [])).catch(() => {});
        api.get("/products").then((r) => {
            setAllParents(
                (r.data.products ?? []).filter((p) => !p.parentProduct && p._id !== initial?._id),
            );
        }).catch(() => {});
    }, [open]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const addMaterialLine = () => {
        setLineError("");
        if (!newLine.material) { setLineError("Select a material"); return; }
        const qty = parseFloat(newLine.quantityUsed);
        if (!qty || qty <= 0) { setLineError("Enter a valid quantity"); return; }
        const mat = newLine.material;
        const effectiveCost = BULK_TYPES.includes(mat.type) && mat.unitsPerPack > 0
            ? mat.costPerUnit / mat.unitsPerPack
            : mat.costPerUnit;
        setMaterials((ms) => [...ms, {
            materialName: mat.name,
            materialType: mat.type ?? "",
            quantityUsed: String(qty),
            unit:         mat.unit ?? "pieces",
            costPerUnit:  String(effectiveCost),
            packCost:     BULK_TYPES.includes(mat.type) ? String(mat.costPerUnit) : "",
            lineCost:     String((qty * effectiveCost).toFixed(4)),
        }]);
        setNewLine({ material: null, quantityUsed: "" });
    };

    const updateMaterialQty = (i, rawVal) =>
        setMaterials((ms) => ms.map((m, idx) => {
            if (idx !== i) return m;
            const qty = Math.max(0, parseFloat(rawVal) || 0);
            const cpu = parseFloat(m.costPerUnit) || 0;
            return { ...m, quantityUsed: rawVal, lineCost: String((qty * cpu).toFixed(4)) };
        }));

    const handleTabChange = (_, v) => {
        setTab(v);
        if (v !== 2) setParentId("");
    };

    const totalMatCost = materials.reduce((s, m) => s + (parseFloat(m.lineCost) || 0), 0);
    const bp = parseFloat(form.basePrice) || 0;
    const estMargin = bp > 0 ? (((bp - totalMatCost) / bp) * 100).toFixed(1) : null;
    const parentObj = allParents.find((p) => p._id === parentId) ?? null;

    const handleSave = async () => {
        if (!form.name.trim()) { setError("Product name is required."); return; }
        if (tab === 2 && !parentId) { setError("Please select a parent product for this variant."); return; }
        setSaving(true);
        setError("");
        try {
            await onSave({
                name:             form.name.trim(),
                sku:              form.sku.trim() || null,
                category:         form.category.trim() || null,
                description:      form.description.trim() || null,
                basePrice:        parseFloat(form.basePrice) || 0,
                active:           form.active,
                isTemplate:       tab === 1,
                parentProduct:    tab === 2 ? parentId || null : null,
                defaultMaterials: materials.map((m) => ({
                    materialName: m.materialName,
                    materialType: m.materialType,
                    quantityUsed: parseFloat(m.quantityUsed) || 0,
                    unit:         m.unit,
                    costPerUnit:  parseFloat(m.costPerUnit) || 0,
                    packCost:     m.packCost !== "" ? parseFloat(m.packCost) : null,
                    lineCost:     parseFloat(m.lineCost) || 0,
                })),
            });
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial?._id ? "Edit Product" : "New Product"}</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Product type tabs */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}>
                    <Tabs value={tab} onChange={handleTabChange}>
                        <Tab label="Standard" />
                        <Tab label="Parent (Template)" />
                        <Tab label="Variant" />
                    </Tabs>
                </Box>

                <Box sx={{ mb: 2, p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {tab === 0 && "A standalone product with its own materials recipe."}
                        {tab === 1 && "A template that other products can inherit their recipe from."}
                        {tab === 2 && "A product that inherits a parent's recipe and can add extra materials."}
                    </Typography>
                </Box>

                {/* Variant: parent selector + inherited recipe preview */}
                {tab === 2 && (
                    <Box sx={{ mb: 2.5 }}>
                        <Autocomplete
                            size="small"
                            options={allParents}
                            getOptionLabel={(opt) => opt.name ?? ""}
                            isOptionEqualToValue={(opt, val) => opt._id === val._id}
                            value={parentObj}
                            onChange={(_, val) => setParentId(val?._id ?? "")}
                            renderInput={(params) => <TextField {...params} label="Parent Product *" fullWidth />}
                        />
                        {parentObj && (parentObj.defaultMaterials || []).length > 0 && (
                            <Box sx={{ mt: 1.5, p: 1.5, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                    Inherited recipe from <strong>{parentObj.name}</strong>:
                                </Typography>
                                {parentObj.defaultMaterials.map((m, i) => (
                                    <Typography key={i} variant="caption" color="text.secondary" display="block">
                                        · {m.materialName} — {m.quantityUsed} {m.unit}
                                    </Typography>
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                {/* Common product fields */}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField label="Product Name *" fullWidth size="small" value={form.name} onChange={set("name")} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="SKU" fullWidth size="small" value={form.sku} onChange={set("sku")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Category" fullWidth size="small" value={form.category} onChange={set("category")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Base Price" fullWidth size="small" type="number"
                            value={form.basePrice} onChange={set("basePrice")}
                            InputProps={{ startAdornment: <InputAdornment position="start">{sym}</InputAdornment> }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description" fullWidth size="small" multiline rows={2}
                            value={form.description} onChange={set("description")}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    size="small"
                                    checked={form.active}
                                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                                />
                            }
                            label={<Typography variant="body2">Active</Typography>}
                        />
                    </Grid>
                </Grid>

                {/* Materials recipe */}
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    {tab === 2 ? "Extra Materials" : "Materials Recipe"}
                </Typography>

                {/* Add material row */}
                <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            size="small"
                            options={allMaterials}
                            getOptionLabel={(opt) => `${opt.name}${opt.color ? ` — ${opt.color}` : ""} (${opt.type})`}
                            isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                            value={newLine.material}
                            onChange={(_, val) => setNewLine((nl) => ({ ...nl, material: val }))}
                            renderInput={(params) => <TextField {...params} label="Material" size="small" />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            size="small" fullWidth type="number"
                            label={`Qty (${newLine.material?.unit || "units"})`}
                            value={newLine.quantityUsed}
                            onChange={(e) => setNewLine((nl) => ({ ...nl, quantityUsed: e.target.value }))}
                            inputProps={{ min: 0, step: "any" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "center" }}>
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={addMaterialLine} fullWidth>
                            Add
                        </Button>
                    </Grid>
                    {lineError && (
                        <Grid item xs={12}>
                            <Alert severity="warning" sx={{ py: 0 }}>{lineError}</Alert>
                        </Grid>
                    )}
                </Grid>

                {materials.length > 0 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                            <TableCell>Material</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Cost/Unit</TableCell>
                                            <TableCell align="right">Line Cost</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {[...materials]
                                            .map((m, i) => ({ ...m, _origIdx: i }))
                                            .sort((a, b) => {
                                                const t = (a.materialType || "").localeCompare(b.materialType || "");
                                                return t !== 0 ? t : (b.lineCost || 0) - (a.lineCost || 0);
                                            })
                                            .map((line) => (
                                                <TableRow key={line._origIdx}>
                                                    <TableCell>{line.materialName}</TableCell>
                                                    <TableCell>
                                                        <Chip label={line.materialType || ""} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ width: 110 }}>
                                                        <TextField
                                                            size="small" type="number"
                                                            value={line.quantityUsed}
                                                            onChange={(e) => updateMaterialQty(line._origIdx, e.target.value)}
                                                            inputProps={{ min: 0, step: "any", style: { textAlign: "right" } }}
                                                            sx={{ width: 100 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{sym}{parseFloat(line.costPerUnit || 0).toFixed(2)}</TableCell>
                                                    <TableCell align="right">{sym}{parseFloat(line.lineCost || 0).toFixed(2)}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Remove material">
                                                            <IconButton size="small" color="error"
                                                                onClick={() => setMaterials((ms) => ms.filter((_, idx) => idx !== line._origIdx))}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" color="text.secondary">Est. Material Cost</Typography>
                                        <Typography fontWeight={700}>{sym}{totalMatCost.toFixed(2)}</Typography>
                                    </Grid>
                                    {tab !== 1 && (
                                        <>
                                            <Grid item xs={4}>
                                                <Typography variant="caption" color="text.secondary">Base Price</Typography>
                                                <Typography fontWeight={700}>{sym}{bp.toFixed(2)}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="caption" color="text.secondary">Est. Material Margin</Typography>
                                                <Typography fontWeight={700} color={estMargin >= 0 ? "success.main" : "error.main"}>
                                                    {estMargin !== null ? `${estMargin}%` : "—"}
                                                </Typography>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
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
