[🏠 Home](../README.md) · [↑ Server](README.md)

---

# server/server.js

## What is this file?

This is the **entry point** for the back-end server — it is the first file that runs when you start the application. Think of it as the "front door" of the server: every HTTP request that arrives from the browser passes through this file before being routed to the right place.

## What technology does it use?

| Technology | What it does |
|---|---|
| **Express** | A Node.js framework that makes it easy to define what happens when the server receives an HTTP request (GET, POST, etc.) |
| **Mongoose** | A library that connects Node.js to a MongoDB database |
| **Helmet** | Adds security headers to every response to protect against common web attacks |
| **CORS** | "Cross-Origin Resource Sharing" — controls which web addresses are allowed to talk to this server |
| **cookie-parser** | Reads cookies sent by the browser so the server can verify who is logged in |
| **Pino** | A structured logger — writes log messages in a machine-readable format |

## How is it structured?

```
1. Import all required libraries
2. Configure the Express app (security, logging, body size limits)
3. Connect to MongoDB
4. Register all API routes under /api
5. Start listening for connections
```

## Key configuration decisions

### Body size limit
```js
app.use(express.json({ limit: '100kb' }));
```
This prevents malicious users from sending enormous payloads to crash the server.

### Where it listens
- **Production**: `127.0.0.1:5001` — only accepts connections from the same machine (safer)
- **Development**: `0.0.0.0:5001` — accepts connections from any network interface

The environment is controlled by the `NODE_ENV` environment variable.

### JWT secret startup check

In **production** (`NODE_ENV=production`), the server will **refuse to start** if `JWT_SECRET` is not set — this prevents accidentally running with the insecure development fallback. In development mode it logs a warning but continues.

## Environment variables it reads

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Full connection string to the MongoDB database |
| `CLIENT_ORIGIN` | The URL of the React front-end (used for CORS) |
| `JWT_SECRET` | Secret key used to sign and verify login tokens |
| `NODE_ENV` | `production` or `development` |
| `COOKIE_SECURE` | Set to `true` in production to require HTTPS for cookies |

### Port
Port **5001** is used. If something else is already using this port, the server won't start.
- Imports and mounts **`routes/index.js`**, which in turn connects all individual route files
- All API routes become accessible at `/api/...` (e.g. `/api/orders`, `/api/materials`)
- The React front-end (`client/`) communicates with this server via the `/api` prefix
