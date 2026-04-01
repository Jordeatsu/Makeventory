[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/common/StatCard.jsx

## What is this file?

A reusable **KPI card** component used to display a single key metric with a label, value, and optional icon or subtitle.

**KPI** stands for Key Performance Indicator — a metric like "Total Revenue" or "Active Orders".

## Two visual modes

The component automatically switches between two layouts depending on whether an `icon` prop is provided:

### With icon (Dashboard style — larger)
```
┌────────────────────────────────┐
│  Total Revenue        [💰 icon]│
│  £4,250.00                     │
│  subtitle text (optional)      │
└────────────────────────────────┘
```
Used on the Dashboard where cards have more breathing room.

### Without icon (Detail page style — compact)
```
┌──────────────────┐
│ Total Revenue    │
│ £4,250.00        │
│ subtitle         │
└──────────────────┘
```
Used in detail pages where multiple stats appear in a row.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | ReactNode | — | Optional MUI icon component. Triggers the icon layout when provided |
| `label` | String | required | The metric label (e.g. "Total Revenue") |
| `value` | String or Number | required | The displayed value (e.g. "£4,250.00") |
| `sub` | String | — | Optional subtitle shown below the value |
| `color` | String | `'primary.main'` | MUI colour token for the value and icon background tint |
| `sx` | Object | `{}` | Additional MUI sx styling for the outer Paper |

## How to use it

```jsx
import StatCard from '../components/common/StatCard';

// Dashboard style
<StatCard
    icon={<AttachMoneyIcon />}
    label="Total Revenue"
    value="£4,250.00"
    sub="This month"
    color="success.main"
/>

// Detail page style (no icon)
<StatCard label="Orders" value={42} />
```

## Relationship to other files

- Used by `DashboardPage.jsx`, `ProductDetailPage.jsx`, `CustomerDetailPage.jsx`, and other detail pages
