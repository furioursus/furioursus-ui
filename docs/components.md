# Components

Vue 3 components shared across furioursus sites. Source in `src/vue/`, built by Vite into
`dist/vue/index.js` (Vue left as an import) and `dist/vue/style.css`. `demo/components.html` shows
every component from the built files.

## Using them

They need the tokens and the theme switcher, then the component styles:

```js
import "@furioursus/ui/tokens.css";      // or tailwind.css on a Tailwind site
import "@furioursus/ui/vue/style.css";
import { PeriodTabs, RankedList, SegmentedControl, ThemeToggle } from "@furioursus/ui/vue";
```

`theme.js` must still load in `<head>` (see [theming.md](theming.md)).

Vue is a peer dependency, marked optional so token-only consumers don't get it installed. A site
using the components installs `vue` itself.

### In Astro

Add the integration (`npx astro add vue`), then use the components in `.astro` files. Astro renders
them to HTML on the server; only components that need to react to clicks need a `client:`
directive:

```astro
---
import { PeriodTabs, RankedList, ThemeToggle } from "@furioursus/ui/vue";
---
<ThemeToggle />                                            <!-- theme.js handles it; no JS shipped -->
<RankedList title="Top Albums" items={albums} newTab />   <!-- static -->
```

- `ThemeToggle` and `RankedList` need no `client:` directive. Leave it off: hydrating either ships
  the Vue runtime (about 30 KB gzipped) for nothing.
- **Footgun:** `PeriodTabs` does need one (`client:visible` is usually right), or it renders but
  doesn't respond. Hydrate only the tabs and let them show and hide server-rendered panels by id, as
  furioursus.dev's `ListeningStatsTabs.vue` does, rather than hydrating the panels' contents too.
- **Footgun:** `v-model` doesn't cross the Astro/Vue boundary. Wrap `PeriodTabs` and the panels it
  switches in one Vue component, and hydrate that.

### In a plain Vite + Vue app

Import and register as usual. Nothing else to set up.

## Styling rules

- All component CSS is inside `@layer components`. A site's own unlayered CSS, or its Tailwind
  utilities (in the later `utilities` layer), override it without `!important`. On a site that
  doesn't declare layers, any unlayered rule wins.
- Classes are prefixed `fu-` and named block/element (`fu-tabs__tab`), so they don't collide with a
  site's own.
- Components read only tokens (`var(--color-accent)` and so on) and never set colours of their own.
- **Every state changes shape as well as colour**, because christopher has protanopia. Hover, press,
  selected, focus and disabled each need a cue that isn't colour: an underline, inset bar, offset
  shadow, outline, nudge, weight or opacity. The segments show the pattern: a 1px underline on hover,
  a 1px nudge on press, bold with a 2px underline when selected, a 2px pink focus ring, 45% when
  disabled. The full state table the sites follow is in mtg-library-value-tracker's
  `docs/design.md` ("Interaction states").
- **Footgun, known gaps:** `ThemeToggle`'s hover and `RankedList`'s link hover only turn pink, and
  neither has a press state. Don't copy their state CSS into a new component; fix them instead.
- One look per component. When projects disagreed, the look was chosen once (2026-11-10) and the
  other removed: ThemeToggle uses furioursus.dev's sun/moon, PeriodTabs the tracker's underlined
  segments. Don't reintroduce a `look`/`variant` prop to bring the other back; change the one look.
  SegmentedControl shares PeriodTabs' look (`src/vue/segments.css`), chosen over Go-Shintai's
  bordered filter strip (2026-11-10); its per-row sell/hold/bulk/keep toggle stays in the tracker.

## ThemeToggle

A switch (`role="switch"`, `aria-checked`) marked `data-theme-toggle`. `theme.js` handles its click
and keeps `aria-checked` and `title` in sync (see [theming.md](theming.md#toggle-buttons)), so it works
as static HTML. Hydrated, it follows `theme-changed` so Vue's render agrees.

- **Footgun:** don't give it a click handler; `theme.js` would switch twice.

| Prop | Default | |
| --- | --- | --- |
| `label` | `"Dark theme"` | Accessible name, read with the on/off state. |

- It renders unchecked on the server and in the first client render, then reads the real theme on
  mount, so hydration never mismatches. The sun/moon swap is CSS on `:root[data-theme]`, so the icon
  is right at first paint anyway.
- 36px hit area, 28px icons, pink on hover, 2px pink focus ring.

## PeriodTabs

The ARIA tabs pattern: arrow keys move and select (wrapping), Home and End jump to the ends, and only
the selected tab is in the Tab order.

| Prop | Default | |
| --- | --- | --- |
| `options` | required | `[{ value, label }]`, in order. |
| `modelValue` | first option | The selected `value`. Use `v-model`. |
| `label` | required | Accessible name of the tab list, e.g. "Time range". |
| `idPrefix` | none | Links tabs to panels: tab `${idPrefix}-tab-${value}` controls `${idPrefix}-panel-${value}`. |

- When the tabs switch panels, pass `idPrefix`, give each panel `id="${idPrefix}-panel-${value}"`,
  `role="tabpanel"` and `aria-labelledby="${idPrefix}-tab-${value}"`, and hide the others.
- When they only filter one view (a chart's date range), leave `idPrefix` off.
- Look: muted text, a 1px underline on hover, a 1px nudge down on press, bold pink with a 2px pink
  underline when selected. The styles are `src/vue/segments.css`, shared with `SegmentedControl`.

## SegmentedControl

A row of toggle buttons where one is pressed: filters and settings that change one view (a chart's
line, a list's filter). Each button is its own Tab stop with `aria-pressed`, the toggle-button
pattern; reach for `PeriodTabs` instead when the choice switches panels.

| Prop | Default | |
| --- | --- | --- |
| `options` | required | `[{ value, label, count?, disabled?, title?, attrs? }]`, in order. `count` shows muted after the label; `attrs` go on that button. |
| `modelValue` | none | The pressed `value`. Use `v-model`. |
| `label` | required | Accessible name of the group, e.g. "Show". |

- Every click emits, the pressed button's too, as with `PeriodTabs`: a handler can treat it as
  "go there" (the lookup's Search tab leaves a card's detail that way). Keep handlers idempotent.
- A `modelValue` no option has presses none, for "not chosen yet". Unlike `PeriodTabs`, it doesn't
  fall back to the first option.
- Other attributes (`id`, `class`) go on the group.
- Look: `PeriodTabs`' (`src/vue/segments.css`), plus a 1px nudge down on press and 45% opacity
  with a not-allowed cursor when disabled.
- In Astro it needs a `client:` directive to respond, like `PeriodTabs`.

## RankedList

A numbered top-N list: rank, name with an optional subtitle, and a count.

| Prop | Default | |
| --- | --- | --- |
| `title` | required | The heading above the list. |
| `headingLevel` | `3` | 2–6. |
| `items` | required | `[{ name, subtitle?, count, url? }]` in rank order. `count` is formatted with the reader's locale. |
| `emptyText` | `"Nothing here yet."` | Shown instead of an empty list. |
| `newTab` | `false` | Open item links in a new tab. |

- Rows reserve two lines (name and subtitle) whether or not they have a subtitle, so lists side by
  side line up row for row.
- **Footgun:** the root has `min-width: 0`. Without it, a list in a grid column grows to its longest
  name and pushes the other columns uneven.
- Items without a `url` render as plain text, not dead links.
- **Footgun:** counts use `toLocaleString()`, which differs between the server (Node's locale) and
  a reader's browser. Render it statically, or Vue reports a hydration mismatch for readers whose
  locale formats numbers differently.

## Adding a component

1. Only when at least two projects need it. Read every project's current version first.
2. If their looks differ, build both behind a temporary `look` prop, show them side by side in
   `demo/components.html`, and let christopher pick. Then delete the prop and the losing CSS before
   release.
3. Write `src/vue/<Name>.vue` with JSDoc on every prop, styles in `@layer components` with `fu-`
   classes and token values only. Export it from `src/vue/index.js`.
4. Add behaviour and server-render tests to `src/vue/components.spec.js`.
5. Document it here, `npm run build`, `npm test`, and check it in `demo/components.html`.
