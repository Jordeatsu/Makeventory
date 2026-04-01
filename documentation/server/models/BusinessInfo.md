[🏠 Home](../../README.md) · [↑ Server](../README.md)

---

# server/models/BusinessInfo.js

## What is this file?

Defines the **BusinessInfo** database schema — a **singleton** document that stores the business's public profile.

This data is used on the login page (before authentication) to display the business's branding.

## Schema fields

| Field | Type | Description |
|---|---|---|
| `businessName` | String | The name of the business |
| `logo` | String | The business logo stored as a **Base64-encoded** data URL (e.g. `data:image/png;base64,...`) |
| `website` | String | Business website URL |
| `twitter` | String | Twitter/X handle or URL |
| `instagram` | String | Instagram handle or URL |
| `tiktok` | String | TikTok handle or URL |
| `facebook` | String | Facebook page URL |

**Collection name:** `businessinfo` (explicitly set — Mongoose would default to `businessinfos` otherwise)

## What is Base64?

Base64 is a way to encode binary data (like an image file) as a plain text string. This allows the logo image to be stored directly in the database rather than as a separate file on disk. The string can be used directly in an HTML `<img>` tag:
```html
<img src="data:image/png;base64,iVBORw0KGgo..." />
```

## How it is used

1. The install wizard (`BusinessStep.jsx`) lets the user set their business name and upload a logo
2. The `GET /api/public/business` endpoint returns `businessName` and `logo` without requiring login
3. `BrandingContext.jsx` in the front-end fetches and stores this data
4. `LoginPage.jsx` displays the business name and logo on the login screen
5. `Layout.jsx` shows the business name and logo in the app's navigation sidebar

## Relationship to other files

- Read by `routes/auth.js` (`GET /public/business`)
- Consumed by `BrandingContext.jsx` in the client
- Set during installation via `install/src/components/BusinessStep.jsx`
- Managed in `SettingsPage.jsx` (future — not yet implemented)
