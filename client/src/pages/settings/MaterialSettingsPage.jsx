import React, { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MaterialSettingsModal from "../../components/modals/MaterialSettingsModal";
import { useTranslation } from "react-i18next";
import api from "../../api";
import SectionCard from "../../components/settings/SectionCard";
import ToggleRow from "../../components/settings/ToggleRow";
import { useSettingsSave } from "../../hooks/useSettingsSave";

const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };
const MAT_COL_KEYS = ["type", "colour", "inStock"];

function SettingRow({ label, description, value }) {
    return (
        <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
                <Typography variant="body2" sx={{ ml: 2, whiteSpace: "nowrap" }}>
                    {value}
                </Typography>
            </Stack>
        </Box>
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

    const prefix$ = useSettingsSave("/settings/materials", "settings.numberPrefix.saveFailed");
    const cols$ = useSettingsSave("/settings/materials", "settings.tableColumns.saveFailed");

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

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const errors = [loadError, prefix$.error, cols$.error].filter(Boolean);

    return (
        <Box>
            {errors.map((e) => (
                <Alert key={e} severity="error" sx={{ mb: 2 }}>
                    {e}
                </Alert>
            ))}
            <Grid container spacing={3} alignItems="flex-start">
                {/* Left — Material Defaults */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard
                        title={t("settings.materialSettings.title")}
                        description={t("settings.materialSettings.subtitle")}
                        headerAction={
                            <Button size="small" variant="outlined" color="inherit" startIcon={<EditIcon />} onClick={() => setModalOpen(true)} sx={{ borderColor: "rgba(255,255,255,0.5)", color: "inherit", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                                {t("common.edit")}
                            </Button>
                        }
                    >
                        {settings && (
                            <>
                                <SettingRow label={t("settings.materialSettings.defaultLowStock")} description={t("settings.materialSettings.defaultLowStockDesc")} value={settings.defaultLowStockThreshold} />
                                <Divider />
                                <SettingRow label={t("settings.materialSettings.currency")} description={t("settings.materialSettings.currencyDesc")} value={`${CURRENCY_SYMBOLS[settings.currency] ?? ""} ${settings.currency}`} />
                                <Divider />
                                <SettingRow label={t("settings.materialSettings.autoDeduct")} description={t("settings.materialSettings.autoDeductDesc")} value={settings.autoDeductOnOrderComplete ? t("common.on") : t("common.off")} />
                                <Divider />
                                <SettingRow label={t("settings.materialSettings.trackFractional")} description={t("settings.materialSettings.trackFractionalDesc")} value={settings.trackFractionalQuantities ? t("common.on") : t("common.off")} />
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
                            onSave={() => prefix$.save({ numberPrefix: (prefix.trim() || "MTL") + "-" })}
                            saving={prefix$.saving}
                            saved={prefix$.saved}
                        >
                            <Box sx={{ px: 3, py: 2 }}>
                                <TextField label={t("settings.numberPrefix.label")} value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                            </Box>
                        </SectionCard>
                        <SectionCard title={t("settings.tableColumns.title")} description={t("settings.tableColumns.descMaterials")} onSave={() => cols$.save({ tableColumns: tableCols })} saving={cols$.saving} saved={cols$.saved}>
                            <ToggleRow label={t("materials.col.name", "Name")} enabled disabled />
                            {MAT_COL_KEYS.map((key) => (
                                <React.Fragment key={key}>
                                    <Divider />
                                    <ToggleRow label={t(`materials.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} />
                                </React.Fragment>
                            ))}
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>
            <MaterialSettingsModal open={modalOpen} current={settings} onClose={() => setModalOpen(false)} onSaved={(updated) => setSettings(updated)} />
        </Box>
    );
}
