[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/CustomersPage.jsx

## What is this file?

The **customers list page** at `/customers`. Displays all customers with their order statistics. Users can create, edit, and delete customers.

## View modes (tabs)

| Tab | Mode | Description |
|---|---|---|
| "Flat" (tab 0) | Table | All customers in a single table |
| "By Letter" (tab 1) | Alphabetical groups | Customers grouped by first letter of name |

## State

| Variable | Description |
|---|---|
| `customers` | All customers from the API |
| `loading` | Loading state |
| `error` | Error message |
| `search` | Search term |
| `tab` | Current view tab |
| `dialogOpen` | Whether the form modal is open |
| `editing` | Customer being edited |
| `deleteTarget` | Customer selected for deletion |

## Key functions

### `load()`
Fetches `GET /api/customers` with optional search query. The customers returned include computed stats (orderCount, totalSpent, totalProfit, firstOrder, lastOrder) added by the server's MongoDB aggregation.

### `handleSave(form)`
- Edit: `PUT /api/customers/:id`
- Create: `POST /api/customers`
- Shows toast on success, error toast on failure

### `handleDelete()`
Calls `DELETE /api/customers/:id`. Deleting a customer does not delete their orders — orders retain the customer name as a snapshot.

### `groupedByLetter`
A `useMemo` that arranges customers into alphabetical letter groups. Names starting with non-letter characters are grouped under `#`.

## Table columns

Customer (name + email), Location, Orders (count with "returning" label), Total Spent, Total Profit, First Order, Last Order, Actions

## Returning customer indicator

If a customer has more than 1 order, they are tagged as "returning" with a green chip — useful for identifying loyal customers.

## Relationship to other files

- Uses `CustomerFormModal`: [components/modals/CustomerFormModal.jsx](../components/modals/CustomerFormModal.md)
- Clicking a row navigates to `CustomerDetailPage.jsx`
- API docs: [server/routes/customers.md](../../server/routes/customers.md)
