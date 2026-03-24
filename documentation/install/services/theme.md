[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/services/theme.js

## What does this file do?

This file defines the **visual theme for the install wizard** — all the colours, typography, and component style overrides that give the installer its consistent look and feel.

It is very similar in purpose to `client/src/theme.js` (the main application's theme file), though the two are maintained separately because the installer is a completely separate application from the main Makeventory client.

---

## Key Concepts

### MUI Theme
Material UI (MUI) is the component library used for all the user interface elements (buttons, text fields, cards, etc.). A "theme" is a central configuration object that tells MUI what colours, fonts, and sizes to use across all components automatically.

By defining the theme once in this file, every component in the installer that uses an MUI component will automatically use these colours — you don't have to style each component individually.

### `createTheme`
The MUI function used to create the theme object. You pass it a configuration object and it returns a fully-formed theme that `ThemeProvider` (in `App.jsx`) applies to the whole application.

### Colour Palette
The palette is defined as a named set of brand colours at the top of the file, which are then referenced throughout the theme configuration. This makes it easy to update a colour in one place and have it change everywhere.

---

## The Colour Palette

```js
const palette = {
  darkest: "#565264",  // deep purple-slate — used for nav and dark accents
  dark:    "#706677",  // muted purple      — primary colour (buttons, active states)
  mid:     "#A6808C",  // mauve rose        — secondary accents
  light:   "#CCB7AE",  // warm blush        — table headers, borders
  pale:    "#D6CFCB",  // soft warm grey    — page background
  white:   "#FFFFFF",  // white             — cards and paper surfaces
};
```

These are warm, muted tones that give Makeventory its distinctive look. The same palette is used in the main application.

---

## Theme Configuration

### Mode
```
mode: "light"
```
The install wizard always uses light mode.

### Primary Colour
Used for primary buttons, active states, focused inputs, etc.
- Main: `#706677` (muted purple)
- Light: `#A6808C` (mauve rose)
- Dark: `#565264` (deep purple-slate)
- Text on primary: white

### Secondary Colour
Used for secondary UI elements.
- Main: `#A6808C` (mauve rose)
- Light: `#CCB7AE` (warm blush)
- Dark: `#706677` (muted purple)

### Status Colours
| Status | Colour | Used For |
|---|---|---|
| Error | `#FFCAB1` (soft coral) | Error messages, failed states |
| Warning | `#ECDCB0` (warm amber) | Warnings |
| Success | `#C1D7AE` (soft green) | Completion states, progress bars |
| Info | `#A6808C` (mauve) | Informational messages |

Note: These are deliberately soft — pastel versions of typical traffic-light colours. They fit the warm palette while still being recognisable.

### Background
- Page background: `#D6CFCB` (soft warm grey)
- Cards / paper surfaces: `#FFFFFF` (white)

### Typography
- Font family: `Inter`, then `Roboto`, then `sans-serif` as fallbacks
- `h5` headings: bold (`700`), deep purple-slate colour
- `h6` headings: semi-bold (`600`), deep purple-slate colour

### Border Radius
All components use `10px` rounded corners by default.

---

## Component Overrides

MUI allows you to customise the default styles of specific components globally. These overrides are applied:

### `MuiPaper`
- Removes the default background gradient (`backgroundImage: "none"`)
- Gives outlined variants the warm blush border colour

### `MuiDivider`
- Uses the warm blush colour for dividing lines

### `MuiButton`
- Primary contained buttons: muted purple background, darkens on hover

### `MuiChip`
- Outlined primary chips: muted purple border and text

### `MuiLinearProgress`
- Progress bars have colour-matched track backgrounds:
  - Primary: semi-transparent blush track, muted purple fill
  - Success: semi-transparent green track, soft green fill
  - Error: semi-transparent coral track, coral fill

### `MuiAlert`
- Alert backgrounds are soft, semi-transparent versions of their status colours
- Alert text always uses the deep purple-slate colour for readability

---

## Export

```js
export default theme;
```

The theme is exported as the default export and consumed in `App.jsx`:
```js
import theme from "./services/theme";
// ...
<ThemeProvider theme={theme}>
  ...
</ThemeProvider>
```

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Imports and applies this theme via MUI's `ThemeProvider` |
| `client/src/theme.js` | The main application's equivalent theme file — same colour palette, maintained separately |
