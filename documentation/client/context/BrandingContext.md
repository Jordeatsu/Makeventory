[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/context/BrandingContext.jsx

## What is this file?

Provides the **business's branding data** (name and logo) to every component via React Context.

This data needs to be available before the user logs in (so the login page can show the business name), and throughout the entire app (so the sidebar always shows the brand).

## What this context provides

Any component that calls `useBranding()` gets:

| Value | Type | Description |
|---|---|---|
| `businessName` | String | The business name (default: `'Makeventory'`) |
| `logo` | String or `null` | Base64-encoded logo image URL, or `null` if no logo set |

## How it works

On mount, the `BrandingProvider` calls `GET /api/public/business` — an endpoint that requires **no authentication**. This ensures branding data is available before login.

If the request fails (e.g. server is down), the context keeps the default values `{ businessName: 'Makeventory', logo: null }`.

## Browser tab title sync

The provider includes a second `useEffect` that watches `businessName` and updates the browser tab title:

```js
document.title = branding.businessName !== 'Makeventory'
    ? `Makeventory - My Shop Name`
    : 'Makeventory';
```

This runs automatically whenever the business name changes.

## How to use it

```jsx
import { useBranding } from '../context/BrandingContext';

function MyComponent() {
    const { businessName, logo } = useBranding();
    return <h1>{businessName}</h1>;
}
```

## Relationship to other files

- `BrandingProvider` wraps the entire app in `App.jsx`
- `LoginPage.jsx` uses `useBranding()` to show the logo on the login screen
- `Layout.jsx` uses `useBranding()` to show the brand in the sidebar
- Data comes from `server/models/BusinessInfo.js` via `routes/auth.js`
