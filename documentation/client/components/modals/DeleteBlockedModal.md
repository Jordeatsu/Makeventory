[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/DeleteBlockedModal.jsx

## What is this file?

A simple **informational dialog** that appears when a user tries to delete a **material type** but cannot, because that type is currently being used by one or more materials.

Rather than just silently failing, this dialog explains exactly why the deletion is blocked and lists the materials that are using the type.

## When does it appear?

When a user clicks the Delete button on a material type and the server responds with a `409 Conflict` status code — meaning the delete was blocked because the type is in use.

## Example appearance

```
┌─────────────────────────────────────────────┐
│  Cannot Delete Type                         │
│                                             │
│  This type is used by the following:        │
│  • Red Cotton                               │
│  • Blue Cotton                              │
│                                             │
│                   [ OK ]                    │
└─────────────────────────────────────────────┘
```

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is showing |
| `materials` | Array of Strings | List of material names that are blocking the delete |
| `onClose` | Function | Called when the user clicks OK |

## Behaviour

- If only 1 material is blocking, it shows a singular message ("This type is used by the following material")
- If 2+ materials are blocking, it shows a plural message
- The material names are shown in a bullet list

## Relationship to other files

- Shown by `MaterialTypesPage.jsx` when a `DELETE /material-types/:id` returns 409
- The blocking materials list comes from the server route `server/routes/materialTypes.js`
