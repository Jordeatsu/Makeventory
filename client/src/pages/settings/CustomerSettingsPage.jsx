import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslation } from 'react-i18next';

export default function CustomerSettingsPage() {
    const { t } = useTranslation();
    return (
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PeopleIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>{t('settings.customerSettings.title')}</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, py: 8, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('settings.customerSettings.title')}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 380, mx: 'auto' }}>
                    {t('settings.customerSettings.description')}
                </Typography>
            </Paper>
        </Box>
    );
}
