[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/components/SettingsLayout.jsx

## What is this file?

The **settings section layout** component — the page shell used for all settings pages (`/settings/*`).

It is very similar to `Layout.jsx` but has a different sidebar with settings-specific navigation items, and a "Back to App" button instead of the module navigation.

## Structure

The settings sidebar contains:

**Top section:**
- Back arrow button — returns to the main app (`/`)
- Settings icon and "Settings" title

**Navigation items** (fixed, not dynamic like the main layout):

| Label | Path |
|---|---|
| Module Selection | `/settings/modules` |
| Material Types | `/settings/material-types` |
| Material Settings | `/settings/materials` |
| Product Settings | `/settings/products` |
| Order Settings | `/settings/orders` |
| Customer Settings | `/settings/customers` |
| Year In Review Settings | `/settings/year-in-review` |
| Language & Region | `/settings/language-region` |

**Bottom section:**
- Sign out button

## Why a separate layout?

The settings section has a completely different navigation structure from the main app. Rather than showing module-based navigation (which is dynamic and user-configurable), settings always shows a fixed list of admin areas.

Separating these into two layout components keeps each one simpler and more focused.

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | The settings page content |

## Relationship to other files

- Used by `App.jsx` to wrap all `/settings/*` routes
- `Layout.jsx` is the parallel component for the main app section
- Also includes `AppUpdateBanner` and `AppFooter`
- Navigation labels are translated via `useTranslation()`
