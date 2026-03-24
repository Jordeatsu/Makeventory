[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/DatabaseStep.jsx

## What does this file do?

This is **Step 3 of the install wizard** — Database Setup. It guides the user through connecting Makeventory to a MongoDB database and creating the database with all the necessary initial data ("seeding").

The step is semi-automatic: it first checks whether MongoDB is available (via Docker or a local install), then asks the user for a database name, and finally creates the database.

---

## Key Concepts

### MongoDB
MongoDB is the database used by Makeventory to store all its data (orders, materials, customers, etc.). Before the app can run, it needs a MongoDB instance with a database created and populated with some starting data.

### Docker
Docker is a tool that lets you run software in isolated containers. Makeventory supports running MongoDB inside a Docker container so you don't need to install MongoDB directly on your machine.

### Database Seeding
"Seeding" means populating a new database with default data — in this case, things like the default settings, modules list, and other records the app needs to function from day one.

### Log Lines
The step displays a running log of what's happening (checking MongoDB, creating the database, etc.) using a `LogLine` sub-component, similar to what you'd see in a terminal window.

---

## Sub-Component: `LogLine`

Renders a single line in the log display. Each line shows:
- An icon on the left (spinner for in-progress, check/cross for done/error, info for informational)
- The message text

### Props

| Prop | Type | Description |
|---|---|---|
| `msg` | string | The text to display |
| `type` | string | `"running"`, `"ok"`, `"error"`, or `"info"` — controls the icon and colour |

---

## The Four Phases

The step moves through a sequence of phases:

### Phase 1: `"running"`
Automatically starts when the step mounts. The component:
1. Checks if MongoDB is directly reachable at `localhost:27017`
2. If not, checks if Docker is installed
3. If Docker is available, checks for or creates/starts the MongoDB container
4. Logs each check with a status message

A `hasRun` ref prevents this sequence from running twice if the user navigates back to the step.

### Phase 2: `"enter_db_name"`
MongoDB is confirmed running. The user is shown a text field to enter their desired database name (e.g., `makeventory`).

### Phase 3: `"creating"`
The user clicked "Create Database". The component calls `createDatabase(dbName)` from `api.js`. A spinner is shown while this runs.

### Phase 4: `"locked"`
The database was created successfully. A success message is shown. After a short delay, `onComplete(dbName)` is called, advancing the wizard to Step 4.

---

## State Variables

| Variable | Type | Description |
|---|---|---|
| `phase` | string | Current phase: `"running"` / `"enter_db_name"` / `"creating"` / `"locked"` |
| `logs` | array | Array of `{ msg, type }` objects forming the log display |
| `dbName` | string | The database name entered by the user |
| `dbError` | string | Validation error for the database name field |

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `savedDbName` | string | No | Pre-fills the database name if the user revisits this step |
| `onSave` | function | No | Called with the `dbName` when the database is created, so `App.jsx` can save it |
| `onComplete` | function | Yes | Called with the `dbName` after successful database creation |

---

## The `hasRun` Ref

```js
const hasRun = useRef(false);
```

When the `useEffect` fires, it immediately sets `hasRun.current = true`. This means even if the component re-renders (which would normally re-run effects in certain circumstances), the MongoDB check sequence won't repeat. This is important because the database connection checks involve real network operations that shouldn't run twice.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 3; receives `savedDbName` from `App.jsx` |
| `install/src/api.js` | Calls `checkMongoDB`, `checkDocker`, `checkDockerContainer`, `createDockerContainer`, `startDockerContainer`, `ensureMongoRunning`, `createDatabase` |
| `install/server.js` | Processes all these API calls server-side |
