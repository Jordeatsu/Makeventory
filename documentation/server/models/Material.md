[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Material.js

## What is this file?

Defines the **Material** database schema — raw materials used in production (thread, resin, wood, fabric, beads, etc.).

## Schema fields

| Field | Type | Description |
|---|---|---|
| `name` | String | Material name (required, unique) |
| `materialType` | ObjectId | Reference to the `MaterialType` document that categorises this material |
| `color` | String | Optional colour description |
| `quantity` | Number | Current stock quantity |
| `unit` | String | Unit of measurement (e.g. "pieces", "metres") |
| `costPerUnit` | Number | Cost per single unit |
| `unitsPerPack` | Number | How many units come in a pack (for bulk-type materials) |
| `lowStockThreshold` | Number | If quantity falls to or below this number, the material is flagged as low stock |
| `supplier` | String | Supplier name |
| `sku` | String | Stock keeping unit code |
| `description` | String | Free-text notes about this material |
| `createdBy` | ObjectId | Reference to the User who created this record |
| `updatedBy` | ObjectId | Reference to the User who last updated this record |

Timestamps (`createdAt`, `updatedAt`) are added automatically.

## What is `unitsPerPack`?

For bulk materials (e.g. a spool of thread containing 200m), the cost might be given per-pack rather than per-unit. `unitsPerPack` lets the system calculate the effective cost per unit:

```
effectiveCostPerUnit = costPerUnit / unitsPerPack
```

This is used in the Dashboard to calculate total stock value.

## What is `lowStockThreshold`?

When `quantity <= lowStockThreshold`, the material will appear in the Dashboard's "Low Stock" warning section. The threshold defaults to `1` if not specified.

## Relationship to other files

- `materialType` references `models/MaterialType.js`
- `createdBy`/`updatedBy` reference `models/User.js`
- Used in `routes/materials.js` for all CRUD operations
- Referenced in `models/Order.js` materialEntrySchema for order line items
- Referenced in `routes/yearReview.js` for material cost analytics
