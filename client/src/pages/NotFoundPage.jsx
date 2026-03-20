import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2, textAlign: 'center' }}>
            <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">{t('notFound.title')}</Typography>
            <Typography variant="h6" color="text.secondary">{t('notFound.subtitle')}</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 340 }}>
                {t('notFound.message')}
            </Typography>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1 }}>
                {t('common.goBack')}
            </Button>
        </Box>
    );
}
