[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/hooks/useCustomerSettings.js

## What is this file?

A **custom React hook** that fetches and returns the customer field visibility settings.

These settings control which fields appear in the customer form (email, phone, address, etc.).

## What it provides

```js
const { fields, loading } = useCustomerSettings();
```

| Value | Type | Description |
|---|---|---|
| `fields` | Object | Map of field names to booleans — `{ email: true, phone: false, ... }` |
| `loading` | Boolean | `true` while the settings are being fetched |

## Default values

If the API request fails, these defaults are used:

```js
{
    email:        true,
    phone:        true,
    addressLine1: true,
    addressLine2: false,  // hidden by default
    city:         true,
    state:        true,
    postcode:     true,
    country:      true,
}
```

## How it works

On mount, the hook calls `GET /api/settings/customers`. The returned `fields` object is merged with the defaults (so any missing key keeps its default value).

## How to use it

```jsx
import { useCustomerSettings } from '../hooks/useCustomerSettings';

function CustomerFormModal() {
    const { fields } = useCustomerSettings();

    return (
        <form>
            <input name="name" required />
            {fields.email && <input name="email" />}
            {fields.phone && <input name="phone" />}
        </form>
    );
}
```

## Relationship to other files

- Fetches from `GET /api/settings/customers` (handled by `routes/settings.js`)
- Data comes from `models/CustomerSettings.js`
- Used by `CustomerFormModal.jsx` (form field visibility)
- Used by `CustomersPage.jsx` (table column visibility)
