import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

const GlobalSettingsContext = createContext(null);

export function GlobalSettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => ({
        language: localStorage.getItem('makeventory_lang') || 'en',
        currency: localStorage.getItem('makeventory_currency') || 'GBP',
    }));

    useEffect(() => {
        fetch('/api/settings/global')
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.settings) {
                    const { language, currency } = data.settings;
                    setSettings({ language, currency });
                    localStorage.setItem('makeventory_lang', language);
                    localStorage.setItem('makeventory_currency', currency);
                    i18n.changeLanguage(language);
                }
            })
            .catch(() => {});
    }, []);

    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('makeventory_lang', newSettings.language);
        localStorage.setItem('makeventory_currency', newSettings.currency);
        i18n.changeLanguage(newSettings.language);
    };

    return (
        <GlobalSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
