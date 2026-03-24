[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/materialTypes.js

## What is this file?

Handles all API operations for **material types** — the categories that materials belong to (e.g. "Cotton Thread", "Resin", "Wood").

Material types define key default values and measurement rules for materials of that type.

## Routes

### `GET /api/material-types`

**Authentication required:** Yes.

**Purpose:** Returns all material types, sorted alphabetically by name.

---

### `GET /api/material-types/:id`

**Authentication required:** Yes.

**Purpose:** Returns a single material type with full detail, including populated `createdBy`/`updatedBy` user information.

---

### `POST /api/material-types`

**Authentication required:** Yes.

**Purpose:** Creates a new material type.

**Required fields:** `name`

**Request body fields:**

| Field | Type | Description |
|---|---|---|
| `name` | string | Type name (required, must be unique) |
| `description` | string | Optional description |
| `usageType` | string | How this type is measured: `"Whole Item"`, `"Percentage"`, or `"Bulk"` |
| `unitOfMeasure` | string | Unit enum: `mm`, `mm2`, `cm`, `cm2`, `m`, `m2`, `in`, `in2`, `piece` |
| `isActive` | boolean | Whether this type is currently in use |
| `defaultStockQty` | number | Default quantity when creating a new material of this type |
| `lowStockThreshold` | number | Default low-stock alert level |
| `defaultCostPrice` | number | Default cost per unit |
| `purchaseQty` | number | Default purchase quantity |

**Error responses:**
- `400` — name not provided
- `409` — a material type with that name already exists

---

### `PUT /api/material-types/:id`

**Authentication required:** Yes.

**Purpose:** Updates an existing material type.

---

### `DELETE /api/material-types/:id`

**Authentication required:** Yes.

**Purpose:** Deletes a material type, but **only if no materials are currently using it**.

If any materials reference this type, the server returns `409 Conflict` with a list of the material names that are blocking the deletion. This prevents broken references (orphaned materials with no type).

**Error response when blocked:**
```json
{
  "error": "This material type is in use and cannot be deleted.",
  "materials": ["Red Cotton Thread", "Blue Cotton Thread"]
}
```

## What is `usageType` for?

The `usageType` field controls how quantity calculations work for materials of this type:

- **Whole Item** — counted as individual pieces (e.g. buttons, beads)
- **Percentage** — consumed as a percentage of the full item (e.g. a colour of resin mixed in)
- **Bulk** — sold in packs, but used in smaller quantities (e.g. thread spools)

## Relationship to other files

- Uses `MaterialType` model from `models/MaterialType.js`
- Checks `Material` model before deletion to prevent orphaned records
- Uses `isValidId` from `lib/helpers.js`
- Front-end pages: `MaterialTypesPage.jsx`, `MaterialTypeDetailPage.jsx`, `MaterialTypeModal.jsx`
