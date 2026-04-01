[🏠 Documentation Home](../README.md)

---

# Client Documentation

The React front-end (Vite). Handles all UI, routing, and API communication through Material UI components.

---

## Entry & Core Files

| File | Purpose |
|---|---|
| [main.jsx](main.md) | Vite entry — mounts React app into DOM |
| [App.jsx](App.md) | Root component — providers, router, protected route wrapper |
| [api.js](api.md) | Axios instance — base URL, credentials, auto 401 redirect |
| [theme.js](theme.md) | MUI theme — fonts, palette, and typography |
| [i18n.js](i18n.md) | i18next setup for all translations |
| [version.js](version.md) | App version constant |

---

## Context Providers

Global state exposed via React Context. Wrap the whole app via `App.jsx`.

| File | What it provides |
|---|---|
| [AuthContext](context/AuthContext.md) | Current user object, login/logout, `useAuth()` hook |
| [BrandingContext](context/BrandingContext.md) | Business name, logo, favicon, `useBranding()` hook |
| [GlobalSettingsContext](context/GlobalSettingsContext.md) | Language, currency, locale prefs, `useGlobalSettings()` hook |

---

## Hooks

Custom React hooks.

| File | What it does |
|---|---|
| [useToast](hooks/useToast.md) | MUI Snackbar toast helper |
| [useModules](hooks/useModules.md) | Reads enabled feature modules from backend |
| [useCustomerSettings](hooks/useCustomerSettings.md) | Reads customer label/field config from backend |

---

## Utilities

| File | What it does |
|---|---|
| [utils/formatting.js](utils/formatting.md) | Currency, date, number formatters |

---

## Components

### Layout Components

| File | What it does |
|---|---|
| [Layout.jsx](components/Layout.md) | Root page shell — navbar, sidebar, outlet |
| [SettingsLayout.jsx](components/SettingsLayout.md) | Settings section shell — sidebar nav |
| [AppFooter.jsx](components/AppFooter.md) | Footer bar shown at bottom of every page |
| [AppUpdateBanner.jsx](components/AppUpdateBanner.md) | Sticky banner shown when an update is available |
| [ErrorBoundary.jsx](components/ErrorBoundary.md) | Catches render errors and shows fallback UI |

### Common / Reusable UI

| File | What it does |
|---|---|
| [common/StatCard.jsx](components/common/StatCard.md) | Dashboard stat tile |
| [common/ToastSnackbar.jsx](components/common/ToastSnackbar.md) | Global toast notification renderer |
| [common/DetailRow.jsx](components/common/DetailRow.md) | Label + value row pair used in detail views |
| [common/RecordInfo.jsx](components/common/RecordInfo.md) | Created/updated meta rows for any record |
| [common/CountrySelect.jsx](components/common/CountrySelect.md) | Country picker dropdown |

### Modals

All form and action modals.

| File | What it does |
|---|---|
| [modals/CustomerFormModal.jsx](components/modals/CustomerFormModal.md) | Add/edit customer |
| [modals/DeleteBlockedModal.jsx](components/modals/DeleteBlockedModal.md) | Blocked delete error dialog |
| [modals/LanguageRegionModal.jsx](components/modals/LanguageRegionModal.md) | Language & region picker modal |
| [modals/MaterialFormModal.jsx](components/modals/MaterialFormModal.md) | Add/edit material |
| [modals/MaterialSettingsModal.jsx](components/modals/MaterialSettingsModal.md) | Edit material display config |
| [modals/MaterialTypeModal.jsx](components/modals/MaterialTypeModal.md) | Add/edit material type |
| [modals/OrderFormModal.jsx](components/modals/OrderFormModal.md) | Add/edit order |
| [modals/OrderSettingsModal.jsx](components/modals/OrderSettingsModal.md) | Edit order settings |
| [modals/ProductFormModal.jsx](components/modals/ProductFormModal.md) | Add/edit product |
| [modals/ProductSettingsModal.jsx](components/modals/ProductSettingsModal.md) | Edit product settings |
| [modals/YearInReviewSettingsModal.jsx](components/modals/YearInReviewSettingsModal.md) | Edit year-in-review config |

---

## Pages

### Main Pages

| File | Route | What it does |
|---|---|---|
| [LoginPage.jsx](pages/LoginPage.md) | `/login` | Login form |
| [DashboardPage.jsx](pages/DashboardPage.md) | `/` | Overview stats |
| [OrdersPage.jsx](pages/OrdersPage.md) | `/orders` | Orders list + search |
| [OrderDetailPage.jsx](pages/OrderDetailPage.md) | `/orders/:id` | Single order detail |
| [MaterialsPage.jsx](pages/MaterialsPage.md) | `/materials` | Materials list + search |
| [MaterialDetailPage.jsx](pages/MaterialDetailPage.md) | `/materials/:id` | Single material detail |
| [ProductsPage.jsx](pages/ProductsPage.md) | `/products` | Products list |
| [ProductDetailPage.jsx](pages/ProductDetailPage.md) | `/products/:id` | Single product detail |
| [CustomersPage.jsx](pages/CustomersPage.md) | `/customers` | Customers list |
| [CustomerDetailPage.jsx](pages/CustomerDetailPage.md) | `/customers/:id` | Single customer detail |
| [YearReviewPage.jsx](pages/YearReviewPage.md) | `/year-review` | Year-in-review analytics |
| [ProfilePage.jsx](pages/ProfilePage.md) | `/profile` | Current user profile |
| [SettingsPage.jsx](pages/SettingsPage.md) | `/settings` | Settings hub |
| [NotFoundPage.jsx](pages/NotFoundPage.md) | `*` | 404 fallback |

### Settings Sub-Pages

Accessed via `/settings/*`. All require admin role.

| File | Route | What it does |
|---|---|---|
| [LanguageRegionPage.jsx](pages/settings/LanguageRegionPage.md) | `/settings/language-region` | Language & currency config |
| [MaterialSettingsPage.jsx](pages/settings/MaterialSettingsPage.md) | `/settings/materials` | Material display settings |
| [CustomerSettingsPage.jsx](pages/settings/CustomerSettingsPage.md) | `/settings/customers` | Customer label config |
| [MaterialTypesPage.jsx](pages/settings/MaterialTypesPage.md) | `/settings/material-types` | Material types list |
| [MaterialTypeDetailPage.jsx](pages/settings/MaterialTypeDetailPage.md) | `/settings/material-types/:id` | Material type detail |
| [ModuleSelectionPage.jsx](pages/settings/ModuleSelectionPage.md) | `/settings/modules` | Feature module toggles |
| [OrderSettingsPage.jsx](pages/settings/OrderSettingsPage.md) | `/settings/orders` | Order settings |
| [ProductSettingsPage.jsx](pages/settings/ProductSettingsPage.md) | `/settings/products` | Product settings |
| [YearInReviewSettingsPage.jsx](pages/settings/YearInReviewSettingsPage.md) | `/settings/year-in-review` | Year-in-review config |
