import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, CircularProgress, Alert, Avatar, InputAdornment, IconButton, Divider } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InventoryIcon from "@mui/icons-material/Inventory2";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "../context/AuthContext";
import { useBranding } from "../context/BrandingContext";
import { useTranslation } from "react-i18next";

const TOP_SUPPORTERS = [
    "The Cross Stitch Club"
];

const BMC_USERNAME = "Jordeatsu";

export default function LoginPage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const branding = useBranding();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!username.trim() || !password) {
            setError(t("auth.fillInFields", "Please enter your username and password."));
            return;
        }
        setSubmitting(true);
        try {
            await login(username.trim(), password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.error ?? t("auth.loginFailed", "Login failed. Please try again."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                px: { xs: 0, md: 3 },
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    minHeight: { xs: "100vh", md: 600 },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    borderRadius: { xs: 0, md: 4 },
                    overflow: "hidden",
                    boxShadow: { xs: "none", md: "0 16px 48px rgba(0,0,0,0.18)" },
                }}
            >
                {/* ── Left — branding panel ───────────────────────────────── */}
                <Box
                    sx={{
                        flex: 1,
                        background: "linear-gradient(160deg, #565264 0%, #A6808C 100%)",
                        px: { xs: 4, md: 5 },
                        py: { xs: 5, md: 6 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        color: "white",
                    }}
                >
                    {/* App identity */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", mb: 4 }}>
                        {branding.logo ? (
                            <Avatar
                                src={branding.logo}
                                variant="rounded"
                                sx={{ width: 80, height: 80, mb: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
                            />
                        ) : (
                            <Avatar
                                variant="rounded"
                                sx={{ width: 80, height: 80, mb: 2, bgcolor: "rgba(255,255,255,0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}
                            >
                                <InventoryIcon sx={{ fontSize: 44, color: "white" }} />
                            </Avatar>
                        )}
                        <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2, mb: 1 }}>
                            {branding.businessName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            {t("auth.tagline", "Your crafting inventory, organised.")}
                        </Typography>
                    </Box>

                    {/* Top supporters */}
                    <Box
                        sx={{
                            bgcolor: "rgba(255,255,255,0.12)",
                            borderRadius: 3,
                            px: 3,
                            py: 2.5,
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                            <FavoriteIcon sx={{ fontSize: 16, color: "#FFCAB1" }} />
                            <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.9 }}>
                                {t("auth.topSupporters", "Top Supporters")}
                            </Typography>
                        </Box>
                        {TOP_SUPPORTERS.map((name, i) => (
                            <Typography key={i} variant="body2" sx={{ py: 0.4, opacity: 0.9, borderBottom: i < TOP_SUPPORTERS.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                                {name}
                            </Typography>
                        ))}
                    </Box>

                    {/* BuyMeACoffee */}
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                        <a
                            href={`https://www.buymeacoffee.com/${BMC_USERNAME}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-block" }}
                        >
                            <img
                                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=Jordeatsu&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                                alt={t("footer.buyMeACoffee", "Buy Me A Coffee")}
                                style={{ height: 40, borderRadius: 8 }}
                            />
                        </a>
                    </Box>
                </Box>

                {/* ── Right — login form ──────────────────────────────────── */}
                <Box
                    sx={{
                        flex: 1,
                        bgcolor: "background.paper",
                        px: { xs: 4, md: 5 },
                        py: { xs: 5, md: 6 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h5" fontWeight={600} color="text.primary" mb={0.75}>
                        {t("auth.welcomeBack", "Welcome back")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={4}>
                        {t("auth.signInToContinue", "Sign in to continue")}
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label={t("auth.usernameOrEmail", "Username or Email")}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            required
                            autoFocus
                            autoComplete="username"
                            disabled={submitting}
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            label={t("auth.password", "Password")}
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            autoComplete="current-password"
                            disabled={submitting}
                            sx={{ mb: error ? 2.5 : 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setShowPass((p) => !p)} edge="end" tabIndex={-1}>
                                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {error && (
                            <Alert severity="error" sx={{ mb: 2.5 }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={submitting}
                            endIcon={!submitting && <ArrowForwardIcon />}
                            sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
                        >
                            {submitting ? <CircularProgress size={22} color="inherit" /> : t("auth.signIn", "Sign In")}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="caption" color="text.disabled" align="center" sx={{ lineHeight: 1.6 }}>
                        {t("auth.loginFooter", "Your inventory data is stored locally and never shared.")}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

