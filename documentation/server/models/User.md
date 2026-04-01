[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/User.js

## What is this file?

Defines the **User** database schema — the blueprint for how user accounts are stored in MongoDB.

In Mongoose, a **schema** defines the shape of documents in a collection: what fields they have, what types those fields are, and any validation rules.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `firstName` | String | User's first name |
| `lastName` | String | User's last name |
| `email` | String | Email address (unique, required) |
| `username` | String | Login username (unique, required) |
| `passwordHash` | String | Scrypt hash of the user's password — never the plain text |
| `role` | String | Either `'admin'` or `'user'` |

Both `email` and `username` have a **unique** constraint — you cannot have two accounts with the same email or username.

## Timestamps

The schema uses `{ timestamps: true }`. This automatically adds two fields to every document:
- `createdAt` — when the document was first created
- `updatedAt` — when the document was last changed

## Important security note

The `passwordHash` field **never** contains the user's actual password. When a user registers or changes their password, the plain text is run through the `hashPassword()` function in `lib/helpers.js` and only the resulting hash is stored. When verifying a login, `verifyPassword()` is used to compare.

## Relationship to other files

- The `User` model is used in `routes/auth.js` (login), `routes/users.js` (profile management)
- Password hashing/verification is handled by `lib/helpers.js`
- Other models reference users in their `createdBy` and `updatedBy` fields
- One admin user is created during the install wizard (`install/src/components/AccountStep.jsx`)
