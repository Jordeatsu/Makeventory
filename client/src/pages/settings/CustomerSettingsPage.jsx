import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Switch, Tooltip, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SaveIcon from "@mui/icons-material/Save";
import { useTranslation } from "react-i18next";
import api from "../../api";

// Keys for togglable fields — labels/descriptions come from i18n
const FIELD_KEYS = ["email", "phone", "addressLine1", "addressLine2", "city", "state", "postcode", "country"];

const DEFAULT_FIELDS = {
    email: true,
    phone: true,
    addressLine1: true,
    addressLine2: false,
    city: true,
    state: true,
    postcode: true,
    country: true,
};

// Columns that can be toggled in the customers table
const CUST_COL_KEYS = ["location", "orders", "totalSpent", "totalProfit", "firstOrder", "lastOrder"];

function FieldToggleRow({ label, description, enabled, onChange, isLast }) {
    return (
        <>
            <Box sx={{ px: 3, py: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body2" fontWeight={500}>
                            {label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                    <Switch checked={enabled} onChange={(e) => onChange(e.target.checked)} size="small" color="primary" />
                </Stack>
            </Box>
            {!isLast && <Divider />}
        </>
    );
}

export default function CustomerSettingsPage() {
    const { t } = useTranslation();
    const [fields, setFields] = useState(DEFAULT_FIELDS);
    const [tableCols, setTableCols] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [colSaving, setColSaving] = useState(false);
    const [colSaved, setColSaved] = useState(false);
    const [colError, setColError] = useState(null);

    useEffect(() => {
        api.get("/settings/customers")
            .then(({ data }) => {
                if (data?.settings?.fields) {
                    setFields({ ...DEFAULT_FIELDS, ...data.settings.fields });
                }
                setTableCols(data?.settings?.tableColumns ?? {});
            })
            .catch(() => setError(t("settings.customerSettings.loadFailed")))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (key) => (value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await api.put("/settings/customers", { fields });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError(t("settings.customerSettings.saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    const handleColSave = async () => {
        setColSaving(true);
        setColError(null);
        try {
            await api.put("/settings/customers", { tableColumns: tableCols });
            setColSaved(true);
            setTimeout(() => setColSaved(false), 3000);
        } catch {
            setColError("Failed to save column settings.");
        } finally {
            setColSaving(false);
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
                    <PeopleIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>
                        {t("settings.customerSettings.title")}
                    </Typography>
                </Stack>
                <Tooltip title="Save changes">
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                        {saving ? t("settings.customerSettings.saving") : t("common.save")}
                    </Button>
                </Tooltip>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {t("settings.customerSettings.saved")}
                </Alert>
            )}

            <Typography variant="body2" color="text.secondary" mb={2}>
                {t("settings.customerSettings.subtitle")}
            </Typography>

            {/* Always-on row for Name */}
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {t("settings.customerSettings.nameField")}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {t("settings.customerSettings.nameFieldDesc")}
                            </Typography>
                        </Box>
                        <Tooltip title={t("settings.customerSettings.nameAlwaysRequired")}>
                            <span>
                                <Switch checked disabled size="small" color="primary" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>

                <Divider />

                {FIELD_KEYS.map((key, idx) => (
                    <FieldToggleRow key={key} label={t(`settings.customerSettings.fields.${key}`)} description={t(`settings.customerSettings.fields.${key}Desc`)} enabled={!!fields[key]} onChange={handleToggle(key)} isLast={idx === FIELD_KEYS.length - 1} />
                ))}
            </Paper>

            {/* Table Column Visibility */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={4} mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    Table Columns
                </Typography>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleColSave} disabled={colSaving}>
                    {colSaving ? "Saving…" : t("common.save")}
                </Button>
            </Stack>
            {colError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setColError(null)}>
                    {colError}
                </Alert>
            )}
            {colSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Column settings saved.
                </Alert>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which columns appear in the Customers table. Customer and Actions are always visible.
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                {/* Always-on: Customer */}
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                            {t("customers.col.customer", "Customer")}
                        </Typography>
                        <Tooltip title="Always visible">
                            <span>
                                <Switch checked disabled size="small" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
                <Divider />
                {CUST_COL_KEYS.map((key, idx) => (
                    <FieldToggleRow key={key} label={t(`customers.col.${key}`, key)} description="" enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} isLast={idx === CUST_COL_KEYS.length - 1} />
                ))}
            </Paper>
        </Box>
    );
}
