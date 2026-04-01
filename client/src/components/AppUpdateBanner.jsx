import React, { useState, useEffect, useCallback } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useTranslation } from "react-i18next";
import api from "../api";

// How often (ms) to poll the server for a newer commit on origin/main.
const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default function AppUpdateBanner() {
    const { t } = useTranslation();
    const [updateInfo, setUpdateInfo] = useState(null); // { remoteTag, releaseNotes } when update available
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState(null); // null | 'restarting' | 'error'
    const [logOpen, setLogOpen] = useState(false);

    const check = useCallback(() => {
        api.get("/system/update-check")
            .then((r) => {
                if (!r.data.upToDate) {
                    setUpdateInfo({ remoteTag: r.data.remoteTag, releaseNotes: r.data.releaseNotes ?? null });
                } else {
                    setUpdateInfo(null);
                }
            })
            .catch(() => {}); // silently ignore — not a critical UI path
    }, []);

    useEffect(() => {
        check();
        const interval = setInterval(check, CHECK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [check]);

    const handleUpdate = async () => {
        setUpdating(true);
        setStatus(null);
        setLogOpen(false);
        try {
            await api.post("/system/update");
            setStatus("restarting");
            setUpdateInfo(null);
        } catch {
            setStatus("error");
            setUpdating(false);
        }
    };

    if (status === "restarting") {
        return (
            <Alert severity="success" sx={{ borderRadius: 0, py: 0.5 }}>
                {t("update.restarting")}
            </Alert>
        );
    }

    if (status === "error") {
        return (
            <Alert severity="error" onClose={() => setStatus(null)} sx={{ borderRadius: 0, py: 0.5 }}>
                {t("common.serverError")}
            </Alert>
        );
    }

    if (!updateInfo) return null;

    return (
        <>
            <Alert
                severity="info"
                icon={<SystemUpdateAltIcon />}
                action={
                    <Button color="inherit" size="small" onClick={() => setLogOpen(true)}>
                        See Change Log
                    </Button>
                }
                sx={{ borderRadius: 0, py: 0.5 }}
            >
                {t("update.available", { tag: updateInfo.remoteTag })}
            </Alert>

            {/* Change Log Modal */}
            <Dialog open={logOpen} onClose={() => setLogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SystemUpdateAltIcon fontSize="small" />
                    What&apos;s new in {updateInfo.remoteTag}
                </DialogTitle>
                <DialogContent dividers>
                    {updateInfo.releaseNotes ? (
                        <Box
                            component="pre"
                            sx={{
                                m: 0,
                                whiteSpace: "pre-wrap",
                                fontFamily: "inherit",
                                fontSize: "0.875rem",
                                lineHeight: 1.6,
                                color: "text.primary",
                            }}
                        >
                            {updateInfo.releaseNotes}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No release notes available for this version.
                        </Typography>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setLogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button variant="contained" startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <SystemUpdateAltIcon />} onClick={handleUpdate} disabled={updating}>
                        {updating ? t("update.updating") : t("update.updateNow")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
