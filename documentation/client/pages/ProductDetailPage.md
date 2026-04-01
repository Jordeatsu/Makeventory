[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/ProductDetailPage.jsx

## What is this file?

The **product detail page** at `/products/:id`. Shows a single product's full profile, including:

- 4-metric KPI strip (total orders, gross revenue, total profit, average profit per order)
- Product info card (description, base price, estimated material cost, estimated margin)
- Materials recipe table (all materials needed to make the product)
- Revenue by country (where orders for this product come from)
- Recent orders involving this product

## Parameters

Reads `id` from the URL via `useParams()`.

## Data loaded

Unlike most pages, this page calls a single **stats endpoint**: `GET /api/products/:id/stats`

That endpoint returns the product itself plus aggregated data (order counts, revenue totals, country breakdown, recent orders) in one response.

## State

| Variable | Description |
|---|---|
| `stats` | The combined product + stats response |
| `loading` | Loading state |
| `error` | Error message |
| `editOpen` | Whether the edit modal is open |

## Key functions

### `load()`
Fetches `GET /api/products/:id/stats` via `useCallback`.

### `handleSave(payload)`
Calls `PUT /api/products/:id`, closes modal, reloads.

## Materials recipe section

Shows all materials needed to make this product. For variants, the recipe shows:
1. Inherited materials from the parent product (in order of type, then cost)
2. The variant's own additional materials

A total row at the bottom shows the combined estimated material cost.

## KPI strip

Four boxes separated by vertical dividers:

| KPI | Value |
|---|---|
| Total Orders | Count of all orders containing this product |
| Gross Revenue | Sum of revenue (including shipping) |
| Total Profit | Sum of profit across all orders |
| Avg Profit / Order | Average profit per sale |

## Relationship to other files

- Uses `ProductFormModal`: [components/modals/ProductFormModal.jsx](../components/modals/ProductFormModal.md)
- Uses `RecordInfo`: [components/common/RecordInfo.jsx](../components/common/RecordInfo.md)
- Uses `InfoRow` from DetailRow: [components/common/DetailRow.jsx](../components/common/DetailRow.md)
- Stats API: [server/routes/products.md](../../server/routes/products.md)
