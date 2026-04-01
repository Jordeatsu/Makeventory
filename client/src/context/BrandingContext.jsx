import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const BrandingContext = createContext({ businessName: 'Makeventory', logo: null });

export function BrandingProvider({ children }) {
    const [branding, setBranding] = useState({ businessName: 'Makeventory', logo: null });

    useEffect(() => {
        api.get('/public/business')
            .then((res) => setBranding(res.data))
            .catch(() => {});
    }, []);

    // Keep the browser tab title in sync: "Makeventory - Business Name"
    useEffect(() => {
        document.title = branding.businessName && branding.businessName !== 'Makeventory'
            ? `Makeventory - ${branding.businessName}`
            : 'Makeventory';
    }, [branding.businessName]);

    return (
        <BrandingContext.Provider value={branding}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
