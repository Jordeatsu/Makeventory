# Makeventory — Documentation

Welcome to the Makeventory developer documentation. Every source file in this project has a corresponding markdown document explaining what it does, how it works, and how it relates to other files. These docs are written for developers who may not be deeply familiar with Node.js, React, or Express.

---

## Quick Links

| Section | What's in it |
|---|---|
| [🖥 Server](#server) | Node.js/Express API, routes, models, middleware |
| [⚛️ Client](#client) | React front-end, pages, components, hooks |
| [🧙 Install Wizard](#install-wizard) | One-time setup wizard (separate app) |
| [⚙️ Systemfiles](#systemfiles) | Start, stop, and restart shell scripts |
| [📄 Root Files](#root-files) | `install.sh`, `package.json` |

---

## Server

The back-end Express API server. Handles authentication, all data operations, and communicates with MongoDB.

→ **[Server Documentation Index](server/README.md)**

### Entry Point
- [server/server.js](server/server.md) — Express app setup, middleware, database connection, route mounting

### Middleware
- [authMiddleware.js](server/middleware/authMiddleware.md) — `requireAuth` and `requireAdmin` JWT verifiers

### Routes
| File | Purpose |
|---|---|
| [routes/index.js](server/routes/index.md) | Mounts all routes under `/api` |
| [routes/auth.js](server/routes/auth.md) | Login, logout, current user |
| [routes/users.js](server/routes/users.md) | User CRUD (admin-only writes) |
| [routes/materials.js](server/routes/materials.md) | Material CRUD + stock management |
| [routes/materialTypes.js](server/routes/materialTypes.md) | Material type CRUD |
| [routes/products.js](server/routes/products.md) | Product CRUD + stats |
| [routes/orders.js](server/routes/orders.md) | Order CRUD + auto customer upsert |
| [routes/customers.js](server/routes/customers.md) | Customer CRUD |
| [routes/settings.js](server/routes/settings.md) | GlobalSettings + BusinessInfo |
| [routes/modules.js](server/routes/modules.md) | Feature module toggle |
| [routes/yearReview.js](server/routes/yearReview.md) | Year-in-review aggregation |
| [routes/system.js](server/routes/system.md) | Update check + apply update + restart |

### Models (MongoDB Schemas)
| File | Purpose |
|---|---|
| [User.js](server/models/User.md) | Admin/staff accounts |
| [Material.js](server/models/Material.md) | Raw materials + stock levels |
| [MaterialType.js](server/models/MaterialType.md) | Material categories |
| [MaterialSettings.js](server/models/MaterialSettings.md) | Material display settings |
| [Product.js](server/models/Product.md) | Products built from materials |
| [Order.js](server/models/Order.md) | Customer orders |
| [Customer.js](server/models/Customer.md) | Customer records |
| [CustomerSettings.js](server/models/CustomerSettings.md) | Customer label/field settings |
| [GlobalSettings.js](server/models/GlobalSettings.md) | Language, currency, system-wide config |
| [BusinessInfo.js](server/models/BusinessInfo.md) | Business name, logo, social links |
| [Module.js](server/models/Module.md) | Feature module enable/disable flags |
| [Overhead.js](server/models/Overhead.md) | Overhead cost records |
| [OrderSettings, ProductSettings, YearInReviewSettings](server/models/SettingsPlaceholders.md) | Per-feature settings schemas |

### Utilities
- [lib/helpers.js](server/lib/helpers.md) — `hashPassword`, `verifyPassword`, `cookieOpts`, `isValidId`, `escapeRegex`, `userLabel`

---

## Client

The React single-page application. Built with Vite and Material UI.

→ **[Client Documentation Index](client/README.md)**

### Core
| File | Purpose |
|---|---|
| [main.jsx](client/main.md) | React entry point |
| [App.jsx](client/App.md) | Route tree + ProtectedRoute |
| [api.js](client/api.md) | Axios instance with all API functions |
| [theme.js](client/theme.md) | MUI colour theme |
| [i18n.js](client/i18n.md) | Internationalisation setup (en/fr/es) |
| [version.js](client/version.md) | App version constant |

### Contexts (Global State)
| File | Purpose |
|---|---|
| [AuthContext.jsx](client/context/AuthContext.md) | Current user, login, logout |
| [GlobalSettingsContext.jsx](client/context/GlobalSettingsContext.md) | Currency, language |
| [BrandingContext.jsx](client/context/BrandingContext.md) | Business name and logo |

### Hooks (Reusable Logic)
| File | Purpose |
|---|---|
| [useToast.js](client/hooks/useToast.md) | Toast notification state |
| [useModules.jsx](client/hooks/useModules.md) | Reads enabled feature modules |
| [useCustomerSettings.js](client/hooks/useCustomerSettings.md) | Customer label/field settings |

### Utilities
- [utils/formatting.js](client/utils/formatting.md) — Currency formatter, date helpers, table head style

### Layout Components
| File | Purpose |
|---|---|
| [Layout.jsx](client/components/Layout.md) | App shell: sidebar + top bar |
| [SettingsLayout.jsx](client/components/SettingsLayout.md) | Settings-specific sidebar |
| [AppFooter.jsx](client/components/AppFooter.md) | Version footer |
| [AppUpdateBanner.jsx](client/components/AppUpdateBanner.md) | Update notification banner |
| [ErrorBoundary.jsx](client/components/ErrorBoundary.md) | Catches React render errors |

### Common Components
| File | Purpose |
|---|---|
| [StatCard.jsx](client/components/common/StatCard.md) | KPI metric card |
| [DetailRow.jsx](client/components/common/DetailRow.md) | Labelled detail row + side-by-side info row |
| [RecordInfo.jsx](client/components/common/RecordInfo.md) | Created/Updated audit panel |
| [CountrySelect.jsx](client/components/common/CountrySelect.md) | Country drop-down |
| [ToastSnackbar.jsx](client/components/common/ToastSnackbar.md) | Toast notification display |

### Modals
| File | Purpose |
|---|---|
| [MaterialFormModal.jsx](client/components/modals/MaterialFormModal.md) | Add/edit material |
| [MaterialTypeModal.jsx](client/components/modals/MaterialTypeModal.md) | Add/edit material type |
| [MaterialSettingsModal.jsx](client/components/modals/MaterialSettingsModal.md) | Material settings form |
| [ProductFormModal.jsx](client/components/modals/ProductFormModal.md) | Add/edit product |
| [ProductSettingsModal.jsx](client/components/modals/ProductSettingsModal.md) | Product settings form |
| [OrderFormModal.jsx](client/components/modals/OrderFormModal.md) | Add/edit order |
| [OrderSettingsModal.jsx](client/components/modals/OrderSettingsModal.md) | Order settings form |
| [CustomerFormModal.jsx](client/components/modals/CustomerFormModal.md) | Add/edit customer |
| [YearInReviewSettingsModal.jsx](client/components/modals/YearInReviewSettingsModal.md) | Year-in-review settings |
| [LanguageRegionModal.jsx](client/components/modals/LanguageRegionModal.md) | Language + currency picker |
| [DeleteBlockedModal.jsx](client/components/modals/DeleteBlockedModal.md) | Deletion blocked warning |

### Pages
| File | Purpose |
|---|---|
| [LoginPage.jsx](client/pages/LoginPage.md) | Login screen |
| [DashboardPage.jsx](client/pages/DashboardPage.md) | Overview with KPI stats + charts |
| [MaterialsPage.jsx](client/pages/MaterialsPage.md) | Materials list |
| [MaterialDetailPage.jsx](client/pages/MaterialDetailPage.md) | Material detail + stock management |
| [ProductsPage.jsx](client/pages/ProductsPage.md) | Products list |
| [ProductDetailPage.jsx](client/pages/ProductDetailPage.md) | Product detail + cost breakdown |
| [OrdersPage.jsx](client/pages/OrdersPage.md) | Orders list |
| [OrderDetailPage.jsx](client/pages/OrderDetailPage.md) | Order detail + material consumption |
| [CustomersPage.jsx](client/pages/CustomersPage.md) | Customers list |
| [CustomerDetailPage.jsx](client/pages/CustomerDetailPage.md) | Customer detail + order history |
| [YearReviewPage.jsx](client/pages/YearReviewPage.md) | Year-in-review charts |
| [ProfilePage.jsx](client/pages/ProfilePage.md) | User profile + password change |
| [SettingsPage.jsx](client/pages/SettingsPage.md) | Settings hub page |
| [NotFoundPage.jsx](client/pages/NotFoundPage.md) | 404 page |

### Settings Pages
| File | Purpose |
|---|---|
| [ModuleSelectionPage.jsx](client/pages/settings/ModuleSelectionPage.md) | Enable/disable feature modules |
| [MaterialTypesPage.jsx](client/pages/settings/MaterialTypesPage.md) | Manage material type list |
| [MaterialTypeDetailPage.jsx](client/pages/settings/MaterialTypeDetailPage.md) | Edit individual material type |
| [MaterialSettingsPage.jsx](client/pages/settings/MaterialSettingsPage.md) | Material display settings |
| [ProductSettingsPage.jsx](client/pages/settings/ProductSettingsPage.md) | Product display settings |
| [OrderSettingsPage.jsx](client/pages/settings/OrderSettingsPage.md) | Order display settings |
| [CustomerSettingsPage.jsx](client/pages/settings/CustomerSettingsPage.md) | Customer label settings |
| [YearInReviewSettingsPage.jsx](client/pages/settings/YearInReviewSettingsPage.md) | Year-in-review settings |
| [LanguageRegionPage.jsx](client/pages/settings/LanguageRegionPage.md) | Language and currency settings |

---

## Install Wizard

A separate, one-time-use React + Express app that guides you through initial setup. Runs on port 3000, then shuts down after installation is complete.

→ **[Install Documentation Index](install/README.md)**

| File | Purpose |
|---|---|
| [server.js](install/server.md) | Express server + SSE npm-install progress stream |
| [App.jsx](install/App.md) | 7-step wizard coordinator |
| [api.js](install/api.md) | All installer API functions |
| [main.jsx](install/main.md) | React entry point |

### Wizard Steps
| File | Step | Purpose |
|---|---|---|
| [LocaleStep.jsx](install/components/LocaleStep.md) | 1 | Language + currency selection |
| [DependenciesStep.jsx](install/components/DependenciesStep.md) | 2 | Live npm install progress |
| [DatabaseStep.jsx](install/components/DatabaseStep.md) | 3 | MongoDB connect + database creation |
| [AccountStep.jsx](install/components/AccountStep.md) | 4 | Admin account creation |
| [BusinessStep.jsx](install/components/BusinessStep.md) | 5 | Business profile + logo upload |
| [ModuleStep.jsx](install/components/ModuleStep.md) | 6 | Feature module selection |
| [ThankYouStep.jsx](install/components/ThankYouStep.md) | 7 | Completion screen |

### Services
- [services/theme.js](install/services/theme.md) — MUI theme for the installer UI

---

## Systemfiles

Shell scripts for starting, stopping, and restarting the application. Two sets: **production** and **development**.

→ **[Systemfiles Documentation Index](systemfiles/README.md)**

### Production
| File | Purpose |
|---|---|
| [start.sh](systemfiles/start-sh.md) | Build + start all services |
| [stop.sh](systemfiles/stop-sh.md) | Gracefully stop all services |
| [restart.sh](systemfiles/restart-sh.md) | Stop then start |

### Development
| File | Purpose |
|---|---|
| [dev/start.sh](systemfiles/dev/start-sh.md) | Start with Vite HMR + nodemon |
| [dev/stop.sh](systemfiles/dev/stop-sh.md) | Stop dev services |
| [dev/restart.sh](systemfiles/dev/restart-sh.md) | Stop then start (dev) |

---

## Root Files

| File | Purpose |
|---|---|
| [install.sh](install-sh.md) | The main installer entry point — run this first |
| [package.json](package-json.md) | Root-level npm scripts for development |

---

## Architecture

For a high-level overview of how all the pieces fit together, see [architecture.md](../architecture.md) in the root of the repository.
