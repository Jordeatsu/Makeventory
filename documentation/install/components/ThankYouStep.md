[🏠 Home](../../README.md) · [↑ Install Wizard](../README.md)

---

# install/src/components/ThankYouStep.jsx

## What does this file do?

This is **Step 7 of the install wizard — the final screen**. It confirms that the installation is complete and tells the user they can now close the installer and launch the main Makeventory application.

It also displays a "Buy Me a Coffee" widget as an optional way to support the developer, since Makeventory is free and open-source software.

---

## Key Concepts

### Final Confirmation Screen
This step is purely informational — there are no forms to fill in, no buttons to click (other than the optional donation button). It's the "All done!" screen that appears after all six setup steps have been completed.

### "Buy Me a Coffee" Widget
This is a third-party donation widget from [buymeacoffee.com](https://www.buymeacoffee.com). It adds a small floating button in the bottom-right corner of the screen linking to the developer's donation page. The widget is injected by adding a `<script>` tag to the page dynamically.

### `useEffect` for Script Injection
Since React manages the page content, you can't just write a `<script>` tag in JSX. Instead, `useEffect` creates a `<script>` element programmatically and adds it to the `<head>` of the document. When the component is unmounted (e.g., if someone navigates away), the cleanup function removes the script and widget to avoid leaving ghost elements behind.

---

## What the User Sees

1. **A large green checkmark** followed by "Installation Complete!" in bold
2. **A subtitle:** "Makeventory is set up and ready to go. You can now close this window and launch the app."
3. **A support card** with a "Buy Me a Coffee" button (yellow, opens in a new tab)
4. **A caption** explaining that the floating donate button stays available for later

---

## No `onComplete` Prop

Unlike every other step, `ThankYouStep` does not receive an `onComplete` prop. There is no "next step" — this is the end of the wizard. The user simply closes the browser tab when ready.

---

## The Buy Me a Coffee Button

```
URL: https://www.buymeacoffee.com/jordeatsu
Colour: #FFDD00 (bright yellow)
Label: ☕ Buy me a coffee
Opens in: new tab (target="_blank" with rel="noopener noreferrer" for security)
```

The `rel="noopener noreferrer"` attribute is a security best practice for links that open in new tabs — it prevents the new tab from being able to access or manipulate the original tab.

---

## `useEffect` Cleanup

```js
return () => {
  const existing = document.querySelector('script[data-name="BMC-Widget"]');
  if (existing) existing.remove();
  const widget = document.getElementById("bmc-wbtn");
  if (widget) widget.remove();
};
```

This cleanup function removes both the `<script>` tag and the rendered widget element when the component is removed from the page. This prevents the floating coffee button from persisting if the user somehow navigates away from this step.

---

## Props Reference

This component accepts no props.

---

## Relationship to Other Files

| File | Relationship |
|---|---|
| `install/src/App.jsx` | Renders this component as Step 7; no props are passed |
| `install/src/components/ModuleStep.jsx` | The step immediately before this one; calls `completeInstall()` before advancing here |
