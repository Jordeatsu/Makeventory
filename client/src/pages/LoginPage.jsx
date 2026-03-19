import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, Alert, Avatar, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InventoryIcon from "@mui/icons-material/Inventory2";
import { useAuth } from "../context/AuthContext";
import api from "../api";

export default function LoginPage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [branding, setBranding] = useState({ businessName: "Makeventory", logo: null });
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (user) navigate("/", { replace: true });
    }, [user, navigate]);

    // Fetch business name + logo for the login card header
    useEffect(() => {
        api.get("/public/business")
            .then((res) => setBranding(res.data))
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!username.trim() || !password) {
            setError("Please enter your username and password.");
            return;
        }
        setSubmitting(true);
        try {
            await login(username.trim(), password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.error ?? "Login failed. Please try again.");
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
                px: 2,
            }}
        >
            <Card elevation={0} variant="outlined" sx={{ width: "100%", maxWidth: 400, borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Branding */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
                        {branding.logo ? (
                            <Avatar src={branding.logo} variant="rounded" sx={{ width: 72, height: 72, mb: 1.5 }} />
                        ) : (
                            <Avatar variant="rounded" sx={{ width: 72, height: 72, mb: 1.5, bgcolor: "primary.dark" }}>
                                <InventoryIcon sx={{ fontSize: 38, color: "primary.contrastText" }} />
                            </Avatar>
                        )}
                        <Typography variant="h5" align="center">
                            {branding.businessName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                            Sign in to continue
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField label="Username or Email" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth required size="small" autoFocus autoComplete="username" disabled={submitting} sx={{ mb: 2 }} />
                        <TextField
                            label="Password"
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            required
                            size="small"
                            autoComplete="current-password"
                            disabled={submitting}
                            sx={{ mb: error ? 2 : 3 }}
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
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Button type="submit" variant="contained" fullWidth size="large" disabled={submitting}>
                            {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
