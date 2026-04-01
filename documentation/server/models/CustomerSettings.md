[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/CustomerSettings.js

## What is this file?

Defines the **CustomerSettings** database schema — a **singleton** document controlling which fields are shown in the customer form.

Because different businesses have different needs, the customer form can be customised to show only the relevant fields. A business that only sells locally might not need address fields; an online-first business might need all of them.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `fields` | Object | A map of field names to boolean visibility toggles |

### The `fields` object

Each key is an optional customer field name, and the value is a boolean indicating whether that field should be shown.

| Field key | Controls |
|---|---|
| `email` | Email address field |
| `phone` | Phone number field |
| `addressLine1` | Address line 1 |
| `addressLine2` | Address line 2 |
| `city` | City field |
| `state` | State/county field |
| `postcode` | Postcode/ZIP field |
| `country` | Country field |

The `name` field is always visible and is not included in this settings object.

## How it works in the front-end

1. `useCustomerSettings.js` hook fetches these settings on startup
2. The settings are passed to `CustomerFormModal.jsx`
3. The modal only renders form fields where the corresponding toggle is `true`

This means the admin can keep the customer form focused on what actually matters for their business.

## Relationship to other files

- Read and written by `routes/settings.js` (`/api/settings/customers`)
- Consumed by `useCustomerSettings.js` hook
- Affects `CustomerFormModal.jsx` (which fields to show)
- Affects `CustomersPage.jsx` (which columns to show in the table)
- Settings UI: `CustomerSettingsPage.jsx`
