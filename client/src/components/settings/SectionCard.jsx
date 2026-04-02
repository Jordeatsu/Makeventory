import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/**
 * Settings page card with a coloured primary-main header banner.
 *
 * Props:
 *   title        — card heading
 *   description  — optional subheading shown below the title
 *   onSave       — if provided, renders a Save button in the header
 *   saving       — disables the Save button while in-flight
 *   saved        — shows the CheckCircle icon + "Saved" label for 3 s
 *   headerAction — override the Save button with a custom React node
 *   sx           — forwarded to the root <Paper> for layout overrides
 *   children     — card body content
 */
export default function SectionCard({ title, description, onSave, saving, saved, headerAction, sx, children }) {
    const action =
        headerAction ??
        (onSave ? (
            <Button size="small" variant="outlined" color="inherit" startIcon={saved ? <CheckCircleIcon /> : <SaveIcon />} onClick={onSave} disabled={saving} sx={{ borderColor: "rgba(255,255,255,0.5)", color: "inherit", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
                {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </Button>
        ) : null);

    return (
        <Paper variant="outlined" sx={{ overflow: "hidden", ...sx }}>
            <Box sx={{ px: 3, py: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" fontWeight={700}>
                        {title}
                    </Typography>
                    {action}
                </Stack>
                {description && (
                    <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.85 }}>
                        {description}
                    </Typography>
                )}
            </Box>
            <Divider />
            {children}
        </Paper>
    );
}
