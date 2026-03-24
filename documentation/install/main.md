[🏠 Home](../README.md) · [↑ Install Wizard](README.md)

---

# install/src/main.jsx

## What does this file do?

This is the **entry point** of the install wizard's React application. It is the very first JavaScript file that runs when the browser loads the installer page. Its only job is to mount (attach) the React application to the HTML page.

Think of it as the "on switch" — it connects the React component tree (starting with `App`) to the actual HTML that gets displayed in the browser.

---

## Key Concepts

### Entry Point
Every web application needs a starting file — one place where everything begins. `main.jsx` is that starting point for the install wizard. Vite (the build tool) is configured to use this as the entry file.

### `createRoot`
This is a React 18 function that creates a React "root" — a managed space in the HTML document where React will render and manage your components. Before React 18, this was done with `ReactDOM.render()`; `createRoot` is the modern replacement.

### `document.getElementById("root")`
The HTML file (`index.html`) contains a `<div id="root"></div>` element. This line finds that element and tells React to take over rendering inside it.

### `.render(<App />)`
This tells React to render the `App` component (the top-level install wizard component) inside the root element. Everything you see on screen flows from this single line.

---

## The Entire File

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);
```

It is intentionally minimal. All the real logic lives in `App.jsx` and the step components.

---

## What Does NOT Live Here

Deliberately absent (unlike many React entry points):
- No theme provider wrapping — the MUI `ThemeProvider` is applied inside `App.jsx` itself
- No router — the install wizard doesn't use React Router (it's a self-contained linear wizard, no URL navigation needed)
- No global context providers — the wizard is simple enough not to need shared context

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | The root component that `main.jsx` renders |
| `install/index.html` | The HTML file containing `<div id="root">` that this file targets |
| `install/vite.config.js` | Configures Vite to use this file as the build entry point |
