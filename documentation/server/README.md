[🏠 Documentation Home](../README.md)

---

# Server Documentation

The back-end Node.js/Express API. Handles all data operations, authentication, and communicates with MongoDB.

---

## Entry Point

- [server.js](server.md) — Express app setup, middleware chain, database connection, route mounting

## Middleware

- [middleware/authMiddleware.js](middleware/authMiddleware.md) — `requireAuth` and `requireAdmin` — JWT cookie verifiers applied to protected routes

## Routes

Each route file handles one area of the API. All are mounted under `/api` by `routes/index.js`.

| File | Mount Path | What it does |
|---|---|---|
| [routes/index.js](routes/index.md) | `/api` | Mounts all route files |
| [routes/auth.js](routes/auth.md) | `/api/auth` | Login, logout, current user |
| [routes/users.js](routes/users.md) | `/api/users` | User CRUD (admin-only writes) |
| [routes/materials.js](routes/materials.md) | `/api/materials` | Material CRUD + stock adjust |
| [routes/materialTypes.js](routes/materialTypes.md) | `/api/material-types` | Material type CRUD |
| [routes/products.js](routes/products.md) | `/api/products` | Product CRUD + stats endpoint |
| [routes/orders.js](routes/orders.md) | `/api/orders` | Order CRUD + auto customer upsert |
| [routes/customers.js](routes/customers.md) | `/api/customers` | Customer CRUD |
| [routes/settings.js](routes/settings.md) | `/api/settings` | GlobalSettings + BusinessInfo |
| [routes/modules.js](routes/modules.md) | `/api/modules` | Feature module enable/disable |
| [routes/yearReview.js](routes/yearReview.md) | `/api/year-review` | Year-in-review aggregation |
| [routes/system.js](routes/system.md) | `/api/system` | Update check + apply update + restart |

## Models (MongoDB Schemas)

Each model defines the shape of a document stored in MongoDB.

| File | Collection | Purpose |
|---|---|---|
| [User.js](models/User.md) | `users` | Admin/staff accounts |
| [Material.js](models/Material.md) | `materials` | Raw materials + stock levels |
| [MaterialType.js](models/MaterialType.md) | `materialtypes` | Material categories |
| [MaterialSettings.js](models/MaterialSettings.md) | `materialsettings` | Material display config |
| [Product.js](models/Product.md) | `products` | Products built from materials |
| [Order.js](models/Order.md) | `orders` | Customer orders |
| [Customer.js](models/Customer.md) | `customers` | Customer records |
| [CustomerSettings.js](models/CustomerSettings.md) | `customersettings` | Customer label/field config |
| [GlobalSettings.js](models/GlobalSettings.md) | `globalsettings` | Language, currency, system config |
| [BusinessInfo.js](models/BusinessInfo.md) | `businessinfos` | Business name, logo, social links |
| [Module.js](models/Module.md) | `modules` | Feature module flags |
| [Overhead.js](models/Overhead.md) | `overheads` | Overhead cost records |
| [OrderSettings, ProductSettings, YearInReviewSettings](models/SettingsPlaceholders.md) | various | Per-feature settings schemas |

## Utilities

- [lib/helpers.js](lib/helpers.md) — Shared server utilities: password hashing, JWT cookie config, input validation helpers
