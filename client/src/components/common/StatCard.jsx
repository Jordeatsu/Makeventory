import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

/**
 * KPI stat card used in dashboard and detail pages.
 *
 * When an `icon` is provided the card uses a two-column layout with a tinted
 * icon box on the right (Dashboard style).  Without an icon it renders a
 * compact stacked label / value layout (detail page style).
 *
 * @param {{ icon?: JSX.Element, label: string, value: string|number, sub?: string, color?: string, sx?: object, elevation?: number }} props
 */
export default function StatCard({ icon, label, value, sub, color = "primary.main", sx = {}, elevation }) {
    return (
        <Paper elevation={elevation} sx={{ p: icon ? 3 : 2.5, height: "100%", ...sx }}>
            {icon ? (
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                            {label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color={color}>
                            {value}
                        </Typography>
                        {sub && (
                            <Typography variant="caption" color="text.secondary">
                                {sub}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ p: 1.5, bgcolor: `${color}18`, borderRadius: 2, color }}>{icon}</Box>
                </Stack>
            ) : (
                <>
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={color}>
                        {value}
                    </Typography>
                    {sub && (
                        <Typography variant="caption" color="text.secondary">
                            {sub}
                        </Typography>
                    )}
                </>
            )}
        </Paper>
    );
}
