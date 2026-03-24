[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/MaterialSettingsPage.jsx

## What is this file?

The **Material Settings page** at `/settings/materials`. Displays the current material configuration and provides an Edit button to change settings.

## What it shows

Four settings in a panel:
1. **Default low stock threshold** — the global app-wide fallback value
2. **Currency** — which currency to display for material costs
3. **Auto-deduct on order complete** — On/Off
4. **Track fractional quantities** — On/Off

## Internal component: `SettingRow`

Displays a setting with an optional description text below the label. Not exported.

## State

| Variable | Description |
|---|---|
| `settings` | The loaded settings object from the API |
| `loading` | Loading state |
| `error` | Error message |
| `modalOpen` | Whether the edit modal is open |

## Data loading

On mount: calls `fetch('/api/settings/materials')`. If the request fails, shows an error message.

## Functions

No named functions beyond event handlers. The Edit button opens the modal; the modal's `onSaved` callback updates `settings` in place (no reload needed).

## Relationship to other files

- Uses `MaterialSettingsModal`: [components/modals/MaterialSettingsModal.jsx](../../components/modals/MaterialSettingsModal.md)
- API endpoint: `GET /api/settings/materials`, `PUT /api/settings/materials` via [server/routes/settings.md](../../../server/routes/settings.md)
