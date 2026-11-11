# Tokens

How the tokens are named and organized, and how each existing site's variables map onto them. The full list with values and contrast is generated into [reference.md](reference.md).

## Naming

Every CSS variable is `--<group>-<name>`, and the groups are Tailwind v4's theme namespaces wherever one exists. So the same name works as a plain variable (`var(--color-accent)`) and as a Tailwind utility (`text-accent`) with no mapping layer.

| Group | Example | Tailwind utility |
| --- | --- | --- |
| `color` | `--color-page` | `bg-page`, `text-ink`, `border-border` |
| `font` | `--font-display` | `font-display` (includes `"opsz" 60`) |
| `text` | `--text-title-lg` | `text-title-lg` (includes line height) |
| `tracking` | `--tracking-label` | `tracking-label` |
| `spacing` | `--spacing-tight-4` | `p-tight-4`, `gap-gutter` |
| `radius` | `--radius-md` | `rounded-md` |
| `container` | `--container-column` | `max-w-column` |
| `ease` | `--ease-bounce` | `ease-bounce` |
| `duration` | `--duration-theme` | none (plain variable) |
| `texture` | `--texture-paper` | none (plain variable) |

`container` uses `column` and `wide`, not `prose`, because Tailwind already has a built-in `max-w-prose`.

## Color roles

Each color has a `role` in `src/tokens.json`, and the tests use it:

- **ground**: something text sits on (`page`, `surface`).
- **text**: must reach 4.5:1 on the page in both themes. The build fails if one doesn't.
- **decor**: rules, borders and fills that never carry text (`border`, `tint`, `hairline`).
- **status**: the admonition colors. Contrast is reported but not enforced, because the light-mode values fail today (1.5–3.0:1). They're Tailwind palette colors carried over from furioursus.dev unchanged. Darken them for the light theme before using them for body-size text anywhere new.

`border` and `tint` are derived from `ink` with `color-mix()`, so they follow the theme automatically and never need their own dark value.

## Adding a token

Add it only when two places need it. A value one component uses belongs in that component. Give it a `description` that says where it's used, and for a color, a `role`. Then `npm run build` and `npm test`.

## Migrating from the old names

### furioursus.dev (`src/styles/global.css`, `tailwind.config.ts`)

| Old | New | Notes |
| --- | --- | --- |
| `--color-global-bg` / `bg-global-bg` | `--color-page` / `bg-page` | |
| `--color-global-text` / `text-global-text` | `--color-ink` / `text-ink` | |
| `--color-accent-2` / `text-accent-2` | `--color-heading` / `text-heading` | |
| `--color-nav-hover` / `text-nav-hover` | `--color-highlight` / `text-highlight` | Same values. |
| `--color-quote` / `text-quote` | `--color-link` / `text-link` | Was always the same value as link. |
| `--color-muted`, `--color-accent`, `--color-link` | unchanged | |
| literal `#666` in `tailwind.config.ts` | `--color-hairline` | |
| `--paper-image`, `--dots-image` | `--texture-paper`, `--texture-dots` | |
| `--dots-size: 24px 24px` | `--texture-dots-size: 24px` | One value now; `base.css` uses it for both axes. |
| `--color-mode-transition-duration` | `--duration-theme` | |
| `text-2xs`, `tracking-label`, `p-tight-*` | unchanged | Already the same names. |
| `ThemeProvider.astro` `themeColors` map | `dist/theme.js` | Generated from the page token, so it can't drift. |

### mtg-csv-sorter and mtg-library-value-tracker

Their hex values are exact conversions of the furioursus.dev colors, so switching changes nothing visually except where noted.

| Old | New | Notes |
| --- | --- | --- |
| `--page`, `--surface` | `--color-page`, `--color-surface` | |
| `--ink`, `--ink-2`, `--muted` | `--color-ink`, `--color-ink-2`, `--color-muted` | |
| `--accent`, `--link` | `--color-accent`, `--color-link` | |
| `--hl` | `--color-highlight` | |
| `--border` | `--color-border` | Same 22% / 18% of ink. |
| `--hover` | `--color-tint` | 5% of ink, not 6%: a barely visible change. |
| `--mono` | `--font-mono` | MonoLisa first now; falls back to the system mono when a site doesn't load it. |
| `--ui-t` | `var(--duration-ui) ease-out` | |
| `--paper`, `--dots` (tracker) | `--texture-paper`, `--texture-dots` | Drop the inlined copies. |

The tracker's chart colors (`--up`, `--down`, `--seq-*`, `--grid`, `--axis`) stay in the tracker until a second project needs them.
