import React, { useState } from 'react';
import {
    Alert, Box, Button, Divider, Paper, Tooltip, Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useGlobalSettings } from '../../context/GlobalSettingsContext';
import LanguageRegionModal from '../../components/modals/LanguageRegionModal';

const LANGUAGE_LABELS = {
    en: 'English 🇬🇧',
    fr: 'Français 🇫🇷',
    es: 'Español 🇪🇸',
};

function SettingRow({ label, value }) {
    return (
        <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>{label}</Typography>
                <Typography variant="body2" color="text.primary" sx={{ ml: 2 }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default function LanguageRegionPage() {
    const { t } = useTranslation();
    const { settings } = useGlobalSettings();
    const [modalOpen, setModalOpen] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaved = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LanguageIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>{t('settings.languageRegion.title')}</Typography>
                </Box>
                <Tooltip title={t('common.edit')}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setModalOpen(true)}>
                        {t('common.edit')}
                    </Button>
                </Tooltip>
            </Box>

            {saved && (
                <Alert severity="success" sx={{ mb: 2 }}>{t('settings.languageRegion.saved')}</Alert>
            )}

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <SettingRow
                    label={t('settings.languageRegion.language')}
                    value={LANGUAGE_LABELS[settings?.language] ?? settings?.language}
                />
                <Divider />
                <SettingRow
                    label={t('settings.languageRegion.currency')}
                    value={settings?.currency}
                />
            </Paper>

            <LanguageRegionModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
        </Box>
    );
}
