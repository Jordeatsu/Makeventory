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

export default function MaterialTypesPage() {
    const [types, setTypes]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing]     = useState(null);   // null = create, obj = edit

    const [blockedOpen, setBlockedOpen]           = useState(false);
    const [blockedMaterials, setBlockedMaterials] = useState([]);

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
                    <Typography variant="h5" fontWeight={600}>Material Types</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setEditing(null); setModalOpen(true); }}
                >
                    New material type
                </Button>
            </Box>

            {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: 'background.default' } }}>
                            <TableCell>Name</TableCell>
                            <TableCell>Usage type</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
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
                                    <Typography variant="body2" color="text.secondary">No material types yet.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : types.map((t) => (
                            <TableRow key={t._id} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={500}>{t.name}</Typography>
                                    {t.description && (
                                        <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                                    )}
                                </TableCell>
                                <TableCell><Typography variant="body2">{t.usageType}</Typography></TableCell>
                                <TableCell><Typography variant="body2">{t.unitOfMeasure || '—'}</Typography></TableCell>
                                <TableCell>
                                    <Chip
                                        label={t.isActive ? 'Active' : 'Inactive'}
                                        color={t.isActive ? 'success' : 'default'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => { setEditing(t); setModalOpen(true); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(t._id)}>
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
