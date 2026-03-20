import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    List, ListItem, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function DeleteBlockedModal({ open, materials, onClose }) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t('settings.materialTypes.deleteBlocked.title')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                    {materials.length === 1
                        ? t('settings.materialTypes.deleteBlocked.usedByOne')
                        : t('settings.materialTypes.deleteBlocked.usedByMany')}
                </Typography>
                <List dense disablePadding sx={{ pl: 1 }}>
                    {materials.map((name) => (
                        <ListItem
                            key={name}
                            sx={{ py: 0.25, display: 'list-item', listStyleType: 'disc', listStylePosition: 'inside' }}
                        >
                            <Typography variant="body2" component="span">{name}</Typography>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="contained" onClick={onClose}>{t('common.ok')}</Button>
            </DialogActions>
        </Dialog>
    );
}
