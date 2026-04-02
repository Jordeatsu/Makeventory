import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";

/**
 * Encapsulates the saving/saved/error state pattern used in every settings
 * section that issues a PUT to the API.
 *
 * @param {string} endpoint  - API path, e.g. "/settings/customers"
 * @param {string} errorKey  - i18n key used when the request fails
 * @returns {{ saving, saved, error, save }}
 *   save(payload) — call with the request body; returns the response data
 */
export function useSettingsSave(endpoint, errorKey) {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const savedTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        };
    }, []);

    const save = async (payload) => {
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        setSaved(false);
        setSaving(true);
        setError(null);
        try {
            const { data } = await api.put(endpoint, payload);
            setSaved(true);
            savedTimerRef.current = setTimeout(() => {
                setSaved(false);
                savedTimerRef.current = null;
            }, 3000);
            return data;
        } catch {
            setSaved(false);
            setError(t(errorKey));
        } finally {
            setSaving(false);
        }
    };

    return { saving, saved, error, save };
}
