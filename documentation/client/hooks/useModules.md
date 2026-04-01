[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/hooks/useModules.jsx

## What is this file?

A **custom React hook** that fetches the list of active modules from the server and converts them into navigation item objects for the sidebar.

## What it provides

```js
const { navItems, loading } = useModules();
```

| Value | Type | Description |
|---|---|---|
| `navItems` | Array | Navigation items ready for rendering |
| `loading` | Boolean | `true` while the module list is being fetched |

### `navItem` shape

Each item in `navItems` has:

| Property | Description |
|---|---|
| `label` | Translated display name (e.g. "Inventory" → "Inventaire" in French) |
| `path` | URL route (e.g. `/materials`) |
| `icon` | MUI Icon component |

## Module configuration

The `MODULE_CONFIG` constant inside this file maps module names (as stored in the database) to their route path and icon:

| Module Name | Path | Icon |
|---|---|---|
| `Inventory` | `/materials` | Inventory2Icon |
| `Products` | `/products` | CategoryIcon |
| `Orders` | `/orders` | ReceiptLongIcon |
| `Customers` | `/customers` | PeopleIcon |
| `Year Review` | `/year-review` | CalendarMonthIcon |

If an unknown module name is returned from the server, a fallback path (kebab-cased name) and `ExtensionIcon` are used.

## Translation

Module labels are translated using i18next: `t('modules.Inventory')`, etc. If a translation key doesn't exist, the module name from the database is used as-is.

## How to use it

```jsx
import { useModules } from '../hooks/useModules.jsx';

function Navigation() {
    const { navItems, loading } = useModules();
    if (loading) return <Skeleton />;
    return navItems.map(item => (
        <NavLink key={item.path} to={item.path}>{item.icon} {item.label}</NavLink>
    ));
}
```

## Relationship to other files

- Fetches from `GET /api/modules` (active modules only)
- Data comes from `models/Module.js`
- Used by `Layout.jsx` to render the navigation sidebar
- Module on/off is managed in `ModuleSelectionPage.jsx`
