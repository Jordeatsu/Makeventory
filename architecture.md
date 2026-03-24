# Makeventory — Architecture Overview

Makeventory is a self-hosted inventory, order, product, and customer management system for small businesses. It is a monorepo containing three distinct applications: the main app (server + client), and a one-time web-based installer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| API server | Express 5 |
| Database | MongoDB via Mongoose |
| Frontend | React 18, Vite, Material UI v5 |
| Routing (client) | React Router v6 |
| i18n | react-i18next (en/fr/es) |
| Auth | JWT stored in HttpOnly cookies |
| Logging | pino |
| Security | helmet, scrypt password hashing, timing-safe comparisons |

---

## Repository Layout

```
Makeventory/
├── install.sh              # Cross-platform install entry point (bash)
├── architecture.md         # This file
├── package.json            # Root-level scripts (start/stop/restart wrappers)
│
├── install/                # One-time web installer (separate Vite app)
│   ├── server.js           # Installer Express server (port 3000) + SSE npm-progress stream
│   ├── src/
│   │   ├── main.jsx        # React entry point
│   │   ├── App.jsx         # 7-step wizard (Locale → Deps → DB → Account → Business → Modules → ThankYou)
│   │   ├── api.js          # Axios helpers for all installer API calls
│   │   ├── components/
│   │   │   ├── LocaleStep.jsx        # Step 1 — language + currency selection
│   │   │   ├── DependenciesStep.jsx  # Step 2 — live npm install via SSE
│   │   │   ├── DatabaseStep.jsx      # Step 3 — MongoDB connect + DB create
│   │   │   ├── AccountStep.jsx       # Step 4 — admin user creation
│   │   │   ├── BusinessStep.jsx      # Step 5 — business name, logo, social URLs
│   │   │   ├── ModuleStep.jsx        # Step 6 — enable/disable modules + completeInstall
│   │   │   └── ThankYouStep.jsx      # Step 7 — completion screen
│   │   └── services/
│   │       └── theme.js              # MUI theme for the installer UI
│   └── vite.config.js
│
├── server/                 # API server (Node/Express, ESM)
│   ├── server.js           # Entry point — middleware, DB connect, route mount
│   ├── .env                # Runtime secrets (git-ignored)
│   ├── .env.example        # Template for .env
│   ├── routes/
│   │   ├── index.js        # Mounts all route files under /api
│   │   ├── auth.js         # POST /login, POST /logout, GET /me
│   │   ├── users.js        # User CRUD (admin-only for write ops)
│   │   ├── materials.js    # Material CRUD + stock management
│   │   ├── materialTypes.js # Material type CRUD
│   │   ├── products.js     # Product CRUD + /stats endpoint
│   │   ├── orders.js       # Order CRUD + auto-customer upsert
│   │   ├── customers.js    # Customer CRUD
│   │   ├── settings.js     # GlobalSettings + BusinessInfo read/write
│   │   ├── modules.js      # Feature module enable/disable
│   │   ├── yearReview.js   # Year-in-review aggregation endpoint
│   │   └── system.js       # /update-check, /apply-update, /restart
│   ├── middleware/
│   │   └── authMiddleware.js  # requireAuth, requireAdmin JWT verifiers
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Material.js
│   │   ├── MaterialType.js
│   │   ├── MaterialSettings.js
│   │   ├── Product.js
│   │   ├── ProductSettings.js
│   │   ├── Order.js
│   │   ├── OrderSettings.js
│   │   ├── Customer.js
│   │   ├── CustomerSettings.js
│   │   ├── GlobalSettings.js
│   │   ├── BusinessInfo.js
│   │   ├── Module.js
│   │   ├── Overhead.js
│   │   └── YearInReviewSettings.js
│   └── lib/
│       └── helpers.js      # Shared utilities: hashPassword, verifyPassword,
│                           #   cookieOpts, isValidId, escapeRegex, userLabel
│
├── client/                 # React SPA (Vite build)
│   ├── index.html
│   ├── vite.config.js      # Proxies /api → localhost:5001 in dev
│   ├── src/
│   │   ├── main.jsx        # React root — wraps app in Router + providers
│   │   ├── App.jsx         # Route tree + ProtectedRoute wrapper
│   │   ├── api.js          # Axios instance (baseURL /api, withCredentials)
│   │   ├── theme.js        # MUI theme customisation
│   │   ├── i18n.js         # i18next init, language detection
│   │   ├── version.js      # APP_VERSION constant (used by AppFooter + update check)
│   │   ├── locales/        # Translation files
│   │   │   ├── en/translation.json
│   │   │   ├── fr/translation.json
│   │   │   └── es/translation.json
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # currentUser, login, logout
│   │   │   ├── GlobalSettingsContext.jsx # currency, language, loaded from API
│   │   │   └── BrandingContext.jsx      # business name/logo from API
│   │   ├── hooks/
│   │   │   ├── useToast.js             # Shared toast notification state
│   │   │   ├── useModules.jsx          # Reads enabled feature modules
│   │   │   └── useCustomerSettings.js  # Fetches customer settings (label, defaults)
│   │   ├── utils/
│   │   │   └── formatting.js # CURRENCY_SYMBOLS, useCurrencyFormatter,
│   │   │                     #   fmtDate, fmtDateLong, fmtDateTime, TABLE_HEAD_SX
│   │   ├── components/
│   │   │   ├── Layout.jsx        # App shell: sidebar nav + top bar
│   │   │   ├── SettingsLayout.jsx # Settings-specific sidebar layout
│   │   │   ├── AppFooter.jsx     # Version footer
│   │   │   ├── AppUpdateBanner.jsx # Polls /api/system/update-check; shows update banner
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── common/           # Reusable presentational components
│   │   │   │   ├── StatCard.jsx      # KPI card (with optional icon)
│   │   │   │   ├── DetailRow.jsx     # DetailRow (stacked) + InfoRow (side-by-side)
│   │   │   │   ├── RecordInfo.jsx    # Created/Updated audit panel
│   │   │   │   ├── CountrySelect.jsx # Country drop-down (MUI Select + flag emoji)
│   │   │   │   └── ToastSnackbar.jsx # Standard MUI Snackbar+Alert wrapper
│   │   │   └── modals/
│   │   │       ├── MaterialFormModal.jsx
│   │   │       ├── MaterialTypeModal.jsx
│   │   │       ├── MaterialSettingsModal.jsx
│   │   │       ├── ProductFormModal.jsx
│   │   │       ├── ProductSettingsModal.jsx
│   │   │       ├── OrderFormModal.jsx
│   │   │       ├── OrderSettingsModal.jsx
│   │   │       ├── CustomerFormModal.jsx
│   │   │       ├── YearInReviewSettingsModal.jsx
│   │   │       ├── LanguageRegionModal.jsx
│   │   │       └── DeleteBlockedModal.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── MaterialsPage.jsx
│   │       ├── MaterialDetailPage.jsx
│   │       ├── ProductsPage.jsx
│   │       ├── ProductDetailPage.jsx
│   │       ├── OrdersPage.jsx
│   │       ├── OrderDetailPage.jsx
│   │       ├── CustomersPage.jsx
│   │       ├── CustomerDetailPage.jsx
│   │       ├── YearReviewPage.jsx
│   │       ├── ProfilePage.jsx
│   │       ├── SettingsPage.jsx
│   │       ├── NotFoundPage.jsx
│   │       └── settings/
│   │           ├── ModuleSelectionPage.jsx
│   │           ├── MaterialTypesPage.jsx
│   │           ├── MaterialTypeDetailPage.jsx
│   │           ├── MaterialSettingsPage.jsx
│   │           ├── ProductSettingsPage.jsx
│   │           ├── OrderSettingsPage.jsx
│   │           ├── CustomerSettingsPage.jsx
│   │           ├── YearInReviewSettingsPage.jsx
│   │           └── LanguageRegionPage.jsx
│   └── dist/               # Vite production build output (git-ignored)
│
├── systemfiles/
│   ├── start.sh            # Starts server (npm install --prefer-offline, vite build, node)
│   ├── stop.sh             # Kills server and client processes by PID
│   ├── restart.sh          # stop + start
│   └── dev/                # Development-mode equivalents (vite dev server)
│
├── documentation/          # Developer documentation (one .md per source file)
│   ├── server/
│   ├── client/
│   ├── install/
│   └── systemfiles/
│
└── logs/
    ├── server.log / server.pid
    ├── client.log / client.pid
    └── update.log
```

---

## Install Process

The installer is a standalone one-shot wizard that runs before the main app exists.

```
user runs install.sh
    ↓
install.sh checks for Node.js
    ↓
cd install/ && npm install && vite build (produces install/dist/)
    ↓
node install/server.js  (port 3000, serves install/dist/)
  └─ simultaneously: spawns npm install for client/ and server/ (SSE progress stream)
    ↓
browser opens http://localhost:3000
    ↓
React wizard steps:
  1. LocaleStep        — choose language (en/fr/es) and currency
  2. DependenciesStep  — watches SSE stream; advances when npm install completes
  3. DatabaseStep      — detects Docker/local MongoDB, creates DB + seeds data
  4. AccountStep       — creates first admin user in MongoDB
  5. BusinessStep      — saves business name, logo (base64), and social URLs
  6. ModuleStep        — enables/disables feature modules, calls completeInstall()
  7. ThankYouStep      — confirmation screen
    ↓
Installer seeds MongoDB with:
    GlobalSettings (language, currency)
    User (admin account)
    BusinessInfo (name, logo, social links)
    Module docs (enabled/disabled per selection)
    ↓
install.sh waits for installer server to exit, then runs systemfiles/start.sh
    ↓
Main app runs at http://localhost:3000 (client) + :5001 (API)
```

---

## Server Architecture

```
HTTP request
    ↓
helmet() — security headers
cors()   — CLIENT_ORIGIN whitelist
express.json() + cookieParser()
    ↓
app.use('/api', routes)
    ↓
routes/index.js
  /auth          → routes/auth.js
  /users         → routes/users.js
  /materials     → routes/materials.js
  /material-types → routes/materialTypes.js
  /products      → routes/products.js
  /orders        → routes/orders.js
  /customers     → routes/customers.js
  /settings      → routes/settings.js
  /modules       → routes/modules.js
  /year-review   → routes/yearReview.js
  /system        → routes/system.js
    ↓
middleware/authMiddleware.js  — requireAuth (any logged-in user)
                              — requireAdmin (role === 'admin')
    ↓
Route handler → Mongoose model → MongoDB
```

### Authentication

- Login: `POST /api/auth/login` validates credentials with `verifyPassword` (scrypt, timing-safe). On success sets an HttpOnly cookie containing a signed JWT.
- Every protected route calls `requireAuth` middleware, which reads and verifies the JWT from the cookie.
- Admin-only routes also call `requireAdmin`.
- `GET /api/auth/me` returns the current user from the token, used by `AuthContext` on page load.

### Update System

`GET /api/system/update-check` compares the local `git describe --tags` against the GitHub Releases API (`api.github.com/repos/Jordeatsu/Makeventory/releases/latest`). A newer tag triggers the update banner.

`POST /api/system/apply-update` runs `git fetch`, `git checkout main`, `git reset --hard <tag>` then launches `systemfiles/start.sh` in a detached background process (double-fork via `nohup`) so the server can respond before restarting.

---

## Client Architecture

### Provider hierarchy (`main.jsx`)

```
<BrowserRouter>
  <AuthProvider>          — currentUser, JWT cookie check on mount
    <GlobalSettingsProvider> — currency, language from /api/settings/global
      <BrandingProvider>  — business name/logo from /api/settings/business
        <App />
      </BrandingProvider>
    </GlobalSettingsProvider>
  </AuthProvider>
</BrowserRouter>
```

### Route structure (`App.jsx`)

All routes except `/login` are wrapped in `<ProtectedRoute>`, which redirects unauthenticated users to `/login`.

| Path | Component | Layout |
|---|---|---|
| `/login` | LoginPage | — |
| `/` | → redirect `/dashboard` | Layout |
| `/dashboard` | DashboardPage | Layout |
| `/materials` | MaterialsPage | Layout |
| `/materials/:id` | MaterialDetailPage | Layout |
| `/products` | ProductsPage | Layout |
| `/products/:id` | ProductDetailPage | Layout |
| `/orders` | OrdersPage | Layout |
| `/orders/:id` | OrderDetailPage | Layout |
| `/customers` | CustomersPage | Layout |
| `/customers/:id` | CustomerDetailPage | Layout |
| `/year-review` | YearReviewPage | Layout |
| `/profile` | ProfilePage | Layout |
| `/settings` | SettingsPage | SettingsLayout |
| `/settings/*` | (see below) | SettingsLayout |

Settings sub-routes under `/settings/`:

| Path | Component |
|---|---|
| `modules` | ModuleSelectionPage |
| `materials` | MaterialSettingsPage |
| `material-types` | MaterialTypesPage |
| `material-types/:id` | MaterialTypeDetailPage |
| `products` | ProductSettingsPage |
| `orders` | OrderSettingsPage |
| `customers` | CustomerSettingsPage |
| `year-in-review` | YearInReviewSettingsPage |
| `language` | LanguageRegionPage |

### Shared modules

All pages pull formatting and UI primitives from shared modules rather than defining them locally:

| Module | Exports | Used by |
|---|---|---|
| `utils/formatting.js` | `CURRENCY_SYMBOLS`, `useCurrencyFormatter(settings)`, `fmtDate`, `fmtDateLong`, `fmtDateTime`, `TABLE_HEAD_SX` | All pages that display money or dates |
| `hooks/useToast.js` | `{ toast, showToast, closeToast }` | All pages with CRUD operations |
| `components/common/ToastSnackbar.jsx` | `<ToastSnackbar toast onClose />` | All pages with CRUD operations |
| `components/common/RecordInfo.jsx` | `<RecordInfo createdAt updatedAt createdBy updatedBy />` | MaterialDetailPage, ProductDetailPage, OrderDetailPage |
| `components/common/StatCard.jsx` | `<StatCard icon? label value sub? color? />` | DashboardPage, ProductDetailPage |
| `components/common/DetailRow.jsx` | `DetailRow` (stacked), `InfoRow` (side-by-side row) | MaterialDetailPage, ProductDetailPage, OrderDetailPage |
| `components/common/CountrySelect.jsx` | `<CountrySelect value onChange />` | CustomerFormModal, CustomerDetailPage |
| `hooks/useCustomerSettings.js` | `{ settings, loading }` — fetches customer label config | CustomersPage, CustomerDetailPage, CustomerFormModal |

### Data fetching pattern

Pages use `api.js` (Axios, baseURL `/api`, `withCredentials: true`) directly — no global state manager. Each page fetches its own data in `useEffect`/`useCallback` and holds it in local `useState`. Mutations call `api.put/post/delete` then re-fetch.

---

## Feature Modules

Modules are stored in MongoDB (`Module` collection) and can be toggled per-installation from the Settings → Modules page. The `useModules` hook reads the current list of enabled modules and the `Layout` sidebar renders only the enabled nav items.

Current modules: **Materials**, **Products**, **Orders**, **Customers**, **Year in Review**.

---

## Development vs Production

In development (`NODE_ENV !== 'production'`):
- Vite dev server at `:3000` proxies `/api` → `:5001`
- pino-pretty pretty-prints logs
- Server binds `0.0.0.0`

In production (after `start.sh`):
- `vite build` outputs to `client/dist/` — served as static files or separately
- Server binds `127.0.0.1` (loopback only, intended behind a reverse proxy)
- pino outputs JSON logs

### Start / Stop scripts (`systemfiles/`)

`start.sh` — installs server dependencies (`npm install --prefer-offline`), builds the client (`vite build`), then starts the Express server as a background process. Writes PIDs to `logs/`.

`stop.sh` — reads PIDs and kills the processes.

`restart.sh` — calls `stop.sh` then `start.sh`.
