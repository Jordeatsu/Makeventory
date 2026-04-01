import { createTheme } from "@mui/material";

// ─── Brand Palette ────────────────────────────────────────────────────────────
// Edit these values to retheme the entire app in one place.
// These are also available as named exports (BRAND, STATUS_COLOURS, SEMANTIC)
// so pages can import specific tokens directly alongside the MUI theme.
export const BRAND = {
    darkest: "#565264", // deep purple-slate  — nav / dark accents
    dark:    "#706677", // muted purple       — primary main
    mid:     "#A6808C", // mauve rose         — primary light / secondary main
    light:   "#CCB7AE", // warm blush         — secondary light / table headers
    pale:    "#D6CFCB", // soft warm grey     — page background
    white:   "#FFFFFF", // white              — paper / cards
};

// ─── Status Colours ───────────────────────────────────────────────────────────
// Used on order-status chips and dashboard charts.
export const STATUS_COLOURS = {
    Pending:       "#FFCAB1",
    "In Progress": "#ECDCB0",
    Completed:     "#C1D7AE",
    Shipped:       "#8CC084",
    Cancelled:     "#968E85",
};

// ─── Semantic Colours ─────────────────────────────────────────────────────────
// Feedback colours for toast messages, alerts, etc.
export const SEMANTIC = {
    success: "#4CAF50",
    warning: "#FF9800",
    error:   "#F44336",
    info:    "#2196F3",
};

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: BRAND.dark,
            light: BRAND.mid,
            dark: BRAND.darkest,
            contrastText: BRAND.white,
        },
        secondary: {
            main: BRAND.mid,
            light: BRAND.light,
            dark: BRAND.dark,
            contrastText: BRAND.white,
        },
        error: {
            main: "#FFCAB1",
            contrastText: BRAND.darkest,
        },
        warning: {
            main: "#ECDCB0",
            contrastText: BRAND.darkest,
        },
        success: {
            main: "#C1D7AE",
            contrastText: BRAND.darkest,
        },
        info: {
            main: BRAND.mid,
            contrastText: BRAND.white,
        },
        background: {
            default: BRAND.pale,
            paper: BRAND.white,
        },
        text: {
            primary: BRAND.darkest,
            secondary: BRAND.dark,
            disabled: BRAND.light,
        },
        divider: BRAND.light,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        h5: { fontWeight: 700, color: BRAND.darkest },
        h6: { fontWeight: 600, color: BRAND.darkest },
    },
    shape: { borderRadius: 10 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: "none" },
                outlined: { borderColor: BRAND.light },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: BRAND.light },
            },
        },
        MuiButton: {
            styleOverrides: {
                containedPrimary: {
                    backgroundColor: BRAND.dark,
                    "&:hover": { backgroundColor: BRAND.darkest },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                outlinedPrimary: { borderColor: BRAND.dark, color: BRAND.dark },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: `${BRAND.light}55`,
                    "& .MuiLinearProgress-bar": { backgroundColor: BRAND.dark },
                },
                colorSuccess: {
                    backgroundColor: `#C1D7AE55`,
                    "& .MuiLinearProgress-bar": { backgroundColor: "#C1D7AE" },
                },
                colorError: {
                    backgroundColor: `#FFCAB155`,
                    "& .MuiLinearProgress-bar": { backgroundColor: "#FFCAB1" },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                standardSuccess: { backgroundColor: "#C1D7AE44", color: BRAND.darkest },
                standardError: { backgroundColor: "#FFCAB144", color: BRAND.darkest },
                standardWarning: { backgroundColor: "#ECDCB044", color: BRAND.darkest },
                standardInfo: { backgroundColor: `${BRAND.mid}33`, color: BRAND.darkest },
            },
        },
    },
});

export default theme;
