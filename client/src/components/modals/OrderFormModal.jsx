import React, { useState, useEffect } from "react";
import { Alert, Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api";
import { useGlobalSettings } from "../../context/GlobalSettingsContext";
import CountrySelect from "../common/CountrySelect";
import { useCustomerSettings } from "../../hooks/useCustomerSettings";
import { useModules } from "../../hooks/useModules.jsx";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

const ALL_STATUSES = ["Pending", "In Progress", "Completed", "Shipped", "Cancelled"];
const UNITS = ["pieces", "m", "cm", "mm", "m²", "cm²", "mm²", "in", "in²"];
const EMPTY_NEW_CUSTOMER = { email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postcode: "", country: "" };

const EMPTY_PRODUCT_LINE = { productId: "", productName: "", sku: "", category: "", basePrice: "", quantity: "1" };
const EMPTY_MATERIAL_LINE = { materialRef: null, materialName: "", materialType: "", quantityUsed: "1", unit: "pieces", costPerUnit: "", packCost: "", lineCost: "" };

const EMPTY_FORM = {
    origin: "",
    originOrderId: "",
    orderDate: "",
    status: "Pending",
    productDescription: "",
    notes: "",
    trackingNumber: "",
    totalCharged: "",
    shippingCost: "",
    buyerTax: "",
    discount: "",
    discountType: "fixed",
    hostingCost: "",
    marketingCost: "",
    refund: "",
};

function toDateInput(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toISOString().slice(0, 10);
}

export default function OrderFormModal({ open, onClose, onSave, initial }) {
    const { settings } = useGlobalSettings();
    const currencySymbol = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    const { fields: customerFields } = useCustomerSettings();
    const { activeModules } = useModules();
    const customersEnabled = activeModules.includes("Customers");
    const productsEnabled = activeModules.includes("Products");
    const inventoryEnabled = activeModules.includes("Inventory");

    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerInput, setCustomerInput] = useState("");
    const [customerOptions, setCustomerOptions] = useState([]);
    const [newCustomerData, setNewCustomerData] = useState({ ...EMPTY_NEW_CUSTOMER });
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [allMaterials, setAllMaterials] = useState([]);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [newLine, setNewLine] = useState({ material: null, quantityUsed: "" });
    const [lineError, setLineError] = useState("");
    const [newProductLine, setNewProductLine] = useState({ product: null, quantity: "1" });
    const [productLineError, setProductLineError] = useState("");

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    origin: initial.origin ?? "",
                    originOrderId: initial.originOrderId ?? "",
                    orderDate: toDateInput(initial.orderDate),
                    status: initial.status ?? "Pending",
                    productDescription: initial.productDescription ?? "",
                    notes: initial.notes ?? "",
                    trackingNumber: initial.trackingNumber ?? "",
                    totalCharged: initial.totalCharged ?? "",
                    shippingCost: initial.shippingCost ?? "",
                    buyerTax: initial.buyerTax ?? "",
                    discount: initial.discount ?? "",
                    discountType: initial.discountType ?? "fixed",
                    hostingCost: initial.hostingCost ?? "",
                    marketingCost: initial.marketingCost ?? "",
                    refund: initial.refund ?? "",
                });
                setSelectedCustomer(initial.customer?._id ? initial.customer : null);
                setCustomerInput(initial.customer?.name ?? "");
                setNewCustomerData({ ...EMPTY_NEW_CUSTOMER });
                setProducts(
                    (initial.products || []).map((p) => ({
                        productId: p.productId ?? "",
                        productName: p.productName ?? "",
                        sku: p.sku ?? "",
                        category: p.category ?? "",
                        basePrice: String(p.basePrice ?? ""),
                        quantity: String(p.quantity ?? 1),
                    })),
                );
                setMaterials(
                    (initial.materials || []).map((m) => ({
                        materialRef: null,
                        materialName: m.materialName ?? "",
                        materialType: m.materialType ?? "",
                        quantityUsed: String(m.quantityUsed ?? 1),
                        unit: m.unit ?? "pieces",
                        costPerUnit: String(m.costPerUnit ?? ""),
                        packCost: m.packCost != null ? String(m.packCost) : "",
                        lineCost: String(m.lineCost ?? ""),
                    })),
                );
            } else {
                setForm(EMPTY_FORM);
                setSelectedCustomer(null);
                setCustomerInput("");
                setNewCustomerData({ ...EMPTY_NEW_CUSTOMER });
                setProducts([]);
                setMaterials([]);
            }
            setNewLine({ material: null, quantityUsed: "" });
            setLineError("");
            setNewProductLine({ product: null, quantity: "1" });
            setProductLineError("");
            setError("");
        }
    }, [open, initial]);

    useEffect(() => {
        if (open) {
            api.get("/products")
                .then((r) => setProductOptions(r.data.products ?? []))
                .catch(() => {});
            api.get("/materials")
                .then((r) => setAllMaterials(r.data.materials ?? []))
                .catch(() => {});
            api.get("/customers")
                .then((r) => setCustomerOptions(r.data.customers ?? []))
                .catch(() => {});
        }
    }, [open]);

    const setF = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    // Auto-sum product lines into Item Price Charged
    useEffect(() => {
        if (products.length > 0) {
            const total = products.reduce((s, p) => s + (parseFloat(p.basePrice) || 0) * (parseInt(p.quantity, 10) || 1), 0);
            setForm((f) => ({ ...f, totalCharged: total.toFixed(2) }));
        }
    }, [products]);
    const setNC = (field) => (e) => setNewCustomerData((d) => ({ ...d, [field]: e.target.value }));

    const addProductLine = () => {
        setProductLineError("");
        if (!newProductLine.product) {
            setProductLineError("Select a product");
            return;
        }
        const qty = parseInt(newProductLine.quantity, 10) || 1;
        if (qty < 1) {
            setProductLineError("Quantity must be at least 1");
            return;
        }
        const prod = newProductLine.product;
        setProducts((ps) => [
            ...ps,
            {
                productId: prod._id,
                productName: prod.name,
                sku: prod.sku ?? "",
                category: prod.category ?? "",
                basePrice: String(prod.basePrice ?? ""),
                quantity: String(qty),
            },
        ]);
        setNewProductLine({ product: null, quantity: "1" });
    };

    const updateProductQty = (i, rawVal) => setProducts((ps) => ps.map((p, idx) => (idx !== i ? p : { ...p, quantity: rawVal })));

    const removeProduct = (i) => setProducts((ps) => ps.filter((_, idx) => idx !== i));

    const addMaterialLine = () => {
        setLineError("");
        if (!newLine.material) {
            setLineError("Select a material");
            return;
        }
        const qty = parseFloat(newLine.quantityUsed);
        if (!qty || qty <= 0) {
            setLineError("Enter a valid quantity");
            return;
        }
        const mat = newLine.material;
        const effectiveCost = mat.unitsPerPack > 0 ? mat.costPerUnit / mat.unitsPerPack : mat.costPerUnit;
        setMaterials((ms) => [
            ...ms,
            {
                materialRef: null,
                materialName: mat.name,
                materialType: mat.type ?? "",
                quantityUsed: String(qty),
                unit: mat.unit ?? "pieces",
                costPerUnit: String(effectiveCost),
                packCost: mat.unitsPerPack > 0 ? String(mat.costPerUnit) : "",
                lineCost: String((qty * effectiveCost).toFixed(4)),
            },
        ]);
        setNewLine({ material: null, quantityUsed: "" });
    };

    const updateMaterialQty = (i, rawVal) =>
        setMaterials((ms) =>
            ms.map((m, idx) => {
                if (idx !== i) return m;
                const qty = Math.max(0, parseFloat(rawVal) || 0);
                const cpu = parseFloat(m.costPerUnit) || 0;
                return { ...m, quantityUsed: rawVal, lineCost: String((qty * cpu).toFixed(4)) };
            }),
        );

    const removeMaterial = (i) => setMaterials((ms) => ms.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            const productLines = products.map((p) => ({
                productId: p.productId || null,
                productName: p.productName,
                sku: p.sku,
                category: p.category,
                basePrice: parseFloat(p.basePrice) || 0,
                quantity: parseInt(p.quantity, 10) || 1,
            }));
            const materialLines = materials.map((m) => ({
                materialName: m.materialName,
                materialType: m.materialType,
                quantityUsed: parseFloat(m.quantityUsed) || 0,
                unit: m.unit,
                costPerUnit: parseFloat(m.costPerUnit) || 0,
                packCost: m.packCost !== "" ? parseFloat(m.packCost) : null,
                lineCost: parseFloat(m.lineCost) || 0,
            }));
            await onSave({
                origin: form.origin.trim(),
                originOrderId: form.originOrderId.trim(),
                orderDate: form.orderDate || null,
                status: form.status,
                customer: selectedCustomer?._id ?? (customerInput.trim() ? { name: customerInput.trim(), ...Object.fromEntries(Object.entries(newCustomerData).filter(([, v]) => v.trim())) } : null),
                products: productLines,
                materials: materialLines,
                productDescription: form.productDescription.trim(),
                notes: form.notes.trim(),
                trackingNumber: form.trackingNumber.trim(),
                totalCharged: parseFloat(form.totalCharged) || 0,
                shippingCost: parseFloat(form.shippingCost) || 0,
                buyerTax: parseFloat(form.buyerTax) || 0,
                discount: parseFloat(form.discount) || 0,
                discountType: form.discountType,
                hostingCost: parseFloat(form.hostingCost) || 0,
                marketingCost: parseFloat(form.marketingCost) || 0,
                refund: parseFloat(form.refund) || 0,
            });
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    // ── Live calculation ──
    const totalMaterialCost = materials.reduce((s, m) => s + (parseFloat(m.lineCost) || 0), 0);
    const itemPrice = parseFloat(form.totalCharged) || 0;
    const buyerTax = parseFloat(form.buyerTax) || 0;
    const discountAmt = form.discountType === "percent" ? itemPrice * ((parseFloat(form.discount) || 0) / 100) : parseFloat(form.discount) || 0;
    const hostingCost = parseFloat(form.hostingCost) || 0;
    const marketingCost = parseFloat(form.marketingCost) || 0;
    const refund = parseFloat(form.refund) || 0;
    const shippingCost = parseFloat(form.shippingCost) || 0;
    const profit = itemPrice - discountAmt + buyerTax - hostingCost - marketingCost - refund - totalMaterialCost;
    const grossRevenue = profit + shippingCost;
    const totalPaid = itemPrice - discountAmt + shippingCost + buyerTax;
    const fmt = (n) => `${currencySymbol}${Number(n || 0).toFixed(2)}`;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{initial?._id ? "Edit Order" : "New Order"}</DialogTitle>
            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* ── Order info ── */}
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Order Info
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="Order Number" fullWidth size="small" value={initial?._id ? initial.orderNumber : "Auto-assigned"} InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-input": { color: "text.secondary", fontStyle: initial?._id ? "normal" : "italic" } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="Origin (e.g. Etsy)" fullWidth size="small" value={form.origin} onChange={setF("origin")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="Origin Order ID" fullWidth size="small" value={form.originOrderId} onChange={setF("originOrderId")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="Order Date" fullWidth size="small" type="date" value={form.orderDate} onChange={setF("orderDate")} InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label="Status" fullWidth size="small" value={form.status} onChange={setF("status")}>
                            {ALL_STATUSES.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField label="Tracking Number" fullWidth size="small" value={form.trackingNumber} onChange={setF("trackingNumber")} />
                    </Grid>
                </Grid>

                {/* ── Customer ── */}
                {customersEnabled && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                            Customer
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={12}>
                                <Autocomplete
                                    freeSolo
                                    options={customerOptions}
                                    getOptionLabel={(opt) => (typeof opt === "string" ? opt : (opt.name ?? ""))}
                                    isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                                    value={selectedCustomer}
                                    inputValue={customerInput}
                                    onInputChange={(_, val, reason) => {
                                        setCustomerInput(val);
                                        if (reason === "clear" || !val) setSelectedCustomer(null);
                                    }}
                                    onChange={(_, val) => {
                                        if (!val || typeof val === "string") {
                                            setSelectedCustomer(null);
                                            setCustomerInput(typeof val === "string" ? val : "");
                                        } else {
                                            setSelectedCustomer(val);
                                            setCustomerInput(val.name ?? "");
                                            setNewCustomerData({ ...EMPTY_NEW_CUSTOMER });
                                        }
                                    }}
                                    renderOption={(props, opt) => (
                                        <li {...props} key={opt._id}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {opt.name}
                                                </Typography>
                                                {opt.email && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {opt.email}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </li>
                                    )}
                                    renderInput={(params) => <TextField {...params} label="Customer" size="small" fullWidth />}
                                />
                            </Grid>

                            {/* Existing customer summary */}
                            {selectedCustomer && (
                                <Grid size={12}>
                                    <Paper variant="outlined" sx={{ px: 2, py: 1, bgcolor: "background.default" }}>
                                        <Stack direction="row" gap={1.5} flexWrap="wrap">
                                            {selectedCustomer.email && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {selectedCustomer.email}
                                                </Typography>
                                            )}
                                            {selectedCustomer.phone && (
                                                <Typography variant="caption" color="text.secondary">
                                                    · {selectedCustomer.phone}
                                                </Typography>
                                            )}
                                            {selectedCustomer.city && (
                                                <Typography variant="caption" color="text.secondary">
                                                    · {selectedCustomer.city}
                                                </Typography>
                                            )}
                                            {selectedCustomer.country && (
                                                <Typography variant="caption" color="text.secondary">
                                                    · {selectedCustomer.country}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            )}

                            {/* New customer detail fields — shown when typing a name that isn't an existing customer */}
                            {!selectedCustomer && customerInput.trim() && (
                                <>
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                            New customer — fill in optional details below
                                        </Typography>
                                    </Grid>
                                    {customerFields.email && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Email" fullWidth size="small" value={newCustomerData.email} onChange={setNC("email")} />
                                        </Grid>
                                    )}
                                    {customerFields.phone && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Phone" fullWidth size="small" value={newCustomerData.phone} onChange={setNC("phone")} />
                                        </Grid>
                                    )}
                                    {customerFields.addressLine1 && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Address Line 1" fullWidth size="small" value={newCustomerData.addressLine1} onChange={setNC("addressLine1")} />
                                        </Grid>
                                    )}
                                    {customerFields.addressLine2 && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField label="Address Line 2" fullWidth size="small" value={newCustomerData.addressLine2} onChange={setNC("addressLine2")} />
                                        </Grid>
                                    )}
                                    {customerFields.city && (
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField label="City" fullWidth size="small" value={newCustomerData.city} onChange={setNC("city")} />
                                        </Grid>
                                    )}
                                    {customerFields.state && (
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField label="State / County" fullWidth size="small" value={newCustomerData.state} onChange={setNC("state")} />
                                        </Grid>
                                    )}
                                    {customerFields.postcode && (
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField label="Postcode" fullWidth size="small" value={newCustomerData.postcode} onChange={setNC("postcode")} />
                                        </Grid>
                                    )}
                                    {customerFields.country && (
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <CountrySelect value={newCustomerData.country} onChange={(v) => setNewCustomerData((d) => ({ ...d, country: v }))} />
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                    </>
                )}

                {/* ── Products ordered ── */}
                {productsEnabled && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                            Products Ordered
                        </Typography>

                        {/* Add product row */}
                        <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    size="small"
                                    options={productOptions}
                                    getOptionLabel={(opt) => `${opt.name}${opt.sku ? ` (${opt.sku})` : ""}${opt.category ? ` — ${opt.category}` : ""}`}
                                    isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                                    value={newProductLine.product}
                                    onChange={(_, val) => setNewProductLine((nl) => ({ ...nl, product: val }))}
                                    renderInput={(params) => <TextField {...params} label="Product" size="small" />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField size="small" fullWidth type="number" label="Quantity" value={newProductLine.quantity} onChange={(e) => setNewProductLine((nl) => ({ ...nl, quantity: e.target.value }))} inputProps={{ min: 1 }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
                                <Button variant="outlined" startIcon={<AddIcon />} onClick={addProductLine} fullWidth>
                                    Add
                                </Button>
                            </Grid>
                            {productLineError && (
                                <Grid size={12}>
                                    <Alert severity="warning" sx={{ py: 0 }}>
                                        {productLineError}
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>

                        {products.length > 0 && (
                            <Paper variant="outlined" sx={{ mb: 1.5 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                            <TableCell>Product</TableCell>
                                            <TableCell>SKU</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell align="right">Qty</TableCell>
                                            <TableCell align="right">Base Price</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((p, i) => (
                                            <TableRow key={i}>
                                                <TableCell sx={{ fontWeight: 600 }}>{p.productName}</TableCell>
                                                <TableCell sx={{ color: "text.secondary" }}>{p.sku || "—"}</TableCell>
                                                <TableCell>{p.category || "—"}</TableCell>
                                                <TableCell align="right" sx={{ width: 100 }}>
                                                    <TextField size="small" type="number" value={p.quantity} onChange={(e) => updateProductQty(i, e.target.value)} inputProps={{ min: 1, style: { textAlign: "right" } }} sx={{ width: 80 }} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {currencySymbol}
                                                    {parseFloat(p.basePrice || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Remove product (also removes its materials from this order)">
                                                        <IconButton size="small" color="error" onClick={() => removeProduct(i)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        )}
                    </>
                )}

                {/* ── Materials used ── */}
                {inventoryEnabled && (
                    <>
                        <Divider sx={{ my: 2.5 }} />
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                            Materials Used
                        </Typography>

                        {/* Add material row */}
                        <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                            <Grid size={{ xs: 12, sm: 5 }}>
                                <Autocomplete
                                    size="small"
                                    options={allMaterials}
                                    getOptionLabel={(opt) => `${opt.name} (${opt.type}) — ${opt.quantity?.toLocaleString() ?? 0} ${opt.unit ?? "units"} left`}
                                    isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                                    value={newLine.material}
                                    onChange={(_, val) => setNewLine((nl) => ({ ...nl, material: val }))}
                                    renderInput={(params) => <TextField {...params} label="Material" size="small" />}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField size="small" fullWidth type="number" label={`Qty (${newLine.material?.unit || "units"})`} value={newLine.quantityUsed} onChange={(e) => setNewLine((nl) => ({ ...nl, quantityUsed: e.target.value }))} inputProps={{ min: 0, step: "any" }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
                                <Button variant="outlined" startIcon={<AddIcon />} onClick={addMaterialLine} fullWidth>
                                    Add
                                </Button>
                            </Grid>
                            {lineError && (
                                <Grid size={12}>
                                    <Alert severity="warning" sx={{ py: 0 }}>
                                        {lineError}
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>

                        {materials.length > 0 && (
                            <Table size="small" sx={{ mb: 1.5 }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: "primary.main", "& .MuiTableCell-head": { color: "white", fontWeight: 700 } }}>
                                        <TableCell>Material</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="right">Qty Used</TableCell>
                                        <TableCell>Unit</TableCell>
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
                                                <TableCell align="right" sx={{ width: 120 }}>
                                                    <TextField size="small" type="number" value={line.quantityUsed} onChange={(e) => updateMaterialQty(line._origIdx, e.target.value)} inputProps={{ min: 0, step: "any", style: { textAlign: "right" } }} sx={{ width: 100 }} />
                                                </TableCell>
                                                <TableCell>{line.unit}</TableCell>
                                                <TableCell align="right">
                                                    {fmt(line.costPerUnit)}
                                                    {line.packCost && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            pack: {fmt(line.packCost)}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">{fmt(line.lineCost)}</TableCell>
                                                <TableCell align="right">
                                                    <Tooltip title="Remove material">
                                                        <IconButton size="small" color="error" onClick={() => removeMaterial(line._origIdx)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        )}
                    </>
                )}

                {/* ── Financials ── */}
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Financials
                </Typography>
                <Grid container spacing={2}>
                    {[
                        { field: "totalCharged", label: "Item Price Charged" },
                        { field: "shippingCost", label: "Shipping Cost" },
                        { field: "buyerTax", label: "Buyer Tax" },
                        { field: "hostingCost", label: "Hosting Fees" },
                        { field: "marketingCost", label: "Marketing Costs" },
                        { field: "refund", label: "Refund" },
                    ].map(({ field, label }) => (
                        <Grid key={field} size={{ xs: 6, sm: 4 }}>
                            <TextField label={label} fullWidth size="small" type="number" value={form[field]} onChange={setF(field)} InputProps={{ startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> }} inputProps={{ min: 0, step: "any" }} />
                        </Grid>
                    ))}
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Discount"
                            type="number"
                            fullWidth
                            size="small"
                            value={form.discount}
                            onChange={setF("discount")}
                            helperText={form.discountType === "percent" ? `= ${fmt(discountAmt)} off item price` : "Fixed amount deducted from item price"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TextField
                                            select
                                            value={form.discountType}
                                            onChange={setF("discountType")}
                                            variant="standard"
                                            sx={{ width: 48, "& .MuiSelect-select": { py: 0, fontSize: "0.85rem" }, "& .MuiInput-underline:before": { borderBottom: "none" }, "& .MuiInput-underline:after": { borderBottom: "none" } }}
                                        >
                                            <MenuItem value="fixed">{currencySymbol}</MenuItem>
                                            <MenuItem value="percent">%</MenuItem>
                                        </TextField>
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{ min: 0, step: form.discountType === "percent" ? 1 : 0.01 }}
                        />
                    </Grid>
                </Grid>

                {/* ── Live Calculation ── */}
                <Paper sx={{ mt: 2.5, p: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="subtitle2" mb={1} fontWeight={700}>
                        Live Calculation
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid size={8}>
                            <Typography variant="body2" color="text.secondary">
                                Item Price
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" fontWeight={600} textAlign="right">
                                {fmt(itemPrice)}
                            </Typography>
                        </Grid>

                        {buyerTax > 0 && (
                            <>
                                <Grid size={8}>
                                    <Typography variant="body2" color="text.secondary">
                                        + Buyer Tax
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="body2" fontWeight={600} color="success.main" textAlign="right">
                                        +{fmt(buyerTax)}
                                    </Typography>
                                </Grid>
                            </>
                        )}

                        {discountAmt > 0 && (
                            <>
                                <Grid size={8}>
                                    <Typography variant="body2" color="text.secondary">
                                        Discount{form.discountType === "percent" ? ` (${form.discount || 0}%)` : ""}
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="body2" fontWeight={600} color="error.main" textAlign="right">
                                        –{fmt(discountAmt)}
                                    </Typography>
                                </Grid>
                            </>
                        )}

                        <Grid size={8}>
                            <Typography variant="body2" color="text.secondary">
                                Shipping Cost{" "}
                                <Typography component="span" variant="caption" color="text.disabled">
                                    (info only)
                                </Typography>
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary" textAlign="right">
                                {fmt(shippingCost)}
                            </Typography>
                        </Grid>

                        <Grid size={8}>
                            <Typography variant="body2" color="text.secondary">
                                – Hosting Fees
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" fontWeight={600} color="error.main" textAlign="right">
                                –{fmt(hostingCost)}
                            </Typography>
                        </Grid>

                        {marketingCost > 0 && (
                            <>
                                <Grid size={8}>
                                    <Typography variant="body2" color="text.secondary">
                                        – Marketing Costs
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="body2" fontWeight={600} color="error.main" textAlign="right">
                                        –{fmt(marketingCost)}
                                    </Typography>
                                </Grid>
                            </>
                        )}

                        <Grid size={8}>
                            <Typography variant="body2" color="text.secondary">
                                – Material Cost
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" fontWeight={600} color="error.main" textAlign="right">
                                –{fmt(totalMaterialCost)}
                            </Typography>
                        </Grid>

                        {refund > 0 && (
                            <>
                                <Grid size={8}>
                                    <Typography variant="body2" color="text.secondary">
                                        – Refund
                                    </Typography>
                                </Grid>
                                <Grid size={4}>
                                    <Typography variant="body2" fontWeight={600} color="error.main" textAlign="right">
                                        –{fmt(refund)}
                                    </Typography>
                                </Grid>
                            </>
                        )}

                        <Grid size={12}>
                            <Divider />
                        </Grid>

                        <Grid size={8}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Gross Revenue
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="subtitle2" fontWeight={700} textAlign="right">
                                {fmt(totalPaid)}
                            </Typography>
                        </Grid>

                        <Grid size={8}>
                            <Typography variant="subtitle2" fontWeight={700} color={grossRevenue >= 0 ? "success.main" : "error.main"}>
                                Net Revenue
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="subtitle2" fontWeight={700} color={grossRevenue >= 0 ? "success.main" : "error.main"} textAlign="right">
                                {fmt(grossRevenue)}
                            </Typography>
                        </Grid>

                        <Grid size={8}>
                            <Typography variant="subtitle2" fontWeight={700} color={profit >= 0 ? "success.main" : "error.main"}>
                                Net Profit
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="subtitle2" fontWeight={700} color={profit >= 0 ? "success.main" : "error.main"} textAlign="right">
                                {fmt(profit)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* ── Notes ── */}
                <Divider sx={{ my: 2.5 }} />
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <TextField label="Product / Description" fullWidth size="small" multiline rows={2} value={form.productDescription} onChange={setF("productDescription")} />
                    </Grid>
                    <Grid size={12}>
                        <TextField label="Notes" fullWidth size="small" multiline rows={2} value={form.notes} onChange={setF("notes")} />
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
