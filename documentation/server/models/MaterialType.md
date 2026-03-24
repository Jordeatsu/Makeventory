[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/MaterialType.js

## What is this file?

Defines the **MaterialType** database schema — the categories that raw materials belong to (e.g. "Cotton Thread", "Resin", "Wood Blank").

Material types provide default values that pre-fill the material creation form, saving time when adding many similar materials.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `name` | String | Type name (required, unique) |
| `description` | String | What this type of material is |
| `usageType` | String | How this material is consumed (see below) |
| `unitOfMeasure` | String | The unit used for quantity — see enum below |
| `isActive` | Boolean | Whether this type is available for use (default: `true`) |
| `defaultStockQty` | Number | Pre-filled quantity when creating a new material of this type |
| `lowStockThreshold` | Number | Pre-filled stock alert level |
| `defaultCostPrice` | Number | Pre-filled cost per unit |
| `purchaseQty` | Number | Pre-filled purchase quantity |
| `createdBy` | ObjectId | Reference to the creating User |
| `updatedBy` | ObjectId | Reference to the last updating User |

## `usageType` enum

| Value | Meaning |
|---|---|
| `Whole Item` | Each unit is a complete item (e.g. a button, a bead) |
| `Percentage` | Used as a percentage of the total (e.g. a pigment added by proportion) |
| `Bulk` | Sold in packs but used in smaller amounts (e.g. thread sold per spool) |

## `unitOfMeasure` enum

| Value | Human meaning |
|---|---|
| `mm` | millimetres |
| `mm2` | square millimetres |
| `cm` | centimetres |
| `cm2` | square centimetres |
| `m` | metres |
| `m2` | square metres |
| `in` | inches |
| `in2` | square inches |
| `piece` | individual pieces |

## Deletion protection

A material type **cannot be deleted** if any materials are currently using it. The `routes/materialTypes.js` file checks for this before deleting and returns a list of the blocking materials if they exist.

## Relationship to other files

- Referenced by `models/Material.js` (the `materialType` field)
- Used in `routes/materialTypes.js`
- Also referenced in `routes/materials.js` when looking up type by name
- Front-end: `MaterialTypesPage.jsx`, `MaterialTypeDetailPage.jsx`, `MaterialTypeModal.jsx`
