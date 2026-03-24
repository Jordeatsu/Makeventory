[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/yearReview.js

## What is this file?

Handles the **Year In Review** analytics page — a comprehensive year-by-year summary of the business's performance.

This file is one of the most complex in the codebase because it uses MongoDB's **aggregation pipeline** extensively to compute many different metrics in a single database pass.

## What is an aggregation pipeline?

MongoDB's aggregation pipeline is a way to process and transform data using a series of steps. Think of it as an assembly line: each step in the pipeline takes the output of the previous step and does something with it (filter, group, sort, calculate, etc.).

This is used here because we need to compute things like "total revenue per month" or "top 10 products by quantity sold" — which require looking at many records and crunching numbers across them.

## Routes

### `GET /api/year-review/stats/:year`

**Authentication required:** Yes.

**Purpose:** Returns a comprehensive analytics breakdown for the given calendar year.

**Example:** `GET /api/year-review/stats/2024`

**What it computes (all run in parallel via `Promise.all`):**

| Key | Description |
|---|---|
| `summary` | Overall KPIs: total orders, gross revenue, net revenue, total profit, average order value, shipping totals, refunds, material costs |
| `monthly` | Orders, revenue, and profit broken down by month (1–12) |
| `statusBreakdown` | Count of orders per status (Pending, Completed, etc.) |
| `countries` | Top 10 countries by order count |
| `origins` | Sales channel breakdown (e.g. Etsy, Website, Instagram) |
| `topCustomers` | Top 10 customers by gross revenue |
| `topProducts` | Top 15 products by quantity sold, including per-country breakdown |
| `materials` | Materials used across all orders, plus overhead costs — sorted by total cost |
| `availableYears` | List of all years that have at least one order |

**Net revenue formula:**
```
netRevenue = grossRevenue - shipping - buyerTax - refunds
```

---

### `POST /api/year-review/overhead`

**Authentication required:** Yes.

**Purpose:** Adds an overhead/expense record to the Year In Review for a specific year.

Overhead records represent business expenses that aren't directly tied to a specific order (e.g. website hosting, tools, packaging supplies).

**Required fields:**
- `name` — expense name
- `cost` — expense amount (must be a positive number)
- `purchaseDate` — the date of the expense (determines which year it appears in)

**Optional fields:**
- `category` — defaults to `"General"` if not provided
- `notes` — free-text notes

The `year` field on the overhead document is automatically derived from `purchaseDate` (see `Overhead` model documentation).

---

### `DELETE /api/year-review/overhead/:id`

**Authentication required:** Yes.

**Purpose:** Deletes an overhead/expense record.

## How materials and overheads are merged

In the stats response, `materials` is a combined and sorted array of:
1. **Order materials** — materials used across orders, aggregated by name (total quantity, cost, etc.)
2. **Overhead records** — reshaped to match the same structure, marked with `isOverhead: true`

Both are sorted by `totalCost` descending so the most expensive items appear first.

## Relationship to other files

- Uses `Order` model from `models/Order.js`
- Uses `Overhead` model from `models/Overhead.js`
- Uses `isValidId` from `lib/helpers.js`
- Front-end page: `YearReviewPage.jsx`
