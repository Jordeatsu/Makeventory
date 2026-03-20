import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, IconButton,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Tooltip, Typography,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MaterialTypeModal from '../../components/modals/MaterialTypeModal';
import DeleteBlockedModal from '../../components/modals/DeleteBlockedModal';
import { useTranslation } from 'react-i18next';

const USAGE_KEY = { 'Whole Item': 'wholeItem', 'Percentage': 'percentage' };

export default function MaterialTypesPage() {
    const [types, setTypes]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState(null);

    const [blockedOpen, setBlockedOpen]           = useState(false);
    const [blockedMaterials, setBlockedMaterials] = useState([]);
    const { t } = useTranslation();

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
    };

    return (
        <Box sx={{ maxWidth: 860 }}>
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
                                    <Typography variant="body2" fontWeight={500}>{mt.name}</Typography>
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
        </Box>
    );
}
