import React, { useState } from "react";
import { Box, Typography, TextField, Button, CircularProgress, Alert, InputAdornment, IconButton, Grid } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { createAccount, updateAccount } from "../api";

const EMPTY = {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountStep({ onComplete, savedData, onSave }) {
    const [fields, setFields] = useState(savedData ? { firstName: savedData.firstName, lastName: savedData.lastName, email: savedData.email, username: savedData.username, password: "", confirm: "" } : EMPTY);
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [done, setDone] = useState(false);

    const isUpdate = !!savedData;

    const set = (field) => (e) => setFields((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!fields.firstName.trim()) e.firstName = "First name is required.";
        if (!fields.lastName.trim()) e.lastName = "Last name is required.";
        if (!fields.email.trim()) e.email = "Email is required.";
        else if (!emailRe.test(fields.email)) e.email = "Enter a valid email address.";
        if (!fields.username.trim()) e.username = "Username is required.";
        if (!isUpdate) {
            if (!fields.password) e.password = "Password is required.";
            else if (fields.password.length < 8) e.password = "Password must be at least 8 characters.";
            if (!fields.confirm) e.confirm = "Please confirm your password.";
            else if (fields.confirm !== fields.password) e.confirm = "Passwords do not match.";
        } else {
            if (fields.password) {
                if (fields.password.length < 8) e.password = "Password must be at least 8 characters.";
                if (!fields.confirm) e.confirm = "Please confirm your new password.";
                else if (fields.confirm !== fields.password) e.confirm = "Passwords do not match.";
            } else if (fields.confirm) {
                e.password = "Enter a new password or clear the confirm field.";
            }
        }
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            if (isUpdate) {
                const payload = {
                    firstName: fields.firstName.trim(),
                    lastName: fields.lastName.trim(),
                    email: fields.email.trim(),
                    username: fields.username.trim(),
                };
                if (fields.password) payload.password = fields.password;
                await updateAccount(payload);
            } else {
                await createAccount({
                    firstName: fields.firstName.trim(),
                    lastName: fields.lastName.trim(),
                    email: fields.email.trim(),
                    username: fields.username.trim(),
                    password: fields.password,
                });
            }
            onSave?.({
                firstName: fields.firstName.trim(),
                lastName: fields.lastName.trim(),
                email: fields.email.trim(),
                username: fields.username.trim(),
            });
            setDone(true);
            setTimeout(onComplete, 800);
        } catch (err) {
            setServerError(err.response?.data?.error ?? err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h5" gutterBottom>
                User Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {isUpdate ? "Update the administrator account details below." : "Create the administrator account you'll use to log in to Makeventory."}
            </Typography>

            <Grid container spacing={2}>
                {/* Name row */}
                <Grid item xs={12} sm={6}>
                    <TextField label="First Name" value={fields.firstName} onChange={set("firstName")} error={!!errors.firstName} helperText={errors.firstName || " "} fullWidth required size="small" disabled={submitting || done} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Last Name" value={fields.lastName} onChange={set("lastName")} error={!!errors.lastName} helperText={errors.lastName || " "} fullWidth required size="small" disabled={submitting || done} />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
                    <TextField label="Email Address" type="email" value={fields.email} onChange={set("email")} error={!!errors.email} helperText={errors.email || " "} fullWidth required size="small" disabled={submitting || done} />
                </Grid>

                {/* Username */}
                <Grid item xs={12}>
                    <TextField label="Username" value={fields.username} onChange={set("username")} error={!!errors.username} helperText={errors.username || " "} fullWidth required size="small" disabled={submitting || done} inputProps={{ autoComplete: "off", spellCheck: false }} />
                </Grid>

                {/* Password */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Password"
                        type={showPass ? "text" : "password"}
                        value={fields.password}
                        onChange={set("password")}
                        error={!!errors.password}
                        helperText={errors.password || (isUpdate ? "Leave blank to keep your current password." : "Minimum 8 characters.")}
                        fullWidth
                        required={!isUpdate}
                        size="small"
                        disabled={submitting || done}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Confirm Password"
                        type={showConfirm ? "text" : "password"}
                        value={fields.confirm}
                        onChange={set("confirm")}
                        error={!!errors.confirm}
                        helperText={errors.confirm || " "}
                        fullWidth
                        required={!isUpdate}
                        size="small"
                        disabled={submitting || done}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} edge="end" tabIndex={-1}>
                                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            {serverError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {serverError}
                </Alert>
            )}

            {done && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {isUpdate ? "Account updated — moving to Business Profile…" : "Account created — moving to Business Profile…"}
                </Alert>
            )}

            {!done && (
                <Box sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 140 }}>
                        {submitting ? <CircularProgress size={20} color="inherit" /> : isUpdate ? "Update Account" : "Create Account"}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
