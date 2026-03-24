[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/ProfilePage.jsx

## What is this file?

The **user profile page** at `/profile` (with optional `?id=xxx` query parameter for admins to view other users). Shows a user's profile information and allows them to edit their profile and change their password.

## Two modes

- **Own profile:** Accessed at `/profile` with no query parameter. Loaded from `currentUser._id` from AuthContext.
- **Admin viewing another user:** Accessed at `/profile?id=abc123`. Can only be done by admins.

## Sections

1. **Hero header** — gradient banner with avatar (initials), name, role chip, and member-since date
2. **Info card grid** — 4 small cards showing: username, email, role, member since
3. **Account details section** — user ID (monospace), account created date, last updated date
4. **Action buttons** — Edit Profile button and Change Password button (only visible if `canEdit`)

## Who can edit?

`canEdit = isOwnProfile || isAdmin` — users can always edit themselves; admins can edit any user.

## State

| Variable | Description |
|---|---|
| `profile` | The user profile data |
| `loading` | Loading state |
| `error` | Error string |
| `snackbar` | Toast notification state |
| `pwOpen` | Whether the change-password dialog is open |
| `pwForm` | Password form state (currentPassword, newPassword, confirmPassword) |
| `pwError` | Password form validation error |
| `editOpen` | Whether the edit profile dialog is open |
| `editForm` | Edit form state (firstName, lastName, username, email) |

## Key functions

### `handlePasswordSubmit(e)`
Validates that `newPassword` matches `confirmPassword` and is at least 8 characters, then calls `PATCH /api/users/:id/password`.

### `handleEditSubmit(e)`
Calls `PATCH /api/users/:id` with the updated profile fields. Updates the local `profile` state with the server response.

### Helper functions

- `fmt(dateStr)` — formats a date for display (local inline function, not from utils)
- `getInitials(p)` — extracts first letters of firstName and lastName for the avatar

## Relationship to other files

- Uses `AuthContext` for `currentUser`: [context/AuthContext.jsx](../context/AuthContext.md)
- API calls to [server/routes/users.md](../../server/routes/users.md)
