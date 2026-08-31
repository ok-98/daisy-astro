# Stat Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/stat/
**Root element:** `div` (all components)
**Target files:** `packages/daisy-astro/src/components/Stat/Stats.astro`, `Stat.astro`, `StatTitle.astro`, `StatValue.astro`, `StatDesc.astro`, `StatFigure.astro`, `StatActions.astro` (only `Stat.astro` exists, as a dummy scaffold) — see §0a
**Story files:** `Stats.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/stat.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). Seven components — the most in the library — and 12 stories in **one** file rather than §5's seven (§3g). §3e.1 is answered at both levels (§8). One behaviour §3 missed is recorded as §3f, and §4's probe carried a line that cannot error (§3g). Step 5 (visual pass) is open.
---

## 0. The component is `stats`; `stat` is a part

daisyUI's frontmatter is explicit **[verified]**: `stats` is the **component**, and `stat`, `stat-title`, `stat-value`, `stat-desc`, `stat-figure` and `stat-actions` are all **parts**. The doc page, the repo directory and this library's checklist all call it "Stat" — singular — which is the name of the *inner* block.

That naming inversion is worth stating once, because the scaffold got it wrong:

```astro
<div class:list={['stat', className]}>   <!-- this is the part, not the container -->
```

A `<div class="stat">` with no `.stats` around it renders a padded grid with no rounding, no dashed divider and no scroll container — plausible, and not what the page shows.

### 0a. Seven files

| File | Class | Why it earns one |
|---|---|---|
| `Stats.astro` | `stats` | the container; owns `direction` (§1) |
| `Stat.astro` | `stat` | one block; a two-column grid (§3a) |
| `StatTitle.astro` | `stat-title` | column 1 |
| `StatValue.astro` | `stat-value` | column 1 |
| `StatDesc.astro` | `stat-desc` | column 1 |
| `StatFigure.astro` | `stat-figure` | **column 2**, spanning three rows (§3a) |
| `StatActions.astro` | `stat-actions` | column 1 |

Seven is the most in the library, beating Card's four. Each carries a real class with real rules **[verified]**, so they pass the same test as `CardBody` (`plans/components/card.md` §0a) — and named slots would be worse here, because the doc examples reorder title/value/desc freely (§3b).

The directory stays `Stat/` per `plans/README.md` §3b (one directory per daisyUI component), with `Stats.astro` inside it — the same dir-name-vs-class divergence documented in `plans/components/browser-mockup.md` §0.

## 1. Variant audit

**9 classes: 1 component + 6 part + 2 direction**, matching the doc page's frontmatter. `grep -oE '\.stats?[a-z0-9-]*' stat.css | sort -u` returns exactly those 9 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `stats` | — | — | `Stats` | Always applied. |
| Part | `stat` `stat-title` `stat-value` `stat-desc` `stat-figure` `stat-actions` | — | — | one each | §0a |
| Direction | `stats-horizontal` `stats-vertical` | `direction` | `'horizontal' \| 'vertical'` | `Stats` | Mutually exclusive → union. `horizontal` is the default and still emittable. Responsive form is a caller class — §3d. |

**No colour or size axis** — none exists **[verified]**. `text-primary` on a value, `shadow` and `border border-base-300` on the container are all caller Tailwind (§3c).

## 2. Slots

Every component takes a **single plain default slot**, no gating.

| Component | Slot content in daisyUI's examples |
|---|---|
| `Stats` | one or more `Stat`s |
| `Stat` | title, value, desc, optionally a figure and actions — **in any order** (§3b) |
| the five parts | text, an `<svg>`, an `Avatar`, or `Button`s |

**No `items` array prop on `Stats`**, and no `title`/`value`/`desc` props on `Stat`: the parts carry their own colour classes, hold arbitrary markup (an Avatar in one example **[verified]**), and appear in different orders.

## 3. Five things the naive implementation gets wrong

### 3a. Each `stat` is a two-column grid, and only the figure uses column 2

```css
.stat { display:inline-grid; grid-template-columns:repeat(1,1fr); column-gap:1rem;
        width:100%; padding-block:1rem; padding-inline:1.5rem }
.stat-figure  { grid-row:1/span 3; grid-column-start:2; place-self:center flex-end }
.stat-title   { grid-column-start:1; font-size:.75rem; color:…60% }
.stat-value   { grid-column-start:1; font-size:2rem; font-weight:800 }
.stat-desc    { grid-column-start:1; font-size:.75rem; color:…60% }
.stat-actions { grid-column-start:1 }
```

**[all verified]**. Five of the six parts stack in column 1; `stat-figure` is pulled to column 2, centred vertically across three rows and pushed to the trailing edge.

Two consequences:

- **The figure's position is fixed regardless of where it appears in the source.** The doc examples put it first **[verified]**, but it would render identically last. That is why `Stat` needs no named slots (§0a).
- **`grid-template-columns: repeat(1, 1fr)`** declares only one column; the figure's `grid-column-start: 2` creates an implicit second track. So a stat with no figure is genuinely one column wide, and adding a figure widens it — worth knowing when several stats sit side by side and only some have figures.

### 3b. The order of title / value / desc is the caller's, and the doc page varies it

Two of the three stats in the "icons or image" example are title → value → desc; the third is **value → title → desc** **[verified]**.

Since all three are `grid-column-start: 1` with no row assignment, they flow in source order — so the caller controls it, and a component that fixed the order via named slots would break that example outright. Recorded because "why is my description above the number" has exactly one cause.

### 3c. `stats` has no background, no shadow, and no width

`.stats` sets `border-radius`, `display: inline-grid`, `grid-auto-flow: column`, `position: relative` and `overflow-x: auto` **[verified]** — nothing else.

Every doc example adds `shadow`, or `bg-base-100 border border-base-300` **[verified]**. So a bare `<Stats>` is an unframed row of blocks with a dashed divider between them — correct, not broken, and the same shape as `plans/components/browser-mockup.md` §3b and `plans/components/navbar.md` §3d.

`inline-grid` means it shrinks to its content rather than filling; `overflow-x: auto` means a wide row **scrolls** rather than wrapping — which is the behaviour to expect on mobile, and the reason the vertical direction exists.

The dashed divider is `.stat:not(:last-child) { border-inline-end: … dashed }` **[verified]**, flipped to `border-block-end` under `stats-vertical` **[verified]** — so direction changes which edge is drawn, automatically.

### 3d. The responsive form is a caller class

The page's last direction example is `stats-vertical lg:stats-horizontal` **[verified]** — vertical on mobile, horizontal on desktop, which is the layout most dashboards want given §3c's horizontal scrolling.

Caller class, the library's standing answer (`plans/components/card.md` §3e), and the fourth component where the prop is the less useful form after `plans/components/footer.md` §3b, `plans/components/drawer.md` §3d and `plans/components/menu.md` §3e.

### 3f. Every text part is `white-space: nowrap`

**Found while implementing, 2026-08-31**, and missed by §3a's listing, which
quoted the grid properties and dropped this one:

```css
.stat-title, .stat-value, .stat-desc, .stat-actions { white-space: nowrap }
```

**[verified]** in `stat.css`. Four of the six parts — everything except
`stat-figure` and the `stat` block itself. So a long title does not wrap onto a
second line: it widens the block, and since `.stats` is
`overflow-x: auto` (§3c) a row of them starts **scrolling** rather than
reflowing. That is the mechanism behind the horizontal-scroll behaviour §3c
describes, and the reason the vertical direction exists.

Nothing to do about it in the components — it is daisyUI's intent, and
`class="whitespace-normal"` overrides it per part. Recorded because "my stat
title is cut off" and "my dashboard scrolls sideways" are the same fact.

### 3g. Two corrections to §4 and §5

**Found while implementing, 2026-08-31.**

1. **§4's probe line `<Stats color="primary">` cannot error.** `color` is a
   native HTML attribute, so it is in `HTMLAttributes<'div'>` and every
   component in this library accepts it — which `plans/README.md` §5c already
   records as a trap, and this plan walked straight into it. The probe used
   `direction="sideways"` (rejected by the union) and an invented prop name
   instead; both errored, so the two things the line was meant to prove are
   proven.
2. **§5's seven story files are one.** The six parts are one-class wrappers
   with no props of their own, so a `Playground` + `Passthrough` each would be
   six files of boilerplate asserting what one nested `Passthrough` asserts
   better. Same call Card made against the same instruction in its own §5
   (`plans/components/card.md` §5 asks for per-part files; `Card.stories.ts` is
   the only file that exists), and for the same reason. `Passthrough` here
   forwards through the container, the block and all five parts at once (§8).

### 3e. Unverified assumptions

1. **Do `Stat`s land as direct children of `.stats`?** Blocking. `.stat:not(:last-child)` draws the divider and `grid-auto-flow: column` places the blocks **[verified]** — a wrapper becomes the single grid item and every divider disappears. Likewise inside a `Stat`, the parts' `grid-column-start` values need them to be direct children. Twenty-sixth plan touching the shared question in `plans/components/aura.md` §3e.1 — blocking at **both** levels here.
2. **Cross-component composition** — the examples use `avatar avatar-online` and `btn btn-xs`. Raw markup until those are implemented.
3. **Slot sanitization vs inline `<svg>`** — six icons across the examples. Shared with `plans/components/alert.md` §3d.1.
4. **Do the doc page's `img.daisyui.com` URLs load in the sandbox?** One avatar image. Shared with the nine other plans.

## 4. Component implementation

### `Stats.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type StatsDirection = 'horizontal' | 'vertical';

/**
 * Container for one or more `Stat` blocks. daisyUI calls **this** the
 * component; `stat` is a part (plan §0).
 *
 * No background or shadow of its own — `class="shadow"` or
 * `class="bg-base-100 border border-base-300"` is what the examples add
 * (plan §3c). It scrolls horizontally rather than wrapping.
 *
 * For the usual dashboard layout use the responsive class rather than the
 * prop: `class="stats-vertical lg:stats-horizontal"` (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Also decides which edge the dashed divider is drawn on (plan §3c). */
  direction?: StatsDirection;
}

// Full literal class names. NEVER `stats-${direction}` (plans/README.md §1b).
const DIRECTION: Record<StatsDirection, string> = {
  horizontal: 'stats-horizontal', vertical: 'stats-vertical',
};

const { direction, class: className, ...rest } = Astro.props;
---

<div class:list={['stats', direction && DIRECTION[direction], className]} {...rest}>
  <slot />
</div>
```

### `Stat.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * One block. A two-column grid: `StatFigure` is pinned to column 2 and centred
 * across the rows, everything else stacks in column 1 **in source order** — so
 * title/value/desc can be arranged however you like (plan §3a, §3b).
 *
 * `class="place-items-center"` centres the whole block, as the doc page's
 * "centered items" example does.
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['stat', className]} {...rest}>
  <slot />
</div>
```

### The five part components

Identical one-class wrappers over `stat-title`, `stat-value`, `stat-desc`, `stat-figure` and `stat-actions`, each with a `div` root, a plain default slot and `HTMLAttributes<'div'>`. `StatFigure`'s JSDoc notes it lands in column 2 wherever it is written (§3a); `StatValue`'s notes that colour is a caller class (`class="text-primary"`).

No `<script>` anywhere: pure CSS. None is polymorphic — daisyUI documents all seven on a `div`.

### Astro idioms gate

- [ ] Content arrives via plain default slots in all seven — no `items`/`title`/`value` props (§2).
- [ ] `<slot />` has no wrapper in `Stats` or `Stat` — both levels are grids (§3e.1).
- [ ] No `Astro.slots.has()` gating anywhere.
- [ ] Roots are `div` in all seven; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in all seven.
- [ ] No invented axis — no colour, no size (§1, §3c).
- [ ] Every variant class is a literal in a `Record` map — no `` `stats-${direction}` ``.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only, `astro-jsx.d.ts:1186`) **[verified]**.
- [ ] Probe (§5c):
  ```astro
  <Stats class="shadow"><Stat><StatTitle>Views</StatTitle><StatValue>89,400</StatValue></Stat></Stats>
  <Stats direction="vertical" class="lg:stats-horizontal" id="x" data-test="y">ok</Stats>
  <Stat class="place-items-center">ok</Stat>
  <Stats color="primary">must error — no colour axis (§1)</Stats>
  <Stat title="Views">must error — parts are components (§2)</Stat>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Seven files. Doc-page examples in page order (`plans/README.md` §8), all in `Stats.stories.ts`: `Default`, `WithIconsOrImage`, `ThreeStats`, `CenteredItems`, `Vertical`, `Responsive`, `WithCustomColorsAndButton`.

Plus `Playground` and `Passthrough`; each of the six sub-components gets a `Playground` + `Passthrough`.

Three beyond the doc page:

- **`FigureLast`** — a `StatFigure` written after the desc, rendering identically to `WithIconsOrImage` (§3a).
- **`ValueBeforeTitle`** — the third stat from the icons example on its own, since that ordering is easy to miss (§3b).
- **`Unframed`** — no `shadow` or border, showing §3c's bare container.

## 6. Steps

- [x] **Step 1: done for §3e.1, which was blocking at both levels.** The build shows `.stats > .stat` in all 12 stories and `.stat > .stat-*` in all 27 blocks — a wrapper at either level would have cost every dashed divider or every column assignment. §3e.2 is discharged by composing the real `Avatar` and `Button`; §3e.3 is moot (sanitization off library-wide, and the six icons render); §3e.4 stays with the other plans.
- [x] **Step 2: skipped as planned.** `direction` is local to this component; `variants.ts` untouched.
- [x] **Step 3: done.** The scaffold's single file became seven per §0a, with `Stats.astro` new. Gate walked — see §3g.1 for the one probe line that had to be rewritten before it could prove anything.
- [x] **Step 4: done, in one file rather than seven** (§3g.2). `Stats.stories.ts`, 12 stories, composing the real `Avatar` and `Button`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default` is a rounded shadowed block, small dimmed title, large bold value, dimmed desc; `ThreeStats` shows **dashed vertical dividers between blocks and none after the last** (§3c); every icon sits at the trailing edge, vertically centred (§3a); **`FigureLast`'s two blocks are identical** despite the source order differing (§3a); `ValueBeforeTitle`'s two differ (§3b); `Vertical` moves the dividers to horizontal; `Responsive` flips at `lg`; a narrow canvas makes a horizontal row **scroll rather than wrap** (§3c, §3f); and `Unframed` has no shadow at all.
- [x] **Step 6: done — forwarding confirmed at three levels in one story.** `Passthrough` renders `<div class="stats stats-horizontal mine shadow" id="stats-1" data-test="yes" style="letter-spacing:1px">` around a marked `stat` around five marked parts. Full output in §8.
- [x] **Step 7: done — the `Stat` row in `plans/README.md` says Implemented**, noting all seven components and the naming inversion.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 9 daisyUI classes reachable across seven components (§0a).
- [x] The scaffold's `stat`-as-container mistake is corrected (§0).
- [x] Both nesting levels render as direct children (§3e.1) — checked in the build output.
- [x] No invented axis — no colour, size, or content props (§1, §2).
- [x] JSDoc states: `stats` is the container (§0), the figure is column 2 wherever written (§3a), title/value/desc follow source order (§3b), the container is unframed by default and scrolls (§3c), and the responsive form is a class (§3d).
- [x] One story per doc-page example, plus `FigureLast`, `ValueBeforeTitle` and `Unframed`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG elided. `astro check`: 187 files, 0 errors, 0 warnings, 0 hints.

```
FigureLast  → <div class="stats shadow">
                <div class="stat"><div class="stat-figure text-primary">SVG</div>
                  <div class="stat-title">Figure first</div>…</div>
                <div class="stat"><div class="stat-title">Figure last</div>
                  <div class="stat-value text-primary">25.6K</div>
                  <div class="stat-desc">…</div>
                  <div class="stat-figure text-primary">SVG</div></div></div>
                                     ↑ written last, rendered in the same place
Passthrough → <div class="stats stats-horizontal mine shadow" id="stats-1" data-test="yes"
                style="letter-spacing:1px"><div class="stat stat-marker" id="stat-1"
                data-test="block"><div class="stat-figure text-primary figure-marker" id="fig-1">SVG</div>
                <div class="stat-title title-marker" id="title-1">Passthrough</div>
                <div class="stat-value value-marker" id="value-1">89,400</div>…
```

Counts across the 12 stories:

```
stats containers      12   → .stats > .stat direct child   12
stat blocks           27   → .stat  > .stat-* direct child 27
title 27 | value 27 | desc 25 | figure 9 | actions 3
stats-vertical 2 | stats-horizontal 2 (1 of them lg:)
```

What this settles:

- **§3e.1, at both levels, which was blocking.** 12 of 12 containers hold a `stat` as a direct child and 27 of 27 blocks hold their parts directly. The dashed divider is `.stat:not(:last-child)` and the parts are placed by `grid-column-start` — one wrapper at the container level would have erased every divider, one inside a block would have dropped the figure out of column 2.
- **§3a, demonstrably**: `FigureLast`'s second block writes the figure after the desc and renders it in the same position as the first block's. Source order does not move it.
- **§3b holds in the doc example itself**: the icons story's third block is value → title → desc, which named slots would have silently reordered.
- **All 9 classes have rules in the built stylesheet** — `.stats`, `.stat`, the five parts and both directions.
- The figure of the third block is a real `Avatar` (`div.avatar.avatar-online > div.w-16`), and `StatActions` holds real `Button`s — §3e.2's raw-markup fallback is discharged, none left in this component.

Not settled here: the dividers, the trailing-edge centring, the `lg` flip and the horizontal scroll. All Step 5.
