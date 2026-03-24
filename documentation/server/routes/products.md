[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/products.js

## What is this file?

Handles all API operations for the **product catalogue** — listing, viewing, creating, updating, and deleting products. Also provides aggregated sales statistics for individual products.

## Helper function: `productToClient(doc)`

Before sending a product to the front-end, converts the `createdBy`/`updatedBy` Mongoose documents to simple `{ _id, name }` objects.

## Routes

### `GET /api/products`

**Authentication required:** Yes.

**Purpose:** Returns all products, optionally filtered.

**Query parameters:**
- `?search=tote` — filters by product name (case-insensitive)
- `?category=bags` — filters by category name (case-insensitive)

Each product's `parentProduct` is populated (looked up) to include the parent's name and material info.

---

### `GET /api/products/:id/stats`

**Authentication required:** Yes.

**Purpose:** Returns a single product along with aggregated sales statistics computed from all orders that include that product.

**Stats returned:**

| Field | Description |
|---|---|
| `totalOrders` | How many orders contain this product |
| `totalRevenue` | Sum of `totalCharged` across those orders |
| `totalProfit` | Sum of `profit` across those orders |
| `avgProfit` | Average profit per order |
| `byCountry` | Revenue and order count broken down by customer country |
| `recentOrders` | 20 most recent orders containing this product |

---

### `POST /api/products`

**Authentication required:** Yes.

**Purpose:** Creates a new product.

**Required fields:** `name`

**Request body fields:**

| Field | Type | Description |
|---|---|---|
| `name` | string | Product name (required) |
| `sku` | string | Stock keeping unit code |
| `category` | string | Product category |
| `description` | string | Free-text notes |
| `basePrice` | number | Default selling price |
| `active` | boolean | Whether the product is currently available |
| `isTemplate` | boolean | Whether this is a template for creating variants |
| `parentProduct` | ObjectId | Reference to a parent/template product |
| `defaultMaterials` | array | List of materials used in this product with quantities |

The `estimatedMaterialCost` is computed automatically by summing the `lineCost` of each entry in `defaultMaterials`.

---

### `PUT /api/products/:id`

**Authentication required:** Yes.

**Purpose:** Updates an existing product. `estimatedMaterialCost` is recalculated automatically.

---

### `DELETE /api/products/:id`

**Authentication required:** Yes.

**Purpose:** Permanently deletes a product.

> **Note:** Deleting a product does not remove it from existing orders — orders store a snapshot of the product name, SKU, and price at the time of the order.

## What are product templates?

The `isTemplate` flag marks a product as a "master" version that other products can derive from (via `parentProduct`). This is useful when you sell the same item in many variations — you create one template and then create variants that inherit its materials.

## Relationship to other files

- Uses `Product` model from `models/Product.js`
- Uses `Order` model for the `/stats` endpoint
- Uses `isValidId`, `escapeRegex`, `userLabel` from `lib/helpers.js`
- Front-end pages: `ProductsPage.jsx`, `ProductDetailPage.jsx`, `ProductFormModal.jsx`
