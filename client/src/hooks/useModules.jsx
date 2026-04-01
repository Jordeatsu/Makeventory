import { useState, useEffect } from "react";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CategoryIcon from "@mui/icons-material/Category";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ExtensionIcon from "@mui/icons-material/Extension";
import { useTranslation } from "react-i18next";
import api from "../api";

// Maps module names (as stored in the DB) to a route path and icon
const MODULE_CONFIG = {
    Inventory: { path: "/materials", icon: <InventoryIcon /> },
    Products: { path: "/products", icon: <CategoryIcon /> },
    Orders: { path: "/orders", icon: <ReceiptLongIcon /> },
    Customers: { path: "/customers", icon: <PeopleIcon /> },
    "Year Review": { path: "/year-review", icon: <CalendarMonthIcon /> },
};

export function useModules() {
    const [navItems, setNavItems] = useState([]);
    const [activeModules, setActiveModules] = useState([]); // raw module name strings
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        api.get("/modules")
            .then((res) => {
                const mods = res.data.modules ?? [];
                const items = mods.map((mod) => {
                    const config = MODULE_CONFIG[mod.name] ?? {
                        path: `/${mod.name.toLowerCase().replace(/\s+/g, "-")}`,
                        icon: <ExtensionIcon />,
                    };
                    // Use translation key matching the DB module name; fall back to DB name
                    const label = t(`modules.${mod.name}`, mod.name);
                    return { label, ...config };
                });
                setNavItems(items);
                setActiveModules(mods.map((m) => m.name));
            })
            .catch(() => {
                setNavItems([]);
                setActiveModules([]);
            })
            .finally(() => setLoading(false));
    }, [t]);

    return { navItems, activeModules, loading };
}
