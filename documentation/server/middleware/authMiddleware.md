[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/middleware/authMiddleware.js

## What is this file?

This file contains **middleware** functions for authentication and authorization.

**Middleware** is code that runs in-between a request arriving at the server and the actual handler sending a response. Think of it as a security guard at a door — every request must pass the check before getting through.

This file provides two guards:
1. **requireAuth** — checks that the user is logged in
2. **requireAdmin** — checks that the logged-in user is an admin

## How does authentication work in this app?

When a user logs in, the server:
1. Verifies their username and password
2. Creates a **JWT (JSON Web Token)** — a signed, tamper-proof token that says "this is user X with role Y"
3. Stores that token in an **HttpOnly cookie** in the user's browser

An HttpOnly cookie is invisible to JavaScript — it cannot be read or stolen by browser scripts, which is more secure than storing tokens in `localStorage`.

Every subsequent request the browser makes automatically includes this cookie. The middleware reads and verifies it.

## Exported functions

### `requireAuth(req, res, next)`

**Purpose:** Ensures the request comes from a logged-in user.

**How it works:**
1. Reads the `token` cookie from the incoming request
2. Verifies it using `JWT_SECRET` (the key stored in `.env`)
3. If valid, attaches the decoded user information to `req.user` and calls `next()` to continue
4. If the token is missing, expired, or tampered with, responds with `401 Unauthorized`

**Used on:** Almost every route — any endpoint that requires the user to be logged in.

```js
// Example usage on a route
router.get('/materials', requireAuth, async (req, res) => {
    // req.user is now available here, e.g. req.user.sub = user ID
    // req.user.role = 'admin' or 'user'
});
```

---

### `requireAdmin(req, res, next)`

**Purpose:** Ensures the logged-in user has the `admin` role.

**How it works:**
1. Checks `req.user.role === 'admin'`
2. If true, calls `next()` to continue
3. If false, responds with `403 Forbidden`

**Important:** This must always be used *after* `requireAuth`, because it depends on `req.user` being set.

```js
// Example usage — requireAuth runs first, then requireAdmin
router.post('/system/update', requireAuth, requireAdmin, async (req, res) => { ... });
```

## The `req.user` object

After `requireAuth` runs, the following is available on `req`:

| Property | Value |
|---|---|
| `req.user.sub` | The user's MongoDB `_id` as a string |
| `req.user.role` | Either `'admin'` or `'user'` |

## Relationship to other files

- Used by nearly every route file in `server/routes/`
- The JWT is created in `server/routes/auth.js` during login
- `JWT_SECRET` must match between where the token is signed (auth.js) and where it is verified (here)
