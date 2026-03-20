import React, { useState, useEffect } from "react";
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Grid, IconButton, InputAdornment, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const ALL_STATUSES = ["Pending", "In Progress", "Completed", "Shipped", "Cancelled"];
const UNITS = ["pieces", "m", "cm", "mm", "m²", "cm²", "mm²", "in", "in²"];

const EMPTY_CUSTOMER = {
    name: "", email: "", phone: "",
    addressLine1: "", addressLine2: "",
    city: "", state: "", postcode: "", country: "",
};

const EMPTY_PRODUCT_LINE = { productId: "", productName: "", sku: "", category: "", basePrice: "", quantity: "1" };
const EMPTY_MATERIAL_LINE = { materialName: "", materialType: "", quantityUsed: "1", unit: "pieces", costPerUnit: "", packCost: "", lineCost: "" };

const EMPTY_FORM = {
    orderNumber: "", origin: "", originOrderId: "",
    orderDate: "", status: "Pending",
    productDescription: "", notes: "", trackingNumber: "",
    totalCharged: "", shippingCost: "", buyerTax: "",
    discount: "", discountType: "fixed",
    hostingCost: "", marketingCost: "", refund: "",
};

function toDateInput(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toISOString().slice(0, 10);
}

export default function OrderFormDialog({ open, onClose, onSave, initial }) {
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";

    const [form, setForm]         = useState(EMPTY_FORM);
    const [customer, setCustomer] = useState({ ...EMPTY_CUSTOMER });
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [error, setError]       = useState("");
    const [saving, setSaving]     = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    orderNumber:        initial.orderNumber ?? "",
                    origin:             initial.origin ?? "",
                    originOrderId:      initial.originOrderId ?? "",
                    orderDate:          toDateInput(initial.orderDate),
                    status:             initial.status ?? "Pending",
                    productDescription: initial.productDescription ?? "",
                    notes:              initial.notes ?? "",
                    trackingNumber:     initial.trackingNumber ?? "",
                    totalCharged:       initial.totalCharged ?? "",
                    shippingCost:       initial.shippingCost ?? "",
                    buyerTax:           initial.buyerTax ?? "",
                    discount:           initial.discount ?? "",
                    discountType:       initial.discountType ?? "fixed",
                    hostingCost:        initial.hostingCost ?? "",
                    marketingCost:      initial.marketingCost ?? "",
                    refund:             initial.refund ?? "",
                });
                setCustomer({
                    name:         initial.customer?.name ?? "",
                    email:        initial.customer?.email ?? "",
                    phone:        initial.customer?.phone ?? "",
                    addressLine1: initial.customer?.addressLine1 ?? "",
                    addressLine2: initial.customer?.addressLine2 ?? "",
                    city:         initial.customer?.city ?? "",
                    state:        initial.customer?.state ?? "",
                    postcode:     initial.customer?.postcode ?? "",
                    country:      initial.customer?.country ?? "",
                });
                setProducts(
                    (initial.products || []).map((p) => ({
                        productId:   p.productId ?? "",
                        productName: p.productName ?? "",
                        sku:         p.sku ?? "",
                        category:    p.category ?? "",
                        basePrice:   String(p.basePrice ?? ""),
                        quantity:    String(p.quantity ?? 1),
                    })),
                );
                setMaterials(
                    (initial.materials || []).map((m) => ({
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
                setCustomer({ ...EMPTY_CUSTOMER });
                setProducts([]);
                setMaterials([]);
            }
            setError("");
        }
    }, [open, initial]);

    useEffect(() => {
        if (open) {
            api.get("/products").then((r) => setProductOptions(r.data.products ?? [])).catch(() => {});
        }
    }, [open]);

    const setF = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    const setC = (field) => (e) => setCustomer((c) => ({ ...c, [field]: e.target.value }));

    // Product line handlers
    const setProductLine = (i, field) => (e) => {
        setProducts((ps) => {
            const next = ps.map((p, idx) => idx === i ? { ...p, [field]: e.target.value } : p);
            if (field === "productId") {
                const selected = productOptions.find((p) => p._id === e.target.value);
                if (selected) {
                    next[i].productName = selected.name;
                    next[i].sku         = selected.sku ?? "";
                    next[i].category    = selected.category ?? "";
                    next[i].basePrice   = String(selected.basePrice ?? "");
                }
            }
            return next;
        });
    };
    const addProduct = () => setProducts((ps) => [...ps, { ...EMPTY_PRODUCT_LINE }]);
    const removeProduct = (i) => setProducts((ps) => ps.filter((_, idx) => idx !== i));

    // Material line handlers
    const setMaterialLine = (i, field) => (e) => {
        setMaterials((ms) => {
            const next = ms.map((m, idx) => idx === i ? { ...m, [field]: e.target.value } : m);
            const m = next[i];
            const qty  = parseFloat(m.quantityUsed) || 0;
            const cpu  = parseFloat(m.costPerUnit) || 0;
            const pack = parseFloat(m.packCost);
            const effectiveCpu = m.packCost !== "" && !isNaN(pack) && pack > 0 ? pack : cpu;
            next[i].lineCost = String((qty * effectiveCpu).toFixed(4));
            return next;
        });
    };
    const addMaterial = () => setMaterials((ms) => [...ms, { ...EMPTY_MATERIAL_LINE }]);
    const removeMaterial = (i) => setMaterials((ms) => ms.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const productLines = products.map((p) => ({
                productId:   p.productId || null,
                productName: p.productName,
                sku:         p.sku,
                category:    p.category,
                basePrice:   parseFloat(p.basePrice) || 0,
                quantity:    parseInt(p.quantity, 10) || 1,
            }));
            const materialLines = materials.map((m) => ({
                materialName: m.materialName,
                materialType: m.materialType,
                quantityUsed: parseFloat(m.quantityUsed) || 0,
                unit:         m.unit,
                costPerUnit:  parseFloat(m.costPerUnit) || 0,
                packCost:     m.packCost !== "" ? parseFloat(m.packCost) : null,
                lineCost:     parseFloat(m.lineCost) || 0,
            }));
            await onSave({
                orderNumber:        form.orderNumber.trim(),
                origin:             form.origin.trim(),
                originOrderId:      form.originOrderId.trim(),
                orderDate:          form.orderDate || null,
                status:             form.status,
                customer,
                products:           productLines,
                materials:          materialLines,
                productDescription: form.productDescription.trim(),
                notes:              form.notes.trim(),
                trackingNumber:     form.trackingNumber.trim(),
                totalCharged:       parseFloat(form.totalCharged) || 0,
                shippingCost:       parseFloat(form.shippingCost) || 0,
                buyerTax:           parseFloat(form.buyerTax) || 0,
                discount:           parseFloat(form.discount) || 0,
                discountType:       form.discountType,
                hostingCost:        parseFloat(form.hostingCost) || 0,
                marketingCost:      parseFloat(form.marketingCost) || 0,
                refund:             parseFloat(form.refund) || 0,
            });
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial?._id ? "Edit Order" : "New Order"}</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* ── Order info ── */}
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Order Info</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Order Number" fullWidth size="small" value={form.orderNumber} onChange={setF("orderNumber")} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Origin (e.g. Etsy)" fullWidth size="small" value={form.origin} onChange={setF("origin")} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Origin Order ID" fullWidth size="small" value={form.originOrderId} onChange={setF("originOrderId")} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Order Date" fullWidth size="small" type="date"
                            value={form.orderDate} onChange={setF("orderDate")}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField select label="Status" fullWidth size="small" value={form.status} onChange={setF("status")}>
                            {ALL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>

                {/* ── Customer ── */}
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Customer</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Customer Name" fullWidth size="small" value={customer.name} onChange={setC("name")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Email" fullWidth size="small" value={customer.email} onChange={setC("email")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Phone" fullWidth size="small" value={customer.phone} onChange={setC("phone")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Address Line 1" fullWidth size="small" value={customer.addressLine1} onChange={setC("addressLine1")} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Address Line 2" fullWidth size="small" value={customer.addressLine2} onChange={setC("addressLine2")} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField label="City" fullWidth size="small" value={customer.city} onChange={setC("city")} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField label="State / County" fullWidth size="small" value={customer.state} onChange={setC("state")} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField label="Postcode" fullWidth size="small" value={customer.postcode} onChange={setC("postcode")} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField label="Country" fullWidth size="small" value={customer.country} onChange={setC("country")} />
                    </Grid>
                </Grid>

                {/* ── Products ordered ── */}
                <Divider sx={{ my: 2.5 }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>Products Ordered</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addProduct}>Add Product</Button>
                </Stack>
                {products.map((p, i) => (
                    <Box key={i} sx={{ mb: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select label="Product" fullWidth size="small"
                                    value={p.productId} onChange={setProductLine(i, "productId")}
                                >
                                    <MenuItem value="">— Custom —</MenuItem>
                                    {productOptions.map((opt) => (
                                        <MenuItem key={opt._id} value={opt._id}>{opt.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Product Name" fullWidth size="small"
                                    value={p.productName} onChange={setProductLine(i, "productName")}
                                />
                            </Grid>
                            <Grid item xs={4} sm={1.5}>
                                <TextField
                                    label="Qty" fullWidth size="small" type="number"
                                    value={p.quantity} onChange={setProductLine(i, "quantity")}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField
                                    label="Base Price" fullWidth size="small" type="number"
                                    value={p.basePrice} onChange={setProductLine(i, "basePrice")}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                    inputProps={{ min: 0, step: "any" }}
                                />
                            </Grid>
                            <Grid item xs="auto">
                                <IconButton size="small" color="error" onClick={() => removeProduct(i)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                ))}

                {/* ── Materials used ── */}
                <Divider sx={{ my: 2.5 }} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={700}>Materials Used</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addMaterial}>Add Material</Button>
                </Stack>
                {materials.map((m, i) => (
                    <Box key={i} sx={{ mb: 1.5, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                        <Grid container spacing={1.5} alignItems="center">
                            <Grid item xs={12} sm={4}>
                                <TextField label="Material Name" fullWidth size="small" value={m.materialName} onChange={setMaterialLine(i, "materialName")} />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField label="Qty" fullWidth size="small" type="number" value={m.quantityUsed} onChange={setMaterialLine(i, "quantityUsed")} inputProps={{ min: 0, step: "any" }} />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField select label="Unit" fullWidth size="small" value={m.unit} onChange={setMaterialLine(i, "unit")}>
                                    {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                                <TextField
                                    label="Cost/Unit" fullWidth size="small" type="number"
                                    value={m.costPerUnit} onChange={setMaterialLine(i, "costPerUnit")}
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

                {/* ── Financials ── */}
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Financials</Typography>
                <Grid container spacing={2}>
                    {[
                        { field: "totalCharged", label: "Item Price Charged" },
                        { field: "shippingCost", label: "Shipping Cost" },
                        { field: "buyerTax",     label: "Buyer Tax" },
                        { field: "hostingCost",  label: "Hosting Fees" },
                        { field: "marketingCost",label: "Marketing Costs" },
                        { field: "refund",       label: "Refund" },
                    ].map(({ field, label }) => (
                        <Grid key={field} item xs={6} sm={4}>
                            <TextField
                                label={label} fullWidth size="small" type="number"
                                value={form[field]} onChange={setF(field)}
                                InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }}
                                inputProps={{ min: 0, step: "any" }}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={6} sm={3}>
                        <TextField
                            label="Discount" fullWidth size="small" type="number"
                            value={form.discount} onChange={setF("discount")}
                            InputProps={{ startAdornment: <InputAdornment position="start">{form.discountType === "percent" ? "%" : currencySymbol}</InputAdornment> }}
                            inputProps={{ min: 0, step: "any" }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField select label="Discount Type" fullWidth size="small" value={form.discountType} onChange={setF("discountType")}>
                            <MenuItem value="fixed">Fixed ({currencySymbol})</MenuItem>
                            <MenuItem value="percent">Percent (%)</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* ── Notes ── */}
                <Divider sx={{ my: 2.5 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="Product / Description" fullWidth size="small" multiline rows={2} value={form.productDescription} onChange={setF("productDescription")} />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField label="Notes" fullWidth size="small" multiline rows={2} value={form.notes} onChange={setF("notes")} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField label="Tracking Number" fullWidth size="small" value={form.trackingNumber} onChange={setF("trackingNumber")} />
                    </Grid>
                </Grid>
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
