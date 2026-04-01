import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Typography,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function OrderSettingsModal({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Order Settings</DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2, pt: '20px !important', pb: 4,
                }}
            >
                <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    No configurable order settings yet.
                    Options will appear here as they are added.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
