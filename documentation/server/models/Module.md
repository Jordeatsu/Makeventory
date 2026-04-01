[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Module.js

## What is this file?

Defines the **Module** database schema — feature flags that control which sections of the application are visible.

Each document in this collection represents one app section (Inventory, Products, Orders, Customers, Year Review). By toggling `isActive`, the admin can hide entire sections from the navigation.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `name` | String | Module identifier name (e.g. `"Inventory"`, `"Orders"`) |
| `description` | String | Human-readable description of what this module does |
| `isActive` | Boolean | Whether this module is currently enabled (default: `true`) |
| `displayOrder` | Number | Sort order in the navigation sidebar |

**Collection name:** `modules` (explicitly set)

## How modules drive the navigation

1. `routes/modules.js` exposes `GET /api/modules` which returns only **active** modules sorted by `displayOrder`
2. The `useModules.jsx` hook in the client fetches this list and maps each module name to a route and icon
3. `Layout.jsx` renders the navigation items from this dynamic list

This means adding a new module to the navigation only requires:
- Adding the module document to the database
- Adding the name→path/icon mapping in `useModules.jsx`

## Default modules

Five modules are seeded during installation:

| Name | Path | Description |
|---|---|---|
| Inventory | `/materials` | Raw material stock management |
| Products | `/products` | Product catalogue |
| Orders | `/orders` | Order management |
| Customers | `/customers` | Customer records |
| Year Review | `/year-review` | Annual analytics |

## Relationship to other files

- Managed by `routes/modules.js`
- Consumed by `useModules.jsx` hook in the client
- Settings UI: `ModuleSelectionPage.jsx`
- Seeded during installation via the install wizard
