import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Divider, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 240;

const navItems = [
    { label: "Orders", path: "/orders", icon: <ReceiptLongIcon /> },
    { label: "Products", path: "/products", icon: <CategoryIcon /> },
    { label: "Materials", path: "/materials", icon: <InventoryIcon /> },
    { label: "Customers", path: "/customers", icon: <PeopleIcon /> },
    { label: "Year Review", path: "/year-review", icon: <CalendarMonthIcon /> },
];

export default function Layout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Brand */}
            <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
                <ColorLensIcon sx={{ color: "secondary.main", fontSize: 28 }} />
                <Box>
                    <Typography variant="h6" sx={{ lineHeight: 1, color: "primary.dark" }}>
                        Makeventory
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Inventory Manager
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <List sx={{ pt: 1, flex: 1 }}>
                {navItems.map((item) => {
                    const active = location.pathname.startsWith(item.path);
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
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            <Divider />
            <List sx={{ pt: 0.5, pb: 0.5 }}>
                <ListItem disablePadding sx={{ px: 1.5 }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ borderRadius: 2, color: "text.secondary" }}
                    >
                        <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><LogoutIcon /></ListItemIcon>
                        <ListItemText
                            primary={user ? `${user.firstName} ${user.lastName}` : "Sign out"}
                            secondary="Sign out"
                            primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: "caption" }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {/* App bar (mobile only) */}
            {isMobile && (
                <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "primary.dark" }}>
                    <Toolbar>
                        <Tooltip title="Open menu">
                            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                        <ColorLensIcon sx={{ mr: 1, color: "secondary.light" }} />
                        <Typography variant="h6" noWrap>
                            CraftStock
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
                        }}
                    >
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

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    bgcolor: "background.default",
                    minHeight: "100vh",
                    pt: { xs: 8, md: 0 },
                }}
            >
                <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
            </Box>
        </Box>
    );
}
