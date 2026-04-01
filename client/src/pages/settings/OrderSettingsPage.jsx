import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import api from "../../api";

// Columns that can be toggled (order ref + actions are always visible)
const ORDER_COL_KEYS = ["date", "customer", "status", "products", "grossRevenue", "netRevenue", "profit"];

function ColToggleRow({ label, enabled, onChange, isLast }) {
    return (
        <>
            <Box sx={{ px: 3, py: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={500}>
                        {label}
                    </Typography>
                    <Switch checked={enabled} onChange={(e) => onChange(e.target.checked)} size="small" color="primary" />
                </Stack>
            </Box>
            {!isLast && <Divider />}
        </>
    );
}

export default function OrderSettingsPage() {
    const { t } = useTranslation();
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/settings/orders")
            .then(({ data }) => {
                setTableCols(data?.settings?.tableColumns ?? {});
                setPrefix((data?.settings?.numberPrefix ?? "ORD-").replace(/-$/, ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await api.put("/settings/orders", { tableColumns: tableCols, numberPrefix: (prefix.trim() || "ORD") + "-" });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch {
            setError("Failed to save column settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 640, mx: "auto" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <ReceiptLongIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>
                        {t("settings.orderSettings.title")}
                    </Typography>
                </Stack>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : t("common.save")}
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {saved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Settings saved.
                </Alert>
            )}

            <Typography variant="h6" fontWeight={600} mb={2}>
                Number Prefix
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Set the prefix used for auto-generated order numbers (e.g. {(prefix || "ORD") + "-"}00000001).
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <TextField label="Number Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                </Box>
            </Paper>

            <Typography variant="h6" fontWeight={600} mb={2}>
                Table Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which columns appear in the Orders table. Order Ref and Actions are always visible.
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {/* Always-on: Order Ref */}
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                            {t("orders.col.order", "Order Ref")}
                        </Typography>
                        <Tooltip title="Always visible">
                            <span>
                                <Switch checked disabled size="small" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
                <Divider />
                {ORDER_COL_KEYS.map((key, idx) => (
                    <ColToggleRow key={key} label={t(`orders.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} isLast={idx === ORDER_COL_KEYS.length - 1} />
                ))}
            </Paper>
        </Box>
    );
}
