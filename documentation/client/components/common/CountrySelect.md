[🏠 Home](../../../README.md) · [↑ Client](../../README.md)

---

# client/src/components/common/CountrySelect.jsx

## What is this file?

A reusable **country selector** drop-down input used on customer forms. Renders as an autocomplete search box that lets the user type to filter and then select a country.

## Features

- Lists every country in the world
- **Pinned countries:** United Kingdom and United States of America always appear at the top of the list for quick access, separated from the full alphabetical list by a divider line
- **Free solo:** The user can also type a custom value that isn't in the list (useful for edge cases)
- Integrates directly with MUI's `Autocomplete` component

## Pin order example

```
──────────────────────────────────
  United Kingdom
  United States of America
──────────────────────────────────
  Afghanistan
  Albania
  Algeria
  ...
──────────────────────────────────
```

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | String | No | Currently selected country name |
| `onChange` | Function | Yes | Called with the new value when user selects or types |
| `required` | Boolean | No | Marks the field as required in form validation |
| `error` | Boolean | No | Shows the field in error state (red border) |
| `helperText` | String | No | Text shown below the field (often the validation message) |
| `size` | String | No | MUI size: `"small"` or `"medium"` |

## Why `freeSolo`?

`freeSolo` means the user can type in a country name that doesn't match any item in the list and still submit the form. This prevents the form from getting stuck if a country is missing from the list.

## Relationship to other files

- Used in:
  - `CustomerFormModal.jsx` — when creating or editing a customer
  - Any other form that collects a country field
