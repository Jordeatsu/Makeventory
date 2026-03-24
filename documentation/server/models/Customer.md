[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Customer.js

## What is this file?

Defines the **Customer** database schema — people who place orders.

## Schema fields

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | **Yes** | Customer's name |
| `email` | String | No | Email address |
| `phone` | String | No | Phone number |
| `addressLine1` | String | No | Primary address line |
| `addressLine2` | String | No | Secondary address line (flat number, etc.) |
| `city` | String | No | City |
| `state` | String | No | State or county |
| `postcode` | String | No | Postal/ZIP code |
| `country` | String | No | Country |

Timestamps (`createdAt`, `updatedAt`) are added automatically.

## Why are most fields optional?

The application is flexible — some businesses might only need a customer name for orders, while others need full mailing addresses. The `CustomerSettings` model allows the business to configure which fields are shown in the customer form. Fields that are hidden in the settings won't be collected.

## Auto-creation of customers

When creating an order, if a customer name/email is typed in that doesn't match an existing record, a new customer document is automatically created (see the `findOrCreateCustomer()` function in `routes/orders.js`). This means customers can be created implicitly through the order creation process without needing to visit the Customers page first.

## Relationship to other files

- Referenced by `models/Order.js` (the `customer` field)
- Used directly in `routes/customers.js`
- Also used in `routes/orders.js` for the auto-create logic and search
- Field visibility controlled by `models/CustomerSettings.js`
- Front-end: `CustomersPage.jsx`, `CustomerDetailPage.jsx`, `CustomerFormModal.jsx`
