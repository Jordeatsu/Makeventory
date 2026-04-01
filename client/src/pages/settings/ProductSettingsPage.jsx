import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Switch, Tooltip, Typography } from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import api from "../../api";

// Columns that can be toggled (name + actions are always visible)
const PROD_COL_KEYS = ["sku", "category", "estMaterialCost", "basePrice", "estMargin", "status"];

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

export default function ProductSettingsPage() {
    const { t } = useTranslation();
    const [tableCols, setTableCols] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/settings/products")
            .then(({ data }) => setTableCols(data?.settings?.tableColumns ?? {}))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await api.put("/settings/products", { tableColumns: tableCols });
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
                    <ShoppingBagIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>
                        {t("settings.productSettings.title")}
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
                    Column settings saved.
                </Alert>
            )}

            <Typography variant="h6" fontWeight={600} mb={2}>
                Table Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which columns appear in the Products table. Name and Actions are always visible.
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {/* Always-on: Name */}
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                            {t("products.col.name", "Name")}
                        </Typography>
                        <Tooltip title="Always visible">
                            <span>
                                <Switch checked disabled size="small" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
                <Divider />
                {PROD_COL_KEYS.map((key, idx) => (
                    <ColToggleRow key={key} label={t(`products.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} isLast={idx === PROD_COL_KEYS.length - 1} />
                ))}
            </Paper>
        </Box>
    );
}
