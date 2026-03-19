import React, { useEffect, useState } from 'react';
import {
    Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem,
    Select, Switch, TextField, Typography,
} from '@mui/material';

const CURRENCIES = [
    { code: 'GBP', label: '£ GBP — British Pound' },
    { code: 'USD', label: '$ USD — US Dollar' },
    { code: 'EUR', label: '€ EUR — Euro' },
    { code: 'AUD', label: '$ AUD — Australian Dollar' },
    { code: 'CAD', label: '$ CAD — Canadian Dollar' },
    { code: 'NZD', label: '$ NZD — New Zealand Dollar' },
];

export default function MaterialSettingsModal({ open, current, onClose, onSaved }) {
    const [form, setForm]     = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    useEffect(() => {
        if (open && current) {
            setForm({
                defaultLowStockThreshold: current.defaultLowStockThreshold ?? 5,
                currency:                 current.currency ?? 'GBP',
                autoDeductOnOrderComplete: current.autoDeductOnOrderComplete ?? false,
                trackFractionalQuantities: current.trackFractionalQuantities ?? false,
            });
            setError(null);
        }
    }, [open, current]);

    const setField  = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
    const setToggle = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.checked }));

    const handleSubmit = async () => {
        const threshold = Number(form.defaultLowStockThreshold);
        if (!Number.isFinite(threshold) || threshold < 0) {
            setError('Default low stock threshold must be 0 or more.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const r = await fetch('/api/settings/materials', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, defaultLowStockThreshold: threshold }),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.error || 'Save failed.');
            onSaved(body.settings);
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!form) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit material settings</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Default low stock threshold"
                    type="number"
                    value={form.defaultLowStockThreshold}
                    onChange={setField('defaultLowStockThreshold')}
                    inputProps={{ min: 0 }}
                    helperText="Pre-filled when creating a new material"
                    fullWidth
                />

                <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select value={form.currency} label="Currency" onChange={setField('currency')}>
                        {CURRENCIES.map((c) => (
                            <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={<Switch checked={form.autoDeductOnOrderComplete} onChange={setToggle('autoDeductOnOrderComplete')} />}
                    label={
                        <>
                            <Typography variant="body2" fontWeight={500}>Auto-deduct stock on order completion</Typography>
                            <Typography variant="caption" color="text.secondary">
                                Automatically reduces material quantities when an order is marked complete
                            </Typography>
                        </>
                    }
                    sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { pt: 0.5 } }}
                />

                <FormControlLabel
                    control={<Switch checked={form.trackFractionalQuantities} onChange={setToggle('trackFractionalQuantities')} />}
                    label={
                        <>
                            <Typography variant="body2" fontWeight={500}>Track fractional quantities</Typography>
                            <Typography variant="caption" color="text.secondary">
                                For bulk materials (thread, fabric, etc.), track stock to 2 decimal places instead of whole numbers
                            </Typography>
                        </>
                    }
                    sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { pt: 0.5 } }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={saving}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
