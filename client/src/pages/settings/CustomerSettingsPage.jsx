import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import api from "../../api";

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

const CUST_COL_KEYS = ["location", "orders", "totalSpent", "totalProfit", "firstOrder", "lastOrder"];

function ToggleRow({ label, description, enabled, onChange, disabled }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 1.75 }}>
            <Box>
                <Typography variant="body2" fontWeight={500}>
                    {label}
                </Typography>
                {description && (
                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
            <Tooltip title={disabled ? "Always required" : ""}>
                <span>
                    <Switch checked={enabled} onChange={(e) => onChange?.(e.target.checked)} size="small" disabled={disabled} />
                </span>
            </Tooltip>
        </Stack>
    );
}

function SectionCard({ title, description, onSave, saving, saved, children }) {
    return (
        <Paper variant="outlined" sx={{ overflow: "hidden", height: "100%" }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>
                        {title}
                    </Typography>
                    {onSave && (
                        <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            startIcon={saved ? <CheckCircleIcon /> : <SaveIcon />}
                            onClick={onSave}
                            disabled={saving}
                            sx={{ borderColor: "rgba(255,255,255,0.5)", color: "inherit", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                        >
                            {saving ? "Saving…" : saved ? "Saved" : "Save"}
                        </Button>
                    )}
                </Stack>
                {description && (
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                        {description}
                    </Typography>
                )}
            </Box>
            <Divider />
            {children}
        </Paper>
    );
}

export default function CustomerSettingsPage() {
    const { t } = useTranslation();
    const [fields, setFields] = useState(DEFAULT_FIELDS);
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [colSaving, setColSaving] = useState(false);
    const [colSaved, setColSaved] = useState(false);
    const [colError, setColError] = useState(null);
    const [prefixSaving, setPrefixSaving] = useState(false);
    const [prefixSaved, setPrefixSaved] = useState(false);
    const [prefixError, setPrefixError] = useState(null);

    useEffect(() => {
        api.get("/settings/customers")
            .then(({ data }) => {
                if (data?.settings?.fields) {
                    setFields({ ...DEFAULT_FIELDS, ...data.settings.fields });
                }
                setTableCols(data?.settings?.tableColumns ?? {});
                setPrefix((data?.settings?.numberPrefix ?? "CST-").replace(/-$/, ""));
            })
            .catch(() => setError(t("settings.customerSettings.loadFailed")))
            .finally(() => setLoading(false));
    }, []);

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
            setColError(t("settings.tableColumns.saveFailed"));
        } finally {
            setColSaving(false);
        }
    };

    const handlePrefixSave = async () => {
        setPrefixSaving(true);
        setPrefixError(null);
        try {
            await api.put("/settings/customers", { numberPrefix: (prefix.trim() || "CST") + "-" });
            setPrefixSaved(true);
            setTimeout(() => setPrefixSaved(false), 3000);
        } catch {
            setPrefixError(t("settings.numberPrefix.saveFailed"));
        } finally {
            setPrefixSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const errors = [error, colError, prefixError].filter(Boolean);

    return (
        <Box>
            {errors.map((e) => (
                <Alert key={e} severity="error" sx={{ mb: 2 }}>
                    {e}
                </Alert>
            ))}

            <Grid container spacing={3} alignItems="flex-start">
                {/* Left column — Customer Fields */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title={t("settings.customerSettings.title")} description={t("settings.customerSettings.subtitle")} onSave={handleSave} saving={saving} saved={success}>
                        <ToggleRow label={t("settings.customerSettings.nameField")} description={t("settings.customerSettings.nameFieldDesc")} enabled disabled />
                        {FIELD_KEYS.map((key, i) => (
                            <React.Fragment key={key}>
                                <Divider />
                                <ToggleRow label={t(`settings.customerSettings.fields.${key}`)} description={t(`settings.customerSettings.fields.${key}Desc`)} enabled={!!fields[key]} onChange={(v) => setFields((prev) => ({ ...prev, [key]: v }))} />
                            </React.Fragment>
                        ))}
                    </SectionCard>
                </Grid>

                {/* Right column — Number Prefix + Table Columns */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack gap={3}>
                        <SectionCard title={t("settings.numberPrefix.title")} description={t("settings.numberPrefix.descCustomers", { example: `${(prefix || "CST") + "-"}00000001` })} onSave={handlePrefixSave} saving={prefixSaving} saved={prefixSaved}>
                            <Box sx={{ px: 3, py: 2 }}>
                                <TextField label={t("settings.numberPrefix.label")} value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                            </Box>
                        </SectionCard>

                        <SectionCard title={t("settings.tableColumns.title")} description={t("settings.tableColumns.descCustomers")} onSave={handleColSave} saving={colSaving} saved={colSaved}>
                            <ToggleRow label={t("customers.col.customer", "Customer")} enabled disabled />
                            {CUST_COL_KEYS.map((key) => (
                                <React.Fragment key={key}>
                                    <Divider />
                                    <ToggleRow label={t(`customers.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} />
                                </React.Fragment>
                            ))}
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}
