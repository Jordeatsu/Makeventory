[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/ProductFormModal.jsx

## What is this file?

A pop-up dialog for **creating or editing a product**. Products can be one of three types, chosen via tabs at the top of the form:

| Tab | Type | Description |
|---|---|---|
| 0 | **Standard** | A standalone product with its own materials recipe |
| 1 | **Parent (Template)** | A reusable template — other products can inherit its materials recipe |
| 2 | **Variant** | A product that extends a parent's recipe with extra materials |

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is visible |
| `onClose` | Function | Called when user cancels |
| `onSave` | Function | Called with the complete payload on save |
| `initial` | Object | If provided, pre-fills the form for editing |

## State

| Variable | Description |
|---|---|
| `tab` | Which product type tab is active (0, 1, or 2) |
| `form` | Product fields: name, sku, category, description, basePrice, active |
| `materials` | List of material rows in the recipe |
| `parentId` | For variants: the ID of the selected parent product |
| `allMaterials` | All materials available to add to the recipe |
| `allParents` | All products that can be used as a parent (templates + standard products) |

## Key functions

### `addMaterialLine()`
Validates and adds a new material row to the recipe. Handles Bulk/Multipack types by dividing pack cost by items per pack to get the per-unit cost.

### `updateMaterialQty(i, rawVal)`
Updates a material row's quantity and recalculates its line cost.

### `handleTabChange(_, v)`
Switches between Standard / Parent / Variant tabs. Clears `parentId` when switching away from Variant.

### `handleSave()`
Validates name is present (and parent is selected for Variant), then calls `onSave(payload)` with:
- `isTemplate: true` for Parent tabs
- `parentProduct: parentId` for Variant tabs
- `defaultMaterials: [...]` array of all recipe rows

## Materials recipe

Below the product fields, a table shows all materials in the recipe with their quantity, cost per unit, and line cost. A live total is shown at the bottom.

For variants, there is also a read-only preview showing the materials inherited from the parent product.

## Estimated margin

While the form is open, an estimated margin percentage is calculated live:

$$\text{Margin} = \frac{\text{basePrice} - \text{totalMaterialCost}}{\text{basePrice}} \times 100$$

## Relationship to other files

- Uses `GlobalSettingsContext` for currency symbol: [context/GlobalSettingsContext.jsx](../../context/GlobalSettingsContext.md)
- Used in: `ProductsPage.jsx`, `ProductDetailPage.jsx`
