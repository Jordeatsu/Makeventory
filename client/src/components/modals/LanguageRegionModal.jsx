import React, { useEffect, useState } from 'react';
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, MenuItem, Paper, Select, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';

const LANGUAGES = [
    { code: 'en', nativeLabel: 'English', flag: '🇬🇧' },
    { code: 'fr', nativeLabel: 'Français', flag: '🇫🇷' },
    { code: 'es', nativeLabel: 'Español', flag: '🇪🇸' },
];

const CURRENCIES = [
    { code: 'GBP', label: '£ GBP — British Pound' },
    { code: 'USD', label: '$ USD — US Dollar' },
    { code: 'EUR', label: '€ EUR — Euro' },
    { code: 'AUD', label: '$ AUD — Australian Dollar' },
    { code: 'CAD', label: '$ CAD — Canadian Dollar' },
    { code: 'NZD', label: '$ NZD — New Zealand Dollar' },
];

export default function LanguageRegionModal({ open, onClose, onSaved }) {
    const { t } = useTranslation();
    const { settings, updateSettings } = useGlobalSettings();

    const [language, setLanguage] = useState('en');
    const [currency, setCurrency] = useState('GBP');
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState(null);

    useEffect(() => {
        if (open && settings) {
            setLanguage(settings.language || 'en');
            setCurrency(settings.currency || 'GBP');
            setError(null);
        }
    }, [open, settings]);

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        try {
            const r = await fetch('/api/settings/global', {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, currency }),
            });
            const body = await r.json();
            if (!r.ok) throw new Error(body.error || t('common.serverError'));
            updateSettings({ language, currency });
            onSaved();
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('settings.languageRegion.title')}</DialogTitle>
            <DialogContent sx={{ pt: '12px !important' }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    {t('settings.languageRegion.language')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {LANGUAGES.map((lang) => {
                        const selected = language === lang.code;
                        return (
                            <Paper
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                elevation={selected ? 3 : 0}
                                variant={selected ? 'elevation' : 'outlined'}
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    minWidth: 100,
                                    textAlign: 'center',
                                    border: selected ? '2px solid' : '1px solid',
                                    borderColor: selected ? 'primary.main' : 'divider',
                                    bgcolor: selected ? 'primary.50' : 'background.paper',
                                    transition: 'all 0.15s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                }}
                            >
                                <Typography sx={{ fontSize: 28, lineHeight: 1, mb: 0.5 }}>
                                    {lang.flag}
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {lang.nativeLabel}
                                </Typography>
                            </Paper>
                        );
                    })}
                </Box>

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                    {t('settings.languageRegion.currency')}
                </Typography>
                <FormControl fullWidth>
                    <Select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        size="small"
                    >
                        {CURRENCIES.map((c) => (
                            <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>{t('common.cancel')}</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={saving}>
                    {saving ? t('common.loading') : t('common.saveChanges')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
