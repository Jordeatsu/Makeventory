import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import { useToast } from "./useToast";

/**
 * Shared state + loader for list pages.
 *
 * @param {string|null} apiPath  - API path to GET, e.g. "/customers".
 *   Pass null to skip the built-in load and use the returned setters directly.
 * @param {string|null} itemsKey - Key in the response data, e.g. "customers".
 * @param {object}      [opts]
 *   @param {string} [opts.settingsPath] - API path for column-visibility settings.
 *   @param {string} [opts.errorKey]     - i18n key used when the built-in load fails.
 *
 * @returns {{
 *   items, setItems, loading, setLoading, error, setError,
 *   search, setSearch, col,
 *   formOpen, setFormOpen, editing, setEditing, deleteTarget, setDeleteTarget,
 *   load, toast, showToast, closeToast
 * }}
 *
 * load(extraParams?) — fetches apiPath with { search, ...extraParams } and populates items.
 * For pages with custom fetch logic (e.g. parallel requests), pass apiPath=null and use the
 * returned setters (setLoading, setError, setItems) inside a locally-defined load function.
 */
export function useListData(apiPath, itemsKey, { settingsPath, errorKey = "common.loadError" } = {}) {
    const { t } = useTranslation();
    const { toast, showToast, closeToast } = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [colSettings, setColSettings] = useState({});
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (!settingsPath) return;
        api.get(settingsPath)
            .then(({ data }) => setColSettings(data?.settings?.tableColumns ?? {}))
            .catch(() => {});
    }, [settingsPath]);

    const col = useCallback((key) => colSettings[key] !== false, [colSettings]);

    const load = useCallback(
        async (extraParams = {}) => {
            if (!apiPath) return;
            setLoading(true);
            setError("");
            try {
                const params = { ...(search ? { search } : {}), ...extraParams };
                const { data } = await api.get(apiPath, { params });
                setItems(data[itemsKey] ?? []);
            } catch {
                setError(t(errorKey));
            } finally {
                setLoading(false);
            }
        },
        [apiPath, itemsKey, errorKey, search, t],
    );

    return {
        items,
        setItems,
        loading,
        setLoading,
        error,
        setError,
        search,
        setSearch,
        col,
        formOpen,
        setFormOpen,
        editing,
        setEditing,
        deleteTarget,
        setDeleteTarget,
        load,
        toast,
        showToast,
        closeToast,
    };
}
