import { createTheme } from '@mui/material';

const palette = {
  darkest: '#565264', // deep purple-slate  — nav / dark accents
  dark:    '#706677', // muted purple       — primary main
  mid:     '#A6808C', // mauve rose         — primary light / secondary main
  light:   '#CCB7AE', // warm blush         — secondary light / table headers
  pale:    '#D6CFCB', // soft warm grey     — page background
  white:   '#FFFFFF', // white              — paper / cards
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:  palette.dark,
      light: palette.mid,
      dark:  palette.darkest,
      contrastText: palette.white,
    },
    secondary: {
      main:  palette.mid,
      light: palette.light,
      dark:  palette.dark,
      contrastText: palette.white,
    },
    error: {
      main:        '#FFCAB1',
      contrastText: palette.darkest,
    },
    warning: {
      main:        '#ECDCB0',
      contrastText: palette.darkest,
    },
    success: {
      main:        '#C1D7AE',
      contrastText: palette.darkest,
    },
    info: {
      main:        palette.mid,
      contrastText: palette.white,
    },
    background: {
      default: palette.pale,
      paper:   palette.white,
    },
    text: {
      primary:   palette.darkest,
      secondary: palette.dark,
      disabled:  palette.light,
    },
    divider: palette.light,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h5: { fontWeight: 700, color: palette.darkest },
    h6: { fontWeight: 600, color: palette.darkest },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: palette.light },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: palette.light },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: palette.dark,
          '&:hover': { backgroundColor: palette.darkest },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlinedPrimary: { borderColor: palette.dark, color: palette.dark },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: `${palette.light}55`,
          '& .MuiLinearProgress-bar': { backgroundColor: palette.dark },
        },
        colorSuccess: {
          backgroundColor: `#C1D7AE55`,
          '& .MuiLinearProgress-bar': { backgroundColor: '#C1D7AE' },
        },
        colorError: {
          backgroundColor: `#FFCAB155`,
          '& .MuiLinearProgress-bar': { backgroundColor: '#FFCAB1' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: '#C1D7AE44', color: palette.darkest },
        standardError:   { backgroundColor: '#FFCAB144', color: palette.darkest },
        standardWarning: { backgroundColor: '#ECDCB044', color: palette.darkest },
        standardInfo:    { backgroundColor: `${palette.mid}33`, color: palette.darkest },
      },
    },
  },
});

export default theme;
