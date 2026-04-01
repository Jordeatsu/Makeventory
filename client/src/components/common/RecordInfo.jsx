import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { fmtDateTime } from "../../utils/formatting";

/**
 * Standard "Record Info" section shown at the bottom of detail pages.
 * Displays created/updated timestamps and the user who made each change.
 *
 * @param {{ createdAt?: string, updatedAt?: string, createdBy?: {name:string}, updatedBy?: {name:string}, createdLabel?: string, updatedLabel?: string }} props
 */
export default function RecordInfo({ createdAt, updatedAt, createdBy, updatedBy, createdLabel = "Created", updatedLabel = "Last Updated" }) {
    if (!createdAt && !updatedAt) return null;
    return (
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                Record Info
            </Typography>
            <Grid container spacing={2}>
                {createdAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {createdLabel}
                        </Typography>
                        {createdBy?.name && (
                            <Typography variant="body1" fontWeight={600}>
                                {createdBy.name}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {fmtDateTime(createdAt)}
                        </Typography>
                    </Grid>
                )}
                {updatedAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {updatedLabel}
                        </Typography>
                        {updatedBy?.name && (
                            <Typography variant="body1" fontWeight={600}>
                                {updatedBy.name}
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {fmtDateTime(updatedAt)}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
}
