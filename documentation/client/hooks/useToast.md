[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/hooks/useToast.js

## What is this file?

A **custom React hook** that manages the state for a toast notification (a small pop-up message).

## What is a custom hook?

In React, a **hook** is a function that starts with `use` and can use React state and other hooks. A **custom hook** is one you write yourself to extract reusable logic from components.

This hook encapsulates the state management for toast notifications so that every page doesn't need to duplicate the same `useState` and handler code.

## What it provides

```js
const { toast, showToast, closeToast } = useToast();
```

| Value | Type | Description |
|---|---|---|
| `toast` | Object | `{ open: boolean, message: string, severity: string }` |
| `showToast(message, severity)` | Function | Opens the toast with a message and optional severity |
| `closeToast()` | Function | Closes the toast |

## `severity` values

These map to MUI Alert severity levels:
- `'success'` — green (default)
- `'error'` — red
- `'warning'` — orange
- `'info'` — blue

## How to use it

```jsx
import { useToast } from '../hooks/useToast';
import ToastSnackbar from '../components/common/ToastSnackbar';

function MyPage() {
    const { toast, showToast, closeToast } = useToast();

    const handleSave = async () => {
        try {
            await api.post('/something', data);
            showToast('Saved successfully!', 'success');
        } catch {
            showToast('Something went wrong.', 'error');
        }
    };

    return (
        <>
            <button onClick={handleSave}>Save</button>
            <ToastSnackbar toast={toast} onClose={closeToast} />
        </>
    );
}
```

## Relationship to other files

- Used by almost every page component
- Works with `ToastSnackbar` component (`components/common/ToastSnackbar.jsx`)
