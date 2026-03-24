[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/ProductsPage.jsx

## What is this file?

The **products list page** at `/products`. Displays all products, with tools to create, edit, duplicate, and delete them.

## View modes

The page uses tabs to switch between product types:

| Tab index | Filter | Shows |
|---|---|---|
| 0 | All | All products in grouped sections (grouped by type) |

Products are grouped within the table by type (Standard / Template / Variant) using `useMemo`.

## State

| Variable | Description |
|---|---|
| `products` | All products loaded from the API |
| `loading` | Whether products are loading |
| `error` | Error message |
| `search` | Search term for product name filtering |
| `tab` | Active tab (not currently changing the query, used for visual grouping) |
| `dialogOpen` | Whether the product form is open |
| `editing` | Product being edited |
| `deleteTarget` | Product selected for deletion |

## Key functions

### `load()`
Fetches `GET /api/products` with an optional search query.

### `handleSave(payload)`
- Edit: `PUT /api/products/:id`
- Create: `POST /api/products`
- Shows success toast and reloads

### `handleDuplicate(p)`
Creates a copy of a product by stripping its `_id`, `__v`, `createdAt`, `updatedAt`, and `estimatedMaterialCost` fields and opening the form modal in "create" mode with the remaining data pre-filled.

### `handleDelete()`
Calls `DELETE /api/products/:id`.

### `groupedByType`
A `useMemo` that groups products into Standard / Template / Variant buckets based on `isTemplate` and `parentProduct` fields.

## Table columns (per row)

Name (with Template/Variant chip), SKU, Category, Estimated Material Cost, Base Price, Estimated Margin, Status (Active/Inactive), Actions

## Estimated margin formula

$$\text{Margin} = \frac{\text{basePrice} - \text{totalMaterialCost}}{\text{basePrice}} \times 100\%$$

For variants, `totalMaterialCost` includes the parent product's material cost plus the variant's own additional materials.

## Relationship to other files

- Uses `ProductFormModal`: [components/modals/ProductFormModal.jsx](../components/modals/ProductFormModal.md)
- Clicking a row navigates to `ProductDetailPage.jsx`
- API docs: [server/routes/products.md](../../server/routes/products.md)
