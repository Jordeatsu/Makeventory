import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Avatar, Divider, Paper, CircularProgress, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const { t } = useTranslation();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (!id) {
            setError(t('profile.noId'));
            return;
        }
        setLoading(true);
        setError(null);
        fetch(`/api/users/${id}`, { credentials: 'include' })
            .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error)))
            .then(({ user }) => setProfile(user))
            .catch((msg) => setError(msg || t('profile.loadFailed')))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ maxWidth: 600 }}>{error}</Alert>;
    }

    const fields = [
        { label: t('profile.firstName'), value: profile?.firstName },
        { label: t('profile.lastName'),  value: profile?.lastName },
        { label: t('profile.username'),  value: profile?.username },
        { label: t('profile.email'),     value: profile?.email },
        { label: t('profile.role'),      value: profile?.role },
        { label: t('profile.userId'),    value: profile?._id },
    ];

    return (
        <Box sx={{ maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                    <AccountCircleIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{profile?.role}</Typography>
                </Box>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {fields.map(({ label, value }, i) => (
                    <React.Fragment key={label}>
                        {i > 0 && <Divider />}
                        <Box sx={{ px: 3, py: 1.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                {label}
                            </Typography>
                            <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right' }}>
                                {value ?? '—'}
                            </Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Paper>
        </Box>
    );
}
