[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/components/AppFooter.jsx

## What is this file?

The **footer component** displayed at the bottom of every page. It shows a copyright notice and a "Buy Me a Coffee" support link.

## What it displays

```
© 2024 Makeventory  v0.2.2       [Buy me a coffee  ☕]
```

Left side:
- Copyright year (auto-generated from `new Date().getFullYear()`)
- App version number (imported from `version.js`)

Right side:
- A "Buy Me a Coffee" button image linking to the creator's BMC page

## Props

None — this component is fully self-contained.

## Buy Me a Coffee

The `BMC_USERNAME` constant contains the Buy Me a Coffee username. If you want to point this to a different account, change that constant.

The link opens in a new tab (`target="_blank"`) with `rel="noopener noreferrer"` for security (this prevents the external page from getting a reference to the Makeventory window).

## Relationship to other files

- Rendered by both `Layout.jsx` and `SettingsLayout.jsx`
- Imports `APP_VERSION` from `version.js`
- Footer copyright text is translated via `useTranslation()`
