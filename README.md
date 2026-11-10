# @furioursus/ui

The shared look for furioursus sites: xerox paper, hot pink, acid green, gothic black. One set of
design tokens and one theme switcher, used by furioursus.dev, the MTG tools, and whatever comes
next. Vue components will live here too.

`src/tokens.json` is the source of truth. Everything in `dist/` is generated from it.

## What's in it

| File | What it does |
| --- | --- |
| `dist/tokens.css` | Every token as a CSS variable, light by default, dark from the system setting or `data-theme="dark"`. No build step needed. |
| `dist/base.css` | Optional page ground: paper and dot texture on `<html>`, ink, font, and the light/dark cross-fade. |
| `dist/tailwind.css` | For Tailwind v4: imports `tokens.css` and registers the names, so `bg-page`, `text-accent` and `font-display` work. Also defines the `dark:` variant. |
| `dist/theme.js` | The light/dark switcher. Sets `data-theme` before first paint and remembers an override. |
| `dist/tokens.json` | Resolved values (with hex) for code that can't read CSS variables, like OG images and charts. |
| `assets/` | The paper and dot-grid textures. |

The full token list, with contrast ratios, is in [docs/reference.md](docs/reference.md).

## Use it

### Install

From GitHub, like the collection packages:

```bash
npm install github:furioursus/furioursus-ui
```

### A static page, no build

Link the files directly. A pinned jsDelivr URL works from a page opened straight from disk:

```html
<meta name="theme-color" content="#e8e3e2">
<script src="https://cdn.jsdelivr.net/gh/furioursus/furioursus-ui@v0.1.0/dist/theme.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/furioursus/furioursus-ui@v0.1.0/dist/tokens.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/furioursus/furioursus-ui@v0.1.0/dist/base.css">
```

### Astro or Vite, with Tailwind v4

```css
@import "tailwindcss";
@import "@furioursus/ui/tailwind.css";
@import "@furioursus/ui/base.css"; /* optional */
```

### Astro or Vite, without Tailwind

```js
import "@furioursus/ui/tokens.css";
import "@furioursus/ui/base.css"; // optional
```

In every case `theme.js` has to load as a blocking script in `<head>`; see
[docs/theming.md](docs/theming.md).

### Fonts

Fonts aren't included. Each site loads its own:

- **MonoLisa** (`--font-mono`) is licensed. Self-host it per site. Without it, the stack falls back to
  the system mono.
- **Bricolage Grotesque** (`--font-display`) is OFL. Load it from Fontsource, Google Fonts, or local
  files, and use the variable version so `"opsz" 60` applies.

## Change a token

1. Edit `src/tokens.json`.
2. `npm run build`
3. `npm test`. It fails if a text colour drops below 4.5:1 on the page, or if `dist/` is stale.
4. Commit `src/` and the regenerated files together, then tag a release (`v0.2.0`) so sites can pin it.

See [docs/tokens.md](docs/tokens.md) for naming, roles, and the map from each site's old variable
names.
