import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import api from "../../api";

const ORDER_COL_KEYS = ["date", "customer", "status", "products", "grossRevenue", "netRevenue", "profit"];

function ToggleRow({ label, enabled, onChange, disabled }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 1.75 }}>
            <Typography variant="body2" fontWeight={500}>{label}</Typography>
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
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
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
                {description && <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>{description}</Typography>}
            </Box>
            <Divider />
            {children}
        </Paper>
    );
}

export default function OrderSettingsPage() {
    const { t } = useTranslation();
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);
    const [prefixSaving, setPrefixSaving] = useState(false);
    const [prefixSaved, setPrefixSaved] = useState(false);
    const [prefixError, setPrefixError] = useState(null);
    const [colSaving, setColSaving] = useState(false);
    const [colSaved, setColSaved] = useState(false);
    const [colError, setColError] = useState(null);

    useEffect(() => {
        api.get("/settings/orders")
            .then(({ data }) => {
                setTableCols(data?.settings?.tableColumns ?? {});
                setPrefix((data?.settings?.numberPrefix ?? "ORD-").replace(/-$/, ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handlePrefixSave = async () => {
        setPrefixSaving(true);
        setPrefixError(null);
        try {
            await api.put("/settings/orders", { numberPrefix: (prefix.trim() || "ORD") + "-" });
            setPrefixSaved(true);
            setTimeout(() => setPrefixSaved(false), 3000);
        } catch {
            setPrefixError(t("settings.tableColumns.saveFailed"));
        } finally {
            setPrefixSaving(false);
        }
    };

    const handleColSave = async () => {
        setColSaving(true);
        setColError(null);
        try {
            await api.put("/settings/orders", { tableColumns: tableCols });
            setColSaved(true);
            setTimeout(() => setColSaved(false), 3000);
        } catch {
            setColError(t("settings.tableColumns.saveFailed"));
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

    const errors = [prefixError, colError].filter(Boolean);

    return (
        <Box>
            {errors.map((e) => (
                <Alert key={e} severity="error" sx={{ mb: 2 }}>{e}</Alert>
            ))}
            <Grid container spacing={3} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard
                        title={t("settings.numberPrefix.title")}
                        description={t("settings.numberPrefix.descOrders", { example: `${(prefix || "ORD") + "-"}00000001` })}
                        onSave={handlePrefixSave}
                        saving={prefixSaving}
                        saved={prefixSaved}
                    >
                        <Box sx={{ px: 3, py: 2 }}>
                            <TextField
                                label={t("settings.numberPrefix.label")}
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                size="small"
                                fullWidth
                                inputProps={{ maxLength: 10 }}
                            />
                        </Box>
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard
                        title={t("settings.tableColumns.title")}
                        description={t("settings.tableColumns.descOrders")}
                        onSave={handleColSave}
                        saving={colSaving}
                        saved={colSaved}
                    >
                        <ToggleRow label={t("orders.col.order", "Order Ref")} enabled disabled />
                        {ORDER_COL_KEYS.map((key) => (
                            <React.Fragment key={key}>
                                <Divider />
                                <ToggleRow
                                    label={t(`orders.col.${key}`, key)}
                                    enabled={tableCols[key] !== false}
                                    onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))}
                                />
                            </React.Fragment>
                        ))}
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}
