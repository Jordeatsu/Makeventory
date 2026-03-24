[🏠 Home](../README.md) · [↑ Client](README.md)

---

# client/src/version.js

## What is this file?

A single-line file that exports the current application version number.

## Contents

```js
export const APP_VERSION = "0.2.2";
```

## Purpose

Exporting the version as a constant rather than hard-coding it in multiple places means:
- It only needs to be updated in one file when making a release
- Any component that shows the version number stays in sync automatically

## Where the version is displayed

`AppFooter.jsx` imports `APP_VERSION` and displays it in the footer of every page:
```
© 2024 Makeventory   v0.2.2
```

## How to update the version

When publishing a new release:
1. Update the version string in this file
2. Push a matching git tag (e.g. `v0.2.3`) to GitHub
3. The update system in `routes/system.js` compares the running git commit against GitHub release tags — the version string here is for display only and does not affect the update logic

## Relationship to other files

- Imported by `AppFooter.jsx` for display
