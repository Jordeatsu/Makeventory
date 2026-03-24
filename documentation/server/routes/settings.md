[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/routes/settings.js

## What is this file?

Handles all API operations for the application's **settings**, which are stored as **singleton** documents in the database.

A **singleton** means there is exactly one document of each type in the database. When you update settings, you update that one document; when you read settings, you read that one document.

Each settings type has its own `GET` and `PUT` endpoint.

## Routes summary

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/settings/materials` | Yes | Get material settings |
| PUT | `/api/settings/materials` | Yes | Update material settings |
| GET | `/api/settings/global` | **No** | Get global language & currency |
| PUT | `/api/settings/global` | Yes | Update global language & currency |
| GET | `/api/settings/customers` | Yes | Get customer field visibility settings |
| PUT | `/api/settings/customers` | Yes | Update customer field visibility |
| GET | `/api/settings/orders` | Yes | Get order settings |
| PUT | `/api/settings/orders` | Yes | Update order settings |
| GET | `/api/settings/products` | Yes | Get product settings |
| PUT | `/api/settings/products` | Yes | Update product settings |
| GET | `/api/settings/year-in-review` | Yes | Get Year In Review settings |
| PUT | `/api/settings/year-in-review` | Yes | Update Year In Review settings |

## Individual settings areas

### Material Settings (`/api/settings/materials`)

Controls how materials behave globally.

| Field | Type | Description |
|---|---|---|
| `defaultLowStockThreshold` | number | Default stock alert level for new materials |
| `currency` | string | Currency code (GBP, USD, EUR, etc.) |
| `autoDeductOnOrderComplete` | boolean | Auto-reduce material stock when an order is completed |
| `trackFractionalQuantities` | boolean | Allow decimal quantities (e.g. 0.5m of fabric) |

---

### Global Settings (`/api/settings/global`)

Controls the app's language and display currency.

| Field | Type | Description |
|---|---|---|
| `language` | string | UI language: `en`, `fr`, or `es` |
| `currency` | string | Display currency: GBP, USD, EUR, AUD, CAD, NZD |

**Note:** This endpoint does not require authentication for **reads** (`GET`). This is intentional — the app needs to know the language setting before the user has logged in so the login page can display in the correct language.

---

### Customer Settings (`/api/settings/customers`)

Controls which fields appear in the customer form.

The `fields` object contains boolean toggles for each optional field:
```json
{
  "fields": {
    "email": true,
    "phone": true,
    "addressLine1": true,
    "addressLine2": false,
    "city": true,
    "state": true,
    "postcode": true,
    "country": true
  }
}
```
The `name` field is always shown and is not included in this object.

---

### Order Settings, Product Settings, Year In Review Settings

These are currently placeholder singletons with no configurable fields. They were seeded during installation and are ready to have fields added in future versions.

## The "upsert" pattern

All `PUT` routes use MongoDB's `upsert: true` option. This means:
- If a settings document already exists → update it
- If no settings document exists yet → create it

This is safer than assuming the document always exists.

## Relationship to other files

- Uses the singleton model files: `MaterialSettings.js`, `GlobalSettings.js`, `CustomerSettings.js`, `OrderSettings.js`, `ProductSettings.js`, `YearInReviewSettings.js`
- Front-end context: `GlobalSettingsContext.jsx` reads from `/api/settings/global`
- Front-end hook: `useCustomerSettings.js` reads from `/api/settings/customers`
- Front-end pages: various Settings pages under `client/src/pages/settings/`
