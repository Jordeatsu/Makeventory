import { useState } from "react";

/**
 * Shared toast notification state.
 * Returns toast state, a function to show a toast, and a close handler.
 */
export function useToast() {
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const showToast = (message, severity = "success") => setToast({ open: true, message, severity });
    const closeToast = () => setToast((p) => ({ ...p, open: false }));
    return { toast, showToast, closeToast };
}
