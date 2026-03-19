import React, { useEffect, useState } from 'react';
import {
    Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem,
    Select, Switch, TextField,
} from '@mui/material';

const USAGE_TYPES = ['Whole Item', 'Percentage'];
const UNITS       = ['mm', 'cm', 'm', 'in', 'ft', 'yd', 'piece'];
const EMPTY_FORM  = { name: '', description: '', usageType: 'Whole Item', unitOfMeasure: '', isActive: true };

export default function MaterialTypeModal({ open, initial, onClose, onSaved }) {
    const isEdit = Boolean(initial);

    const [form, setForm]     = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError]   = useState(null);

    useEffect(() => {
        if (open) {
            setForm(
                initial
                    ? {
                          name:           initial.name,
                          description:    initial.description || '',
                          usageType:      initial.usageType,
                          unitOfMeasure:  initial.unitOfMeasure || '',
                          isActive:       initial.isActive,
                      }
                    : EMPTY_FORM
            );
            setError(null);
        }
    }, [open, initial]);

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            setError('Name is required.');
            return;
        }
        if (form.usageType === 'Percentage' && !form.unitOfMeasure) {
            setError('Unit of measure is required for Percentage types.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            // Whole Item always stores 'piece'; Percentage uses the selected value
            const unitOfMeasure = form.usageType === 'Whole Item' ? 'piece' : form.unitOfMeasure;

            const url    = isEdit ? `/api/material-types/${initial._id}` : '/api/material-types';
            const method = isEdit ? 'PUT' : 'POST';

            const r = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, unitOfMeasure }),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.error || 'Save failed.');
            onSaved(body.type, isEdit);
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Edit material type' : 'New material type'}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
                {error && <Alert severity="error">{error}</Alert>}

                <TextField
                    label="Name"
                    value={form.name}
                    onChange={set('name')}
                    required
                    fullWidth
                />
                <TextField
                    label="Description"
                    value={form.description}
                    onChange={set('description')}
                    fullWidth
                    multiline
                    minRows={2}
                />
                <FormControl fullWidth required>
                    <InputLabel>Usage type</InputLabel>
                    <Select value={form.usageType} label="Usage type" onChange={set('usageType')}>
                        {USAGE_TYPES.map((u) => (
                            <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Unit of measure — only shown and required for Percentage */}
                {form.usageType === 'Percentage' && (
                    <FormControl fullWidth required error={!form.unitOfMeasure}>
                        <InputLabel>Unit of measure *</InputLabel>
                        <Select value={form.unitOfMeasure} label="Unit of measure *" onChange={set('unitOfMeasure')}>
                            {UNITS.filter((u) => u !== 'piece').map((u) => (
                                <MenuItem key={u} value={u}>{u}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <FormControlLabel
                    control={
                        <Switch
                            checked={form.isActive}
                            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        />
                    }
                    label="Active"
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
                    {isEdit ? 'Save changes' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
