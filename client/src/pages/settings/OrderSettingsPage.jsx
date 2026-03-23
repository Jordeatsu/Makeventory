import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import OrderSettingsModal from '../../components/modals/OrderSettingsModal';

export default function OrderSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        api.get('/settings/orders')
            .then(({ data }) => setSettings(data.settings ?? {}))
            .catch(() => setSettings({}));
    }, []);

    return (
        <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <ReceiptLongIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>{t('settings.orderSettings.title')}</Typography>
                </Stack>
                <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setModalOpen(true)}
                    disabled={!settings}
                >
                    {t('common.edit')}
                </Button>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 2, py: 8, textAlign: 'center' }}>
                <ReceiptLongIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('settings.orderSettings.title')}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 380, mx: 'auto' }}>
                    {t('settings.orderSettings.description')}
                </Typography>
            </Paper>

            <OrderSettingsModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </Box>
    );
}
