import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Button } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useTranslation } from 'react-i18next';
import api from '../api';

// How often (ms) to poll the server for a newer commit on origin/main.
const CHECK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default function AppUpdateBanner() {
    const { t } = useTranslation();
    const [updateInfo, setUpdateInfo] = useState(null); // { remoteCommit } when update available
    const [updating, setUpdating]     = useState(false);
    const [status, setStatus]         = useState(null); // null | 'restarting' | 'error'

    const check = useCallback(() => {
        api.get('/system/update-check')
            .then((r) => {
                if (!r.data.upToDate) {
                    setUpdateInfo({ remoteTag: r.data.remoteTag });
                } else {
                    setUpdateInfo(null);
                }
            })
            .catch(() => {}); // silently ignore — not a critical UI path
    }, []);

    useEffect(() => {
        check();
        const interval = setInterval(check, CHECK_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [check]);

    const handleUpdate = async () => {
        setUpdating(true);
        setStatus(null);
        try {
            await api.post('/system/update');
            setStatus('restarting');
            setUpdateInfo(null);
        } catch {
            setStatus('error');
            setUpdating(false);
        }
    };

    if (status === 'restarting') {
        return (
            <Alert severity="success" sx={{ borderRadius: 0, py: 0.5 }}>
                {t('update.restarting')}
            </Alert>
        );
    }

    if (status === 'error') {
        return (
            <Alert severity="error" onClose={() => setStatus(null)} sx={{ borderRadius: 0, py: 0.5 }}>
                {t('common.serverError')}
            </Alert>
        );
    }

    if (!updateInfo) return null;

    return (
        <Alert
            severity="info"
            icon={<SystemUpdateAltIcon />}
            action={
                <Button color="inherit" size="small" onClick={handleUpdate} disabled={updating}>
                    {updating ? t('update.updating') : t('update.updateNow')}
                </Button>
            }
            sx={{ borderRadius: 0, py: 0.5 }}
        >
            {t('update.available', { tag: updateInfo.remoteTag })}
        </Alert>
    );
}
