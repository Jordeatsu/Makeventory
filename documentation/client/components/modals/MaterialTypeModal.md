[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/MaterialTypeModal.jsx

## What is this file?

A pop-up dialog for **creating or editing a material type**. Material types are categories that define how materials of that type are measured, costed, and tracked (e.g., "Cotton Thread" might be a type with Percentage usage measured in metres).

## Why are material types important?

Every material must belong to a type, and the type defines:
- **Usage type** — how the material is consumed: Whole Item, Percentage, or Bulk
- **Unit of measure** — what measurement unit applies (mm, cm, m, pieces, etc.)
- **Default values** — sensible starting values pre-filled when creating new materials of this type

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is showing |
| `initial` | Object or null | If provided, the existing type being edited. If null, creates a new type. |
| `onClose` | Function | Called when user cancels |
| `onSaved` | Function | Called with `(newType, isEdit)` after successful save |

## State

| Variable | Description |
|---|---|
| `form` | All field values |
| `saving` | Whether save is in progress |
| `error` | Validation or server error message |

## Key form fields

| Field | Required | Notes |
|---|---|---|
| Name | Yes | Must be unique |
| Description | No | Free text |
| Usage Type | Yes | Whole Item / Percentage / Bulk |
| Unit of Measure | Only for Percentage | The unit materials of this type are measured in |
| isActive | Yes | Toggle — inactive types won't appear in new material forms |
| Default Stock Qty | No | Pre-fills the quantity when creating a material of this type |
| Low Stock Threshold | No | Pre-fills the low-stock warning level |
| Default Cost Price | No | Pre-fills the cost field |
| Purchase Qty | No | Pre-fills the pack quantity field (used for Percentage/Bulk) |

## Functions

### `set(field)`
Returns an onChange handler for a field.

### `handleSubmit()`
Validates then calls `POST /api/material-types` (new) or `PUT /api/material-types/:id` (edit).

For "Whole Item" and "Bulk" types, `unitOfMeasure` is forced to `"piece"` since it's irrelevant for those usage types.

## Relationship to other files

- Material types are stored in the `MaterialType` MongoDB model: [server/models/MaterialType.md](../../../server/models/MaterialType.md)
- Used in: `MaterialTypesPage.jsx`, `MaterialTypeDetailPage.jsx`
- Materials reference their type by name: when a material is added, its type is looked up by name on the server
