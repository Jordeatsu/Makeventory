[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/modules.js

## What is this file?

Handles the **feature module system** — which sections of the app (Inventory, Products, Orders, etc.) are turned on or off.

The navigation sidebar in the front-end is built dynamically from the list of active modules. If "Customers" is deactivated, it disappears from the navigation entirely.

## Routes

### `GET /api/modules`

**Authentication required:** Yes.

**Purpose:** Returns only the **active** modules, sorted by `displayOrder`. This is what the front-end uses to build the navigation sidebar.

**Returns:**
```json
{ "modules": [ { "_id": "...", "name": "Inventory", "displayOrder": 1 }, ... ] }
```

---

### `GET /api/modules/all`

**Authentication required:** Yes.

**Purpose:** Returns **all** modules regardless of active status, including their descriptions. Used by the settings screen where the user can toggle modules on and off.

**Returns:**
```json
{
  "modules": [
    { "_id": "...", "name": "Inventory", "description": "Track raw materials", "isActive": true, "displayOrder": 1 },
    { "_id": "...", "name": "Products", "description": "Manage product catalogue", "isActive": false, "displayOrder": 2 }
  ]
}
```

---

### `PATCH /api/modules`

**Authentication required:** Yes.

**Purpose:** Updates the `isActive` state of multiple modules in a single request. Used when the user saves their module selection on the Settings page.

**Request body:**
```json
{
  "updates": [
    { "id": "64a1b2c3d4e5f6a1b2c3d4e1", "isActive": true },
    { "id": "64a1b2c3d4e5f6a1b2c3d4e2", "isActive": false }
  ]
}
```

Runs all updates in parallel using `Promise.all()` for efficiency. Invalid IDs are silently skipped.

## Relationship to other files

- Uses `Module` model from `models/Module.js`
- Uses `isValidId` from `lib/helpers.js`
- Front-end: `useModules.jsx` hook and `ModuleSelectionPage.jsx`
- The modules are seeded during installation via the install wizard
