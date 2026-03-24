[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/context/AuthContext.jsx

## What is this file?

Provides **authentication state** (who is logged in) to every component in the application via React Context.

## What is React Context?

React Context is a way to share data between components without passing it as a prop through every level of the component tree ("prop drilling"). Any component wrapped inside a `Provider` can access the context data directly.

Think of it like a global variable that React manages safely — it updates all subscribers when the value changes.

## What this context provides

Any component that calls `useAuth()` gets access to:

| Value | Type | Description |
|---|---|---|
| `user` | Object or `null` | The currently logged-in user's data, or `null` if not logged in |
| `loading` | Boolean | `true` while checking the cookie on first load |
| `login(username, password)` | Function | Logs in a user |
| `logout()` | Function | Logs out the current user |

## How it works

### On mount (first load)

When the `AuthProvider` mounts, it immediately calls `GET /api/auth/me`. This checks whether the browser's stored cookie is still valid. If it is, `user` is set to the returned user object. If not (cookie expired, not present), `user` is set to `null`.

The `loading` flag is `true` until this check completes. `ProtectedRoute` in `App.jsx` shows a spinner while `loading` is true.

### `login(username, password)`

Calls `POST /api/auth/login`. On success, stores the returned user object in state. The JWT cookie is stored automatically by the browser (the server sends it as a `Set-Cookie` header).

### `logout()`

Calls `POST /api/auth/logout` to clear the server-side cookie, then sets `user` to `null`. The `ProtectedRoute` will then redirect to `/login`.

## How to use it

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
    const { user, logout } = useAuth();
    return (
        <div>
            <p>Hello, {user.firstName}</p>
            <button onClick={logout}>Log out</button>
        </div>
    );
}
```

## Relationship to other files

- `AuthProvider` wraps the entire app in `App.jsx`
- `ProtectedRoute` in `App.jsx` uses `useAuth()` to guard pages
- `Layout.jsx` uses `useAuth()` to show the user's name and provide logout
- `LoginPage.jsx` uses `login()` to authenticate
- The server-side counterpart is `routes/auth.js`
