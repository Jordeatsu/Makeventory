[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/index.js

## What is this file?

The **central router** — a single file that imports all 11 sub-routers and registers them with the Express app. Think of it as a switchboard that connects all the different areas of the API together.

The server's `server.js` file imports this one file and mounts it at `/api`. This file then distributes requests to the appropriate specialist router.

## How routing works in Express

In Express, a **Router** is a self-contained group of routes. Each route file (`auth.js`, `orders.js`, etc.) creates its own Router and defines routes relative to its own base. This keeps the code organised — each file handles one area of the API.

## Imported routers

| Router file | What it handles |
|---|---|
| `routes/auth.js` | Login, logout, current user |
| `routes/users.js` | User profile management |
| `routes/modules.js` | Feature module on/off toggles |
| `routes/materialTypes.js` | Material category management |
| `routes/materials.js` | Raw material stock management |
| `routes/products.js` | Product catalogue |
| `routes/orders.js` | Order creation and management |
| `routes/customers.js` | Customer records |
| `routes/settings.js` | All settings singletons |
| `routes/system.js` | Update checks and system operations |
| `routes/yearReview.js` | Year-in-review analytics |

## Mounting strategy

Each sub-router is mounted **without a path prefix** — meaning the individual route files define their own full paths (e.g. `/orders`, `/materials/:id`). This is slightly different from the alternative pattern where you'd mount them at `/api/orders`, `/api/materials`, etc.

## Relationship to other files

- Imported by `server/server.js`
- Every route file in `server/routes/` is managed through this file
