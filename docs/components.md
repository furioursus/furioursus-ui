# Components

Vue 3 components shared across furioursus sites. Source in `src/vue/`, built by Vite into `dist/vue/index.js` (Vue left as an import) and `dist/vue/style.css`. `demo/components.html` shows every component from the built files.

## Using them

They need the tokens and the theme switcher, then the component styles:

```js
import "@furioursus/ui/tokens.css";      // or tailwind.css on a Tailwind site
import "@furioursus/ui/vue/style.css";
import { Pager, PeriodTabs, RankedList, SegmentedControl, ThemeToggle } from "@furioursus/ui/vue";
```

`theme.js` must still load in `<head>` (see [theming.md](theming.md)).

Vue is a peer dependency, marked optional so token-only consumers don't get it installed. A site using the components installs `vue` itself.

### In Astro

Add the integration (`npx astro add vue`), then use the components in `.astro` files. Astro renders them to HTML on the server; only components that need to react to clicks need a `client:` directive:

```astro
---
import { PeriodTabs, RankedList, ThemeToggle } from "@furioursus/ui/vue";
---
<ThemeToggle />                                            <!-- theme.js handles it; no JS shipped -->
<RankedList title="Top Albums" items={albums} newTab />   <!-- static -->
```

- `ThemeToggle` and `RankedList` need no `client:` directive. Leave it off: hydrating either ships the Vue runtime (about 30 KB gzipped) for nothing.
- **Footgun:** `PeriodTabs` does need one (`client:visible` is usually right), or it renders but doesn't respond. Hydrate only the tabs and let them show and hide server-rendered panels by id, as furioursus.dev's `ListeningStatsTabs.vue` does, rather than hydrating the panels' contents too.
- **Footgun:** `v-model` doesn't cross the Astro/Vue boundary. Wrap `PeriodTabs` and the panels it switches in one Vue component, and hydrate that.

### In a plain Vite + Vue app

Import and register as usual. Nothing else to set up.

## Styling rules

- All component CSS is inside `@layer components`. A site's own unlayered CSS, or its Tailwind utilities (in the later `utilities` layer), override it without `!important`. On a site that doesn't declare layers, any unlayered rule wins.
- Classes are prefixed `fu-` and named block/element (`fu-tabs__tab`), so they don't collide with a site's own.
- Components read only tokens (`var(--color-accent)` and so on) and never set colors of their own.
- **Every state changes shape as well as color**, because christopher has protanopia. Hover, press, selected, focus and disabled each need a cue that isn't color: an underline, inset bar, offset shadow, outline, nudge, weight or opacity. The segments show the pattern: a 1px underline on hover, a 1px nudge on press, bold with a 2px underline when selected, a 2px pink focus ring, 45% when disabled. The full state table the sites follow is in mtg-library-value-tracker's `docs/design.md` ("Interaction states").
- `test/states.test.mjs` fails when a `:hover`, `:active`, `:disabled`, `aria-disabled` or selected/pressed state in `dist/vue/style.css` changes only color properties. The components so far are borderless, after furioursus.dev's design system (no boxes, shadows or lifts), so they use an underline, a thicker stroke, a 1px nudge, bolder weight or an outline. The pink offset shadow belongs to the tracker's and sorter's boxed buttons.

## ThemeToggle

A switch (`role="switch"`, `aria-checked`) marked `data-theme-toggle`. `theme.js` handles its click and keeps `aria-checked` and `title` in sync (see [theming.md](theming.md#toggle-buttons)), so it works as static HTML. Hydrated, it follows `theme-changed` so Vue's render agrees.

- **Footgun:** don't give it a click handler; `theme.js` would switch twice.

| Prop | Default | |
| --- | --- | --- |
| `label` | `"Dark theme"` | Accessible name, read with the on/off state. |

- It renders unchecked on the server and in the first client render, then reads the real theme on mount, so hydration never mismatches. The sun/moon swap is CSS on `:root[data-theme]`, so the icon is right at first paint anyway.
- 36px hit area, 28px icons. Hover turns it pink and thickens the strokes from 1.5 to 2; press nudges it down 1px. 2px pink focus ring.

## PeriodTabs

The ARIA tabs pattern: arrow keys move and select (wrapping), Home and End jump to the ends, and only the selected tab is in the Tab order.

| Prop | Default | |
| --- | --- | --- |
| `options` | required | `[{ value, label }]`, in order. |
| `modelValue` | first option | The selected `value`. Use `v-model`. |
| `label` | required | Accessible name of the tab list, e.g. "Time range". |
| `idPrefix` | none | Links tabs to panels: tab `${idPrefix}-tab-${value}` controls `${idPrefix}-panel-${value}`. |

- When the tabs switch panels, pass `idPrefix`, give each panel `id="${idPrefix}-panel-${value}"`, `role="tabpanel"` and `aria-labelledby="${idPrefix}-tab-${value}"`, and hide the others.
- When they only filter one view (a chart's date range), leave `idPrefix` off.
- Look: muted text, a 1px underline on hover, a 1px nudge down on press, bold pink with a 2px pink underline when selected. The styles are `src/vue/segments.css`, shared with `SegmentedControl`.

## SegmentedControl

A row of toggle buttons where one is pressed: filters and settings that change one view (a chart's line, a list's filter). Each button is its own Tab stop with `aria-pressed`, the toggle-button pattern; reach for `PeriodTabs` instead when the choice switches panels.

| Prop | Default | |
| --- | --- | --- |
| `options` | required | `[{ value, label, count?, disabled?, title?, attrs? }]`, in order. `count` shows muted after the label; `attrs` go on that button. |
| `modelValue` | none | The pressed `value`. Use `v-model`. |
| `label` | required | Accessible name of the group, e.g. "Show". |

- Every click emits, the pressed button's too, as with `PeriodTabs`: a handler can treat it as "go there" (the lookup's Search tab leaves a card's detail that way). Keep handlers idempotent.
- A `modelValue` no option has presses none, for "not chosen yet". Unlike `PeriodTabs`, it doesn't fall back to the first option.
- Other attributes (`id`, `class`) go on the group.
- Look: `PeriodTabs`' (`src/vue/segments.css`), plus a 1px nudge down on press and 45% opacity with a not-allowed cursor when disabled.
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

- Rows reserve two lines (name and subtitle) whether or not they have a subtitle, so lists side by side line up row for row.
- **Footgun:** the root has `min-width: 0`. Without it, a list in a grid column grows to its longest name and pushes the other columns uneven.
- Items without a `url` render as plain text, not dead links.
- Look: a linked row's name turns pink with a 2px underline on hover, and the row nudges down 1px on press. 2px pink focus ring.
- **Footgun:** counts use `toLocaleString()`, which differs between the server (Node's locale) and a reader's browser. Render it statically, or Vue reports a hydration mismatch for readers whose locale formats numbers differently.

## Pager

Previous and next steps with "Page 2 of 5" between them. It replaces furioursus.dev's `Paginator.astro` and CardCollection's pagination bar, and the tracker's `BrowsePager.vue`.

| Prop | Default | |
| --- | --- | --- |
| `page` | required | Current page, 1-based. Use `v-model:page`. |
| `pages` | required | Number of pages. Nothing renders when it's 1 or less. |
| `prevHref`, `nextHref` | none | Passing either renders links in a `<nav>`; otherwise buttons in a `role="group"`. |
| `prevText`, `nextText` | `"Previous"`, `"Next"` | Visible text. The arrows are added beside it, spaced by a margin, and hidden from screen readers. |
| `label` | `"Pages"` | Accessible name of the nav or group. |

There are two modes:

- **Links**, for pages the server builds. They need no `client:` directive. Astro's `page` maps straight on:

  ```astro
  <Pager page={page.currentPage} pages={page.lastPage} prevHref={page.url.prev} nextHref={page.url.next} />
  ```

  At an end the missing link is left out, and the other step keeps its side.
- **Buttons**, for lists paged in the browser. Each one emits `update:page` with the page to go to. At an end the button is `aria-disabled`, not `disabled`, and ignores clicks.
  - **Footgun:** keep it that way. A `disabled` button drops focus to `<body>` when Next lands on the last page.
  - It doesn't scroll. Under a long list, scroll back to the list's top in the handler, as the tracker's `goPage(…, true)` does.

Look (christopher chose furioursus.dev's borderless one over the tracker's boxed buttons):

- A 2px pink underline on hover, with the arrow stepping 3px outward, and a 1px nudge down on press.
- 45% opacity at an end, and a 2px pink focus ring.
- The label wraps onto two lines when a phone is too narrow for all three parts, so the steps never wrap.

## Adding a component

1. Only when at least two projects need it. Read every project's current version first.
2. If their looks differ, build both behind a temporary `look` prop, show them side by side in `demo/components.html`, and let christopher pick. Then delete the prop and the losing CSS before release.
3. Write `src/vue/<Name>.vue` with JSDoc on every prop, styles in `@layer components` with `fu-` classes and token values only. Export it from `src/vue/index.js`.
4. Add behavior and server-render tests to `src/vue/components.spec.js`.
5. Document it here, `npm run build`, `npm test`, and check it in `demo/components.html`.
