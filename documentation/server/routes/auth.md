[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/auth.js

## What is this file?

Handles everything related to user authentication: logging in, logging out, and checking who the current user is.

## Routes

### `GET /api/public/business`

**Authentication required:** No — this is public.

**Purpose:** Returns the business name and logo so the login page can display them before the user has logged in.

**Returns:**
```json
{ "businessName": "My Shop", "logo": "data:image/png;base64,..." }
```

---

### `POST /api/auth/login`

**Authentication required:** No.

**Purpose:** Authenticates a user with their username (or email) and password, and returns a JWT cookie.

**Rate limited:** 20 requests per 15 minutes per IP address. This prevents brute-force password attacks.

**Request body:**
```json
{ "username": "janesmith", "password": "mysecretpassword" }
```

**What it does:**
1. Looks up the user by username or email (case-insensitive)
2. Uses `verifyPassword()` to check the password against the stored hash
3. If valid, creates a **JWT (JSON Web Token)** containing the user's ID and role
4. Sets the JWT in an **HttpOnly cookie** — the browser stores it automatically
5. Returns the user object (without the password hash)

**Returns:**
```json
{ "user": { "_id": "...", "firstName": "Jane", "role": "admin", ... } }
```

**Error responses:**
- `400` — username/password not provided
- `401` — user not found or wrong password
- `429` — rate limit exceeded

---

### `POST /api/auth/logout`

**Authentication required:** No (but available to any client).

**Purpose:** Clears the authentication cookie, effectively logging the user out.

**What it does:** Clears the `token` cookie by sending a new cookie with an empty value and very short expiry.

---

### `GET /api/auth/me`

**Authentication required:** Yes (`requireAuth` middleware).

**Purpose:** Returns the currently logged-in user's details. Used by the front-end on page load to check whether the stored cookie is still valid.

**Returns:**
```json
{ "user": { "_id": "...", "firstName": "Jane", "role": "admin", ... } }
```
(The `passwordHash` field is never included.)

**Cache:** Response is marked `no-store` so browsers do not cache it.

## Security notes

- Passwords are verified using scrypt via `helpers.verifyPassword()` — never compared directly
- The JWT is stored in an HttpOnly cookie (not accessible to JavaScript)
- The login endpoint is rate-limited to prevent brute-force attacks
- The cookie is marked `Secure` in production (HTTPS only)

## Relationship to other files

- Uses `hashPassword`/`verifyPassword` and `cookieOpts` from `lib/helpers.js`
- The JWT is later verified by `middleware/authMiddleware.js` on every protected route
- Reading `BusinessInfo` model for the public `/public/business` endpoint
