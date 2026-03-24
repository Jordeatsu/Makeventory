[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/common/RecordInfo.jsx

## What is this file?

A small card displayed at the bottom of detail pages that shows when a record was **created** and last **updated**, and by whom. It gives an audit trail for any record in the application.

## Example appearance

```
┌────────────────────────────────────────────────┐
│  Record Information                             │
│  Created       15 June 2024   by Jane Smith     │
│  Updated       20 June 2024   by Alex Jones     │
└────────────────────────────────────────────────┘
```

## Props

| Prop | Type | Description |
|---|---|---|
| `createdAt` | Date string or Date | When the record was first created |
| `updatedAt` | Date string or Date | When the record was last changed |
| `createdBy` | Object `{ name }` | The user who created the record |
| `updatedBy` | Object `{ name }` | The user who last updated the record |
| `createdLabel` | String | Optional override for the "Created" label (default from translations) |
| `updatedLabel` | String | Optional override for the "Updated" label (default from translations) |

## Behaviour

- If **both** `createdAt` and `updatedAt` are absent, the component renders nothing at all
- Dates are formatted using the `fmtDateTime` helper from `utils/formatting.js`
- The Paper card (white box with shadow) always sits at the bottom of the section

## Why this file exists

Every record in MongoDB automatically gets a `createdAt` and `updatedAt` timestamp (via Mongoose's `{ timestamps: true }` option on each Schema). This component gives a consistent way to display those timestamps across all detail pages without repeating the same layout code.

## Relationship to other files

- Uses `fmtDateTime` from [utils/formatting.js](../../utils/formatting.md)
- Uses `i18n` translation keys via `useTranslation`
- Used at the bottom of: `MaterialDetailPage.jsx`, `ProductDetailPage.jsx`, `OrderDetailPage.jsx`, `CustomerDetailPage.jsx`
