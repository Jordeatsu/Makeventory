import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Divider, Grid, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../../api";
import SectionCard from "../../components/settings/SectionCard";
import ToggleRow from "../../components/settings/ToggleRow";
import { useSettingsSave } from "../../hooks/useSettingsSave";

const PROD_COL_KEYS = ["sku", "category", "estMaterialCost", "basePrice", "estMargin", "status"];

export default function ProductSettingsPage() {
    const { t } = useTranslation();
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);

    const prefix$ = useSettingsSave("/settings/products", "settings.numberPrefix.saveFailed");
    const cols$ = useSettingsSave("/settings/products", "settings.tableColumns.saveFailed");

    useEffect(() => {
        api.get("/settings/products")
            .then(({ data }) => {
                setTableCols(data?.settings?.tableColumns ?? {});
                setPrefix((data?.settings?.numberPrefix ?? "PRD-").replace(/-$/, ""));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const errors = [prefix$.error, cols$.error].filter(Boolean);

    return (
        <Box>
            {errors.map((e) => (
                <Alert key={e} severity="error" sx={{ mb: 2 }}>
                    {e}
                </Alert>
            ))}
            <Grid container spacing={3} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard
                        title={t("settings.numberPrefix.title")}
                        description={t("settings.numberPrefix.descProducts", { example: `${(prefix || "PRD") + "-"}00000001` })}
                        onSave={() => prefix$.save({ numberPrefix: (prefix.trim() || "PRD") + "-" })}
                        saving={prefix$.saving}
                        saved={prefix$.saved}
                    >
                        <Box sx={{ px: 3, py: 2 }}>
                            <TextField label={t("settings.numberPrefix.label")} value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                        </Box>
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title={t("settings.tableColumns.title")} description={t("settings.tableColumns.descProducts")} onSave={() => cols$.save({ tableColumns: tableCols })} saving={cols$.saving} saved={cols$.saved}>
                        <ToggleRow label={t("products.col.name", "Name")} enabled disabled />
                        {PROD_COL_KEYS.map((key) => (
                            <React.Fragment key={key}>
                                <Divider />
                                <ToggleRow label={t(`products.col.${key}`, key)} enabled={tableCols[key] !== false} onChange={(v) => setTableCols((prev) => ({ ...prev, [key]: v }))} />
                            </React.Fragment>
                        ))}
                    </SectionCard>
                </Grid>
            </Grid>
        </Box>
    );
}
