[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/common/DetailRow.jsx

## What is this file?

Contains two small **display row** components used to present label/value pairs in detail views.

## Exported components

### `DetailRow`

A vertically stacked label and value pair, displayed inside a MUI Grid item.

```
Supplier
─────────────────────
Acme Thread Co.
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | String | required | The field name label |
| `value` | String or Number | — | The value to display |
| `mono` | Boolean | `false` | Use monospace font for the value (useful for codes like SKUs) |

**Behaviour:** Returns `null` (renders nothing) if `value` is empty, `null`, or `undefined`. This makes it safe to use even for optional fields that might not be set.

**Used in:** `MaterialDetailPage.jsx`

---

### `InfoRow`

A side-by-side label/value row with a horizontal divider line between rows.

```
Status          ●  Completed
──────────────────────────────
Order Date      15 June 2024
──────────────────────────────
```

**Props:**

| Prop | Type | Description |
|---|---|---|
| `label` | String | The field name |
| `value` | String or Number | The value (shows `—` if empty) |
| `valueColor` | String | Optional MUI colour token for the value text |

**Used in:** `ProductDetailPage.jsx`, `OrderDetailPage.jsx`

## Why two components?

They serve the same purpose but in different visual contexts:
- `DetailRow` is for grid-based layouts where fields flow in columns
- `InfoRow` is for table-like layouts with a clear label/value separation

## Relationship to other files

- Both are used in various detail pages
- `InfoRow` is particularly common in `ProductDetailPage.jsx` and `OrderDetailPage.jsx`
