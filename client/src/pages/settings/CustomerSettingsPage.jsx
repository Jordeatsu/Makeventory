import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Divider, Grid, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../../api";
import SectionCard from "../../components/settings/SectionCard";
import ToggleRow from "../../components/settings/ToggleRow";
import { useSettingsSave } from "../../hooks/useSettingsSave";

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

export default function CustomerSettingsPage() {
    const { t } = useTranslation();
    const [fields, setFields] = useState(DEFAULT_FIELDS);
    const [tableCols, setTableCols] = useState({});
    const [prefix, setPrefix] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const fields$ = useSettingsSave("/settings/customers", "settings.customerSettings.saveFailed");
    const prefix$ = useSettingsSave("/settings/customers", "settings.numberPrefix.saveFailed");
    const cols$ = useSettingsSave("/settings/customers", "settings.tableColumns.saveFailed");

    useEffect(() => {
        api.get("/settings/customers")
            .then(({ data }) => {
                if (data?.settings?.fields) {
                    setFields({ ...DEFAULT_FIELDS, ...data.settings.fields });
                }
                setTableCols(data?.settings?.tableColumns ?? {});
                setPrefix((data?.settings?.numberPrefix ?? "CST-").replace(/-$/, ""));
            })
            .catch(() => setLoadError(t("settings.customerSettings.loadFailed")))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const errors = [loadError, fields$.error, prefix$.error, cols$.error].filter(Boolean);

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
                    <SectionCard title={t("settings.customerSettings.title")} description={t("settings.customerSettings.subtitle")} onSave={() => fields$.save({ fields })} saving={fields$.saving} saved={fields$.saved} sx={{ height: "100%" }}>
                        <ToggleRow label={t("settings.customerSettings.nameField")} description={t("settings.customerSettings.nameFieldDesc")} enabled disabled />
                        {FIELD_KEYS.map((key) => (
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
                        <SectionCard
                            title={t("settings.numberPrefix.title")}
                            description={t("settings.numberPrefix.descCustomers", { example: `${(prefix || "CST") + "-"}00000001` })}
                            onSave={() => prefix$.save({ numberPrefix: (prefix.trim() || "CST") + "-" })}
                            saving={prefix$.saving}
                            saved={prefix$.saved}
                        >
                            <Box sx={{ px: 3, py: 2 }}>
                                <TextField label={t("settings.numberPrefix.label")} value={prefix} onChange={(e) => setPrefix(e.target.value)} size="small" fullWidth inputProps={{ maxLength: 10 }} />
                            </Box>
                        </SectionCard>

                        <SectionCard title={t("settings.tableColumns.title")} description={t("settings.tableColumns.descCustomers")} onSave={() => cols$.save({ tableColumns: tableCols })} saving={cols$.saving} saved={cols$.saved}>
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
