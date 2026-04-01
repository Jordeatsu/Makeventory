[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/MaterialSettings.js

## What is this file?

Defines the **MaterialSettings** database schema — a **singleton** document controlling global behaviour for materials.

## Schema fields

| Field | Type | Default | Description |
|---|---|---|---|
| `defaultLowStockThreshold` | Number | `1` | Default alert level used when creating new materials |
| `currency` | String | `'GBP'` | Currency for material cost display. Enum: `GBP`, `USD`, `EUR`, `AUD`, `CAD`, `NZD` |
| `autoDeductOnOrderComplete` | Boolean | `false` | When `true`, marking an order as Completed automatically reduces material stock quantities |
| `trackFractionalQuantities` | Boolean | `false` | When `true`, allows decimal quantities (e.g. 2.5 metres of fabric) |

## Field explanations

### `autoDeductOnOrderComplete`

This is an automation feature. When enabled, the server will automatically reduce the `quantity` field of each material used in an order when the order's status changes to "Completed". This saves manual stock adjustments.

> **Note:** As of the current version, this field is stored but the auto-deduction logic may not yet be implemented on status change.

### `trackFractionalQuantities`

By default, material quantities are whole numbers. Enabling this flag allows decimal values — useful for materials sold by length or weight (e.g. "I used 0.75 metres of fabric" or "3.2 grams of resin").

## Relationship to other files

- Read and written by `routes/settings.js` (`/api/settings/materials`)
- The `currency` value supplements the `GlobalSettings` currency
- Settings UI: `MaterialSettingsPage.jsx`, `MaterialSettingsModal.jsx`
