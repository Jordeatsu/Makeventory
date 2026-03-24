[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/OrdersPage.jsx

## What is this file?

The **orders list page** at `/orders`. Displays all orders in a searchable, filterable table. Users can create, edit, and delete orders from this page.

## Layout

The page has two view modes switchable via tabs:

| Tab | Mode | Description |
|---|---|---|
| "Flat" (tab 0) | Table view | All orders in a paginated table (10 per page) |
| "By Month" (tab 1) | Grouped view | Orders grouped into collapsible month sections |

## State

| Variable | Description |
|---|---|
| `orders` | All orders loaded from the API |
| `loading` | Whether orders are being fetched |
| `error` | Error message if loading fails |
| `search` | Current search text (filters by customer name, origin, etc.) |
| `statusFilter` | Current status filter (Pending / In Progress / etc.) |
| `formOpen` | Whether the order form dialog is open |
| `editing` | The order being edited (or `null` for a new order) |
| `deleteTarget` | The order marked for deletion |
| `page` | Current page index for pagination |
| `tab` | Which view tab is active |

## Key functions

### `load()`
Fetches orders from `GET /api/orders` with the current search and status filter as query parameters. Wrapped in `useCallback` so it only re-builds when `search` or `statusFilter` changes.

### `handleSave(form)`
- If `editing` is set: calls `PUT /api/orders/:id`
- Otherwise: calls `POST /api/orders`
- Shows a success toast and reloads the list

### `handleDelete()`
Calls `DELETE /api/orders/:deleteTarget._id`, clears the delete target, and reloads.

### `isLocked(o)`
Returns `true` if an order has been locked. Orders lock automatically after 45 days (`LOCK_MS`). Locked orders cannot be edited or deleted — only unlocked (admin action).

### `groupedByMonth`
A `useMemo` calculation that takes the orders array and groups them by month/year for the "By Month" tab view.

### `renderRow(o)`
Renders a single table row for an order — includes origin, date, customer, status chip, products summary, financial columns, and action buttons. Clicking anywhere on the row navigates to `OrderDetailPage`.

## Table columns

Order, Date, Customer, Status, Products, Gross Revenue, Net Revenue, Profit, Actions

## Relationship to other files

- Uses `OrderFormModal`: [components/modals/OrderFormModal.jsx](../components/modals/OrderFormModal.md)
- Uses `ToastSnackbar`, `useToast`: [components/common/ToastSnackbar.jsx](../components/common/ToastSnackbar.md)
- Navigates to `OrderDetailPage.jsx` on row click
- API calls to `server/routes/orders.js`: [server/routes/orders.md](../../server/routes/orders.md)
