import { Box, Stack, Switch, Tooltip, Typography } from "@mui/material";

/**
 * A single toggle row used inside a SectionCard.
 *
 * Props:
 *   label       — primary label text
 *   description — optional secondary caption below the label
 *   enabled     — Switch checked state
 *   onChange    — called with the new boolean value
 *   disabled    — shows "Always required" tooltip and disables the Switch
 */
export default function ToggleRow({ label, description, enabled, onChange, disabled }) {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 1.75 }}>
            <Box>
                <Typography variant="body2" fontWeight={500}>
                    {label}
                </Typography>
                {description && (
                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
            <Tooltip title={disabled ? "Always required" : ""}>
                <span>
                    <Switch checked={enabled} onChange={(e) => onChange?.(e.target.checked)} size="small" disabled={disabled} />
                </span>
            </Tooltip>
        </Stack>
    );
}
