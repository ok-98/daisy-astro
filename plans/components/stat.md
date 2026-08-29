# Stat Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/stat/
**Root element:** `div` (all components)
**Target files:** `packages/daisy-astro/src/components/Stat/Stats.astro`, `Stat.astro`, `StatTitle.astro`, `StatValue.astro`, `StatDesc.astro`, `StatFigure.astro`, `StatActions.astro` (only `Stat.astro` exists, as a dummy scaffold) — see §0a
**Story files:** `Stats.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/stat.css` and the doc page source. §3e lists what is **unverified**.

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

- [ ] **Step 1:** Resolve §3e.1 — blocking at both levels. Settle §3e.4 (image URLs) with the nine other plans.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Rename/replace the scaffold: `Stat.astro` becomes the **part**, and `Stats.astro` is new (§0). Create the five part components per §4, then walk the gate.
- [ ] **Step 4:** Replace `Stat.stories.ts` with `Stats.stories.ts` and add the six sub-component story files per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is a rounded, shadowed block with a small dimmed title, a large bold value and a dimmed desc; `ThreeStats` shows **dashed vertical dividers** between blocks but not after the last (§3c); `WithIconsOrImage` puts every icon at the trailing edge, vertically centred (§3a); `FigureLast` is identical (§3a); `Vertical` moves the dividers to horizontal (§3c); `Responsive` flips at `lg`; a narrow canvas makes the horizontal version **scroll** rather than wrap (§3c); `Unframed` has no shadow.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="stats[^"]*"[^>]*><div class="stat[ "]' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div class="stat"[^>]*><div class="stat-' storybook-static/astro-prerendered-stories.json | head
  ```
  Both must match — direct children at each level (§3e.1).
- [ ] **Step 7:** Update the `Stat` row in `plans/README.md` to **Implemented**, noting all seven components and the `stats`-is-the-component naming (§0).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 9 daisyUI classes reachable across seven components (§0a).
- [ ] The scaffold's `stat`-as-container mistake is corrected (§0).
- [ ] Both nesting levels render as direct children (§3e.1) — checked in the build output.
- [ ] No invented axis — no colour, size, or content props (§1, §2).
- [ ] JSDoc states: `stats` is the container (§0), the figure is column 2 wherever written (§3a), title/value/desc follow source order (§3b), the container is unframed by default and scrolls (§3c), and the responsive form is a class (§3d).
- [ ] One story per doc-page example, plus `FigureLast`, `ValueBeforeTitle` and `Unframed`.
- [ ] Every box in §4's gate ticked.
