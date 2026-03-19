import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2, textAlign: 'center' }}>
            <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">404</Typography>
            <Typography variant="h6" color="text.secondary">Page not found</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 340 }}>
                The page you're looking for doesn't exist or has been moved.
            </Typography>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 1 }}>
                Go back
            </Button>
        </Box>
    );
}
