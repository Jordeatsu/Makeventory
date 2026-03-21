import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../version';

const BMC_USERNAME = 'Jordeatsu';

export default function AppFooter() {
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 1.5,
                mt: 'auto',
                flexShrink: 0,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {t('footer.copyright', { year })}{' '}
                <Typography component="span" variant="caption" color="text.disabled">
                    v{APP_VERSION}
                </Typography>
            </Typography>
            <Link
                href={`https://www.buymeacoffee.com/${BMC_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
                <Box
                    component="img"
                    src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                    alt={t('footer.buyMeACoffee')}
                    sx={{ height: 32 }}
                />
            </Link>
        </Box>
    );
}
