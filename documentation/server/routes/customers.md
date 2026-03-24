[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/customers.js

## What is this file?

Handles all API operations for **customer records** — listing, viewing, creating, updating, and deleting customers.

A notable feature is the **aggregated order stats** that are included with every customer listing request, computed efficiently in a single MongoDB aggregation pipeline rather than N individual queries.

## Routes

### `GET /api/customers`

**Authentication required:** Yes.

**Purpose:** Returns all customers, optionally filtered by a search term. Each customer is enriched with their order statistics.

**Query parameters:**
- `?search=jane` — filters by customer name or email (case-insensitive)

**How the order stats work:**

Rather than querying orders once per customer (which would be slow), the route uses MongoDB's **aggregation pipeline** to compute statistics for all customers in a single database query, then merges the results:

| Stat | Description |
|---|---|
| `orderCount` | Total number of orders |
| `totalSpent` | Total amount charged across all orders |
| `totalProfit` | Total profit across all orders |
| `firstOrder` | Date of the earliest order |
| `lastOrder` | Date of the most recent order |

**Returns:**
```json
{ "customers": [ { "_id": "...", "name": "Jane Smith", "orderCount": 5, "totalSpent": 200.00, ... } ] }
```

---

### `GET /api/customers/:id`

**Authentication required:** Yes.

**Purpose:** Returns a single customer and all of their orders.

**Returns:**
```json
{ "customer": { ... }, "orders": [ { ... }, ... ] }
```

---

### `POST /api/customers`

**Authentication required:** Yes.

**Purpose:** Creates a new customer record.

**Required fields:** `name`

**Accepted fields:** `name`, `email`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `postcode`, `country` — only these known fields are written to the database.

**Returns:** The newly created customer document.

---

### `PUT /api/customers/:id`

**Authentication required:** Yes.

**Purpose:** Updates an existing customer record. Only the known customer fields are accepted; any other keys in the request body are ignored.

**Returns:** The updated customer document.

---

### `DELETE /api/customers/:id`

**Authentication required:** Yes.

**Purpose:** Permanently deletes a customer record.

> **Note:** Currently there is no block preventing deletion of customers who have orders. The orders will remain but their `customer` reference will become a dangling reference.

## Relationship to other files

- Uses the `Customer` model from `models/Customer.js`
- Uses `Order` model for aggregated stats
- Uses `isValidId` and `escapeRegex` from `lib/helpers.js`
- Front-end pages: `CustomersPage.jsx`, `CustomerDetailPage.jsx`, `CustomerFormModal.jsx`
