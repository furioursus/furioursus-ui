# Theming

Light and dark, chosen by the system setting unless the visitor overrides it.

## How it decides

1. `tokens.css` alone, with no JavaScript, follows `prefers-color-scheme`.
2. `theme.js` sets `data-theme="light"` or `"dark"` on `<html>` before first paint. The attribute
   always wins over the system setting.
3. A visitor's choice is stored in `localStorage` under `theme`, **but only when it differs from
   the system**. Picking the theme the system already uses clears the override, so the page goes
   back to following the OS. This is the MTG tools' behaviour. furioursus.dev used to store every
   choice, which pinned the theme even after the OS switched.

## Loading `theme.js`

It must be a plain, blocking `<script>` in `<head>`, **after** `<meta name="theme-color">`:

```html
<meta name="theme-color" content="#e8e3e2">
<script src=".../theme.js"></script>
```

- **Footgun:** `defer`, `async` or `type="module"` make it run after first paint, so a dark-mode
  visitor sees a flash of the light page.
- **Footgun:** before the meta tag, it can't find the tag to update. The browser chrome (and iOS
  Safari's overscroll area) then stays the wrong colour until the next switch.
- In Astro, inline it with `<script is:inline>` (import the file's text with `?raw`), or reference
  the file with `<script is:inline src=...>`. A plain `<script>` gets bundled as a module, which
  makes it deferred.

## API

```js
furioursusTheme.get();            // "light" | "dark"
furioursusTheme.set("dark");
furioursusTheme.toggle();

// Same as set(), for code that shouldn't reference the global:
document.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: "dark" } }));

// Fires on every change, including OS switches and other tabs. Update toggle icons here:
document.addEventListener("theme-changed", (e) => e.detail.theme);
```

It also re-applies the theme when the page comes back from the back/forward cache, and when another
tab changes it.

## Toggle buttons

Mark any button `data-theme-toggle` and `theme.js` does the rest, with no other script:

```html
<button type="button" role="switch" data-theme-toggle><span class="sr-only">Dark theme</span>…</button>
<button type="button" data-theme-toggle>◐</button>
```

- A click anywhere inside it switches theme, saving the choice by the rule above.
- On every change, and once on `DOMContentLoaded`, each toggle's `title` becomes "Switch to light/dark
  mode". A `role="switch"` also gets `aria-checked` (true in dark). Any other toggle gets the same
  text as its `aria-label`, so it names the action.
- **Footgun:** `theme.js` is the only click handler. A toggle that also handles its own click (calls
  `toggle()` or dispatches `theme-change`) switches twice and appears to do nothing.
- The shared `ThemeToggle` component is this: a `role="switch"` with `data-theme-toggle`. It works
  rendered as static HTML, so a site doesn't have to ship Vue to the browser for it.

## The cross-fade

`tokens.css` registers each literal colour with `@property`, so `base.css` can transition them on
`<html>` over `--duration-theme` (300ms). Children inherit the in-between values, so the whole page
fades at once with no per-element transitions. `prefers-reduced-motion` turns it off.

`border` and `tint` aren't registered because they're `color-mix()` of `ink`. They follow `ink` as it
fades.

## Textures

`--texture-paper` and `--texture-dots` are `url()`s relative to `dist/tokens.css`. `base.css`
applies them, and it lives in the same folder, so the paths resolve wherever the files are served
from. Bundlers (Vite, Astro) rewrite them to hashed asset URLs anyway.

- **Footgun:** if you use `var(--texture-paper)` in your own stylesheet without a bundler, check
  that the image loads. Browsers don't agree on whether a `url()` inside a variable resolves against
  the stylesheet that declared it or the one that used it.
