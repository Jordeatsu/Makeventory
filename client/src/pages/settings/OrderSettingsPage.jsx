import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function OrderSettingsPage() {
    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <ReceiptLongIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>Order Settings</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Configure order statuses, default values, and order management preferences.
                </Typography>
            </Paper>
        </Box>
    );
}
