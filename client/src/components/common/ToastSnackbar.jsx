import React from "react";
import { Alert, Snackbar } from "@mui/material";

/**
 * Standard toast notification snackbar used across all pages.
 * Pair with the `useToast` hook.
 *
 * @param {{ toast: {open:boolean, message:string, severity:string}, onClose: () => void }} props
 */
export default function ToastSnackbar({ toast, onClose }) {
    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={onClose} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
                {toast.message}
            </Alert>
        </Snackbar>
    );
}
