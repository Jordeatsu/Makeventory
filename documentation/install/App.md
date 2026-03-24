[🏠 Home](../README.md) · [↑ Install Wizard](README.md)

---

# install/src/App.jsx

## What does this file do?

This is the **root component of the install wizard** — it's the highest-level piece of the React application that runs during installation. Think of it as the coordinator that manages the entire multi-step setup process.

It defines:
- The **list of all wizard steps** and their order
- The **current progress** (which step is active, which are complete, which are pending)
- How data is **passed between steps** (e.g., the database name chosen in step 3 is saved here and forwarded to later steps)
- How the **visual step indicator** (the sidebar list) reflects where you are

---

## Key Concepts

### React Component
A component is a building block of a React application. `App` is the top-level component — all other components appear inside it. When exported as `default`, it means this is the main thing the file provides.

### State
"State" is information that a component remembers and can change over time. When state changes, React re-renders (visually updates) the component. This file uses `useState` to track things like which step is currently active.

### `useEffect`
A React hook that runs code after the component renders. Used here to check whether the installation has already been completed (in case the wizard is opened again after a previous successful run).

### Wizard Pattern
A multi-step form where each "step" collects different information, and you must complete one step before moving to the next. This wizard has 7 steps.

---

## File Structure

```
install/src/App.jsx
    ├── STEPS constant (array of step definitions)
    ├── App component
    │   ├── State: stepStatus, currentStep, savedLocale, savedDbName, savedAccount, savedBusiness
    │   ├── markComplete(data) — advances to the next step
    │   ├── markError(stepId, msg) — marks a step as failed
    │   └── Renders: step sidebar + active step component
```

---

## The 7 Wizard Steps

The `STEPS` array defines every step in order:

| # | Step ID | Component | Purpose |
|---|---|---|---|
| 1 | `locale` | `LocaleStep` | Choose language and currency |
| 2 | `dependencies` | `DependenciesStep` | Automatically installs npm packages |
| 3 | `database` | `DatabaseStep` | Connect to MongoDB and create the database |
| 4 | `account` | `AccountStep` | Create the admin user account |
| 5 | `business` | `BusinessStep` | Set up business name, logo, and social links |
| 6 | `modules` | `ModuleStep` | Choose which optional modules to enable |
| 7 | `thankyou` | `ThankYouStep` | Confirmation and completion screen |

---

## State Variables

### `stepStatus`
An object that tracks the status of each step by its ID:
```js
{
  locale:       "complete",
  dependencies: "active",
  database:     "pending",
  account:      "pending",
  business:     "pending",
  modules:      "pending",
  thankyou:     "pending"
}
```

Possible values:
- `"pending"` — not yet reached
- `"active"` — currently being shown
- `"complete"` — finished successfully
- `"error"` — something went wrong

### `currentStep`
A number (0–6) indicating which step index in the `STEPS` array is currently active.

### `savedLocale`
Stores `{ language, currency }` from the Locale step so it can be passed to later steps if the user navigates back.

### `savedDbName`
Stores the database name chosen during the Database step.

### `savedAccount`
Stores the admin account details (username, email, etc.) in case the step needs to be revisited.

### `savedBusiness`
Stores the business profile (business name, logo, social links) in case the step needs to be revisited.

---

## Key Functions

### `markComplete(data)`
Called by each step component when the user successfully completes that step.

- Marks the current step as `"complete"`
- Advances `currentStep` to the next step
- Marks the next step as `"active"`
- If `data` is provided, saves it to the appropriate state variable (e.g., if the locale step completes, saves `data` to `savedLocale`)

### `markError(stepId, msg)`
Called if a step encounters an unrecoverable error (e.g., the database connection fails).

- Changes that step's status to `"error"`
- Optionally stores an error message for display

---

## Layout

The App renders two side-by-side panels:

**Left panel — Step list:**
A numbered list of all 7 steps with visual indicators:
- ✅ Green check = complete
- ▶ Highlighted = active/current
- ○ Grey = pending
- ✗ Red = error

**Right panel — Active step:**
The component for the current step is rendered here. Each step receives:
- `onComplete` — a function to call when done (this is `markComplete`)
- Relevant saved data (so revisiting a step pre-fills the form)

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/main.jsx` | Renders `App` into the HTML page |
| `install/src/components/LocaleStep.jsx` | Step 1 component rendered by App |
| `install/src/components/DependenciesStep.jsx` | Step 2 component rendered by App |
| `install/src/components/DatabaseStep.jsx` | Step 3 component rendered by App |
| `install/src/components/AccountStep.jsx` | Step 4 component rendered by App |
| `install/src/components/BusinessStep.jsx` | Step 5 component rendered by App |
| `install/src/components/ModuleStep.jsx` | Step 6 component rendered by App |
| `install/src/components/ThankYouStep.jsx` | Step 7 component rendered by App |
| `install/src/services/theme.js` | Provides the colour theme and styling for the wizard |
| `install/src/api.js` | Used indirectly — each step imports from this to make API calls |

---

## How the Wizard Flows

```
App renders
    → shows Step 1 (LocaleStep) in right panel
    → user completes step → markComplete({ language, currency }) called
        → Step 1 = complete, Step 2 = active
    → shows Step 2 (DependenciesStep) — auto-runs npm install
        → install finishes → markComplete() called automatically
            → Step 2 = complete, Step 3 = active
    → ... continues through each step ...
    → Step 7 (ThankYouStep) — installation is done!
```
