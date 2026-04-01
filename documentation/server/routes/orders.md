[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/orders.js

## What is this file?

Handles all API operations for **orders** — the most complex entity in the application.

This file contains two important helper functions in addition to the standard CRUD routes.

## Helper functions

### `findOrCreateCustomer(c)`

**Purpose:** Resolves the `customer` field from an incoming order to a MongoDB customer `_id`.

The front-end can send a customer in several ways:
1. A raw ObjectId string (existing customer already selected by ID)
2. An object with `_id` (existing customer selected from a list)
3. An object with `name`/`email` fields (new or existing customer being typed in)

This function handles all three cases. For case 3, it performs an **upsert** — it finds an existing customer with a matching email or name, or creates a new one if none exists.

### `calcProfit(data)`

**Purpose:** Calculates the `profit` and `totalMaterialCost` for an order before saving.

```
profit = totalCharged
       - discount (flat or percentage)
       - hostingCost
       - marketingCost
       - totalMaterialCost
       - refund
```

## Routes

### `GET /api/orders`

**Authentication required:** Yes.

**Purpose:** Returns all orders, optionally filtered by status and/or a search term.

**Query parameters:**
- `?status=Pending` — filter by order status
- `?search=jane` — searches customer name, customer email, or `originOrderId`

Orders are returned sorted by date (newest first), with the customer record fully populated.

---

### `GET /api/orders/:id`

**Authentication required:** Yes.

**Purpose:** Returns a single order with full detail, including populated customer, `createdBy`, and `updatedBy` fields.

---

### `POST /api/orders`

**Authentication required:** Yes.

**Purpose:** Creates a new order.

**Auto-assigned fields:**
- `orderNumber` — automatically assigned in `ORD-00000001` format, incrementing from the last order
- `status` — defaults to `'Pending'` if not provided
- `profit` and `totalMaterialCost` — computed via `calcProfit()`
- `createdBy` / `updatedBy` — set from the authenticated user

---

### `PUT /api/orders/:id`

**Authentication required:** Yes.

**Purpose:** Updates an existing order.

**Locked orders:** The `orderNumber` field cannot be changed via this endpoint (it is deleted from the request body before updating).

Profit and material cost are recalculated on every update.

---

### `DELETE /api/orders/:id`

**Authentication required:** Yes.

**Purpose:** Permanently deletes an order.

---

### `PATCH /api/orders/:id/unlock`

**Authentication required:** Yes.

**Purpose:** Sets the order's `locked` field to `false`.

Orders can be "locked" (e.g. after completion) to prevent accidental edits. This endpoint allows an authorised user to unlock them.

## Order status values

| Status | Meaning |
|---|---|
| `Pending` | Order received, not yet started |
| `In Progress` | Currently being worked on |
| `Completed` | Work done, not yet shipped |
| `Shipped` | Dispatched to customer |
| `Cancelled` | Order cancelled |

## Relationship to other files

- Uses `Order` model from `models/Order.js`
- Uses `Customer` model (for search and upsert via `findOrCreateCustomer`)
- Uses `isValidId`, `escapeRegex`, `userLabel` from `lib/helpers.js`
- Front-end pages: `OrdersPage.jsx`, `OrderDetailPage.jsx`, `OrderFormModal.jsx`
