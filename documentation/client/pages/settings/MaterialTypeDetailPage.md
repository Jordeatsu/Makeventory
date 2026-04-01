[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/MaterialTypeDetailPage.jsx

## What is this file?

The **Material Type detail page** at `/settings/material-types/:id`. Shows the full configuration of a single material type, including its usage type, unit of measure, and all default values.

## What it shows

- Name, description, usage type, unit, and active/inactive status
- Defaults section (if any are set): default stock quantity, low stock threshold, default cost price, purchase quantity

## Internal component: `DetailRow`

A local `DetailRow` component (defined in this file, not imported from `common/`) that shows label/value pairs in a grid. Returns null if value is empty — so only populated fields render.

## State

| Variable | Description |
|---|---|
| `type` | The material type record |
| `loading` | Loading state |
| `error` | Error message |
| `editOpen` | Whether the edit modal is open |

## Key functions

### `load()`
Fetches `GET /api/material-types/:id`.

### `handleSaved()`
Closes the modal, shows a toast, and reloads.

## Back navigation

A back arrow button in the header navigates to `/settings/material-types` (the list page).

## Relationship to other files

- Uses `MaterialTypeModal`: [components/modals/MaterialTypeModal.jsx](../../components/modals/MaterialTypeModal.md)
- Parent list page: [pages/settings/MaterialTypesPage.jsx](./MaterialTypesPage.md)
- API: [server/routes/materialTypes.md](../../../server/routes/materialTypes.md)
