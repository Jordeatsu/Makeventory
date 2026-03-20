/**
 * @file colors.js
 * @description Central colour tokens for the application.
 * Edit {@link BRAND} here to retheme the entire app in one place.
 * {@link STATUS_COLORS} drives order-status chips and dashboard charts.
 * {@link SEMANTIC} provides semantic feedback colours (success, warning, etc.).
 */

/**
 * Brand palette — maps semantic names to hex values.
 * @type {{ darkest: string, dark: string, mid: string, light: string, pale: string, white: string }}
 */
// ─── Brand Palette ────────────────────────────────────────────────────────────
// Edit these values to retheme the entire app in one place.
export const BRAND = {
    darkest: "#565264", // deep purple-slate  — nav / dark accents
    dark:    "#706677", // muted purple       — primary main
    mid:     "#A6808C", // mauve rose         — primary light / secondary main
    light:   "#CCB7AE", // warm blush         — secondary light / table headers
    pale:    "#D6CFCB", // soft warm grey     — page background
    white:   "#FFFFFF", // white              — paper / cards
};

/**
 * Maps each order status string to a background hex colour used on Chips.
 * @type {{ Pending: string, 'In Progress': string, Completed: string, Shipped: string, Cancelled: string }}
 */
// ─── Status Colours ───────────────────────────────────────────────────────────
// Used on order status chips and dashboard charts.
export const STATUS_COLOURS = {
    Pending:       "#FFCAB1",
    "In Progress": "#ECDCB0",
    Completed:     "#C1D7AE",
    Shipped:       "#8CC084",
    Cancelled:     "#968E85",
};

/**
 * Semantic feedback colours for success / warning / error / info states.
 * @type {{ success: string, warning: string, error: string, info: string }}
 */
// ─── Semantic Colours ─────────────────────────────────────────────────────────
export const SEMANTIC = {
    success: "#4CAF50",
    warning: "#FF9800",
    error:   "#F44336",
    info:    "#2196F3",
};
