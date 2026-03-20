import React, { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./services/theme";
import { Box, Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import StorageIcon from "@mui/icons-material/Storage";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import ExtensionIcon from "@mui/icons-material/Extension";
import InventoryIcon from "@mui/icons-material/Inventory2";

import DatabaseStep from "./components/DatabaseStep";
import DependenciesStep from "./components/DependenciesStep";
import AccountStep from "./components/AccountStep";
import BusinessStep from "./components/BusinessStep";
import ModuleStep from "./components/ModuleStep";
import LocaleStep from "./components/LocaleStep";
import LanguageIcon from "@mui/icons-material/Language";

const DRAWER_WIDTH = 270;

const STEPS = [
    { id: "locale", label: "Language & Currency", Icon: LanguageIcon },
    { id: "dependencies", label: "Install Dependencies", Icon: DownloadDoneIcon },
    { id: "database", label: "Database Setup", Icon: StorageIcon },
    { id: "account", label: "User Account", Icon: PersonAddIcon },
    { id: "business", label: "Business Profile", Icon: BusinessIcon },
    { id: "modules", label: "Module Selection", Icon: ExtensionIcon },
];

// status: 'complete' | 'active' | 'pending' | 'error'
const INITIAL_STATUS = {
    locale: "active",
    dependencies: "pending",
    database: "pending",
    account: "pending",
    business: "pending",
    modules: "pending",
};

function StepIcon({ status }) {
    if (status === "complete") return <CheckCircleIcon sx={{ color: "#C1D7AE", fontSize: 20 }} />;
    if (status === "error") return <ErrorIcon sx={{ color: "#FFCAB1", fontSize: 20 }} />;
    if (status === "active") return <HourglassEmptyIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }} />;
    return <RadioButtonUncheckedIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />;
}

export default function App() {
    const [stepStatus, setStepStatus] = useState(INITIAL_STATUS);
    const [currentStep, setCurrentStep] = useState("locale");

    const [savedLocale, setSavedLocale] = useState({ language: 'en', currency: 'GBP' });
    const [savedDbName, setSavedDbName] = useState("");
    const [savedAccount, setSavedAccount] = useState(null);
    const [savedBusiness, setSavedBusiness] = useState(null);

    const markComplete = (stepId) => {
        setStepStatus((prev) => ({ ...prev, [stepId]: "complete" }));
        const idx = STEPS.findIndex((s) => s.id === stepId);
        if (idx < STEPS.length - 1) {
            const nextId = STEPS[idx + 1].id;
            setStepStatus((prev) => ({ ...prev, [nextId]: "active" }));
            setCurrentStep(nextId);
        }
    };

    const markError = (stepId) => {
        setStepStatus((prev) => ({ ...prev, [stepId]: "error" }));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                {/* ── Sidebar ──────────────────────────────────────────────────── */}
                <Box
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        bgcolor: "primary.dark",
                        borderRight: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Logo */}
                    <Box sx={{ px: 2.5, pt: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.2 }}>
                        <InventoryIcon sx={{ color: "primary.contrastText", fontSize: 26 }} />
                        <Box>
                            <Typography variant="h6" sx={{ color: "primary.contrastText" }} lineHeight={1.1}>
                                Makeventory
                            </Typography>
                            <Typography variant="caption" sx={{ color: "primary.light", opacity: 0.8 }}>
                                Installation Wizard
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

                    {/* Step list */}
                    <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
                        {STEPS.map(({ id, label }) => {
                            const status = stepStatus[id];
                            const isActive = currentStep === id;
                            return (
                                <ListItem
                                    key={id}
                                    onClick={() => {
                                        if (status !== "pending") setCurrentStep(id);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        bgcolor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                                        border: isActive ? "1px solid rgba(255,255,255,0.25)" : "1px solid transparent",
                                        py: 1,
                                        cursor: status !== "pending" ? "pointer" : "default",
                                        "&:hover": status !== "pending" ? { bgcolor: "rgba(255,255,255,0.10)" } : {},
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 34 }}>
                                        <StepIcon status={status} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={label}
                                        primaryTypographyProps={{
                                            variant: "body2",
                                            fontWeight: isActive ? 600 : 400,
                                            color: status === "pending" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>

                    {/* Footer */}
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                            v1.0.0
                        </Typography>
                    </Box>
                </Box>

                {/* ── Main panel ───────────────────────────────────────────────── */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        overflow: "auto",
                        p: { xs: 3, md: 5 },
                        bgcolor: "background.default",
                    }}
                >
                    {currentStep === "locale" && (
                        <LocaleStep
                            savedLocale={savedLocale}
                            onComplete={(locale) => { setSavedLocale(locale); markComplete("locale"); }}
                        />
                    )}

                    {currentStep === "dependencies" && <DependenciesStep alreadyComplete={stepStatus.dependencies === "complete"} onComplete={() => markComplete("dependencies")} />}

                    {currentStep === "database" && <DatabaseStep savedDbName={savedDbName} savedLocale={savedLocale} onDbNameSaved={(name) => setSavedDbName(name)} onComplete={() => markComplete("database")} onError={() => markError("database")} />}

                    {currentStep === "account" && <AccountStep savedData={savedAccount} onSave={(data) => setSavedAccount(data)} onComplete={() => markComplete("account")} />}
                    {currentStep === "business" && <BusinessStep savedData={savedBusiness} onSave={(data) => setSavedBusiness(data)} onComplete={() => markComplete("business")} />}
                    {currentStep === "modules" && <ModuleStep onComplete={() => markComplete("modules")} />}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
