[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/YearReviewPage.jsx

## What is this file?

The **Year in Review page** at `/year-review`. A comprehensive annual summary of the business — similar to a simple end-of-year business report. The user can navigate between years using left/right arrow buttons.

## Internal components

The file defines several small sub-components at the top (not exported):

- **`StatCard`** — an overview metric card with icon, label, value, and sub-text
- **`SectionHeader`** — a consistent heading row with an icon and title for each section

## Sections displayed

1. **Summary KPI strip** — total orders, gross revenue, net profit, material cost, average order value, top status, total countries, total customers
2. **Monthly breakdown table** — orders and revenue per month with status counts
3. **Status breakdown** — table of order counts per status
4. **Top countries** — countries ordered for from, with order counts
5. **Origins** — which platforms orders came from (Etsy, etc.)
6. **Top customers** — highest-value customers this year
7. **Top products** — best-selling products with expandable material cost rows
8. **Material usage** — how much of each material was used across all orders
9. **Overheads** — annual overheads list, with a form to add new overhead entries

## State

| Variable | Description |
|---|---|
| `year` | Currently displayed year |
| `data` | The full stats response from the server |
| `loading` | Loading state |
| `error` | Error message |
| `expandedProducts` | Set of product IDs with expanded material cost rows |
| `overheadForm` | Form state for adding a new overhead entry |

## Key functions

### `load()`
Fetches `GET /api/year-review/stats/:year` which returns 10 parallel data sets from the server in one response.

### `toggleProductExpand(id)`
Adds or removes a product ID from the `expandedProducts` set — controls which product rows show their material breakdown underneath.

### `handleAddOverhead()`
Calls `POST /api/year-review/overhead` to add a new overhead entry, then reloads the data.

### `handleDeleteOverhead(id)`
Calls `DELETE /api/year-review/overhead/:id`, then reloads.

## Year navigation

Navigation arrows (◀ / ▶) step the `year` state by 1. The previous-year arrow is disabled for years before the earliest available year. Available years come from the server as `data.availableYears`.

## Relationship to other files

- API: [server/routes/yearReview.md](../../server/routes/yearReview.md)
- Uses `GlobalSettingsContext` for currency
- Uses `useCurrencyFormatter` from [utils/formatting.js](../utils/formatting.md)
