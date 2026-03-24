[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/MaterialTypesPage.jsx

## What is this file?

The **Material Types management page** at `/settings/material-types`. Lists all material types with options to create, edit, and delete them.

## What are material types?

Material types define *how* materials are measured and costed. For example:
- "DMC Thread" might be a type with Percentage usage, measured in metres
- "Wooden Buttons" might be a type with Whole Item usage, measured in pieces

Every material must belong to a type, and the type determines which fields appear in the material form.

## Sections

At the top: 3 stat cards — total, active, and inactive type counts.

Below: A table of all types with columns: Name, Usage Type, Unit, Status (Active/Inactive chip), Actions (Edit + Delete).

## State

| Variable | Description |
|---|---|
| `types` | List of all material types |
| `loading` | Loading state |
| `fetchError` | Error loading types |
| `modalOpen` | Whether the create/edit modal is open |
| `editing` | Type being edited (null = create new) |
| `blockedOpen` | Whether the delete-blocked modal is showing |
| `blockedMaterials` | List of material names blocking a deletion |

## Key functions

### `load()`
Fetches `GET /api/material-types`.

### `handleSaved(type, isEdit)`
Called by `MaterialTypeModal` after a save. Directly updates the `types` array — either replaces the edited type or appends the new one. Avoids a full reload.

### `handleDelete(id)`
Calls `DELETE /api/material-types/:id`. If the server returns `409 Conflict` (type is in use), sets `blockedMaterials` and opens `DeleteBlockedModal`. Otherwise removes the type from the list.

## Relationship to other files

- Uses `MaterialTypeModal`: [components/modals/MaterialTypeModal.jsx](../../components/modals/MaterialTypeModal.md)
- Uses `DeleteBlockedModal`: [components/modals/DeleteBlockedModal.jsx](../../components/modals/DeleteBlockedModal.md)
- Clicking a type name navigates to `MaterialTypeDetailPage.jsx`
- API: [server/routes/materialTypes.md](../../../server/routes/materialTypes.md)
