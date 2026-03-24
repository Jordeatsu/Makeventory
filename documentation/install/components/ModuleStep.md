[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/ModuleStep.jsx

## What does this file do?

This is **Step 6 of the install wizard** — Module Selection. It lets you choose which optional feature modules to enable in your Makeventory installation.

Modules allow you to turn parts of the application on or off depending on what your business needs. For example, you might not need the "Year in Review" reporting module if your business only just launched. Everything can be changed later from the admin settings inside the main application.

This step also **completes the installation** — clicking "Save & Finish" saves your module choices and marks the setup as done.

---

## Key Concepts

### Modules
Modules are optional feature sets within Makeventory. Each module has a `name`, `description`, and an `isActive` flag. When a module is inactive, its section of the application is hidden from the main navigation.

### Toggle Switch
Each module is displayed with a toggle switch (MUI `Switch` component). Flipping the switch changes the module's `isActive` state locally in the browser. Nothing is saved until you click "Save & Finish".

### `completeInstall()`
This API call writes a "completed" flag to the database. The main application checks for this flag when it starts — if installation isn't complete, it redirects to the installer. Calling `completeInstall()` here is what allows the main app to launch properly.

---

## State Variables

| Variable | Type | Description |
|---|---|---|
| `modules` | array | List of module objects from the database: `[{ _id, name, description, isActive }]` |
| `loading` | boolean | `true` while the initial module list is being fetched |
| `saving` | boolean | `true` while the "Save & Finish" API calls are in progress |
| `done` | boolean | `true` after installation is successfully completed |
| `serverError` | string | Error message if the API calls fail |

---

## Key Functions

### `useEffect` — Fetch Modules
Runs once when the component first renders. Calls `getModules()` from `api.js` to load the list of available modules and their default states.

### `toggle(id)`
Flips the `isActive` boolean for a given module by its `_id`. This is a local state change only — nothing is sent to the server until the user clicks "Save & Finish".

```js
const toggle = (id) =>
  setModules(prev =>
    prev.map(m => m._id === id ? { ...m, isActive: !m.isActive } : m)
  );
```

### `handleSave()`
Called when the user clicks "Save & Finish":
1. Sets `saving = true`
2. Calls `saveModules()` with the current `isActive` state for all modules
3. Calls `completeInstall()` to mark the installation as done
4. Sets `done = true` — shows the success alert
5. After 800ms, calls `onComplete()` — advances to the Thank You step

---

## The Module List Display

Each module is shown as a row inside a `Paper` (card-bordered) container:
- **Left side:** Module name (bold) and its description (grey, smaller text)
- **Right side:** Toggle switch

Rows are separated by `Divider` lines. The switch is disabled once saving has started or after `done = true`.

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `onComplete` | function | Yes | Called after saving modules and completing installation, to advance to Step 7 |

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 6; provides `onComplete` |
| `install/src/api.js` | Calls `getModules`, `saveModules`, `completeInstall` |
| `install/server.js` | Processes the module save and install completion |
| `server/models/Module.js` | The MongoDB schema that stores each module's state |
| `client/src/hooks/useModules.js` | The main app's hook that reads module states to show/hide navigation sections |
