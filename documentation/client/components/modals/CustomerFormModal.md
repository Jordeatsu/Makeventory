[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/modals/CustomerFormModal.jsx

## What is this file?

A **pop-up dialog** (modal) for creating a new customer or editing an existing one. It works both as a "New Customer" form and as an "Edit Customer" form — the title and behaviour change automatically based on whether existing customer data is passed in.

## What is a modal/dialog?

A modal is a window that appears on top of the page and blocks interaction with the rest of the page until you close it. In this project, modals are used to add and edit records without navigating to a different page.

## Props

| Prop | Type | Description |
|---|---|---|
| `open` | Boolean | Whether the dialog is visible |
| `onClose` | Function | Called when the user cancels |
| `onSave` | Function | Called with the form data when the user clicks Save |
| `initial` | Object | If provided, pre-populates the form (edit mode). If absent, an empty form is shown (create mode). |

## State

| Variable | Description |
|---|---|
| `form` | Object holding all the input values |
| `saving` | `true` while the save is in progress (disables the Save button to prevent double-clicks) |

## Dynamic fields

The form uses the `useCustomerSettings` hook to check which optional fields (email, phone, address, etc.) are enabled in settings. Only enabled fields are displayed. The **Name** field is always shown and always required.

## Functions

### `set(field)`
A helper that returns an `onChange` handler for a text field. Calling `set('email')` returns a function that updates `form.email` whenever the user types.

### `handleSubmit(e)`
Triggered when the form is submitted (Save button clicked):
1. Prevents the default browser form submission
2. Sets `saving` to `true` 
3. Calls `onSave(form)` with the collected data
4. Sets `saving` back to `false` when done (whether success or error)

## Relationship to other files

- Uses `CountrySelect` for the country drop-down: [common/CountrySelect.jsx](../common/CountrySelect.md)
- Uses `useCustomerSettings` to check which fields are visible: [hooks/useCustomerSettings.js](../../hooks/useCustomerSettings.md)
- Used in: `CustomersPage.jsx`, `OrderFormModal.jsx` (inline new-customer sub-form)
