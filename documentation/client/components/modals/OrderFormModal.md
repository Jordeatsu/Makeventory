[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/OrderFormModal.jsx

## What is this file?

The largest form in the application — a pop-up dialog for **creating or editing an order**. An order contains:
- Order metadata (origin platform, date, status, order number)
- Customer (existing or new)
- Products purchased (with quantities and prices)
- Materials used (with quantities and costs)
- Financial breakdown (pricing, discounts, fees, shipping, profit calculation)

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is showing |
| `onClose` | Function | Called when user cancels |
| `onSave` | Function | Called with the complete payload on save |
| `initial` | Object | If provided, pre-fills the form for editing |

## State

The component manages a large amount of state — broken into logical groups:

### Order fields
`form` — origin, originOrderId, orderDate, status, productDescription, notes, trackingNumber, all financial fields (totalCharged, shippingCost, buyerTax, discount, discountType, hostingCost, marketingCost, refund)

### Customer
- `selectedCustomer` — the existing customer object (if one was picked from the list)
- `customerInput` — text currently typed in the customer autocomplete field
- `newCustomerData` — address/phone/email fields for a brand-new customer

### Product lines
- `products` — array of product rows (productId, name, sku, category, basePrice, quantity)
- `productOptions` — list of all products to choose from (loaded on open)
- `newProductLine` — the currently being-added product row

### Material lines
- `materials` — array of material rows (name, type, quantity used, unit, cost per unit, line cost)
- `allMaterials` — list of all materials to choose from (loaded on open)
- `newLine` — the currently being-added material row

## Key functions

### `addProductLine()`
Validates the "add product" sub-form and appends a new row to the `products` array. Pre-fills name, SKU, category, and base price from the selected product.

### `addMaterialLine()`
Validates the "add material" sub-form and appends a new row to the `materials` array. Calculates the `effectiveCost` — for bulk/multipack types, divides the pack cost by items per pack to get a per-unit figure.

### `updateProductQty(i, rawVal)` / `updateMaterialQty(i, rawVal)`
Update the quantity for an existing row (the row at index `i`). `updateMaterialQty` also recalculates the `lineCost` (quantity × cost per unit).

### `handleSave()`
Assembles the complete payload from all state, parses all numeric fields, and calls `onSave(payload)`.

## Live profit calculation

At the bottom of the form, the total material cost, gross revenue, and net profit are calculated in real time as the user types — so they can see the impact of any change immediately.

## Customer autocomplete

The customer field is a **freeSolo** autocomplete — the user can either:
1. Type to search for an existing customer and select them
2. Type a new name — additional fields then appear to add address details

## Relationship to other files

- Uses `CountrySelect`: [common/CountrySelect.jsx](../common/CountrySelect.md)
- Uses `useCustomerSettings`: [hooks/useCustomerSettings.js](../../hooks/useCustomerSettings.md)
- Uses `GlobalSettingsContext` for currency: [context/GlobalSettingsContext.jsx](../../context/GlobalSettingsContext.md)
- Used in: `OrdersPage.jsx`, `OrderDetailPage.jsx`
