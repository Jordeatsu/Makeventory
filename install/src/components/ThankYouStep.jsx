import React, { useEffect } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function ThankYouStep() {
    useEffect(() => {
        // Load the Buy Me a Coffee widget script
        const script = document.createElement("script");
        script.setAttribute("data-name", "BMC-Widget");
        script.setAttribute("data-cfasync", "false");
        script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
        script.setAttribute("data-id", "jordeatsu");
        script.setAttribute("data-description", "Support me on Buy me a coffee!");
        script.setAttribute("data-message", "Thanks for using Makeventory! If it's saved you time, a coffee would be much appreciated ☕");
        script.setAttribute("data-color", "#40DCA5");
        script.setAttribute("data-position", "Right");
        script.setAttribute("data-x_margin", "18");
        script.setAttribute("data-y_margin", "18");
        script.async = true;
        document.head.appendChild(script);

        return () => {
            // Clean up widget on unmount
            const existing = document.querySelector('script[data-name="BMC-Widget"]');
            if (existing) existing.remove();
            const widget = document.getElementById("bmc-wbtn");
            if (widget) widget.remove();
        };
    }, []);

    return (
        <Box sx={{ maxWidth: 600 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 36 }} />
                <Typography variant="h5" fontWeight={700}>
                    Installation Complete!
                </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Makeventory is set up and ready to go. You can now close this window and launch the app.
            </Typography>

            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    mb: 3,
                    borderColor: "success.light",
                    bgcolor: (t) => t.palette.mode === "dark" ? "rgba(193,215,174,0.06)" : "#f6faf2",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <FavoriteIcon sx={{ color: "#e05c8a", fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Makeventory is free, and always will be
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This project is built and maintained in my spare time at no charge. If it's useful to your business
                    and you'd like to show your appreciation, buying me a coffee goes a long way and helps keep
                    development going.
                </Typography>
                <Button
                    variant="contained"
                    href="https://www.buymeacoffee.com/jordeatsu"
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{
                        bgcolor: "#FFDD00",
                        color: "#000",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#f5d400" },
                    }}
                >
                    ☕ Buy me a coffee
                </Button>
            </Paper>

            <Typography variant="caption" color="text.secondary">
                The Buy Me a Coffee button in the bottom-right corner will stay available if you ever want to come back and donate later.
            </Typography>
        </Box>
    );
}
