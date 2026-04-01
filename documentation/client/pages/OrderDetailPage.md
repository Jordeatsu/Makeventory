[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/OrderDetailPage.jsx

## What is this file?

The **order detail page** at `/orders/:id`. Shows the full details of a single order, including:

- A status-tinted header banner with the order number and status chip
- Customer info card (name, email, phone, address)
- Products table
- Materials used table
- Financial breakdown (charges, discounts, taxes, fees, refund, profit)
- Audit info (record info card at the bottom)

## Parameters

The page reads `id` from the URL using `useParams()` — so navigating to `/orders/abc123` loads order `abc123`.

## Locking

Orders automatically **lock** after 45 days (`LOCK_MS = 45 × 24 × 60 × 60 × 1000` milliseconds). A locked order cannot be edited.

When locked, the Edit button is replaced with a lock icon and an "Unlock" button (admin only). An admin can unlock an order to re-enable editing.

## State

| Variable | Description |
|---|---|
| `order` | The order data from the API |
| `loading` | Whether the order is being loaded |
| `error` | Error message if loading fails |
| `editOpen` | Whether the edit modal is open |

## Key functions

### `load()`
Fetches `GET /api/orders/:id` and stores the result.

### `handleSave(form)`
Calls `PUT /api/orders/:id` with the edited form data. Closes the modal and reloads.

### `handleUnlock()`
Calls `PATCH /api/orders/:id/unlock` to manually unlock a locked order. Updates the displayed order data in place.

## Financial breakdown section

Shows a detailed breakdown of how the profit is calculated:

```
Item price         £50.00
  - Discount        -£5.00
  + Tax              £4.00
  + Shipping         £3.50
  ────────────────────────
  Total Paid        £52.50

  - Materials        -£8.00
  - Hosting          -£2.00
  - Marketing        -£1.50
  - Refund            £0.00
  ────────────────────────
  Net Profit        £41.00
```

## Relationship to other files

- Uses `OrderFormModal`: [components/modals/OrderFormModal.jsx](../components/modals/OrderFormModal.md)
- Uses `RecordInfo`: [components/common/RecordInfo.jsx](../components/common/RecordInfo.md)
- Uses `InfoRow` from `DetailRow.jsx`: [components/common/DetailRow.jsx](../components/common/DetailRow.md)
- Uses `STATUS_COLOURS` from [theme.js](../theme.md)
- Navigates to `CustomersPage.jsx` via the customer name (if applicable)
