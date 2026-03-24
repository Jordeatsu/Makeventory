[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/pages/settings/CustomerSettingsPage.jsx

## What is this file?

The **Customer Settings page** at `/settings/customers`. Allows toggling which optional customer fields are collected throughout the application.

## Why does this page exist?

Not every business needs every field. A user who only sells locally might not need the country field; a digital-only seller might not need address fields at all. This page lets the admin decide which customer fields appear on customer forms.

## Controlled fields

The **Name** field is always required and cannot be toggled off. The following 8 fields can each be individually turned on or off:

`email`, `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `postcode`, `country`

## Internal component: `FieldToggleRow`

A row with a label, description, and a toggle switch. Not exported. Used for each configurable field.

## State

| Variable | Description |
|---|---|
| `fields` | Object mapping each field key to `true`/`false` |
| `loading` | Loading state |
| `saving` | Whether save is in progress |
| `error` | Error message |
| `success` | Shows a success banner for 3 seconds after saving |

## Key functions

### `handleToggle(key)`
Returns an `onChange` handler for a specific toggle switch — updates `fields[key]`.

### `handleSave()`
Calls `PUT /api/settings/customers` with the current `fields` object.

## Effect on other parts of the app

When fields are disabled here, `CustomerFormModal.jsx` and `OrderFormModal.jsx` (the inline new-customer sub-form) will hide the corresponding input fields. The `useCustomerSettings` hook reads these settings so they are available app-wide.

## Relationship to other files

- Settings consumed by `useCustomerSettings`: [hooks/useCustomerSettings.js](../../hooks/useCustomerSettings.md)
- API: `GET /api/settings/customers`, `PUT /api/settings/customers`
