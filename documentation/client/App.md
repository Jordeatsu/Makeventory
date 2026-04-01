[🏠 Home](../README.md) · [↑ Client](README.md)

---

# client/src/App.jsx

## What is this file?

The **root component** of the React application. It defines:
1. Which **context providers** wrap the entire app
2. All **URL routes** — which page to show for each URL

## What is a component?

In React, a **component** is a JavaScript function that returns a piece of UI (HTML-like JSX). Components can contain state, logic, and other components.

## What is a route?

React Router makes the browser URL control what gets displayed. When the URL is `/orders`, the `OrdersPage` component is rendered. When it changes to `/products`, `ProductsPage` is rendered — without reloading the page.

## Components in this file

### `ProtectedRoute`

A wrapper component that checks if the user is logged in before allowing access to a page.

**How it works:**
1. Reads the current user and loading state from `AuthContext`
2. If still loading (checking the stored cookie): shows a spinner
3. If logged in: renders the child page
4. If not logged in: redirects to `/login`

```jsx
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <CircularProgress />;
    return user ? children : <Navigate to="/login" replace />;
}
```

### `AppRoutes`

Contains all the route definitions. Routes are organised into two sections:

**Settings routes** (`/settings/*`):
- Wrapped in `ProtectedRoute` + `SettingsLayout`
- Has its own sidebar and navigation
- Contains all settings sub-pages

**Main app routes** (`/*`):
- Wrapped in `ProtectedRoute` + `Layout`
- Has the module navigation sidebar
- Contains all main feature pages

### `App` (default export)

The outermost component — wraps everything in the three context providers.

```jsx
export default function App() {
    return (
        <GlobalSettingsProvider>
            <BrandingProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrandingProvider>
        </GlobalSettingsProvider>
    );
}
```

## Route table

| URL | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Login screen (public) |
| `/settings` | → `/settings/modules` | Redirects to module selection |
| `/settings/modules` | `ModuleSelectionPage` | Toggle app modules on/off |
| `/settings/material-types` | `MaterialTypesPage` | List material type categories |
| `/settings/material-types/:id` | `MaterialTypeDetailPage` | View/edit single material type |
| `/settings/materials` | `MaterialSettingsPage` | Material settings |
| `/settings/products` | `ProductSettingsPage` | Product settings |
| `/settings/orders` | `OrderSettingsPage` | Order settings |
| `/settings/customers` | `CustomerSettingsPage` | Customer settings |
| `/settings/year-in-review` | `YearInReviewSettingsPage` | Year in review settings |
| `/settings/language-region` | `LanguageRegionPage` | Language & currency settings |
| `/` | `DashboardPage` | Home dashboard |
| `/materials` | `MaterialsPage` | Materials list |
| `/materials/:id` | `MaterialDetailPage` | Single material detail |
| `/products` | `ProductsPage` | Products list |
| `/products/:id` | `ProductDetailPage` | Single product detail |
| `/orders` | `OrdersPage` | Orders list |
| `/orders/:id` | `OrderDetailPage` | Single order detail |
| `/customers` | `CustomersPage` | Customers list |
| `/customers/:id` | `CustomerDetailPage` | Single customer detail |
| `/year-review` | `YearReviewPage` | Year in review analytics |
| `/profile` | `ProfilePage` | User profile |
| anything else | `NotFoundPage` | 404 page |

## Relationship to other files

- Rendered by `main.jsx`
- Imports all page components from `pages/`
- Imports layout components: `Layout.jsx`, `SettingsLayout.jsx`
- Uses auth from `AuthContext.jsx`, branding from `BrandingContext.jsx`, settings from `GlobalSettingsContext.jsx`
