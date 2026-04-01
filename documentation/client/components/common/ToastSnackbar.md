[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/common/ToastSnackbar.jsx

## What is this file?

A reusable **toast notification** component — a small alert that appears briefly at the bottom of the screen to give feedback after an action.

## What it looks like

A coloured alert bar appears at the bottom-centre of the screen for 3 seconds:

```
✅  Material saved successfully.          ✕
```

The colour depends on the `severity`:
- `success` — green
- `error` — red
- `warning` — orange
- `info` — blue

## Props

| Prop | Type | Description |
|---|---|---|
| `toast` | Object | `{ open: boolean, message: string, severity: string }` — matches the shape returned by `useToast()` |
| `onClose` | Function | Called when the toast closes (either after 3 seconds or via the ✕ button) |

## How to use it

Always paired with the `useToast()` hook:

```jsx
import { useToast } from '../../hooks/useToast';
import ToastSnackbar from '../common/ToastSnackbar';

function MyPage() {
    const { toast, showToast, closeToast } = useToast();

    return (
        <>
            {/* page content */}
            <ToastSnackbar toast={toast} onClose={closeToast} />
        </>
    );
}
```

## Auto-dismiss

The snackbar automatically closes after **3000ms** (3 seconds). The user can also close it manually with the ✕ button.

## Relationship to other files

- Works with `useToast.js` hook
- Used on every page that performs create/update/delete operations
