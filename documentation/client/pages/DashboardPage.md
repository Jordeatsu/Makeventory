[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/DashboardPage.jsx

## What is this file?

The **home page** of the application, shown after login at `/`. It provides an at-a-glance overview of the business:

- 4 KPI stat cards (total orders, revenue, profit, and materials count)
- A bar chart of orders by status
- A stock overview panel with low-stock warnings
- A recent orders table

## What is a KPI?

KPI stands for "Key Performance Indicator" — a metric that helps you understand how the business is doing at a glance.

## Data loaded

On mount, the page fetches two things in parallel:
- `GET /api/materials` — all materials (to count and find low-stock ones)
- `GET /api/orders` — all orders (to sum revenue/profit and list recent ones)

If either call fails, the page shows empty states rather than a full error screen (using `safeFetch`).

## State

| Variable | Description |
|---|---|
| `materials` | All material records |
| `orders` | All order records |
| `loading` | Whether initial data is still loading |
| `error` | Error message if loading fails |

## Derived values (calculated from data)

These are not stored in state — they are re-calculated each render:

| Variable | Calculation |
|---|---|
| `totalRevenue` | Sum of `totalCharged` across all orders |
| `totalProfit` | Sum of `profit` across all orders |
| `activeOrders` | Orders not in Completed/Shipped/Cancelled status |
| `lowStock` | Materials where `quantity <= lowStockThreshold` |
| `chartData` | Order count grouped by status |
| `totalStockValue` | Sum of (quantity × cost per unit) for each material |

## Sections

### KPI strip
Four `StatCard` components side by side showing total orders, revenue, profit, and materials count.

### Orders by status chart
A bar chart using **Recharts** library. Each bar is coloured using the `STATUS_COLOURS` from `theme.js`. The bars show how many orders are in each status.

### Stock overview
Shows the total stock value, then lists materials that are low on stock with a progress bar showing how low they are relative to their threshold.

### Recent orders
A table showing the last 5 orders with date, customer, products, charged amount, and profit.

## Relationship to other files

- Uses `StatCard`: [components/common/StatCard.jsx](../components/common/StatCard.md)
- Uses `GlobalSettingsContext` for currency formatting
- Uses `STATUS_COLOURS` from [theme.js](../theme.md)
- Uses `fmtDate`, `useCurrencyFormatter` from [utils/formatting.js](../utils/formatting.md)
