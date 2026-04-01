import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, FormControl,
    Select, MenuItem,
} from '@mui/material';

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

export default function LocaleStep({ savedLocale, onComplete }) {
    const [language, setLanguage] = useState(savedLocale?.language || 'en');
    const [currency, setCurrency] = useState(savedLocale?.currency || 'GBP');

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight={600}>
                Language &amp; Currency
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Choose your preferred language and currency. These can be changed later in Settings.
            </Typography>

            {/* Language selector */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Language
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                {LANGUAGES.map((lang) => {
                    const selected = language === lang.code;
                    return (
                        <Paper
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            elevation={selected ? 3 : 0}
                            variant={selected ? 'elevation' : 'outlined'}
                            sx={{
                                p: 2.5,
                                cursor: 'pointer',
                                borderRadius: 2,
                                minWidth: 110,
                                textAlign: 'center',
                                border: selected ? '2px solid' : '1px solid',
                                borderColor: selected ? 'primary.main' : 'divider',
                                bgcolor: selected ? 'primary.50' : 'background.paper',
                                transition: 'all 0.15s',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                            }}
                        >
                            <Typography sx={{ fontSize: 32, lineHeight: 1, mb: 0.75 }}>
                                {lang.flag}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {lang.nativeLabel}
                            </Typography>
                        </Paper>
                    );
                })}
            </Box>

            {/* Currency selector */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                Currency
            </Typography>
            <FormControl sx={{ mb: 4, maxWidth: 380 }} fullWidth>
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

            <Box>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => onComplete({ language, currency })}
                >
                    Continue
                </Button>
            </Box>
        </Box>
    );
}
