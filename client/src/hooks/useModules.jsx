import { useState, useEffect } from 'react';
import InventoryIcon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExtensionIcon from '@mui/icons-material/Extension';
import api from '../api';

// Maps module names (as stored in the DB) to a route path and icon
const MODULE_CONFIG = {
    'Inventory':   { path: '/materials',   icon: <InventoryIcon /> },
    'Products':    { path: '/products',    icon: <CategoryIcon /> },
    'Orders':      { path: '/orders',      icon: <ReceiptLongIcon /> },
    'Customers':   { path: '/customers',   icon: <PeopleIcon /> },
    'Year Review': { path: '/year-review', icon: <CalendarMonthIcon /> },
};

export function useModules() {
    const [navItems, setNavItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/modules')
            .then((res) => {
                const items = res.data.modules.map((mod) => {
                    const config = MODULE_CONFIG[mod.name] ?? {
                        path: `/${mod.name.toLowerCase().replace(/\s+/g, '-')}`,
                        icon: <ExtensionIcon />,
                    };
                    return { label: mod.name, ...config };
                });
                setNavItems(items);
            })
            .catch(() => setNavItems([]))
            .finally(() => setLoading(false));
    }, []);

    return { navItems, loading };
}
