import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Avatar, Divider, Paper, CircularProgress, Alert } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ProfilePage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    useEffect(() => {
        if (!id) {
            setError('No user ID provided.');
            return;
        }
        setLoading(true);
        setError(null);
        fetch(`/api/users/${id}`, { credentials: 'include' })
            .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error)))
            .then(({ user }) => setProfile(user))
            .catch((msg) => setError(msg || 'Failed to load profile.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ maxWidth: 600 }}>{error}</Alert>;
    }

    const fields = [
        { label: 'First name', value: profile?.firstName },
        { label: 'Last name',  value: profile?.lastName },
        { label: 'Username',   value: profile?.username },
        { label: 'Email',      value: profile?.email },
        { label: 'Role',       value: profile?.role },
        { label: 'User ID',    value: profile?._id },
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
