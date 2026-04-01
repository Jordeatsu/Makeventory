[🏠 Documentation Home](../README.md)

---

# Install Wizard Documentation

A standalone one-time setup app that runs on port 3000 before the main application is initialised. Guides the administrator through configuring locale, dependencies, database, account, business details, and modules.

After a successful install this wizard self-disables.

---

## Entry & Core Files

| File | Purpose |
|---|---|
| [server.js](server.md) | Express server for the installer — serves the wizard UI and exposes install API endpoints |
| [src/main.jsx](main.md) | Vite entry — mounts wizard React app |
| [src/App.jsx](App.md) | Root wizard component — step controller and progress state |
| [src/api.js](api.md) | Axios instance scoped to the install server |

---

## Wizard Steps

Steps are rendered in order by `App.jsx`. Each step collects data and advances to the next on success.

| Step | File | What it collects |
|---|---|---|
| 1 | [LocaleStep.jsx](components/LocaleStep.md) | Language and region/currency preferences |
| 2 | [DependenciesStep.jsx](components/DependenciesStep.md) | Runs dependency checks and installs |
| 3 | [DatabaseStep.jsx](components/DatabaseStep.md) | MongoDB connection string + database name |
| 4 | [AccountStep.jsx](components/AccountStep.md) | First admin account (username + password) |
| 5 | [BusinessStep.jsx](components/BusinessStep.md) | Business name, logo, and social links |
| 6 | [ModuleStep.jsx](components/ModuleStep.md) | Feature module selection |
| 7 | [ThankYouStep.jsx](components/ThankYouStep.md) | Success screen — redirects to main app |

---

## Services

| File | Purpose |
|---|---|
| [services/theme.js](services/theme.md) | MUI theme for the installer UI (standalone, separate from main app theme) |
