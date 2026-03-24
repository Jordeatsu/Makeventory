[🏠 Home](../README.md) · [↑ Install Wizard](README.md)

---

# install/src/api.js

## What does this file do?

This file provides all the **API functions used by the install wizard** to communicate with the install server (`install/server.js`). Each function sends an HTTP request to the server and returns the response.

Think of this file as a "telephone directory" — it lists every operation the wizard can perform on the server, named clearly so components don't have to know the exact URL or HTTP method. Components just call a function like `createDatabase("mydb")` instead of manually constructing a network request.

---

## Key Concepts

### Axios
Axios is a popular JavaScript library for making HTTP requests (fetching data from servers). It works similarly to the browser's built-in `fetch`, but with a cleaner API and automatic JSON handling.

### Base URL
All requests go to `/api` — a path on the same server (the install server running on port 3000). No external internet connection is needed; all communication is between your browser and the install server on your local machine.

### Named Exports
Each function is exported by name, which means components can import just what they need:
```js
import { createDatabase, createAccount } from "../api";
```

---

## The Axios Instance

```js
const api = axios.create({ baseURL: "/api" });
```

This creates a pre-configured Axios instance. Every function in this file uses `api` instead of raw `axios`, so they all automatically go to `/api` without repeating the base URL.

---

## Exported Functions

### Status & Connectivity

#### `ping()`
- **Purpose:** Checks whether the install server is reachable.
- **HTTP:** `GET /api/ping`
- **Used by:** App startup check.

#### `getStatus()`
- **Purpose:** Retrieves the current install status (whether installation has already been completed).
- **HTTP:** `GET /api/status`
- **Used by:** `App.jsx` on startup to skip the wizard if already installed.

---

### MongoDB / Docker Checks

These functions check whether the database is available before attempting to create it.

#### `checkMongoDB()`
- **Purpose:** Tests if MongoDB is reachable at `localhost:27017`.
- **HTTP:** `GET /api/check-mongo`

#### `checkDocker()`
- **Purpose:** Tests if Docker is installed and running.
- **HTTP:** `GET /api/check-docker`

#### `checkDockerContainer()`
- **Purpose:** Checks if the Makeventory MongoDB Docker container already exists.
- **HTTP:** `GET /api/check-docker-container`

#### `createDockerContainer()`
- **Purpose:** Creates the MongoDB Docker container.
- **HTTP:** `POST /api/create-docker-container`

#### `startDockerContainer()`
- **Purpose:** Starts the MongoDB Docker container (if it already exists but isn't running).
- **HTTP:** `POST /api/start-docker-container`

#### `ensureMongoRunning()`
- **Purpose:** Convenience function that checks MongoDB and starts it via Docker if necessary.
- **HTTP:** `POST /api/ensure-mongo`

---

### Database

#### `createDatabase(dbName)`
- **Purpose:** Creates a new MongoDB database with the given name and seeds it with the necessary initial data.
- **HTTP:** `POST /api/create-database`
- **Parameters:** `dbName` — the name for the database (e.g., `"makeventory"`)
- **Used by:** `DatabaseStep.jsx`

---

### User Account

#### `createAccount(data)`
- **Purpose:** Creates the admin user account.
- **HTTP:** `POST /api/create-account`
- **Parameters:** `data` — object containing `{ firstName, lastName, email, username, password }`
- **Used by:** `AccountStep.jsx`

#### `updateAccount(data)`
- **Purpose:** Updates the admin user account (used when the user goes back and edits their account details).
- **HTTP:** `PUT /api/update-account`
- **Parameters:** `data` — same shape as `createAccount`
- **Used by:** `AccountStep.jsx` (in "update" mode)

---

### Business Profile

#### `createBusiness(data)`
- **Purpose:** Saves the business profile (name, logo, website, social media links).
- **HTTP:** `POST /api/create-business`
- **Parameters:** `data` — object containing `{ businessName, logoBase64?, logoMime?, website?, twitter?, instagram?, tiktok?, facebook? }`
- **Used by:** `BusinessStep.jsx`

---

### Modules

#### `getModules()`
- **Purpose:** Retrieves the list of available modules and their current enabled/disabled status.
- **HTTP:** `GET /api/modules`
- **Used by:** `ModuleStep.jsx` to populate the toggle list.

#### `saveModules(modules)`
- **Purpose:** Saves the user's module selection.
- **HTTP:** `POST /api/modules`
- **Parameters:** `modules` — array of objects: `[{ _id, isActive }, ...]`
- **Used by:** `ModuleStep.jsx` on "Save & Finish"

---

### Completion

#### `completeInstall()`
- **Purpose:** Marks the installation as finished. The main application uses this flag to know setup is done.
- **HTTP:** `POST /api/complete`
- **Used by:** `ModuleStep.jsx` — called after saving modules, just before the wizard advances to the Thank You screen.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/server.js` | The server that receives all these API calls |
| `install/src/components/DependenciesStep.jsx` | Uses `/api/npm-progress` (SSE, not via this file) |
| `install/src/components/DatabaseStep.jsx` | Calls `checkMongoDB`, `checkDocker`, `createDatabase`, etc. |
| `install/src/components/AccountStep.jsx` | Calls `createAccount`, `updateAccount` |
| `install/src/components/BusinessStep.jsx` | Calls `createBusiness` |
| `install/src/components/ModuleStep.jsx` | Calls `getModules`, `saveModules`, `completeInstall` |
| `install/src/App.jsx` | Calls `getStatus` on startup |
