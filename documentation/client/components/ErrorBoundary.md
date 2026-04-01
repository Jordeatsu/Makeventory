[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/components/ErrorBoundary.jsx

## What is this file?

A **React error boundary** that catches JavaScript errors anywhere in the component tree and shows a fallback UI instead of crashing the entire page.

## What is an error boundary?

Normally, if a React component throws an error during rendering, the whole tree crashes and shows a blank white page. An **error boundary** is a special React class component that intercepts these errors and renders something useful instead.

Error boundaries work like a try/catch block — but for React rendering.

## What it looks like when an error occurs

```
Something went wrong

[Error message here]

[Reload page]
```

Centred on the screen, with the error message and a button to reload.

## Why a class component?

Error boundaries must be class components — React does not yet support error boundary logic in function components (there is no function component equivalent of `componentDidCatch`).

## Key lifecycle methods

### `static getDerivedStateFromError(error)`

Called when a child component throws during rendering. Updates state to `{ hasError: true, error }` which triggers the fallback render.

### `componentDidCatch(error, info)`

Called after the error has been caught. Currently logs to the console. In production, this is where you would send the error to an error tracking service like Sentry.

## How to extend this

To integrate error tracking (e.g. Sentry), add the tracking call inside `componentDidCatch`:
```js
componentDidCatch(error, info) {
    Sentry.captureException(error, { extra: info });
}
```

## Relationship to other files

- Used in `main.jsx` to wrap the entire application
- Any component anywhere in the tree is protected
