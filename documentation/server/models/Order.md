[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Order.js

## What is this file?

Defines the **Order** database schema — the most complex model in the application.

An order represents a sale. It can contain multiple products and tracks all of the associated financial details.

## Sub-schemas

The Order schema uses two nested sub-schemas — schemas defined within the main schema for array items.

### `productEntrySchema` — items in `order.products[]`

Each entry in the `products` array represents one product in the order.

| Field | Type | Description |
|---|---|---|
| `productId` | ObjectId | Reference to the Product document |
| `productName` | String | Snapshot of the product name at time of order |
| `sku` | String | Snapshot of the SKU at time of order |
| `category` | String | Snapshot of category |
| `basePrice` | Number | Price per unit |
| `quantity` | Number | Quantity ordered |

**Why store snapshots?** Products can be edited or deleted after an order is placed. By storing a snapshot of the name, SKU, and price, the order record remains accurate even if the product changes later.

### `materialEntrySchema` — items in `order.materials[]`

Each entry in the `materials` array represents a raw material used in the order.

| Field | Type | Description |
|---|---|---|
| `materialId` | ObjectId | Reference to the Material document |
| `materialName` | String | Snapshot of the material name |
| `materialType` | String | Snapshot of the material type name |
| `quantityUsed` | Number | Amount of this material used |
| `unit` | String | Unit of measurement |
| `lineCost` | Number | Cost for this line (quantity × cost per unit) |

## Main schema fields

### Identity
| Field | Type | Description |
|---|---|---|
| `orderNumber` | String | Auto-assigned identifier like `ORD-00000001` |
| `origin` | String | Sales channel (e.g. "Etsy", "Website", "Instagram") |
| `originOrderId` | String | The order ID from the external platform |
| `orderDate` | Date | When the order was placed |
| `status` | String | Enum: `Pending`, `In Progress`, `Completed`, `Shipped`, `Cancelled` |
| `locked` | Boolean | When true, the order is protected from accidental edits |

### Customer
| Field | Type | Description |
|---|---|---|
| `customer` | ObjectId | Reference to a Customer document |

### Items
| Field | Description |
|---|---|
| `products[]` | Array of `productEntrySchema` items |
| `materials[]` | Array of `materialEntrySchema` items |

### Financials
| Field | Type | Description |
|---|---|---|
| `totalCharged` | Number | Total amount paid by the customer |
| `shipping` | Number | Shipping cost charged to the customer |
| `buyerTax` | Number | Tax paid by the buyer |
| `discount` | Number | Discount amount or percentage |
| `discountType` | String | `'flat'` or `'percent'` |
| `hostingCost` | Number | Platform/marketplace fees (e.g. Etsy fee) |
| `marketingCost` | Number | Advertising costs attributed to this order |
| `refund` | Number | Any refund issued |
| `totalMaterialCost` | Number | Computed total cost of all materials used |
| `profit` | Number | Computed profit (see `calcProfit` in routes/orders.js) |

### Audit
| Field | Type | Description |
|---|---|---|
| `notes` | String | Free-text notes |
| `tracking` | String | Shipment tracking number |
| `createdBy` | ObjectId | Reference to the User who created this order |
| `updatedBy` | ObjectId | Reference to the User who last updated this order |

## Relationship to other files

- Used extensively in `routes/orders.js`
- Referenced in `routes/customers.js` (order stats aggregation)
- Referenced in `routes/products.js` (product sales stats)
- Referenced in `routes/yearReview.js` (year-in-review analytics)
- `totalMaterialCost` and `profit` are computed in `routes/orders.js` by `calcProfit()`
