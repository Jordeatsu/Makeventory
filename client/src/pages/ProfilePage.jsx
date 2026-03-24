import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Avatar, Divider, Paper, Grid, Chip, CircularProgress, Alert,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    IconButton, InputAdornment, Snackbar,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import UpdateIcon from '@mui/icons-material/Update';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const fmt = (dateStr) =>
    dateStr
        ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

const getInitials = (p) =>
    p ? `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase() : '?';

export default function ProfilePage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const { user: currentUser } = useAuth();
    const { t } = useTranslation();

    const [profile, setProfile]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // ── Change password dialog ──────────────────────────────────────────────
    const [pwOpen, setPwOpen]       = useState(false);
    const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError]     = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [showPw, setShowPw]       = useState({});

    // ── Edit profile dialog ─────────────────────────────────────────────────
    const [editOpen, setEditOpen]       = useState(false);
    const [editForm, setEditForm]       = useState({ firstName: '', lastName: '', username: '', email: '' });
    const [editError, setEditError]     = useState('');
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const targetId = id || currentUser?._id;
        if (!targetId) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        api.get(`/users/${targetId}`)
            .then((res) => setProfile(res.data.user))
            .catch((err) => setError(err.response?.data?.error || t('profile.loadFailed')))
            .finally(() => setLoading(false));
    }, [id, currentUser?._id]);

    const isOwnProfile = !!(currentUser?._id && profile?._id && String(currentUser._id) === String(profile._id));
    const isAdmin      = currentUser?.role === 'admin';
    const canEdit      = isOwnProfile || isAdmin;

    const showToast = (message, severity = 'success') =>
        setSnackbar({ open: true, message, severity });

    // ── Handlers ────────────────────────────────────────────────────────────
    const openPwDialog = () => {
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPwError('');
        setShowPw({});
        setPwOpen(true);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError(t('profile.passwordsNoMatch')); return; }
        if (pwForm.newPassword.length < 8) { setPwError(t('profile.passwordTooShort')); return; }
        setPwLoading(true);
        setPwError('');
        try {
            await api.patch(`/users/${profile._id}/password`, {
                currentPassword: pwForm.currentPassword,
                newPassword:     pwForm.newPassword,
            });
            setPwOpen(false);
            showToast(t('profile.passwordUpdated'));
        } catch (err) {
            setPwError(err.response?.data?.error || t('profile.passwordFailed'));
        } finally {
            setPwLoading(false);
        }
    };

    const openEditDialog = () => {
        setEditForm({ firstName: profile.firstName, lastName: profile.lastName, username: profile.username, email: profile.email });
        setEditError('');
        setEditOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        try {
            const res = await api.patch(`/users/${profile._id}`, editForm);
            setProfile(res.data.user);
            setEditOpen(false);
            showToast(t('profile.profileUpdated'));
        } catch (err) {
            setEditError(err.response?.data?.error || t('profile.profileFailed'));
        } finally {
            setEditLoading(false);
        }
    };

    // ── Render states ────────────────────────────────────────────────────────
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error" sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>{error}</Alert>;

    const infoCards = [
        { icon: <PersonIcon />,         label: t('profile.username'),  value: profile?.username },
        { icon: <EmailIcon />,          label: t('profile.email'),     value: profile?.email },
        { icon: <BadgeIcon />,          label: t('profile.role'),      value: profile?.role },
        { icon: <CalendarTodayIcon />,  label: t('profile.memberSince'),  value: fmt(profile?.createdAt) },
    ];

    const detailRows = [
        { icon: <FingerprintIcon sx={{ fontSize: 18 }} />,    label: t('profile.userId'),   value: profile?._id,          mono: true },
        { icon: <CalendarTodayIcon sx={{ fontSize: 18 }} />,  label: t('profile.accountCreated'),     value: fmt(profile?.createdAt) },
        { icon: <UpdateIcon sx={{ fontSize: 18 }} />,         label: t('profile.lastUpdated'),        value: fmt(profile?.updatedAt) },
    ];

    const pwFields = [
        { key: 'currentPassword',  label: t('profile.currentPassword') },
        { key: 'newPassword',      label: t('profile.newPassword') },
        { key: 'confirmPassword',  label: t('profile.confirmPassword') },
    ];

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
            {/* ── Hero header ─────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #565264 0%, #706677 60%, #A6808C 100%)',
                        p: { xs: 3, md: 4 },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 88, height: 88,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: 32, fontWeight: 700,
                            border: '3px solid rgba(255,255,255,0.3)',
                        }}
                    >
                        {getInitials(profile)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ color: 'white', mb: 0.75 }}>
                            {profile?.firstName} {profile?.lastName}
                        </Typography>
                        <Chip
                            label={profile?.role}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, textTransform: 'capitalize', mb: 1 }}
                        />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 14 }} />
                            {t('profile.memberSinceDate', { date: fmt(profile?.createdAt) })}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* ── Info cards grid ──────────────────────────────────────────── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {infoCards.map(({ icon, label, value }) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                                {React.cloneElement(icon, { sx: { fontSize: 18 } })}
                                <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {label}
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight={500} noWrap title={value ?? '—'} sx={{ textTransform: label === t('profile.role') ? 'capitalize' : 'none' }}>
                                {value ?? '—'}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            {canEdit && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 600, letterSpacing: '0.08em' }}>
                        {t('common.actions')}
                    </Typography>
                    <Grid container spacing={2}>
                        {isOwnProfile && (
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <LockResetIcon sx={{ color: 'white' }} />
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{t('profile.changePassword')}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {t('profile.changePasswordDesc')}
                                    </Typography>
                                    <Button fullWidth variant="contained" onClick={openPwDialog}>
                                        {t('profile.changePassword')}
                                    </Button>
                                </Paper>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={isOwnProfile ? 6 : 12}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <EditIcon sx={{ color: 'white' }} />
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight={600}>Edit Profile</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Update your name, username, and email address.
                                </Typography>
                                <Button fullWidth variant="outlined" onClick={openEditDialog}>
                                    Edit Details
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* ── Account details ──────────────────────────────────────────── */}
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ px: 3, py: 1.75, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.08em' }}>
                        {t('profile.accountDetails')}
                    </Typography>
                </Box>
                {detailRows.map(({ icon, label, value, mono }, i) => (
                    <React.Fragment key={label}>
                        {i > 0 && <Divider />}
                        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</Box>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, flexShrink: 0 }}>{label}</Typography>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{ fontFamily: mono ? 'monospace' : undefined, fontSize: mono ? '0.8rem' : undefined, wordBreak: 'break-all' }}
                            >
                                {value ?? '—'}
                            </Typography>
                        </Box>
                    </React.Fragment>
                ))}
            </Paper>

            {/* ── Change Password Dialog ───────────────────────────────────── */}
            <Dialog open={pwOpen} onClose={() => !pwLoading && setPwOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockResetIcon color="primary" /> {t('profile.changePassword')}
                </DialogTitle>
                <Box component="form" onSubmit={handlePasswordSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
                        {pwFields.map(({ key, label }) => (
                            <TextField
                                key={key}
                                label={label}
                                type={showPw[key] ? 'text' : 'password'}
                                fullWidth
                                required
                                value={pwForm[key]}
                                onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}>
                                                {showPw[key] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        ))}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setPwOpen(false)} disabled={pwLoading}>{t('common.cancel')}</Button>
                        <Button type="submit" variant="contained" disabled={pwLoading}>
                            {pwLoading ? <CircularProgress size={20} color="inherit" /> : t('profile.updatePassword')}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ── Edit Profile Dialog ──────────────────────────────────────── */}
            <Dialog open={editOpen} onClose={() => !editLoading && setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon color="primary" /> {t('profile.editProfile')}
                </DialogTitle>
                <Box component="form" onSubmit={handleEditSubmit}>
                    <DialogContent sx={{ pt: 1 }}>
                        {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t('profile.firstName')} fullWidth required
                                    value={editForm.firstName}
                                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t('profile.lastName')} fullWidth required
                                    value={editForm.lastName}
                                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={t('profile.username')} fullWidth required
                                    value={editForm.username}
                                    onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={t('profile.email')} type="email" fullWidth required
                                    value={editForm.email}
                                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setEditOpen(false)} disabled={editLoading}>{t('common.cancel')}</Button>
                        <Button type="submit" variant="contained" disabled={editLoading}>
                            {editLoading ? <CircularProgress size={20} color="inherit" /> : t('common.saveChanges')}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ── Success / error toast ────────────────────────────────────── */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
