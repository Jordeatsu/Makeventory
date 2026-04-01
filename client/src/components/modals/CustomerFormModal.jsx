import React, { useState, useEffect } from "react";
import {
    Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, Grid, Stack, TextField, Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CountrySelect from "../common/CountrySelect";
import { useCustomerSettings } from "../../hooks/useCustomerSettings";

const EMPTY = {
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
};

export default function CustomerFormModal({ open, onClose, onSave, initial }) {
    const { fields } = useCustomerSettings();
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(initial ? { ...EMPTY, ...initial } : EMPTY);
    }, [initial, open]);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    const isEditing = Boolean(initial?._id);
    const hasAddressFields = fields.addressLine1 || fields.addressLine2 || fields.city || fields.state || fields.postcode || fields.country;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                            <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>
                            {isEditing ? "Edit Customer" : "New Customer"}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack gap={2.5}>
                        {/* Contact info */}
                        <Box>
                            <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                <PersonIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} fontSize="0.7rem">
                                    Contact Information
                                </Typography>
                            </Stack>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <TextField label="Name" required fullWidth size="small" value={form.name} onChange={set("name")} autoFocus />
                                </Grid>
                                {fields.email && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="Email" fullWidth size="small" type="email" value={form.email} onChange={set("email")} />
                                    </Grid>
                                )}
                                {fields.phone && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField label="Phone" fullWidth size="small" value={form.phone} onChange={set("phone")} />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        {/* Address */}
                        {hasAddressFields && (
                            <>
                                <Divider />
                                <Box>
                                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                                        <LocationOnIcon fontSize="small" color="primary" />
                                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5} fontSize="0.7rem">
                                            Address
                                        </Typography>
                                    </Stack>
                                    <Grid container spacing={2}>
                                        {fields.addressLine1 && (
                                            <Grid size={12}>
                                                <TextField label="Address Line 1" fullWidth size="small" value={form.addressLine1} onChange={set("addressLine1")} />
                                            </Grid>
                                        )}
                                        {fields.addressLine2 && (
                                            <Grid size={12}>
                                                <TextField label="Address Line 2" fullWidth size="small" value={form.addressLine2} onChange={set("addressLine2")} />
                                            </Grid>
                                        )}
                                        {fields.city && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField label="City" fullWidth size="small" value={form.city} onChange={set("city")} />
                                            </Grid>
                                        )}
                                        {fields.state && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField label="State / County" fullWidth size="small" value={form.state} onChange={set("state")} />
                                            </Grid>
                                        )}
                                        {fields.postcode && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField label="Postcode" fullWidth size="small" value={form.postcode} onChange={set("postcode")} />
                                            </Grid>
                                        )}
                                        {fields.country && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <CountrySelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saving || !form.name.trim()}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
