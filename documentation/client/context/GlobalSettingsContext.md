[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/context/GlobalSettingsContext.jsx

## What is this file?

Provides the app's **global language and currency settings** to every component via React Context.

## What this context provides

Any component that calls `useGlobalSettings()` gets:

| Value | Type | Description |
|---|---|---|
| `settings` | Object | `{ language: 'en', currency: 'GBP' }` |
| `updateSettings(newSettings)` | Function | Updates language and currency everywhere |

## How it works

### On startup

1. The context initialises from `localStorage` (so the last-used language/currency loads instantly without waiting for the server)
2. Then fetches `GET /api/settings/global` to get the server's stored settings
3. Updates both the context state and `localStorage`
4. Calls `i18n.changeLanguage()` to switch the UI language

Using `localStorage` as the initial value prevents a flash of the wrong language while the server request is loading.

### `updateSettings(newSettings)`

Called by `LanguageRegionPage.jsx` when the user saves new settings. It:
1. Updates the React state
2. Saves to `localStorage`
3. Calls `i18n.changeLanguage()` to immediately switch the UI language

## Note on currency

The currency stored here is the global display currency — formatters throughout the app use it to show `£`, `$`, `€`, etc. It is independent of the `currency` field in `MaterialSettings`.

## How to use it

```jsx
import { useGlobalSettings } from '../context/GlobalSettingsContext';
import { useCurrencyFormatter } from '../utils/formatting';

function MyComponent() {
    const { settings } = useGlobalSettings();
    const fmt = useCurrencyFormatter(settings);
    return <p>Total: {fmt(42.50)}</p>;
}
```

## Relationship to other files

- `GlobalSettingsProvider` wraps the entire app in `App.jsx` (outermost provider)
- `i18n.js` is imported here and its `changeLanguage()` method is called on updates
- `LanguageRegionPage.jsx` calls `updateSettings()` after saving to the server
- `useCurrencyFormatter` in `utils/formatting.js` uses the `settings` object from this context
- The `GET /api/settings/global` endpoint is public (no auth required) — see `routes/settings.js`
