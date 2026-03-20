import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useTranslation } from 'react-i18next';

export default function OrderSettingsPage() {
    const { t } = useTranslation();
    return (
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <ReceiptLongIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>{t('settings.orderSettings.title')}</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, py: 8, textAlign: 'center' }}>
                <ReceiptLongIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('settings.orderSettings.title')}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 380, mx: 'auto' }}>
                    {t('settings.orderSettings.description')}
                </Typography>
            </Paper>
        </Box>
    );
}
