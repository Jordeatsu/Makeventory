[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/OrderSettings.js
# server/models/ProductSettings.js
# server/models/YearInReviewSettings.js

## What are these files?

These three files each define an **empty singleton** database schema. They exist as placeholders for future configuration options.

| File | Purpose |
|---|---|
| `OrderSettings.js` | Future settings for order behaviour |
| `ProductSettings.js` | Future settings for the product catalogue |
| `YearInReviewSettings.js` | Future settings for the Year In Review page |

## Why do they exist now if they're empty?

1. **They are seeded during installation.** Having the documents in the database means the `GET /api/settings/orders` (etc.) endpoints return a valid object immediately rather than `null`. The front-end can safely read them without checking for null.

2. **They are ready to grow.** When a new configuration option is needed for orders or products, you can simply add a field to the schema — the existing document in the database will be updated on the next settings save.

## Schema

Each file follows the same pattern:

```js
const settingsSchema = new Schema({}, { timestamps: true });
export default mongoose.model('OrderSettings', settingsSchema);
```

The empty `{}` means no fields are currently defined. Timestamps are still added automatically.

## Relationship to other files

- All three are imported and managed by `routes/settings.js`
- Settings UI pages: `OrderSettingsPage.jsx`, `ProductSettingsPage.jsx`, `YearInReviewSettingsPage.jsx`
- All three are seeded by the install wizard
