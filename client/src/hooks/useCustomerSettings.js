import { useState, useEffect } from 'react';
import api from '../api';

const DEFAULT_FIELDS = {
    email:        true,
    phone:        true,
    addressLine1: true,
    addressLine2: false,
    city:         true,
    state:        true,
    postcode:     true,
    country:      true,
};

/**
 * Fetches the customer field-visibility settings from the API.
 * Returns { fields, loading } where `fields` is an object like
 * { email: true, phone: false, … }.  "name" is always shown and
 * is not included in fields.
 */
export function useCustomerSettings() {
    const [fields, setFields]   = useState(DEFAULT_FIELDS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/settings/customers')
            .then(({ data }) => {
                if (data?.settings?.fields) {
                    setFields({ ...DEFAULT_FIELDS, ...data.settings.fields });
                }
            })
            .catch(() => { /* fall back to defaults */ })
            .finally(() => setLoading(false));
    }, []);

    return { fields, loading };
}
