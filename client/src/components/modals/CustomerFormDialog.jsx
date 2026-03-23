import React, { useState, useEffect } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Grid, TextField,
} from "@mui/material";
import CountrySelect from "../common/CountrySelect";

const EMPTY = {
    name: "", email: "", phone: "",
    addressLine1: "", addressLine2: "",
    city: "", state: "", postcode: "", country: "",
};

export default function CustomerFormDialog({ open, onClose, onSave, initial }) {
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{initial?._id ? "Edit Customer" : "New Customer"}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name" required fullWidth size="small"
                                value={form.name} onChange={set("name")}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Email" fullWidth size="small" type="email"
                                value={form.email} onChange={set("email")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Phone" fullWidth size="small"
                                value={form.phone} onChange={set("phone")} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Address Line 1" fullWidth size="small"
                                value={form.addressLine1} onChange={set("addressLine1")} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Address Line 2" fullWidth size="small"
                                value={form.addressLine2} onChange={set("addressLine2")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="City" fullWidth size="small"
                                value={form.city} onChange={set("city")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="State / County" fullWidth size="small"
                                value={form.state} onChange={set("state")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Postcode" fullWidth size="small"
                                value={form.postcode} onChange={set("postcode")} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <CountrySelect
                                value={form.country}
                                onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || !form.name.trim()}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
