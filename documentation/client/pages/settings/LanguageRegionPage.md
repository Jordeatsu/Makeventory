[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/LanguageRegionPage.jsx

## What is this file?

The **Language & Region settings page** at `/settings/language-region`. Displays the current language and currency settings and provides an Edit button to change them.

## What it shows

A read-only view of:
- Current language (e.g. "English 🇬🇧")
- Current currency (e.g. "GBP")

An "Edit" button opens `LanguageRegionModal`.

## Internal component: `SettingRow`

A small inline component (not exported) that lays out a label/value pair in a row:
```
Language                               English 🇬🇧
─────────────────────────────────────────────────
Currency                               GBP
```

## State

| Variable | Description |
|---|---|
| `modalOpen` | Whether the edit modal is open |
| `saved` | Shows a green "Saved" alert for 3 seconds after saving |

## Functions

### `handleSaved()`
Called by the modal after a successful save. Sets `saved = true` (shows the banner), then clears it after 3 seconds.

## Relationship to other files

- Uses `LanguageRegionModal`: [components/modals/LanguageRegionModal.jsx](../../components/modals/LanguageRegionModal.md)
- Uses `GlobalSettingsContext` for current values: [context/GlobalSettingsContext.jsx](../../context/GlobalSettingsContext.md)
- Registered in the settings routes in `App.jsx`
