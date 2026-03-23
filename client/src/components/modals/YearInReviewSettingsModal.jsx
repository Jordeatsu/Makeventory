import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent,
    DialogTitle, Typography,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function YearInReviewSettingsModal({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Year In Review Settings</DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 2, pt: '20px !important', pb: 4,
                }}
            >
                <AssessmentIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    No configurable year-in-review settings yet.
                    Options will appear here as they are added.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
