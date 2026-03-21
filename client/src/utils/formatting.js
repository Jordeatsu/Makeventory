/** Shared formatting utilities used across multiple pages. */

export const CURRENCY_SYMBOLS = { GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" };

/**
 * Returns a currency-aware formatter function.
 * @param {object} settings - GlobalSettings object with a `currency` field.
 * @returns {(n: number|string) => string}
 */
export function useCurrencyFormatter(settings) {
    const sym = CURRENCY_SYMBOLS[settings?.currency] ?? "£";
    return (n) => `${sym}${Number(n || 0).toFixed(2)}`;
}

/** Formats a date string to short en-GB format (e.g. 01/01/2024). */
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

/** Formats a date string with full month name (e.g. 1 January 2024). */
export const fmtDateLong = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

/** Formats a date string with date and time (e.g. 1 January 2024 at 10:30). */
export const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }) : "—";

/** MUI Table sx prop that bolds headers and applies background — use on `<Table sx={TABLE_HEAD_SX}>`. */
export const TABLE_HEAD_SX = { "& th": { fontWeight: 600, bgcolor: "background.default" } };
