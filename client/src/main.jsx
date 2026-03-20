import './i18n'; // must be imported before the app renders
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from './theme';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CssBaseline />
                        <App />
                    </LocalizationProvider>
                </ThemeProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
);
