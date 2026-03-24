[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/materials.js

## What is this file?

Handles all API operations for **raw material inventory** — listing, viewing, creating, updating, deleting, and adjusting stock quantities.

## Helper function: `materialToClient(doc)`

Before sending a material to the front-end, this function reshapes it slightly:
- Adds a flat `type` field with the material type's name (e.g. `"Cotton Thread"`) for easy display
- Keeps `materialType` as just the ObjectId reference
- Converts `createdBy`/`updatedBy` to `{ _id, name }` objects using `userLabel()`

This transforms the internal database format into a shape that's more convenient for the UI.

## Routes

### `GET /api/materials`

**Authentication required:** Yes.

**Purpose:** Returns all materials, optionally filtered.

**Query parameters:**
- `?search=red` — filters by name (case-insensitive)
- `?type=Cotton` — filters by material type name

**Returns:**
```json
{ "materials": [ { "_id": "...", "name": "Red Thread", "type": "Cotton Thread", "quantity": 50, ... } ] }
```

---

### `GET /api/materials/:id`

**Authentication required:** Yes.

**Purpose:** Returns a single material with full details, including populated `materialType`, `createdBy`, and `updatedBy` fields.

---

### `POST /api/materials`

**Authentication required:** Yes.

**Purpose:** Creates a new material record.

**Required fields:** `name`, `type` (material type name — looked up by name, not ID)

**Note on `type` vs `materialType`:** The API accepts the type as a *name string* (e.g. `"Cotton Thread"`). It looks up the MaterialType document by name internally and stores the ObjectId. This is friendlier for the front-end.

**Request body fields:**

| Field | Type | Description |
|---|---|---|
| `name` | string | Material name (required) |
| `type` | string | Material type name (required) |
| `color` | string | Optional colour description |
| `quantity` | number | Current stock level |
| `unit` | string | Unit of measure (e.g. "pieces") |
| `costPerUnit` | number | Cost per unit |
| `unitsPerPack` | number | Units in a pack (for bulk types) |
| `lowStockThreshold` | number | Alert threshold |
| `supplier` | string | Supplier name |
| `sku` | string | Stock keeping unit code |
| `description` | string | Free-text notes |

**Error responses:**
- `400` — name or type missing
- `400` — named material type not found in database
- `409` — a material with that name already exists (unique constraint)

---

### `PUT /api/materials/:id`

**Authentication required:** Yes.

**Purpose:** Updates an existing material record.

---

### `DELETE /api/materials/:id`

**Authentication required:** Yes.

**Purpose:** Permanently deletes a material record.

---

### `POST /api/materials/:id/adjust-stock`

**Authentication required:** Yes.

**Purpose:** Increments or decrements the material's `quantity` by a `delta` value. Used when manually adjusting stock levels without editing the full record.

**Request body:**
```json
{ "delta": -5 }
```
A positive delta increases stock; a negative delta decreases it.

## Relationship to other files

- Uses `Material` model from `models/Material.js`
- Uses `MaterialType` model for type name lookups
- Uses `isValidId`, `escapeRegex`, `userLabel` from `lib/helpers.js`
- Front-end pages: `MaterialsPage.jsx`, `MaterialDetailPage.jsx`, `MaterialFormModal.jsx`
