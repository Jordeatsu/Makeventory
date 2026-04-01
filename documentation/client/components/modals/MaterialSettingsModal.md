[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/MaterialSettingsModal.jsx

## What is this file?

A pop-up dialog for editing **material-wide settings**. These settings affect default behaviour across all materials in the application.

## What settings does it control?

| Setting | Description |
|---|---|
| **Default low stock threshold** | How low a material's quantity must fall before it shows as "low stock" (app-wide default) |
| **Currency** | Which currency symbol to show for material costs |
| **Auto-deduct on order complete** | Whether to automatically reduce material stock when an order status changes to "Completed" |
| **Track fractional quantities** | Whether to allow decimal quantities (e.g., 2.5 metres) or integers only |

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is visible |
| `current` | Object | The current settings values to pre-fill the form |
| `onClose` | Function | Called when the user cancels |
| `onSaved` | Function | Called with the updated settings object after a successful save |

## State

| Variable | Description |
|---|---|
| `form` | Copy of `current` being edited |
| `saving` | Whether the save is in progress |
| `error` | Error message if saving fails |

## Functions

### `setField(field)`
Returns an `onChange` handler for regular input fields (text, selects).

### `setToggle(field)`
Returns an `onChange` handler for toggle switches (boolean fields).

### `handleSubmit()`
Validates that the low stock threshold is a valid non-negative number, then calls `PUT /api/settings/materials` with the updated settings. Calls `onSaved(body.settings)` on success.

## Relationship to other files

- Used by `MaterialSettingsPage.jsx`
- Saves to the `MaterialSettings` model via `server/routes/settings.js`
