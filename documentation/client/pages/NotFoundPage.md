[🏠 Home](../../README.md) · [↑ Client](../README.md)

---

# client/src/pages/NotFoundPage.jsx

## What is this file?

The **404 Not Found page** — shown when a user navigates to a URL that doesn't match any route in the application. React Router renders this component for the catch-all `*` route.

## What it shows

- A sad face icon
- "Page not found" heading
- A brief explanation message
- A "Go back" button that uses `navigate(-1)` to return to the previous page

## Relationship to other files

- Registered as the catch-all route in `App.jsx`: [App.jsx](../App.md)
- All text is translatable via `useTranslation`: keys `notFound.title`, `notFound.subtitle`, `notFound.message`
