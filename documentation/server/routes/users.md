[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/users.js

## What is this file?

Handles API operations for **user profile management** — viewing, updating, and changing passwords.

**Note on scope:** This file does not handle user creation or listing all users. User creation happens during the install wizard. Admins managing users would be a future feature.

## Access control rules

- **Non-admin users** can only view and edit their own profile
- **Admin users** can view and edit any user's profile
- Password changes are always restricted to the account owner only (even admins cannot change someone else's password through this route)

These checks are enforced inside each route using `req.user.sub` (the logged-in user's ID) and `req.user.role`.

## Routes

### `GET /api/users/:id`

**Authentication required:** Yes.

**Purpose:** Returns a user's profile. The `passwordHash` field is always excluded.

**Access:** Admins may view any user. Non-admins may only view their own profile.

---

### `PATCH /api/users/:id`

**Authentication required:** Yes.

**Purpose:** Updates a user's profile fields.

**Updateable fields:** `firstName`, `lastName`, `email`, `username`

**Access:** Admins may edit any user. Non-admins may only edit their own profile.

Only fields that are provided and non-empty are updated — missing fields are ignored rather than cleared.

**Error responses:**
- `400` — no valid fields provided
- `409` — the new username or email is already in use by another account

---

### `PATCH /api/users/:id/password`

**Authentication required:** Yes.

**Purpose:** Changes a user's password. Requires proof of the current password.

**Access:** Account owner only (even admins cannot use this to change someone else's password).

**Request body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newsecurepassword456"
}
```

**Validation:**
- Both fields are required
- New password must be at least 8 characters
- Current password is verified against the stored hash before any change is made

**How it works:**
1. Verifies `currentPassword` matches the user's stored `passwordHash`
2. Hashes the new password with `hashPassword()`
3. Saves the new hash

## Relationship to other files

- Uses `User` model from `models/User.js`
- Uses `isValidId`, `verifyPassword`, `hashPassword` from `lib/helpers.js`
- Front-end page: `ProfilePage.jsx`
