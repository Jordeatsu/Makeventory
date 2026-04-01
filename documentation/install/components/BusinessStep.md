[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/BusinessStep.jsx

## What does this file do?

This is **Step 5 of the install wizard** — Business Profile. It collects information about your business so that Makeventory can personalise the application with your brand.

All fields except the business name are optional. The information entered here appears throughout the app — your business name shows in the header, your logo appears on invoices and the dashboard, and your social media links are stored for reference.

---

## Key Concepts

### Base64 Logo Encoding
When you upload a logo image, the browser reads the file and converts it to a Base64 string — a text representation of the image file. This text is what gets stored in the database. When the app needs to display the logo, it converts the Base64 string back into an image.

This approach means the logo is stored directly in MongoDB rather than as a separate file on disk, keeping the application self-contained.

### `FileReader`
A browser API that allows reading the contents of a file selected by the user. Here it's used with `readAsDataURL()`, which converts the file into a Base64-encoded data URL.

### URL Normalisation
Social media URLs and website URLs often get typed without `https://` (e.g., `example.com`). The `normaliseUrl()` function automatically adds `https://` if it's missing, so the stored URLs are always valid.

### Update Mode (`isUpdate`)
If the user navigates back to this step, it enters update mode: the form is pre-filled with their previously entered data (from `savedBusiness`), and it calls the same `createBusiness()` API call (which overwrites the existing record).

---

## Form Fields

| Field | Required | Notes |
|---|---|---|
| Business Name | Yes | Stored and displayed throughout the app |
| Company Logo | No | Image file, max 2 MB, any image type |
| Website | No | URL-validated + auto-prefixed with `https://` |
| Twitter | No | URL-validated + auto-prefixed with `https://` |
| Instagram | No | URL-validated + auto-prefixed with `https://` |
| TikTok | No | URL-validated + auto-prefixed with `https://` |
| Facebook | No | URL-validated + auto-prefixed with `https://` |

---

## State Variables

| Variable | Type | Description |
|---|---|---|
| `fields` | object | All text field values: `{ businessName, website, twitter, instagram, tiktok, facebook }` |
| `errors` | object | Field-level error messages |
| `logo` | object / null | `{ base64, mime, preview }` — stores the uploaded logo. `null` if no logo. |
| `submitting` | boolean | `true` while the API call is running |
| `serverError` | string | Error message from the server if submission fails |
| `done` | boolean | `true` after successful submission |

---

## Key Functions

### `set(field)`
Returns an `onChange` handler for a given field name. Clears the field's error as the user types.

### `URL_RE`
A regular expression that validates URLs. Accepts formats like:
- `https://example.com`
- `http://example.com`
- `example.com` (normalised before storage)

### `normaliseUrl(value)`
Adds `"https://"` to a URL if it doesn't already start with `http://` or `https://`, then validates the result. Returns an empty string if the field is blank. If the URL is still invalid after normalisation, it's rejected during validation.

### `handleLogoChange(e)`
Called when the user selects a file:
1. Checks the file size is ≤ 2 MB
2. Uses `FileReader.readAsDataURL()` to convert the image to Base64
3. Strips the `data:image/...;base64,` prefix from the data URL (only the raw Base64 string is stored)
4. Stores `{ base64, mime, preview }` in the `logo` state

### `validate()`
Checks:
- `businessName` is not empty
- Each URL field (if filled in) passes `URL_RE`

### `handleSubmit(e)`
1. Validates the form
2. Calls `createBusiness()` with all field values (and logo if uploaded)
3. Calls `onSave?.()` with the cleaned data so `App.jsx` can store it
4. After 800ms, calls `onComplete()` to advance the wizard

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `savedBusiness` | object | No | Pre-fills all fields if the user revisits. Includes `{ businessName, website, twitter, instagram, tiktok, facebook, logo }` |
| `onSave` | function | No | Called with the business data on success, so `App.jsx` can store it |
| `onComplete` | function | Yes | Called after successful submission to advance the wizard |

---

## Logo Preview

The logo upload area shows an `Avatar` (square image placeholder) that displays:
- A grey upload icon if no logo has been selected
- A live preview of the chosen image (using the Base64 preview URL)

Two buttons appear below the preview once a logo is uploaded: "Change Logo" and "Remove" (red).

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this as Step 5; provides `savedBusiness`, `onSave`, `onComplete` |
| `install/src/api.js` | Calls `createBusiness` |
| `install/server.js` | Receives the business data and stores it in MongoDB |
| `server/models/BusinessInfo.js` | The MongoDB schema that stores the business profile |
