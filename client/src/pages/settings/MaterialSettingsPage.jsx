import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import MaterialSettingsModal from "../../components/modals/MaterialSettingsModal";
import { useTranslation } from "react-i18next";
import api from "../../api";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

// Columns that can be toggled  (name + actions are always visible)
const MAT_COL_KEYS = ["type", "colour", "inStock"];

function SettingRow({ label, description, value }) {
    return (
        <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                <Typography variant="body2" color="text.primary" sx={{ ml: 2, whiteSpace: "nowrap" }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

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

export default function MaterialSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [tableCols, setTableCols] = useState({});
    const [colSaving, setColSaving] = useState(false);
    const [colSaved, setColSaved] = useState(false);
    const [colError, setColError] = useState(null);
    const [prefix, setPrefix] = useState("");
    const [prefixSaving, setPrefixSaving] = useState(false);
    const [prefixSaved, setPrefixSaved] = useState(false);
    const [prefixError, setPrefixError] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        fetch("/api/settings/materials", { credentials: "include" })
            .then((r) => (r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error))))
            .then(({ settings: data }) => {
                setSettings(data);
                setTableCols(data?.tableColumns ?? {});
                setPrefix((data?.numberPrefix ?? "MTL-").replace(/-$/, ""));
            })
            .catch((msg) => setError(msg || "Failed to load settings."))
            .finally(() => setLoading(false));
    }, []);

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

    const handlePrefixSave = async () => {
        setPrefixSaving(true);
        setPrefixError(null);
        try {
            await api.put("/settings/materials", { numberPrefix: (prefix.trim() || "MTL") + "-" });
            setPrefixSaved(true);
            setTimeout(() => setPrefixSaved(false), 3000);
        } catch {
            setPrefixError("Failed to save prefix.");
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

    return (
        <Box sx={{ maxWidth: 640, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <TuneIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>
                        {t("settings.materialSettings.title")}
                    </Typography>
                </Box>
                {settings && (
                    <Tooltip title={t("settings.materialSettings.editTitle")}>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setModalOpen(true)}>
                            {t("common.edit")}
                        </Button>
                    </Tooltip>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {settings && (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <SettingRow label={t("settings.materialSettings.defaultLowStock")} description={t("settings.materialSettings.defaultLowStockDesc")} value={settings.defaultLowStockThreshold} />
                    <Divider />
                    <SettingRow label={t("settings.materialSettings.currency")} description={t("settings.materialSettings.currencyDesc")} value={`${CURRENCY_SYMBOLS[settings.currency] ?? ""} ${settings.currency}`} />
                    <Divider />
                    <SettingRow label={t("settings.materialSettings.autoDeduct")} description={t("settings.materialSettings.autoDeductDesc")} value={settings.autoDeductOnOrderComplete ? t("common.on") : t("common.off")} />
                    <Divider />
                    <SettingRow label={t("settings.materialSettings.trackFractional")} description={t("settings.materialSettings.trackFractionalDesc")} value={settings.trackFractionalQuantities ? t("common.on") : t("common.off")} />
                </Paper>
            )}

            {/* Number Prefix */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={4} mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    {t("settings.numberPrefix.title")}
                </Typography>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handlePrefixSave} disabled={prefixSaving}>
                    {prefixSaving ? t("common.saving") : t("common.save")}
                </Button>
            </Stack>
            {prefixError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPrefixError(null)}>
                    {prefixError}
                </Alert>
            )}
            {prefixSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {t("settings.numberPrefix.saved")}
                </Alert>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
                {t("settings.numberPrefix.descMaterials", { example: `${(prefix || "MTL") + "-"}00000001` })}
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <TextField label={t("settings.numberPrefix.label")} value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                </Box>
            </Paper>

            {/* Table Column Visibility */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mt={4} mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    {t("settings.tableColumns.title")}
                </Typography>
                <Button variant="contained" size="small" startIcon={<SaveIcon />} onClick={handleColSave} disabled={colSaving}>
                    {colSaving ? t("common.saving") : t("common.save")}
                </Button>
            </Stack>
            {colError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setColError(null)}>
                    {colError}
                </Alert>
            )}
            {colSaved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {t("settings.tableColumns.saved")}
                </Alert>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
                {t("settings.tableColumns.descMaterials")}
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {/* Always-on: Name */}
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={500}>
                            {t("materials.col.name", "Name")}
                        </Typography>
                        <Tooltip title={t("settings.tableColumns.alwaysVisible")}>
                            <span>
                                <Switch checked disabled size="small" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>
                <Divider />
                {MAT_COL_KEYS.map((key, idx) => (
                    <ColToggleRow key={key} label={t(`materials.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} isLast={idx === MAT_COL_KEYS.length - 1} />
                ))}
            </Paper>

            <MaterialSettingsModal open={modalOpen} current={settings} onClose={() => setModalOpen(false)} onSaved={(updated) => setSettings(updated)} />
        </Box>
    );
}
