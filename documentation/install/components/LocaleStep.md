[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/LocaleStep.jsx

## What does this file do?

This is **Step 1 of the install wizard** — Language & Currency selection. It's the very first thing a user sees when setting up Makeventory. It lets them choose:

1. **Language** — which language the app's interface will be displayed in
2. **Currency** — which currency symbol to use throughout the application

Once both choices are made and the user clicks Continue, this step saves the selections and the wizard advances to Step 2.

---

## Key Concepts

### Props
Props (short for "properties") are the inputs a component receives from its parent. Think of them like the settings you pass to a function. This component receives two props from `App.jsx`:

- `savedLocale` — if the user has already completed this step, this contains their previous selections so the form can be pre-filled
- `onComplete` — a function to call when the step is finished (provided by `App.jsx` as `markComplete`)

### State
The component tracks the user's current selections using `useState`:
- `language` — currently selected language code (e.g., `"en"`)
- `currency` — currently selected currency code (e.g., `"GBP"`)

### `useEffect`
When the component first loads, it checks whether `savedLocale` was passed in. If so, it pre-fills `language` and `currency` with the previously saved values. This handles the case where a user goes back to this step after already completing it.

---

## Supported Languages

Displayed as clickable tile cards, each showing a flag emoji and the language name:

| Code | Flag | Label |
|---|---|---|
| `en` | 🇬🇧 | English |
| `fr` | 🇫🇷 | Français |
| `es` | 🇪🇸 | Español |

---

## Supported Currencies

Displayed as a dropdown (MUI `Select` component):

| Code | Symbol | Name |
|---|---|---|
| `GBP` | £ | British Pound |
| `USD` | $ | US Dollar |
| `EUR` | € | Euro |
| `AUD` | A$ | Australian Dollar |
| `CAD` | C$ | Canadian Dollar |
| `NZD` | NZ$ | New Zealand Dollar |

---

## Sub-Component: Language Tile Card

The three language options are rendered as interactive card tiles. When clicked, the card for the selected language gets a highlighted/selected visual style. This is built inline using MUI's `Paper` component styled to look like a selectable card.

---

## What Happens on "Continue"

The Continue button is only enabled once both a language and currency have been chosen.

When clicked, it calls:
```js
onComplete({ language, currency })
```

This passes the two selected values up to `App.jsx`, which saves them as `savedLocale` and advances the wizard to Step 2.

**No API call is made** — this step is purely a UI data collection step. The locale settings are saved to the database later in the wizard process.

---

## Props Reference

| Prop | Type | Required | Description |
|---|---|---|---|
| `savedLocale` | object | No | `{ language, currency }` — pre-fills the form if the user revisits this step |
| `onComplete` | function | Yes | Called with `{ language, currency }` when the user clicks Continue |

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 1; provides `savedLocale` and `onComplete` props |
| `install/src/api.js` | Not used by this step — no API calls are made here |
