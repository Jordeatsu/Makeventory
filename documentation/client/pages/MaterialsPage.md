[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/MaterialsPage.jsx

## What is this file?

The **materials list page** at `/materials`. Shows all materials in a searchable, type-filtered table. Users can add, edit, and delete materials.

## Key features

- **Low Stock Alert section:** If any materials are below their low-stock threshold, they appear in a highlighted warning table at the top of the page
- **Type filter:** A dropdown to filter materials by material type
- **Search:** Live search filtering by name
- **Add Material / Edit Material:** Opens `MaterialFormModal` in create or edit mode
- **"Save and Add More":** After saving a material, the modal stays open so the user can quickly add another material of the same type

## State

| Variable | Description |
|---|---|
| `materials` | Filtered list shown in the main table |
| `materialTypes` | All types for the filter dropdown |
| `loading` | Whether data is loading |
| `error` | Error message string |
| `search` | Current search term |
| `typeFilter` | Currently selected type filter |
| `formOpen` | Whether the add/edit modal is open |
| `editing` | The material being edited (null = create mode) |
| `deleteTarget` | The material selected for deletion |
| `lowStockMaterials` | Materials below their threshold |

## Key functions

### `load()`
Fetches two parallel requests:
1. `GET /api/materials?search=...&type=...` — the filtered list for the main table
2. `GET /api/materials` — all materials to check which are low on stock

### `handleSave(form)`
Calls `PUT /api/materials/:id` (edit) or `POST /api/materials` (create). If the save fails, it re-throws the error so `MaterialFormModal` can display it inline.

### `handleSaveMore(form)`
Similar to `handleSave` but always calls `POST` (create) and does not close the modal (the modal handles that itself after calling this).

### `handleDelete()`
Calls `DELETE /api/materials/:id`.

## Table columns

Name, Type, Colour, Quantity, Unit, Cost/Unit, Low Stock Threshold, Supplier, Actions

## Relationship to other files

- Uses `MaterialFormModal`: [components/modals/MaterialFormModal.jsx](../components/modals/MaterialFormModal.md)
- Clicking a material name navigates to `MaterialDetailPage.jsx`
- API calls to `server/routes/materials.js`: [server/routes/materials.md](../../server/routes/materials.md)
