[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/utils/formatting.js

## What is this file?

A collection of **shared formatting utility functions** used across multiple pages. Having these in one place prevents duplicate code and ensures consistent formatting throughout the app.

## Exported values

### `CURRENCY_SYMBOLS`

A lookup table mapping currency codes to their display symbols.

```js
{ GBP: "£", USD: "$", EUR: "€", AUD: "$", CAD: "$", NZD: "$" }
```

---

### `useCurrencyFormatter(settings)`

**Type:** A factory function (returns a formatter function)

**Purpose:** Creates a function that formats a number as a currency string using the symbol from the user's global settings.

**Usage:**
```jsx
const fmt = useCurrencyFormatter(settings); // settings from GlobalSettingsContext
fmt(42.5); // returns "£42.50" (if currency is GBP)
```

The function uses `Number(n || 0).toFixed(2)` to ensure two decimal places and handle `null`/`undefined` safely.

---

### `fmtDate(d)`

Formats a date to the short `en-GB` format: `01/01/2024`.

```js
fmtDate('2024-06-15T10:30:00Z'); // "15/06/2024"
fmtDate(null); // "—"
```

---

### `fmtDateLong(d)`

Formats a date with the full month name: `15 June 2024`.

```js
fmtDateLong('2024-06-15T10:30:00Z'); // "15 June 2024"
```

---

### `fmtDateTime(d)`

Formats a date with both date and time, using the user's locale: `15 June 2024 at 10:30`.

```js
fmtDateTime('2024-06-15T10:30:00Z'); // "15 June 2024 at 10:30"
```

---

### `TABLE_HEAD_SX`

An MUI `sx` prop object that applies consistent styling to table headers across all pages:
- Bold font weight (`fontWeight: 600`)
- Light background (`bgcolor: "background.default"`)

**Usage:**
```jsx
<Table sx={TABLE_HEAD_SX}>
```

## Relationship to other files

- `useCurrencyFormatter` is used by virtually every page that displays money values
- `fmtDate`, `fmtDateLong`, `fmtDateTime` are used in detail pages and the Year Review page
- `TABLE_HEAD_SX` is used in all list pages with tables
- `settings` passed to `useCurrencyFormatter` comes from `GlobalSettingsContext.jsx`
