[🏠 Home](../README.md) · [↑ Client](README.md)

---

# client/src/theme.js

## What is this file?

Defines the **visual design system** for the entire application — colours, typography, and component styling using MUI's theming system.

## What is MUI?

MUI (Material UI) is a React component library. It provides pre-built components like buttons, tables, dialogs, and navigation drawers. The **theme** is a configuration object that tells MUI which colours, fonts, and styles to use for all its components.

## Exported values

### `BRAND`

The core colour palette. Edit these values to retheme the entire application in one place.

| Token | Hex | Description |
|---|---|---|
| `darkest` | `#565264` | Deep purple-slate — used for navigation background and dark accents |
| `dark` | `#706677` | Muted purple — primary main colour |
| `mid` | `#A6808C` | Mauve rose — primary light, secondary main |
| `light` | `#CCB7AE` | Warm blush — secondary light, table headers |
| `pale` | `#D6CFCB` | Soft warm grey — page background |
| `white` | `#FFFFFF` | White — cards and paper surfaces |

### `STATUS_COLOURS`

Colours used for order status chips and dashboard chart bars.

| Status | Colour |
|---|---|
| `Pending` | Peach |
| `In Progress` | Warm yellow |
| `Completed` | Sage green |
| `Shipped` | Brighter green |
| `Cancelled` | Grey |

### `SEMANTIC`

Standard feedback colours used in toasts, alerts, and indicators.

| Key | Colour | Use |
|---|---|---|
| `success` | Green | Success messages |
| `warning` | Orange | Warning messages |
| `error` | Red | Error messages |
| `info` | Blue | Informational messages |

### `theme` (default export)

The MUI theme object created with `createTheme()`. This is what `ThemeProvider` in `main.jsx` uses.

It maps the `BRAND` palette into MUI's expected palette structure:
- `primary.main` = `BRAND.dark`
- `secondary.main` = `BRAND.mid`
- `background.default` = `BRAND.pale`
- `background.paper` = `BRAND.white`
- Plus custom typography using the "Inter" font

## How to change the theme

To retheme the app, only the `BRAND` object needs to be edited — all other colours derive from it.

## Relationship to other files

- Applied globally via `ThemeProvider` in `main.jsx`
- `STATUS_COLOURS` and `BRAND` are imported directly by pages that need specific colour tokens (e.g. `DashboardPage.jsx`, `OrdersPage.jsx`)
- `SEMANTIC` is used in `useToast.js` and toast notification components
