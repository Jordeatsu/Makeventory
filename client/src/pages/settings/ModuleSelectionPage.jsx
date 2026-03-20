import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Switch, Divider,
    Button, CircularProgress, Alert, Skeleton,
} from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';

export default function ModuleSelectionPage() {
    const [modules, setModules]   = useState([]);
    const [draft, setDraft]       = useState({});
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState(null);
    const [success, setSuccess]   = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetch('/api/modules/all', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error)))
            .then(({ modules: data }) => {
                setModules(data);
                const initial = {};
                data.forEach((m) => { initial[m._id] = m.isActive; });
                setDraft(initial);
            })
            .catch((msg) => setError(msg || 'Failed to load modules.'))
            .finally(() => setLoading(false));
    }, []);

    const isDirty = modules.some((m) => draft[m._id] !== m.isActive);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const updates = modules.map((m) => ({ id: m._id, isActive: draft[m._id] }));
            const r = await fetch('/api/modules', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });
            if (!r.ok) {
                const b = await r.json();
                throw new Error(b.error || 'Save failed.');
            }
            // Commit draft back into base state so isDirty resets
            setModules((prev) => prev.map((m) => ({ ...m, isActive: draft[m._id] })));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ExtensionIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>{t('settings.moduleSelection.title')}</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                >
                    {t('common.saveChanges')}
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.moduleSelection.description')}
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{t('settings.moduleSelection.saved')}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {loading
                    ? [1, 2, 3, 4].map((n) => (
                        <Box key={n} sx={{ px: 3, py: 2 }}>
                            <Skeleton variant="rounded" height={28} />
                        </Box>
                    ))
                    : modules.map((m, i) => (
                        <React.Fragment key={m._id}>
                            {i > 0 && <Divider />}
                            <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>{m.name}</Typography>
                                    {m.description && (
                                        <Typography variant="caption" color="text.secondary">{m.description}</Typography>
                                    )}
                                </Box>
                                <Switch
                                    checked={draft[m._id] ?? false}
                                    onChange={(e) => setDraft((prev) => ({ ...prev, [m._id]: e.target.checked }))}
                                    color="primary"
                                />
                            </Box>
                        </React.Fragment>
                    ))
                }
            </Paper>
        </Box>
    );
}

