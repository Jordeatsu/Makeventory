[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/CustomerDetailPage.jsx

## What is this file?

The **customer detail page** at `/customers/:id`. Shows a single customer's full profile:

- Customer name, email, phone, address
- "Returning" or "One-time" customer chip
- 6 summary stat boxes (total orders, total spent, avg order value, total profit, first order date, last order date)
- Complete order history table

## Internal component: `StatBox`

A small inline component defined at the top of the file. Renders a single metric in an outlined card:
```
┌─────────────────┐
│     £52.50      │
│  Total Spent    │
└─────────────────┘
```

Not exported — only used inside this file.

## Parameters

Reads `id` from the URL via `useParams()`.

## Data loaded

`GET /api/customers/:id` — returns both the customer record and their orders array in one response.

## State

| Variable | Description |
|---|---|
| `customer` | Customer record |
| `orders` | All orders for this customer |
| `loading` | Loading state |
| `error` | Error message |
| `editOpen` | Whether the edit modal is open |
| `deleteOpen` | Whether the delete confirmation dialog is open |

## Derived stats

Calculated locally from the `orders` array (not from the API):

| Stat | Calculation |
|---|---|
| `totalSpent` | Sum of `totalCharged` |
| `totalProfit` | Sum of `profit` |
| `avgOrder` | `totalSpent / orders.length` |
| `firstOrder` | Last item in orders array (oldest) |
| `lastOrder` | First item in orders array (newest) |

## Key functions

### `loadCustomer()`
Fetches `GET /api/customers/:id`.

### `handleSave(form)`
Calls `PUT /api/customers/:id`. Reloads after save.

### `handleDelete()`
Calls `DELETE /api/customers/:id` then navigates back to `/customers`.

## Order history table

Shows all orders: date, product description, status chip, amount charged, profit. Clicking a row navigates to the order's detail page.

## Relationship to other files

- Uses `CustomerFormModal`: [components/modals/CustomerFormModal.jsx](../components/modals/CustomerFormModal.md)
- Links to `OrderDetailPage.jsx` for each order row
- API docs: [server/routes/customers.md](../../server/routes/customers.md)
