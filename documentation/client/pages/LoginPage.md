[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/LoginPage.jsx

## What is this file?

The **login screen** — the first page a user sees if they are not already signed in. It is a two-panel layout:

- **Left panel (brand):** Shows the app's logo, name, tagline, supporter names, and links to the developer's Buy Me a Coffee page
- **Right panel (form):** Username, password field with show/hide toggle, and sign-in button

## What is a "page"?

In React Router, a "page" is just a component that React Router renders for a specific URL path. The `LoginPage` is rendered when the user navigates to `/login`.

## Key features

- Shows the business name and logo from `BrandingContext` — so it displays the user's own branding, not just default app text
- On mobile, the layout stacks vertically (brand panel on top, form below)
- If the user is already logged in (`user` exists in `AuthContext`), they are immediately redirected to `/`
- Includes a `TOP_SUPPORTERS` array listing named supporters

## State

| Variable | Description |
|---|---|
| `username` | Current value of the username input |
| `password` | Current value of the password input |
| `showPass` | Boolean — whether the password is visible (toggle) |
| `submitting` | `true` while the login request is in progress |
| `error` | Error message shown if login fails |

## Key functions

### `handleSubmit(e)`
1. Prevents default form submission
2. Validates that both fields are filled
3. Calls `login(username, password)` from `AuthContext`
4. On success: navigates to `/`
5. On failure: shows the error message from the server (e.g. "Invalid password")

## Relationship to other files

- Uses `AuthContext` for `login()` and `user`: [context/AuthContext.jsx](../context/AuthContext.md)
- Uses `BrandingContext` for logo and businessName: [context/BrandingContext.jsx](../context/BrandingContext.md)
- The login API call goes to `POST /api/auth/login`: see [server/routes/auth.md](../../server/routes/auth.md)
- After successful login, navigates to `DashboardPage.jsx`
