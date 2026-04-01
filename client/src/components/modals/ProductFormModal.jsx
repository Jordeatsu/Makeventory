import React, { useState, useEffect } from "react";
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, InputAdornment, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const EMPTY_FORM = {
    name: "",
    sku: "",
    category: "",
    description: "",
    basePrice: "",
    active: true,
};

export default function ProductFormModal({ open, onClose, onSave, initial }) {
    const { settings } = useGlobalSettings();
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    // 0 = Standard, 1 = Parent (Template), 2 = Variant
    const [tab, setTab] = useState(0);
    const [form, setForm] = useState(EMPTY_FORM);
    const [parentId, setParentId] = useState("");

    const [allParents, setAllParents] = useState([]);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initial) {
            setTab(initial.isTemplate ? 1 : initial.parentProduct ? 2 : 0);
            setForm({
                name: initial.name ?? "",
                sku: initial.sku ?? "",
                category: initial.category ?? "",
                description: initial.description ?? "",
                basePrice: initial.basePrice ?? "",
                active: initial.active !== false,
            });
            setParentId(initial.parentProduct?._id ?? initial.parentProduct ?? "");
        } else {
            setTab(0);
            setForm(EMPTY_FORM);
            setParentId("");
        }
        setError("");
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        api.get("/products")
            .then((r) => {
                setAllParents((r.data.products ?? []).filter((p) => !p.parentProduct && p._id !== initial?._id));
            })
            .catch(() => {});
    }, [open]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleTabChange = (_, v) => {
        setTab(v);
        if (v !== 2) setParentId("");
    };

    const parentObj = allParents.find((p) => p._id === parentId) ?? null;

    const handleSave = async () => {
        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }
        if (tab === 2 && !parentId) {
            setError("Please select a parent product for this variant.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await onSave({
                name: form.name.trim(),
                sku: form.sku.trim() || null,
                category: form.category.trim() || null,
                description: form.description.trim() || null,
                basePrice: parseFloat(form.basePrice) || 0,
                active: form.active,
                isTemplate: tab === 1,
                parentProduct: tab === 2 ? parentId || null : null,
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
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

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
                        {tab === 0 && "A standalone product."}
                        {tab === 1 && "A template that variants inherit their base settings from."}
                        {tab === 2 && "A product that inherits settings from a parent. Manage materials separately using the Materials button on the product page."}
                    </Typography>
                </Box>

                {/* Variant: parent selector */}
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
                    </Box>
                )}

                {/* Common product fields */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField label="Product Name *" fullWidth size="small" value={form.name} onChange={set("name")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="SKU" fullWidth size="small" value={form.sku} onChange={set("sku")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Category" fullWidth size="small" value={form.category} onChange={set("category")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Base Price" fullWidth size="small" type="number" value={form.basePrice} onChange={set("basePrice")} InputProps={{ startAdornment: <InputAdornment position="start">{sym}</InputAdornment> }} />
                    </Grid>
                    <Grid size={12}>
                        <TextField label="Description" fullWidth size="small" multiline rows={2} value={form.description} onChange={set("description")} />
                    </Grid>
                    <Grid size={12}>
                        <FormControlLabel control={<Switch size="small" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />} label={<Typography variant="body2">Active</Typography>} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
