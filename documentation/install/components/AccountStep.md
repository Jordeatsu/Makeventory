[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/AccountStep.jsx

## What does this file do?

This is **Step 4 of the install wizard** — Admin Account Setup. It collects the details needed to create the first (and only) administrator account for the Makeventory application.

This account is what you will log in with every day. Having admin access means you can manage all settings, users, and data in the application.

---

## Key Concepts

### Admin Account
Makeventory has a user system. The account created here is the first (and during installation, the only) admin user. After installation, this account can log in and manage the application.

### Form Validation
Before the data is sent to the server, it's checked on the browser side ("client-side validation"). If something is wrong (e.g., the email doesn't look right, or the passwords don't match), an error message is shown under the relevant field without ever contacting the server.

### Update Mode (`isUpdate`)
If the user goes back to this step after already completing it, the form enters "update" mode. Instead of `createAccount()`, it calls `updateAccount()`. The saved values are pre-filled so the user can make changes or just confirm and move on.

---

## Form Fields

| Field | Required | Validation Rule |
|---|---|---|
| First Name | Yes | Must not be empty |
| Last Name | Yes | Must not be empty |
| Email | Yes | Must match a valid email format (checked with a regex) |
| Username | Yes | Must not be empty |
| Password | Yes | Must not be empty |
| Confirm Password | Yes | Must exactly match the Password field |

---

## State Variables

| Variable | Type | Description |
|---|---|---|
| `fields` | object | All form field values: `{ firstName, lastName, email, username, password, confirm }` |
| `errors` | object | Field-level error messages keyed by field name |
| `submitting` | boolean | `true` while the API call is in progress (disables the form) |
| `serverError` | string | Error message from the server if the API call fails |
| `done` | boolean | `true` after successful submission (shows success state) |

---

## Key Functions

### `set(field)`
A helper that returns an `onChange` event handler for a given field name. Keeps the `onChange` wiring concise:
```js
onChange={set("firstName")}
// is equivalent to:
onChange={(e) => setFields(prev => ({ ...prev, firstName: e.target.value }))}
```
It also clears the error for that field as the user starts typing.

### `validate()`
Checks all fields before submission:
- Trims whitespace then checks required fields aren't empty
- Validates email format with a regex
- Checks that `confirm` matches `password`
- Returns `true` if all checks pass, `false` otherwise (with `errors` state updated)

### `handleSubmit(e)`
Called when the form is submitted:
1. Calls `validate()` — stops if invalid
2. Sets `submitting = true`
3. Calls `createAccount()` or `updateAccount()` depending on `isUpdate`
4. On success: calls `onSave?.()` to store the account data in `App.jsx`, sets `done = true`, waits 800ms, then calls `onComplete()`
5. On failure: shows the server's error message

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `savedAccount` | object | No | `{ firstName, lastName, email, username }` — pre-fills the form if revisiting. Note: passwords are never pre-filled for security reasons. |
| `onSave` | function | No | Called with the account data on success, so `App.jsx` can store it |
| `onComplete` | function | Yes | Called after successful submission to advance the wizard |

---

## Security Note

Passwords are never stored in `App.jsx`'s state or passed back via `onSave`. Only non-sensitive fields (name, email, username) are saved for potential step-revisiting. This means if a user goes back to this step, they must re-enter their password.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 4; provides `savedAccount` and `onSave` |
| `install/src/api.js` | Calls `createAccount` or `updateAccount` |
| `install/server.js` | Processes account creation, hashes the password with scrypt |
| `server/models/User.js` | Defines the user schema that gets a document inserted by this step |
