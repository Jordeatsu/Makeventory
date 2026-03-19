import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Button, CircularProgress, Divider,
    Paper, Tooltip, Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';
import MaterialSettingsModal from '../../components/modals/MaterialSettingsModal';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€', AUD: '$', CAD: '$', NZD: '$' };

function SettingRow({ label, description, value }) {
    return (
        <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                    {description && (
                        <Typography variant="caption" color="text.secondary">{description}</Typography>
                    )}
                </Box>
                <Typography variant="body2" color="text.primary" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function MaterialSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetch('/api/settings/materials', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error)))
            .then(({ settings: data }) => setSettings(data))
            .catch((msg) => setError(msg || 'Failed to load settings.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 640 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TuneIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>Material Settings</Typography>
                </Box>
                {settings && (
                    <Tooltip title="Edit settings">
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setModalOpen(true)}>
                            Edit
                        </Button>
                    </Tooltip>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {settings && (
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                    <SettingRow
                        label="Default low stock threshold"
                        description="Pre-filled when creating a new material"
                        value={settings.defaultLowStockThreshold}
                    />
                    <Divider />
                    <SettingRow
                        label="Currency"
                        description="Symbol shown next to material costs"
                        value={`${CURRENCY_SYMBOLS[settings.currency] ?? ''} ${settings.currency}`}
                    />
                    <Divider />
                    <SettingRow
                        label="Auto-deduct stock on order completion"
                        description="Reduces material quantities when an order is marked complete"
                        value={settings.autoDeductOnOrderComplete ? 'On' : 'Off'}
                    />
                    <Divider />
                    <SettingRow
                        label="Track fractional quantities"
                        description="Track bulk materials to 2 decimal places instead of whole numbers"
                        value={settings.trackFractionalQuantities ? 'On' : 'Off'}
                    />
                </Paper>
            )}

            <MaterialSettingsModal
                open={modalOpen}
                current={settings}
                onClose={() => setModalOpen(false)}
                onSaved={(updated) => setSettings(updated)}
            />
        </Box>
    );
}
