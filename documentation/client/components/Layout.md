[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/components/Layout.jsx

## What is this file?

The **main application layout** component — the page shell that wraps every non-settings page in the app. It contains the navigation sidebar, top app bar, update banner, and footer.

## What it looks like

```
┌─────────────────────────────────────────────┐
│  [Update banner — shown when update available]│
├────────────┬────────────────────────────────┤
│            │                                │
│  Sidebar   │     Page content               │
│  (Drawer)  │     (children prop)            │
│            │                                │
│  - Brand   │                                │
│  - Nav     │                                │
│  - Profile │                                │
│  - Settings│                                │
│  - Logout  │                                │
├────────────┴────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

## Responsiveness

On **mobile** (screens narrower than the `sm` breakpoint):
- The sidebar is hidden by default
- A hamburger icon button in the top app bar opens it as a temporary overlay (`Drawer` in temporary mode)

On **desktop**:
- The sidebar is always visible on the left (`Drawer` in permanent mode)
- No app bar is shown

## Sidebar content

**Top section — Brand**
- Shows the business logo (if one is set) or a default colour palette icon
- Clicking navigates to the dashboard
- Business name text pulled from `BrandingContext`

**Middle section — Module navigation**
- Dynamically built from `useModules()` hook
- Shows a skeleton animation while modules are loading
- Active route item is highlighted with the primary colour

**Bottom section — User actions**
- Profile link showing the user's first name + "My Profile" subtitle
- Settings link
- Sign out button

## Props

| Prop | Type | Description |
|---|---|---|
| `children` | ReactNode | The page content to render in the main area |

## Key dependencies

- `useModules()` — fetches active navigation items from the server
- `useAuth()` — gets current user and logout function
- `useBranding()` — gets business name and logo
- `AppUpdateBanner` — shown above the sidebar when an update is available
- `AppFooter` — shown below the page content

## Relationship to other files

- Used by `App.jsx` to wrap all main (non-settings) pages
- `SettingsLayout.jsx` is a parallel component for the settings section
- Navigation items come from `useModules.jsx`
- Brand comes from `BrandingContext.jsx`
- User info comes from `AuthContext.jsx`
