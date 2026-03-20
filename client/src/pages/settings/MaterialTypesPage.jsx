import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Chip, CircularProgress, IconButton,
    Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tooltip, Typography,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTypeModal from '../../components/modals/MaterialTypeModal';
import DeleteBlockedModal from '../../components/modals/DeleteBlockedModal';
import { useTranslation } from 'react-i18next';

const USAGE_KEY = { 'Whole Item': 'wholeItem', 'Percentage': 'percentage', 'Bulk': 'bulk' };

export default function MaterialTypesPage() {
    const [types, setTypes]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState(null);

    const [blockedOpen, setBlockedOpen]           = useState(false);
    const [blockedMaterials, setBlockedMaterials] = useState([]);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

    const load = useCallback(() => {
        setLoading(true);
        fetch('/api/material-types', { credentials: 'include' })
            .then((r) => r.ok ? r.json() : r.json().then((b) => Promise.reject(b.error)))
            .then(({ types: data }) => setTypes(data))
            .catch((msg) => setFetchError(msg || 'Failed to load material types.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSaved = (type, isEdit) => {
        setTypes((prev) =>
            isEdit ? prev.map((t) => (t._id === type._id ? type : t)) : [...prev, type]
        );
        if (!isEdit) showToast(t('settings.materialTypes.created', 'Material type created successfully'));
    };

    const handleDelete = async (id) => {
        const r    = await fetch(`/api/material-types/${id}`, { method: 'DELETE', credentials: 'include' });
        const body = await r.json();
        if (r.status === 409) {
            setBlockedMaterials(body.materials ?? []);
            setBlockedOpen(true);
            return;
        }
        if (!r.ok) return;
        setTypes((prev) => prev.filter((t) => t._id !== id));
        showToast(t('settings.materialTypes.deleted', 'Material type deleted'));
    };

    return (
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CategoryIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={600}>{t('settings.materialTypes.title')}</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setEditing(null); setModalOpen(true); }}
                >
                    {t('settings.materialTypes.newButton')}
                </Button>
            </Box>

            {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

            {!loading && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    {[
                        { label: t('common.total'),    value: types.length,                                     color: 'text.primary'   },
                        { label: t('common.active'),   value: types.filter((mt) => mt.isActive).length,         color: 'success.main'   },
                        { label: t('common.inactive'), value: types.filter((mt) => !mt.isActive).length,        color: 'text.secondary' },
                    ].map(({ label, value, color }) => (
                        <Paper key={label} variant="outlined" sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                        </Paper>
                    ))}
                </Box>
            )}

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'background.default' } }}>
                            <TableCell>{t('common.name')}</TableCell>
                            <TableCell>{t('settings.materialTypes.table.usageType')}</TableCell>
                            <TableCell>{t('settings.materialTypes.table.unit')}</TableCell>
                            <TableCell>{t('common.status')}</TableCell>
                            <TableCell align="right">{t('common.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : types.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">{t('settings.materialTypes.noData')}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : types.map((mt) => (
                            <TableRow key={mt._id} hover>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        fontWeight={500}
                                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                                        onClick={() => navigate(`/settings/material-types/${mt._id}`)}
                                    >{mt.name}</Typography>
                                    {mt.description && (
                                        <Typography variant="caption" color="text.secondary">{mt.description}</Typography>
                                    )}
                                </TableCell>
                                <TableCell><Typography variant="body2">{USAGE_KEY[mt.usageType] ? t(`usageTypes.${USAGE_KEY[mt.usageType]}`) : mt.usageType}</Typography></TableCell>
                                <TableCell><Typography variant="body2">{mt.unitOfMeasure ? t(`units.${mt.unitOfMeasure}`, mt.unitOfMeasure) : '—'}</Typography></TableCell>
                                <TableCell>
                                    <Chip
                                        label={mt.isActive ? t('common.active') : t('common.inactive')}
                                        color={mt.isActive ? 'success' : 'default'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title={t('common.edit')}>
                                        <IconButton size="small" onClick={() => { setEditing(mt); setModalOpen(true); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={t('common.delete')}>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(mt._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <MaterialTypeModal
                open={modalOpen}
                initial={editing}
                onClose={() => setModalOpen(false)}
                onSaved={handleSaved}
            />
            <DeleteBlockedModal
                open={blockedOpen}
                materials={blockedMaterials}
                onClose={() => setBlockedOpen(false)}
            />
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((p) => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setToast((p) => ({ ...p, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
