import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemText, Switch, Button, CircularProgress, Alert, Divider, Paper } from "@mui/material";
import { getModules, saveModules, completeInstall } from "../api";

export default function ModuleStep({ onComplete }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [serverError, setServerError] = useState("");

    useEffect(() => {
        getModules()
            .then((res) => setModules(res.data))
            .catch((err) => setServerError(err.response?.data?.error ?? err.message))
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id) => setModules((prev) => prev.map((m) => (m._id === id ? { ...m, isActive: !m.isActive } : m)));

    const handleSave = async () => {
        setSaving(true);
        setServerError("");
        try {
            await saveModules(modules.map(({ _id, isActive }) => ({ _id, isActive })));
            await completeInstall();
            setDone(true);
            setTimeout(onComplete, 800);
        } catch (err) {
            setServerError(err.response?.data?.error ?? err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Module Selection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose which modules to enable for your Makeventory installation. You can change these at any time from the admin settings.
            </Typography>

            {loading && <CircularProgress size={24} />}

            {!loading && modules.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <List disablePadding>
                        {modules.map((mod, i) => (
                            <React.Fragment key={mod._id}>
                                {i > 0 && <Divider />}
                                <ListItem sx={{ py: 1.5, px: 2 }} secondaryAction={<Switch checked={mod.isActive} onChange={() => toggle(mod._id)} disabled={saving || done} />}>
                                    <ListItemText primary={mod.name} secondary={mod.description} primaryTypographyProps={{ fontWeight: 600, variant: "body1" }} secondaryTypographyProps={{ variant: "body2" }} sx={{ pr: 6 }} />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {serverError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {serverError}
                </Alert>
            )}

            {done && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Modules saved — installation complete!
                </Alert>
            )}

            {!loading && !done && (
                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ minWidth: 140 }}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : "Save & Finish"}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
