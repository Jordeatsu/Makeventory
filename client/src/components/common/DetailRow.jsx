import React from "react";
import { Grid, Typography } from "@mui/material";

/**
 * `DetailRow` — stacked label / value pair in a Grid item.
 * Used in MaterialDetailPage-style grids.
 *
 * @param {{ label: string, value?: string|number|null, mono?: boolean }} props
 */
export function DetailRow({ label, value, mono = false }) {
    if (value === null || value === undefined || value === "") return null;
    return (
        <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body1" fontFamily={mono ? "monospace" : undefined} fontWeight={500}>
                {value}
            </Typography>
        </Grid>
    );
}

/**
 * `InfoRow` — side-by-side label / value row with a bottom border.
 * Used in ProductDetailPage and OrderDetailPage grids.
 *
 * @param {{ label: string, value?: string|number|null, valueColor?: string }} props
 */
export function InfoRow({ label, value, valueColor }) {
    return (
        <Grid container sx={{ py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
            <Grid size={{ xs: 6, sm: 5 }}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 7 }}>
                <Typography variant="body2" fontWeight={600} color={valueColor}>
                    {value || "—"}
                </Typography>
            </Grid>
        </Grid>
    );
}
