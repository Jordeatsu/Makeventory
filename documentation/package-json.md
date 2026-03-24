[🏠 Home](README.md)

---

# package.json (root)

## What does this file do?

This is the **root-level package.json** for the Makeventory monorepo. It defines some convenience scripts that let you work with both the client and server simultaneously from the project root — useful primarily during development.

---

## Key Concepts

### Monorepo
A "monorepo" (monolithic repository) is a code repository that contains multiple distinct applications in one place. Makeventory has three sub-applications:
- `server/` — the Node.js API
- `client/` — the React front end
- `install/` — the one-time setup wizard

Each has its own `package.json` with its own `node_modules`. This root `package.json` provides shared scripts that coordinate them.

### `package.json`
In any Node.js project, `package.json` is a configuration file that describes the project and lists any scripts and dependencies. The `scripts` section lets you run commands with `npm run <script-name>`.

### `concurrently`
A package that lets you run multiple commands at the same time in a single terminal window, with colour-coded output so you can see which part is logging what. Used here to run the API server and React client simultaneously in development mode.

---

## Project Details

```json
{
  "name": "makeventory",
  "version": "1.0.0",
  "description": "Full-stack Inventory Management Application"
}
```

---

## Available Scripts

### `npm run dev`
Starts both the API server (blue output) and the React client (green output) in development mode simultaneously using `concurrently`.

```
concurrently -n "Server,Client" -c "blue,green" "npm run server" "npm run client"
```

This is an alternative to using `systemfiles/dev/start.sh` — it runs both processes in the foreground in your terminal window rather than as background processes.

### `npm run server`
Starts just the API server in development mode:
```
cd server && npm run dev
```

### `npm run client`
Starts just the React development server:
```
cd client && npm run dev
```

### `npm run install:all`
Installs all dependencies for all three parts of the project:
```
npm install           (root devDependencies)
cd server && npm install
cd client && npm install
```

Useful when setting up a development environment manually (without using the installer).

### `npm run build`
Builds the React client for production:
```
cd client && npm run build
```

---

## Dev Dependencies

| Package | Purpose |
|---|---|
| `concurrently` | Runs multiple npm scripts in parallel in one terminal |

---

## Notes for Developers

- These scripts are primarily for **development** use. For running the application normally, use `systemfiles/start.sh` (production) or `systemfiles/dev/start.sh` (development).
- The `npm run dev` script here does **not** start MongoDB. Make sure MongoDB is running before using these scripts.
- The install wizard (`install/`) is not included in these scripts — it must be run separately via `./install.sh`.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `server/package.json` | Defines `npm run dev` for the API server |
| `client/package.json` | Defines `npm run dev` for the React client |
| `systemfiles/dev/start.sh` | Alternative way to start the dev environment (also starts MongoDB) |
| `systemfiles/start.sh` | Production start (builds first, then runs) |
