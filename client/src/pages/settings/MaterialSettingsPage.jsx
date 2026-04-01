import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Grid, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import MaterialSettingsModal from "../../components/modals/MaterialSettingsModal";
import { useTranslation } from "react-i18next";
import api from "../../api";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const MAT_COL_KEYS = ["type", "colour", "inStock"];

function SettingRow({ label, description, value }) {
    return (
        <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                    {description && <Typography variant="caption" color="text.secondary">{description}</Typography>}
                </Box>
                <Typography variant="body2" sx={{ ml: 2, whiteSpace: "nowrap" }}>{value}</Typography>
            </Stack>
        </Box>
    );
}

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

function SectionCard({ title, description, onSave, saving, saved, headerAction, children }) {
    return (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
                    {headerAction ?? (onSave ? (
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
                    ) : null)}
                </Stack>
                {description && <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>{description}</Typography>}
            </Box>
            <Divider />
            {children}
        </Paper>
    );
}

export default function MaterialSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [prefixSaving, setPrefixSaving] = useState(false);
    const [prefixSaved, setPrefixSaved] = useState(false);
    const [prefixError, setPrefixError] = useState(null);
    const [colSaving, setColSaving] = useState(false);
    const [colSaved, setColSaved] = useState(false);
    const [colError, setColError] = useState(null);

    useEffect(() => {
        api.get("/settings/materials")
            .then(({ data }) => {
                const s = data?.settings ?? {};
                setSettings(s);
                setTableCols(s.tableColumns ?? {});
                setPrefix((s.numberPrefix ?? "MTL-").replace(/-$/, ""));
            })
            .catch(() => setLoadError(t("settings.materialSettings.loadFailed", "Failed to load settings.")))
            .finally(() => setLoading(false));
    }, []);

    const handlePrefixSave = async () => {
        setPrefixSaving(true);
        setPrefixError(null);
        try {
            await api.put("/settings/materials", { numberPrefix: (prefix.trim() || "MTL") + "-" });
            setPrefixSaved(true);
            setTimeout(() => setPrefixSaved(false), 3000);
        } catch {
            setPrefixError(t("settings.numberPrefix.saveFailed", "Failed to save prefix."));
        } finally {
            setPrefixSaving(false);
        }
    };

    const handleColSave = async () => {
        setColSaving(true);
        setColError(null);
        try {
            await api.put("/settings/materials", { tableColumns: tableCols });
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

    const errors = [loadError, prefixError, colError].filter(Boolean);

    return (
        <Box>
            {errors.map((e) => (
                <Alert key={e} severity="error" sx={{ mb: 2 }}>{e}</Alert>
            ))}
            <Grid container spacing={3} alignItems="flex-start">
                {/* Left — Material Defaults */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard
                        title={t("settings.materialSettings.title")}
                        description={t("settings.materialSettings.subtitle")}
                        headerAction={
                            <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                startIcon={<EditIcon />}
                                onClick={() => setModalOpen(true)}
                                sx={{ borderColor: "rgba(255,255,255,0.5)", color: "inherit", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                            >
                                {t("common.edit")}
                            </Button>
                        }
                    >
                        {settings && (
                            <>
                                <SettingRow
                                    label={t("settings.materialSettings.defaultLowStock")}
                                    description={t("settings.materialSettings.defaultLowStockDesc")}
                                    value={settings.defaultLowStockThreshold}
                                />
                                <Divider />
                                <SettingRow
                                    label={t("settings.materialSettings.currency")}
                                    description={t("settings.materialSettings.currencyDesc")}
                                    value={`${CURRENCY_SYMBOLS[settings.currency] ?? ""} ${settings.currency}`}
                                />
                                <Divider />
                                <SettingRow
                                    label={t("settings.materialSettings.autoDeduct")}
                                    description={t("settings.materialSettings.autoDeductDesc")}
                                    value={settings.autoDeductOnOrderComplete ? t("common.on") : t("common.off")}
                                />
                                <Divider />
                                <SettingRow
                                    label={t("settings.materialSettings.trackFractional")}
                                    description={t("settings.materialSettings.trackFractionalDesc")}
                                    value={settings.trackFractionalQuantities ? t("common.on") : t("common.off")}
                                />
                            </>
                        )}
                    </SectionCard>
                </Grid>

                {/* Right — Number Prefix + Table Columns */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack gap={3}>
                        <SectionCard
                            title={t("settings.numberPrefix.title")}
                            description={t("settings.numberPrefix.descMaterials", { example: `${(prefix || "MTL") + "-"}00000001` })}
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
                        <SectionCard
                            title={t("settings.tableColumns.title")}
                            description={t("settings.tableColumns.descMaterials")}
                            onSave={handleColSave}
                            saving={colSaving}
                            saved={colSaved}
                        >
                            <ToggleRow label={t("materials.col.name", "Name")} enabled disabled />
                            {MAT_COL_KEYS.map((key) => (
                                <React.Fragment key={key}>
                                    <Divider />
                                    <ToggleRow
                                        label={t(`materials.col.${key}`, key)}
                                        enabled={tableCols[key] !== false}
                                        onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))}
                                    />
                                </React.Fragment>
                            ))}
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>
            <MaterialSettingsModal
                open={modalOpen}
                current={settings}
                onClose={() => setModalOpen(false)}
                onSaved={(updated) => setSettings(updated)}
            />
        </Box>
    );
}
