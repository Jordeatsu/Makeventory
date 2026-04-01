import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Divider, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import ExtensionIcon from "@mui/icons-material/Extension";
import CategoryIcon from "@mui/icons-material/Category";
import TuneIcon from "@mui/icons-material/Tune";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AppUpdateBanner from "./AppUpdateBanner";
import AppFooter from "./AppFooter";

const DRAWER_WIDTH = 240;

// Nav item config — labels are added inside the component using t()
// module: the DB module name this settings page belongs to (null = always visible)
const SETTINGS_NAV_CONFIG = [
    { key: "moduleSelection", path: "/settings/modules", icon: <ExtensionIcon />, module: null },
    { key: "materialTypes", path: "/settings/material-types", icon: <CategoryIcon />, module: "Inventory" },
    { key: "materialSettings", path: "/settings/materials", icon: <TuneIcon />, module: "Inventory" },
    { key: "productSettings", path: "/settings/products", icon: <ShoppingBagIcon />, module: "Products" },
    { key: "orderSettings", path: "/settings/orders", icon: <ReceiptLongIcon />, module: "Orders" },
    { key: "customerSettings", path: "/settings/customers", icon: <PeopleIcon />, module: "Customers" },
    { key: "yearInReviewSettings", path: "/settings/year-in-review", icon: <AssessmentIcon />, module: "Year Review" },
    { key: "languageRegion", path: "/settings/language-region", icon: <LanguageIcon />, module: null },
];

export default function SettingsLayout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeModules, setActiveModules] = useState(null); // null = loading, array = loaded
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useTranslation();

    const fetchModules = useCallback(() => {
        fetch("/api/modules", { credentials: "include" })
            .then((r) => (r.ok ? r.json() : { modules: [] }))
            .then(({ modules }) => setActiveModules(modules.map((m) => m.name)))
            .catch(() => setActiveModules([]));
    }, []);

    useEffect(() => {
        fetchModules();
        window.addEventListener("modules-updated", fetchModules);
        return () => window.removeEventListener("modules-updated", fetchModules);
    }, [fetchModules]);

    const SETTINGS_NAV = SETTINGS_NAV_CONFIG.filter((item) => {
        if (!item.module) return true; // always visible
        if (activeModules === null) return true; // still loading — show all
        return activeModules.includes(item.module);
    }).map((item) => ({
        ...item,
        label: t(`settings.nav.${item.key}`),
    }));

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box sx={{ px: 2, py: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title={t("nav.backToApp")}>
                    <IconButton size="small" onClick={() => navigate("/")} sx={{ mr: 0.5 }}>
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <SettingsIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                <Typography variant="h6" sx={{ lineHeight: 1, color: "primary.dark" }}>
                    {t("settings.title")}
                </Typography>
            </Box>
            <Divider />

            {/* Nav items */}
            <List sx={{ pt: 1, flex: 1 }}>
                {SETTINGS_NAV.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
                            <ListItemButton
                                selected={active}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    "&.Mui-selected": {
                                        bgcolor: "primary.main",
                                        color: "primary.contrastText",
                                        "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                                        "&:hover": { bgcolor: "primary.dark" },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 38, color: active ? "inherit" : "text.secondary" }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ variant: "body2" }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />
            <List sx={{ pt: 0.5, pb: 0.5 }}>
                <ListItem disablePadding sx={{ px: 1.5 }}>
                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "text.secondary" }}>
                        <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary={t("nav.signOut")} primaryTypographyProps={{ variant: "body2", fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {isMobile && (
                <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "primary.dark" }}>
                    <Toolbar>
                        <Tooltip title={t("nav.openMenu")}>
                            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <SettingsIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" noWrap>
                            {t("settings.title")}
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                {isMobile ? (
                    <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}>
                        {drawerContent}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            "& .MuiDrawer-paper": {
                                width: DRAWER_WIDTH,
                                boxSizing: "border-box",
                                border: "none",
                                boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
                            },
                        }}
                        open
                    >
                        {drawerContent}
                    </Drawer>
                )}
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    bgcolor: "background.default",
                    minHeight: "100vh",
                    pt: { xs: 8, md: 0 },
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <AppUpdateBanner />
                <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>{children}</Box>
                <AppFooter />
            </Box>
        </Box>
    );
}
