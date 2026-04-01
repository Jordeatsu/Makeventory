[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/ModuleSelectionPage.jsx

## What is this file?

The **Module Selection page** at `/settings/modules`. Controls which optional feature modules are active in the application. Toggling a module off removes it from the sidebar navigation.

## What are modules?

Modules are optional application features that can be turned on or off. The navigation sidebar is built dynamically from only the active modules — so deactivating a module removes its link from the sidebar. Available modules include: Orders, Products, Customers, Materials, and Year in Review.

## How changes work

1. The current module states are loaded from the server
2. The user flips toggle switches — these update a **draft** object (not the real state yet)
3. The Save Changes button becomes enabled only if the draft differs from the loaded state (`isDirty`)
4. Clicking Save sends a `PATCH /api/modules` request with all module states

## State

| Variable | Description |
|---|---|
| `modules` | The committed module list from server |
| `draft` | Map of `{ [moduleId]: isActive }` being edited in real time |
| `loading` | Loading state |
| `saving` | Whether save is in progress |
| `error` | Error message |
| `success` | Shows success banner for 3 seconds after saving |

## `isDirty`

Computed each render: `modules.some((m) => draft[m._id] !== m.isActive)` — true if any draft value differs from the committed state.

## Key functions

### `handleSave()`
Calls `PATCH /api/modules` with the full array of `{ id, isActive }` updates. On success, commits the draft into the `modules` state so `isDirty` resets to false.

## Relationship to other files

- Module states consumed by `useModules`:  [hooks/useModules.jsx](../../hooks/useModules.md)
- API: `GET /api/modules/all`, `PATCH /api/modules`
