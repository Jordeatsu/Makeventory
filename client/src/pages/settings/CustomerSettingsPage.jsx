import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Button, CircularProgress, Divider,
    Paper, Stack, Switch, Tooltip, Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SaveIcon   from '@mui/icons-material/Save';
import api from '../../api';

// Fields that can be toggled. "name" is mandatory and always shown.
const FIELD_CONFIG = [
    { key: 'email',        label: 'Email',           description: 'Customer email address' },
    { key: 'phone',        label: 'Phone',           description: 'Customer phone number' },
    { key: 'addressLine1', label: 'Address Line 1',  description: 'Street / first line of address' },
    { key: 'addressLine2', label: 'Address Line 2',  description: 'Apartment, flat, suite, etc.' },
    { key: 'city',         label: 'City',            description: 'Town or city' },
    { key: 'state',        label: 'State / County',  description: 'State, county, or region' },
    { key: 'postcode',     label: 'Postcode / ZIP',  description: 'Postal or ZIP code' },
    { key: 'country',      label: 'Country',         description: 'Country dropdown' },
];

const DEFAULT_FIELDS = {
    email: true, phone: true, addressLine1: true, addressLine2: false,
    city: true, state: true, postcode: true, country: true,
};

function FieldToggleRow({ label, description, enabled, onChange, isLast }) {
    return (
        <>
            <Box sx={{ px: 3, py: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body2" fontWeight={500}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary">{description}</Typography>
                    </Box>
                    <Switch
                        checked={enabled}
                        onChange={(e) => onChange(e.target.checked)}
                        size="small"
                        color="primary"
                    />
                </Stack>
            </Box>
            {!isLast && <Divider />}
        </>
    );
}

export default function CustomerSettingsPage() {
    const [fields, setFields]   = useState(DEFAULT_FIELDS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get('/settings/customers')
            .then(({ data }) => {
                if (data?.settings?.fields) {
                    setFields({ ...DEFAULT_FIELDS, ...data.settings.fields });
                }
            })
            .catch(() => setError('Failed to load customer settings.'))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = (key) => (value) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await api.put('/settings/customers', { fields });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <PeopleIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>Customer Settings</Typography>
                </Stack>
                <Tooltip title="Save changes">
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </Tooltip>
            </Stack>

            {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>Settings saved.</Alert>}

            <Typography variant="body2" color="text.secondary" mb={2}>
                Choose which fields appear in the customer form when creating or editing a customer.
                <strong> Name</strong> is always required and cannot be hidden.
            </Typography>

            {/* Always-on row for Name */}
            <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="body2" fontWeight={500}>Name</Typography>
                            <Typography variant="caption" color="text.secondary">Customer's full name — always required</Typography>
                        </Box>
                        <Tooltip title="Name is always required">
                            <span>
                                <Switch checked disabled size="small" color="primary" />
                            </span>
                        </Tooltip>
                    </Stack>
                </Box>

                <Divider />

                {FIELD_CONFIG.map(({ key, label, description }, idx) => (
                    <FieldToggleRow
                        key={key}
                        label={label}
                        description={description}
                        enabled={!!fields[key]}
                        onChange={handleToggle(key)}
                        isLast={idx === FIELD_CONFIG.length - 1}
                    />
                ))}
            </Paper>
        </Box>
    );
}

