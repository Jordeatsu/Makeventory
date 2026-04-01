[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/MaterialFormModal.jsx

## What is this file?

The most complex form in the application — a pop-up dialog for **creating or editing a material**. It adapts its fields, labels, and validation rules based on the **material type's usage type** (Whole Item, Percentage, or Bulk).

## Why is it complex?

Different types of materials are costed differently:

| Usage Type | Example | How cost is tracked |
|---|---|---|
| **Whole Item** | A wooden button | Cost per single item |
| **Percentage** | Cotton thread | Cost per pack ÷ metres per pack = cost per metre |
| **Bulk** | Beads | Cost per pack ÷ items per pack = cost per bead |

This means the form shows different fields and calculates cost-per-unit differently depending on the type.

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is showing |
| `onClose` | Function | Called when user cancels |
| `onSave` | Function | Called with payload when user saves |
| `onSaveMore` | Function | Called when user saves and wants to add another material immediately |
| `onStockAdjusted` | Function | Called if user uses the "add to existing stock" shortcut |
| `initial` | Object | If provided, pre-fills form fields for editing |
| `materialTypes` | Array | All available material types (loaded by parent page) |

## State

| Variable | Description |
|---|---|
| `form` | All input field values |
| `errors` | Per-field validation error messages |
| `saveError` | Global error shown if the save API call fails |
| `existingMaterial` | If a duplicate name is found, the existing material data |

## Key functions

### `handleTypeChange(e)`
When the user selects a different material type: resets quantity/cost fields to that type's defaults and clears any duplicate-name warning.

### `handleNameBlur()`
When the user finishes typing the material name (on blur/tab-away): checks the server for a material with the same name and type. If found, shows a warning and an "Add to existing stock" button.

### `handleAddToExisting()`
If the user types a name that matches an existing material and enters a quantity, this function calls `PATCH /materials/:id/adjust-stock` to add to the existing material instead of creating a duplicate.

### `validate()`
Runs before saving. Checks:
- Name is not empty (and not a duplicate)
- A material type is selected
- Quantity is a valid number
- Cost per unit is a valid number
- Pack quantity is provided for Percentage and Bulk types

Returns `true` if valid; adds error messages to `errors` state if not.

### `buildPayload()`
Assembles the API payload from form state. Resolves the unit of measure and pack quantity based on the usage type.

### `handleSave()` / `handleSaveAndMore()`
Both validate, then call the appropriate `onSave`/`onSaveMore` prop. `handleSaveAndMore` keeps the dialog open and resets just the name and quantity fields so the user can quickly add another material.

## Cost insight panel

Below the cost fields, a live calculation panel shows the effective cost per unit and a useful reference calculation (e.g., "10 cm costs £0.05") — this helps the user verify they entered the cost correctly.

## Relationship to other files

- Uses `api.js` to check for duplicate names: [api.js](../../api.md)
- Uses `GlobalSettingsContext` to get the currency symbol: [context/GlobalSettingsContext.jsx](../../context/GlobalSettingsContext.md)
- Used in: `MaterialsPage.jsx`, `MaterialDetailPage.jsx`
