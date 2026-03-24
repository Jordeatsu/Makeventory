[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/GlobalSettings.js

## What is this file?

Defines the **GlobalSettings** database schema — a **singleton** document that stores app-wide settings affecting the entire application.

**Singleton** means there is only ever one GlobalSettings document in the database. It is created once during installation and updated (never created again) when settings are changed.

## Schema fields

| Field | Type | Values | Description |
|---|---|---|---|
| `language` | String | `en`, `fr`, `es` | The UI language for the application |
| `currency` | String | `GBP`, `USD`, `EUR`, `AUD`, `CAD`, `NZD` | The display currency |

## Why is this public?

The `/api/settings/global` GET endpoint does NOT require authentication. This is intentional — the React front-end needs to know the language setting before the user logs in, so that the login page itself can be displayed in the correct language.

## How currency is used

The `currency` value is read by `GlobalSettingsContext.jsx` in the front-end and passed to the `useCurrencyFormatter()` utility in `utils/formatting.js`. This utility adds the appropriate symbol (`£`, `$`, `€`, etc.) to monetary values throughout the UI.

## Relationship to other files

- Read and written by `routes/settings.js`
- Read at startup by `GlobalSettingsContext.jsx` (client-side React context)
- Seeded with default values during installation
- The `language` value also affects `i18n.js` in the client
