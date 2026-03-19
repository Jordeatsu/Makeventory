import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';

export default function MaterialSettingsPage() {
    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TuneIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>Material Settings</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Configure default settings for materials, such as low stock thresholds and display preferences.
                </Typography>
            </Paper>
        </Box>
    );
}
