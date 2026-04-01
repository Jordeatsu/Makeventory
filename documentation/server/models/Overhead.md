[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/Overhead.js

## What is this file?

Defines the **Overhead** database schema — business expense records that appear in the Year In Review analytics.

Overheads represent costs that are not tied to a specific order — things like marketplace subscription fees, packaging equipment, software tools, or studio rent.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `name` | String | Expense name (required) |
| `category` | String | Expense category (e.g. "Equipment", "Subscriptions") |
| `cost` | Number | Expense amount (required) |
| `purchaseDate` | Date | When the expense was incurred (required) |
| `notes` | String | Optional free-text notes |
| `year` | Number | The year of the expense — **auto-derived** from `purchaseDate` |
| `createdBy` | ObjectId | Reference to the User who added this record |

## The `year` field and the pre-save hook

The `year` field is **not set manually** — it is automatically computed from `purchaseDate` using a Mongoose **pre-save hook**:

```js
overheadSchema.pre('save', function () {
    this.year = new Date(this.purchaseDate).getFullYear();
});
```

A **pre-save hook** is code that runs automatically just before a document is saved to the database. This ensures `year` is always accurate and consistent with `purchaseDate`, without requiring the caller to compute it.

The `year` field is used by `routes/yearReview.js` to quickly filter overhead records by year without having to parse dates in every query.

## How it appears in Year In Review

In the Year In Review stats response, overhead records are merged with material usage data into a single `materials` array. Overhead entries are marked with `isOverhead: true` so the front-end can display them differently.

## Relationship to other files

- Created and deleted by `routes/yearReview.js`
- Used in the Year In Review stats aggregation
- Front-end: `YearReviewPage.jsx`
