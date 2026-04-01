[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/components/AppUpdateBanner.jsx

## What is this file?

A banner component that appears at the top of the app when a newer version of Makeventory is available on GitHub.

## What it looks like

When an update is available:
```
ℹ️  Version v0.3.0 is available.          [Update Now]
```

When updating:
```
✅  Restarting with the new version...
```

When hidden: renders nothing (`null`)

## How it works

### Polling

On mount, the component calls `GET /api/system/update-check` immediately, then sets up an interval to check **every 10 minutes**. The interval is cleared if the component unmounts (e.g. the user logs out).

### Displaying the banner

If the response has `upToDate: false`, the banner becomes visible showing the new release tag name.

If `upToDate: true` or the request fails, nothing is shown (errors are silently ignored — this is not a critical UI feature).

### Applying an update

When the user clicks "Update Now":
1. Calls `POST /api/system/update`
2. Shows the "Restarting..." success message
3. The server will restart itself — the page will stop responding briefly, then the browser can be refreshed

If the update request fails, an error alert appears.

## Security

Both update endpoints (`update-check` and `update`) require admin authentication on the server. Non-admin users will never see the banner (the request will return 403 and the catch handler silently ignores it).

## Relationship to other files

- Rendered inside both `Layout.jsx` and `SettingsLayout.jsx`
- Communicates with `routes/system.js` on the server
- Text is translated via `useTranslation()`
