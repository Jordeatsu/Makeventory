import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

export default function SettingsPage() {
    return (
        <Box sx={{ maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <SettingsIcon sx={{ color: 'text.secondary', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={600}>Settings</Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ px: 3, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Settings will be configured here.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
