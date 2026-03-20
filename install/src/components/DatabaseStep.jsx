import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Alert, TextField, Button, CircularProgress, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import * as api from "../api";

// ─── Status constants ────────────────────────────────────────────────────────
const S = { RUNNING: "running", SUCCESS: "success", ERROR: "error", INFO: "info" };

// ─── A single log line ───────────────────────────────────────────────────────
function LogLine({ status, message }) {
    const icon = {
        [S.RUNNING]: <CircularProgress size={14} thickness={5} />,
        [S.SUCCESS]: <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />,
        [S.ERROR]: <ErrorIcon sx={{ color: "error.main", fontSize: 16 }} />,
        [S.INFO]: <InfoIcon sx={{ color: "info.main", fontSize: 16 }} />,
    }[status] ?? <FiberManualRecordIcon sx={{ color: "text.disabled", fontSize: 8, mt: "4px" }} />;

    return (
        <ListItem dense disableGutters sx={{ py: 0.4, alignItems: "flex-start" }}>
            <ListItemIcon sx={{ minWidth: 26, mt: "2px" }}>{icon}</ListItemIcon>
            <ListItemText
                primary={message}
                primaryTypographyProps={{
                    variant: "body2",
                    color: status === S.ERROR ? "error.main" : "text.primary",
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: "0.8rem",
                }}
            />
        </ListItem>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function DatabaseStep({ onComplete, onError, savedDbName, onDbNameSaved, savedLocale }) {
    const [log, setLog] = useState([]);
    const [phase, setPhase] = useState(savedDbName ? "locked" : "running");
    const [dbName, setDbName] = useState(savedDbName || "");
    const [dbNameError, setDbNameError] = useState("");
    const [creating, setCreating] = useState(false);

    const hasRun = useRef(false);

    // ── Helper: append a new line ──────────────────────────────────────────────
    const addLine = (message, status = S.INFO) => setLog((prev) => [...prev, { id: Date.now() + Math.random(), message, status }]);

    // ── Helper: update the LAST line ──────────────────────────────────────────
    const updateLast = (status, message) =>
        setLog((prev) => {
            if (!prev.length) return prev;
            const copy = [...prev];
            copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                status,
                ...(message !== undefined ? { message } : {}),
            };
            return copy;
        });

    // ── Step 5: ensure MongoDB is reachable on 27017 ──────────────────────────
    const runEnsureRunning = async () => {
        addLine("Ensuring MongoDB is running on port 27017…", S.RUNNING);
        const res = await api.ensureMongoRunning();
        if (res.data.running) {
            updateLast(S.SUCCESS, "MongoDB is running and accepting connections.");
            setPhase("enter_db_name");
        } else {
            updateLast(S.ERROR, "MongoDB did not become reachable. Please start it manually and re-run the installer.");
            onError();
        }
    };

    // ── Docker container flow (steps 3–5) ─────────────────────────────────────
    const runDockerFlow = async () => {
        addLine("Checking for existing MongoDB Docker container…", S.RUNNING);
        const {
            data: { exists, running },
        } = await api.checkDockerContainer();

        if (!exists) {
            updateLast(S.INFO, "No MongoDB container found.");
            addLine("Creating MongoDB container (this may take a moment)…", S.RUNNING);
            const create = await api.createDockerContainer();
            if (!create.data.success) {
                updateLast(S.ERROR, `Failed to create container: ${create.data.error}`);
                onError();
                return;
            }
            updateLast(S.SUCCESS, "MongoDB container created successfully.");
        } else if (!running) {
            updateLast(S.INFO, "MongoDB container found (currently stopped).");
            addLine("Starting MongoDB container…", S.RUNNING);
            const start = await api.startDockerContainer();
            if (!start.data.success) {
                updateLast(S.ERROR, `Failed to start container: ${start.data.error}`);
                onError();
                return;
            }
            updateLast(S.SUCCESS, "MongoDB container started.");
        } else {
            updateLast(S.SUCCESS, "MongoDB container is already running.");
        }

        await runEnsureRunning();
    };

    // ── Main detection sequence (runs once on mount) ───────────────────────────
    useEffect(() => {
        if (savedDbName) return; // already configured — show locked view
        if (hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            try {
                // Step 1 – Is mongod available on PATH?
                addLine("Checking for a local MongoDB installation…", S.RUNNING);
                const mongoCheck = await api.checkMongoDB();

                if (mongoCheck.data.available) {
                    updateLast(S.SUCCESS, "MongoDB installation found on this machine.");
                    await runEnsureRunning();
                    return;
                }

                updateLast(S.INFO, "MongoDB is not installed locally.");

                // Step 2 – Is Docker available?
                addLine("Checking for Docker…", S.RUNNING);
                const dockerCheck = await api.checkDocker();

                if (!dockerCheck.data.available) {
                    updateLast(S.ERROR, "Docker is not installed or not running.");
                    setPhase("hard_stop");
                    onError();
                    return;
                }

                updateLast(S.SUCCESS, "Docker is available.");
                await runDockerFlow();
            } catch (err) {
                addLine(`Unexpected error: ${err.message}`, S.ERROR);
                onError();
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── DB name validation ────────────────────────────────────────────────────
    const validateName = (val) => {
        if (!val) return "Database name is required.";
        if (!/^[a-zA-Z]+$/.test(val)) return "Only letters are allowed — no numbers or special characters.";
        return "";
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setDbName(val);
        setDbNameError(validateName(val));
    };

    const handleCreate = async () => {
        const err = validateName(dbName);
        if (err) {
            setDbNameError(err);
            return;
        }

        setCreating(true);
        try {
            await api.createDatabase(dbName, savedLocale);
            addLine(`Database "${dbName}" configured.`, S.SUCCESS);
            addLine("server/.env written with connection URI.", S.SUCCESS);
            onDbNameSaved?.(dbName);
            setPhase("complete");
            setTimeout(onComplete, 800);
        } catch (e) {
            setDbNameError(e.response?.data?.error ?? e.message);
        } finally {
            setCreating(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Database Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Makeventory requires MongoDB. We'll detect your setup and configure everything automatically.
            </Typography>

            {/* Activity log */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: "#0d1b2a",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    minHeight: 80,
                }}
            >
                <List dense disablePadding>
                    {log.map((item) => (
                        <LogLine key={item.id} status={item.status} message={item.message} />
                    ))}
                </List>
            </Paper>

            {/* Locked — already configured */}
            {phase === "locked" && (
                <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Database already configured. To change the database, re-run the installer.
                    </Alert>
                    <Box sx={{ display: "flex", alignItems: "flex-start", maxWidth: 440 }}>
                        <TextField label="Database Name" value={dbName} size="small" fullWidth disabled inputProps={{ autoComplete: "off", spellCheck: false }} />
                    </Box>
                </Box>
            )}

            {/* Hard stop */}
            {phase === "hard_stop" && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Installation cannot continue
                    </Typography>
                    MongoDB was not found on your system and Docker is not available. Please install one of the following, then re-run <code style={{ fontFamily: "monospace" }}>./install.sh</code>:
                    <ul style={{ marginTop: 8 }}>
                        <li>
                            <strong>MongoDB Community Edition</strong> — https://www.mongodb.com/try/download/community
                        </li>
                        <li>
                            <strong>Docker Desktop</strong> — https://www.docker.com/products/docker-desktop
                        </li>
                    </ul>
                </Alert>
            )}

            {/* Database name input */}
            {phase === "enter_db_name" && (
                <Fade in>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            Name your database
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Choose a name for your Makeventory database. Letters only (e.g. <em>makeventory</em>).
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", maxWidth: 440 }}>
                            <TextField label="Database Name" value={dbName} onChange={handleNameChange} error={!!dbNameError} helperText={dbNameError || " "} size="small" fullWidth autoFocus disabled={creating} inputProps={{ autoComplete: "off", spellCheck: false }} />
                            <Button variant="contained" onClick={handleCreate} disabled={creating || !!dbNameError || !dbName} sx={{ mt: 0.25, minWidth: 90 }}>
                                {creating ? <CircularProgress size={20} color="inherit" /> : "Create"}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            )}

            {/* Complete */}
            {phase === "complete" && <Alert severity="success">Database setup complete — moving to the next step…</Alert>}
        </Box>
    );
}
