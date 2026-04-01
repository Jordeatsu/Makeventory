import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemText, Switch, Button, CircularProgress, Alert, Divider, Paper, Stack, TextField } from "@mui/material";
import { getModules, saveModules, savePrefixes, completeInstall } from "../api";

const DEFAULT_PREFIXES = { orders: "ORD", materials: "MTL", products: "PRD", customers: "CST" };

export default function ModuleStep({ onComplete }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [serverError, setServerError] = useState("");
    const [prefixes, setPrefixes] = useState(DEFAULT_PREFIXES);

    useEffect(() => {
        getModules()
            .then((res) => setModules(res.data))
            .catch((err) => setServerError(err.response?.data?.error ?? err.message))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setModules((prev) => prev.map((m) => (m._id === id ? { ...m, isActive: !m.isActive } : m)));

    const handleSave = async () => {
        setSaving(true);
        setServerError("");
        try {
            await saveModules(modules.map(({ _id, isActive }) => ({ _id, isActive })));
            // Save prefixes with dash appended — user typed without dash
            await savePrefixes({
                orders:    (prefixes.orders.trim()    || "ORD") + "-",
                materials: (prefixes.materials.trim() || "MTL") + "-",
                products:  (prefixes.products.trim()  || "PRD") + "-",
                customers: (prefixes.customers.trim() || "CST") + "-",
            });
            await completeInstall();
            setDone(true);
            setTimeout(onComplete, 800);
        } catch (err) {
            setServerError(err.response?.data?.error ?? err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Module Selection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose which modules to enable for your Makeventory installation. You can change these at any time from the admin settings.
            </Typography>

            {loading && <CircularProgress size={24} />}

            {!loading && modules.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {modules.map((mod, i) => (
                            <React.Fragment key={mod._id}>
                                {i > 0 && <Divider />}
                                <ListItem sx={{ py: 1.5, px: 2 }} secondaryAction={<Switch checked={mod.isActive} onChange={() => toggle(mod._id)} disabled={saving || done} />}>
                                    <ListItemText primary={mod.name} secondary={mod.description} primaryTypographyProps={{ fontWeight: 600, variant: "body1" }} secondaryTypographyProps={{ variant: "body2" }} sx={{ pr: 6 }} />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Number Prefixes */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 4, mb: 1 }}>
                Number Prefixes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set a prefix for auto-generated reference numbers. The dash is added automatically — just enter the letters (e.g. <strong>ORD</strong> becomes <strong>ORD-00000001</strong>).
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {[
                    { key: "orders",    label: "Orders" },
                    { key: "materials", label: "Materials" },
                    { key: "products",  label: "Products" },
                    { key: "customers", label: "Customers" },
                ].map(({ key, label }, idx, arr) => (
                    <React.Fragment key={key}>
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography variant="body2" fontWeight={500} sx={{ minWidth: 100 }}>{label}</Typography>
                                <TextField
                                    value={prefixes[key]}
                                    onChange={(e) => setPrefixes((prev) => ({ ...prev, [key]: e.target.value }))}
                                    size="small"
                                    disabled={saving || done}
                                    inputProps={{ maxLength: 10 }}
                                    sx={{ width: 130 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    → {(prefixes[key].trim() || DEFAULT_PREFIXES[key]) + "-"}00000001
                                </Typography>
                            </Stack>
                        </Box>
                        {idx < arr.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Paper>

            {serverError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {serverError}
                </Alert>
            )}

            {done && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Modules saved — installation complete!
                </Alert>
            )}

            {!loading && !done && (
                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ minWidth: 140 }}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : "Save & Finish"}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
