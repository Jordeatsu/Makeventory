[🏠 Home](../README.md) · [↑ Client](README.md)

---

# client/src/api.js

## What is this file?

Creates and exports a **pre-configured Axios instance** that all front-end code uses to make HTTP requests to the back-end server.

## What is Axios?

Axios is a JavaScript library that makes HTTP requests (GET, POST, PUT, DELETE etc.) much easier than the browser's built-in `fetch` API. It automatically handles JSON serialisation/parsing, errors, and more.

## What this file sets up

```js
import axios from 'axios';

const api = axios.create({
    baseURL:         '/api',
    withCredentials: true,
});

export default api;
```

### `baseURL: '/api'`

All requests made through `api` will be prefixed with `/api`. This means instead of writing:
```js
axios.get('http://localhost:5001/api/orders')
```
You write:
```js
api.get('/orders')
```

The `/api` prefix is what Vite's dev server (and the production Nginx/Express reverse proxy) routes to the back-end server.

### `withCredentials: true`

This tells the browser to include the **HttpOnly authentication cookie** on every request. Without this, the cookie would not be sent and every request would be treated as unauthenticated.

This is the client-side counterpart to the server's CORS `credentials: true` setting.

## How it is used

Every page and component that needs data from the server imports this instance:

```js
import api from '../api';

// In a component:
const { data } = await api.get('/orders');
const { data } = await api.post('/orders', { status: 'Pending', ... });
await api.delete('/orders/64abc...');
```

## Error handling

Axios automatically throws an error for any HTTP response with a status code ≥ 400. Components handle these errors with `try/catch` blocks and typically show an error message or toast notification.

## Relationship to other files

- Imported by virtually every page component and hook in `src/`
- The `baseURL` `/api` must match the path the back-end server responds to
- The cookie sent via `withCredentials` is verified by `authMiddleware.js` on the server
