[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/LanguageRegionModal.jsx

## What is this file?

A pop-up dialog for changing the application's **display language** and **currency**. These are global settings — changing them affects the entire application for all users.

## What it changes

- **Language:** English, Français, or Español — changes all on-screen labels and text instantly
- **Currency:** GBP (£), USD ($), EUR (€), AUD ($), CAD ($), NZD ($) — changes how financial amounts are displayed throughout the app

## State

| Variable | Description |
|---|---|
| `language` | Currently selected language code (`en`, `fr`, `es`) |
| `currency` | Currently selected currency code (`GBP`, `USD`, etc.) |
| `saving` | Whether the form is currently being submitted |
| `error` | Error message to show if saving fails |

## Initialisation

When the dialog opens, the current language and currency are loaded from `GlobalSettingsContext` so the user sees the existing values as a starting point.

## Language selector appearance

Languages are shown as clickable card tiles (not a drop-down). The selected language gets a highlighted border:

```
┌────────┐  ┌────────┐  ┌────────┐
│  🇬🇧   │  │  🇫🇷   │  │  🇪🇸   │
│English │  │Français│  │Español │
└────────┘  └────────┘  └────────┘
     ↑ selected (highlighted border)
```

## Functions

### `handleSubmit()`
1. Calls `PUT /api/settings/global` with the selected language and currency 
2. If successful: calls `updateSettings()` on the context (updates the app in real time), calls `onSaved()` and `onClose()`
3. If it fails: shows the error message

## Relationship to other files

- Called from `LanguageRegionPage.jsx`
- Updates `GlobalSettingsContext` so language/currency change takes effect immediately without a page reload
- Language change triggers `i18n.changeLanguage()` — see [context/GlobalSettingsContext.jsx](../../context/GlobalSettingsContext.md)
