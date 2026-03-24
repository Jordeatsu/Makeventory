[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/lib/helpers.js

## What is this file?

A collection of small, reusable **utility functions** used throughout the server. Rather than copy-pasting the same code in multiple route files, these functions are written once here and imported wherever needed.

## Exported functions

### `hashPassword(plaintext)`

**Purpose:** Converts a plain-text password into a secure hash before storing it in the database. Passwords must never be stored in plain text.

**How it works:** Uses Node.js's built-in `scrypt` algorithm — a modern, memory-hard password hashing function. A random `salt` is generated each time, so even if two users have the same password, their stored hashes will be different.

**Returns:** A string in the format `"salt:hashHex"` — both pieces are needed to verify the password later.

```js
const hash = await hashPassword('mypassword123');
// stores something like: "a1b2c3:f4e5d6..."
```

---

### `verifyPassword(plaintext, stored)`

**Purpose:** Checks whether a plain-text password matches the stored hash during login.

**How it works:** Splits the stored `"salt:hashHex"` string, re-hashes the supplied password with the same salt, then compares using a **timing-safe** comparison. Timing-safe means even a wrong password takes the same amount of time to reject — this prevents certain types of attacks that measure response times.

**Returns:** `true` if the password matches, `false` otherwise.

```js
const valid = await verifyPassword('mypassword123', user.passwordHash);
```

---

### `cookieOpts()`

**Purpose:** Returns a standard configuration object for the JWT authentication cookie. Using a single function ensures every cookie is set consistently.

**What it contains:**
- `httpOnly: true` — the cookie cannot be read by JavaScript (prevents XSS theft)
- `sameSite: 'lax'` — prevents the cookie being sent in cross-site requests (prevents CSRF)
- `secure` — `true` when `COOKIE_SECURE=true` **or** when `NODE_ENV=production` (guarantees HTTPS cookies in production even if the env var was omitted)
- `maxAge` — 30 days in milliseconds

---

### `userLabel(u)`

**Purpose:** Converts a populated Mongoose user document into a simple `{ _id, name }` object for sending to the front-end.

**Why it exists:** Many database records store `createdBy` and `updatedBy` as references to user IDs. When the server "populates" these (looks them up), it gets full user documents. This function trims that down to just what the UI needs.

```js
userLabel({ _id: '...', firstName: 'Jane', lastName: 'Smith' });
// returns: { _id: '...', name: 'Jane Smith' }
```

---

### `isValidId(id)`

**Purpose:** Checks whether a string is a valid MongoDB ObjectId (24-character hexadecimal string).

**Why it exists:** Route parameters like `/orders/:id` come from the URL and could be anything. If the code tries to query MongoDB with an invalid ID, it throws an error. This function lets routes validate first and return a proper `400 Bad Request` error instead.

```js
isValidId('abc123')          // false
isValidId('64a1b2c3d4e5f6')  // false (too short)
isValidId('64a1b2c3d4e5f6a1b2c3d4e5') // true
```

---

### `escapeRegex(str)`

**Purpose:** Escapes special characters in a user-supplied search string before using it in a MongoDB `$regex` query.

**Why it exists:** If a user searches for `"(test)"` and that string is put directly into a regex, the parentheses are treated as regex syntax and could cause an error or unexpected behaviour. This function adds backslashes before those characters so they are treated as literal text.

This prevents a class of security vulnerability called **ReDoS** (Regular Expression Denial of Service).

## Relationship to other files

- Imported by most route files in `server/routes/`
- `hashPassword` and `verifyPassword` are used in `routes/auth.js` (login) and `routes/users.js` (password change)
- `cookieOpts` is used in `routes/auth.js` (login and logout)
- `isValidId` and `escapeRegex` are used in every route that handles `:id` parameters or search queries
