import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    List, ListItem, Typography,
} from '@mui/material';

export default function DeleteBlockedModal({ open, materials, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cannot delete material type</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                    This material type is used by the following material{materials.length !== 1 ? 's' : ''} and cannot be deleted:
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
                <Button variant="contained" onClick={onClose}>OK</Button>
            </DialogActions>
        </Dialog>
    );
}
