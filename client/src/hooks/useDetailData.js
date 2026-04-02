import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "./useToast";

/**
 * Shared state + loader for detail pages.
 *
 * @param {Function} fetchFn - async function that returns the page data.
 *   MUST be wrapped in useCallback with [id] as a dep so the hook re-fetches
 *   when the ID changes. Throw new Error(message) for custom error messages.
 * @param {object}  [opts]
 *   @param {string} [opts.errorKey] - i18n fallback key when fetchFn throws without a message.
 *
 * @returns {{ data, setData, loading, error, setError, editOpen, setEditOpen, load, toast, showToast, closeToast }}
 */
export function useDetailData(fetchFn, { errorKey = "common.loadFailed" } = {}) {
    const { t } = useTranslation();
    const { toast, showToast, closeToast } = useToast();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editOpen, setEditOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await fetchFn();
            setData(result);
        } catch (e) {
            const axiosAppMessage = e?.response?.data?.error;
            const isAxiosError = !!e?.isAxiosError || !!e?.response;
            const message = axiosAppMessage || (!isAxiosError && e?.message) || t(errorKey);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, t, errorKey]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, setData, loading, error, setError, editOpen, setEditOpen, load, toast, showToast, closeToast };
}
