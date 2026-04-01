[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Product.js

## What is this file?

Defines the **Product** database schema — items that are made and sold.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `name` | String | Product name (required) |
| `sku` | String | Stock keeping unit code |
| `category` | String | Product category (e.g. "Bags", "Jewellery") |
| `description` | String | Free-text notes |
| `basePrice` | Number | Default selling price |
| `active` | Boolean | Whether this product is currently available for sale (default: `true`) |
| `isTemplate` | Boolean | Whether this is a template/master product (default: `false`) |
| `parentProduct` | ObjectId | Self-reference — if this product is derived from another |
| `defaultMaterials` | Array | List of materials that go into making this product |
| `estimatedMaterialCost` | Number | Computed sum of all material line costs |
| `createdBy` | ObjectId | Reference to the creating User |
| `updatedBy` | ObjectId | Reference to the last updating User |

## How `defaultMaterials` works

Each entry in the `defaultMaterials` array is a sub-document with:
- `materialId` — reference to a Material
- `materialName` — snapshot of the name
- `materialType` — snapshot of the type
- `quantityUsed`, `unit`, `lineCost` — how much of the material and at what cost

This is the same `materialEntrySchema` used in the Order model. When a product is added to an order, its default materials can be pre-filled from this list.

## Templates and variants

- `isTemplate: true` marks a "master" product with a standard set of materials
- Products can set `parentProduct` to point to a template
- This allows a parent/child structure — for example, a template "Tote Bag" with child products "Tote Bag - Black" and "Tote Bag - Red"
- `parentProduct` is a **self-reference** (points to another Product document)

## `estimatedMaterialCost`

This is recalculated automatically every time the product is saved, summing up the `lineCost` of each `defaultMaterials` entry. It gives a quick estimate of the cost of goods for this product without recalculating from scratch each time it's displayed.

## Relationship to other files

- `parentProduct` self-references `models/Product.js`
- `defaultMaterials` entries loosely reference `models/Material.js`
- `createdBy`/`updatedBy` reference `models/User.js`
- Used in `routes/products.js`
- Referenced in `models/Order.js` productEntrySchema
