import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTranslation } from 'react-i18next';

export default function YearInReviewSettingsPage() {
    const { t } = useTranslation();
    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AssessmentIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>{t('settings.yearInReview.title')}</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {t('settings.yearInReview.description')}
                </Typography>
            </Paper>
        </Box>
    );
}
