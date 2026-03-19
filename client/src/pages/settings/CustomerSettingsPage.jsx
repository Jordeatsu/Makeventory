import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

export default function CustomerSettingsPage() {
    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PeopleIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>Customer Settings</Typography>
            </Box>
            <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Configure customer record fields, default values, and customer management preferences.
                </Typography>
            </Paper>
        </Box>
    );
}
