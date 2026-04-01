[🏠 Home](../README.md) · [↑ Client](README.md)

---

# client/src/main.jsx

## What is this file?

The **entry point** for the React front-end. This is the very first JavaScript file that runs in the browser. It sets up all the global providers and renders the `App` component into the HTML page.

## What it does

```
1. Imports i18n.js (sets up translations — must happen before anything renders)
2. Gets the HTML element with id="root" from index.html
3. Creates a React root and renders the app tree into it
```

## Providers explained

This file wraps the entire app in several **providers** — components that make data or functionality available to every component deep in the component tree.

Think of providers like layers on an onion — the outermost layer wraps everything else.

| Provider | What it does |
|---|---|
| `React.StrictMode` | In development, renders components twice to help catch bugs |
| `ErrorBoundary` | Catches JavaScript errors anywhere in the component tree and shows a fallback UI instead of a blank page |
| `BrowserRouter` | Enables URL-based navigation (React Router) |
| `ThemeProvider` | Makes the MUI colour theme available to all components |
| `LocalizationProvider` | Makes date formatting (using Day.js) available to MUI date pickers |
| `CssBaseline` | Resets browser default styles to a consistent baseline |
| `App` | The actual application |

## Why must i18n be imported first?

The `i18n.js` import (`import './i18n'`) must happen at the top — before any component renders — because translations need to be loaded before the app tries to display any text. If it loaded later, components might render with missing translation keys.

## Relationship to other files

- Renders `App.jsx` as the root component
- Applies the theme from `theme.js`
- Wraps with `ErrorBoundary` from `components/ErrorBoundary.jsx`
- Initialises translations from `i18n.js`
- The HTML anchor point `<div id="root">` is in `index.html` (not tracked in the docs folder)
