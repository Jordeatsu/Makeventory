import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production you'd send this to an error tracking service (e.g. Sentry)
        console.error('Uncaught render error:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h5">Something went wrong</Typography>
                <Typography variant="body2" color="text.secondary">
                    {this.state.error?.message ?? 'An unexpected error occurred.'}
                </Typography>
                <Button variant="outlined" onClick={() => window.location.reload()}>
                    Reload page
                </Button>
            </Box>
        );
    }
}
