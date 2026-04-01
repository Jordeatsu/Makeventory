import React, { useState, useEffect, useCallback } from "react";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, Typography } from "@mui/material";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api";

// Maps markdown elements to MUI Typography / structural components so the
// release notes feel native to the app's design system.
const MD_COMPONENTS = {
    h1: ({ children }) => (
        <Typography variant="h6" fontWeight={700} mt={2} mb={0.5}>
            {children}
        </Typography>
    ),
    h2: ({ children }) => (
        <Typography variant="subtitle1" fontWeight={700} mt={2} mb={0.5}>
            {children}
        </Typography>
    ),
    h3: ({ children }) => (
        <Typography variant="subtitle2" fontWeight={700} mt={1.5} mb={0.5}>
            {children}
        </Typography>
    ),
    p: ({ children }) => (
        <Typography variant="body2" mb={1}>
            {children}
        </Typography>
    ),
    ul: ({ children }) => (
        <List dense disablePadding sx={{ pl: 2, mb: 1, listStyleType: "disc", display: "list-item" === "list-item" ? "block" : undefined }}>
            {children}
        </List>
    ),
    ol: ({ children }) => (
        <List dense disablePadding component="ol" sx={{ pl: 2, mb: 1 }}>
            {children}
        </List>
    ),
    li: ({ children }) => (
        <ListItem disableGutters disablePadding sx={{ display: "list-item", pl: 0, py: 0.25 }}>
            <Typography variant="body2" component="span">
                {children}
            </Typography>
        </ListItem>
    ),
    code: ({ inline, children }) =>
        inline ? (
            <Box component="code" sx={{ px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: "action.hover", fontFamily: "monospace", fontSize: "0.8rem" }}>
                {children}
            </Box>
        ) : (
            <Box component="pre" sx={{ p: 1.5, borderRadius: 1, bgcolor: "action.hover", fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", overflowX: "auto", mb: 1 }}>
                {children}
            </Box>
        ),
    blockquote: ({ children }) => <Box sx={{ borderLeft: 3, borderColor: "divider", pl: 2, my: 1, color: "text.secondary" }}>{children}</Box>,
    hr: () => <Divider sx={{ my: 1.5 }} />,
    a: ({ href, children }) => (
        <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main" }}>
            {children}
        </Box>
    ),
};

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
        try {
            await api.post("/system/update");
            setStatus("restarting");
            // Poll until the server is back up, then reload in place
            setTimeout(() => {
                const id = setInterval(() => {
                    api.get("/system/update-check")
                        .then(() => {
                            clearInterval(id);
                            window.location.reload();
                        })
                        .catch(() => {});
                }, 3000);
            }, 10000);
        } catch {
            setStatus("error");
            setUpdating(false);
            setLogOpen(false);
        }
    };

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
                        {t("update.changeLog")}
                    </Button>
                }
                sx={{ borderRadius: 0, py: 0.5 }}
            >
                {t("update.available", { tag: updateInfo.remoteTag })}
            </Alert>

            {/* Change Log Modal */}
            <Dialog open={logOpen} onClose={updating || status === "restarting" ? undefined : () => setLogOpen(false)} disableEscapeKeyDown={updating || status === "restarting"} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SystemUpdateAltIcon fontSize="small" />
                    {t("update.whatsNew", { tag: updateInfo.remoteTag })}
                </DialogTitle>
                <DialogContent dividers>
                    {status === "restarting" ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 2 }}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                {t("update.installing")}
                            </Typography>
                        </Box>
                    ) : updateInfo?.releaseNotes ? (
                        <Box sx={{ "& > *:first-of-type": { mt: 0 } }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                                {updateInfo.releaseNotes}
                            </ReactMarkdown>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t("update.noReleaseNotes")}
                        </Typography>
                    )}
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={() => setLogOpen(false)} color="inherit" disabled={updating || status === "restarting"}>
                        {t("common.cancel")}
                    </Button>
                    <Button variant="contained" startIcon={updating ? <CircularProgress size={14} color="inherit" /> : <SystemUpdateAltIcon />} onClick={handleUpdate} disabled={updating}>
                        {updating ? t("update.updating") : t("update.updateNow")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
