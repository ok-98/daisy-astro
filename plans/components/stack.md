# Stack Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/stack/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Stack/Stack.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Stack/Stack.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/stack.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. A 5×5 grid where three children get three different grid areas

```css
.stack { display:inline-grid;
         grid-template-rows: 3px 4px 1fr 4px 3px;
         grid-template-columns: 3px 4px 1fr 4px 3px }
.stack > * { width:100%; height:100%;
             &:first-child      { z-index:3; }
             &:nth-child(2)     { z-index:2; opacity:.9 }
             &:nth-child(n+2)   { opacity:.7 } }

:is(.stack, .stack.stack-bottom) > * { grid-area:3/3/6/4;
  &:nth-child(2) { grid-area:2/2/5/5 } &:first-child { grid-area:1/1/4/6 } }
.stack.stack-top   > * { grid-area:1/3/4/4; &:nth-child(2){grid-area:2/2/5/5} &:first-child{grid-area:3/1/6/6} }
.stack.stack-start > * { grid-area:3/1/4/4; &:nth-child(2){grid-area:2/2/5/5} &:first-child{grid-area:1/3/6/6} }
.stack.stack-end   > * { grid-area:3/3/4/6; &:nth-child(2){grid-area:2/2/5/5} &:first-child{grid-area:1/1/6/4} }
```

**[all verified]**. The 3 px / 4 px tracks are the peeking offsets, and each modifier reassigns three grid areas so the pile leans a different way.

Two things fall straight out and are the whole plan: **only the first three children are individually positioned** (§3a), and **the first child is the front one** (§3b).

## 1. Variant audit

**5 classes: 1 component + 4 modifier**, matching the doc page's frontmatter. `grep -oE '\.stack[a-z0-9-]*' stack.css | sort -u` returns exactly those 5 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `stack` | — | — | Always applied. |
| Direction | `stack-top` `stack-bottom` `stack-start` `stack-end` | `direction` | `'top' \| 'bottom' \| 'start' \| 'end'` | Mutually exclusive → union. `bottom` is the default and is still emittable (`:is(.stack, .stack.stack-bottom)` **[verified]**). |

**No colour or size axis** — none exists **[verified]**. Sizing is `w-*`/`h-*`/`size-*` on the container, which daisyUI's own info box calls out (§3c).

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — direct children of `.stack` | no | 3 divs, 3 `<img>`s, or 3 Cards |

Single default slot, no gating.

**No `items` array prop**: every example stacks a different kind of thing — coloured divs, images, whole Cards with bodies and titles.

## 3. Five things the naive implementation gets wrong

### 3a. Only three children are positioned; the rest pile onto the third

There are rules for `:first-child`, `:nth-child(2)` and the shared `> *` (which the third and later children fall through to) **[verified]** — there is no `:nth-child(4)` rule.

So a fourth, fifth and sixth child all land in the **same grid area as the third**, at `opacity: .7`, exactly on top of one another. The stack looks like three cards no matter how many you pass.

That is not a cap in the `display: none` sense of `plans/components/fab.md` §3d or `plans/components/hover-gallery.md` §3b — the extra children render, they are just indistinguishable. Every doc example uses exactly three **[verified]**.

The JSDoc says "three visible layers"; `FourChildren` (§5) shows what a fourth does.

### 3b. The **first** child is the front of the pile

`:first-child { z-index: 3 }` and the largest grid area; `:nth-child(2)` gets `z-index: 2; opacity: .9`; later children `opacity: .7` **[verified]**.

So the stack reads **front to back in source order** — the opposite of the usual "later elements paint on top" instinct, and the opposite of `plans/components/hero.md` §3d, where order was irrelevant.

Consequence worth stating: to add a card to the top of the pile, prepend it. For a notifications stack (the page's last example), the newest goes first.

### 3c. It has no size, and every child is stretched to fill it

`.stack` is `inline-grid` with no width or height **[verified]**, and `.stack > * { width: 100%; height: 100% }` **[verified]** forces every child to the container's box.

daisyUI's own info box says it plainly: *"You can use `w-*` and `h-*` classes to set the width and height of the stack, making all items the same size."*

Two consequences:

- **A `<Stack>` with no size classes** collapses to the tallest natural child — the last three doc examples rely on that for Cards, while the first three set `h-20 w-32`, `w-48` or `size-28` **[verified]**. Both work; the JSDoc says which is which.
- **Children cannot size themselves.** A child's own `w-*` is overridden by the `width: 100%` rule. That is what makes the pile look like one object.

### 3d. `stack-bottom` is the default *and* an explicit class

`:is(.stack, .stack.stack-bottom)` **[verified]** — the base and the modifier share one rule block, so `direction="bottom"` emits a class that changes nothing. Correct, and worth keeping for the same reason `md` sizes are kept elsewhere: the default should be expressible.

Note the modifier names describe **where the stack leans**, not where the front card sits: `stack-top` puts the peeking edges above, which means the *first* child (the front one) moves to the bottom of the group **[verified from the grid areas]**. Easy to read backwards; one JSDoc line, and `Directions` (§5) shows all four together.

### 3e. Unverified assumptions

1. **Do slot children land as direct children?** Blocking. Every rule is `.stack > *` with `:nth-child` positions **[verified]** — a wrapper becomes the single first child and there is no stack at all, just one full-size box. Twenty-fifth plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with Avatar, Card, Carousel, Diff, Hero, List, Mask and Phone Mockup.
3. **Cross-component composition** — four of the seven examples stack Cards. Raw markup until `plans/components/card.md` is implemented.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type StackDirection = 'top' | 'bottom' | 'start' | 'end';

/**
 * Piles its children on top of each other with a peeking offset.
 *
 * **The first child is the front of the pile** — source order runs front to
 * back, so prepend to add on top (plan §3b).
 *
 * Only the first three children get their own position; a fourth and beyond
 * land exactly on the third (plan §3a).
 *
 * Every child is stretched to the container, so size the `Stack` —
 * `class="size-28"` — not the children (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {
  /**
   * Which way the pile leans. `bottom` is daisyUI's default. Note the name is
   * the direction of the peeking edges, not of the front card (plan §3d).
   */
  direction?: StackDirection;
}

// Full literal class names. NEVER `stack-${direction}` (plans/README.md §1b).
const DIRECTION: Record<StackDirection, string> = {
  top: 'stack-top', bottom: 'stack-bottom',
  start: 'stack-start', end: 'stack-end',
};

const { direction, class: className, ...rest } = Astro.props;
---

<div class:list={['stack', direction && DIRECTION[direction], className]} {...rest}>
  <slot />
</div>
```

No `<script>`: pure CSS. Not polymorphic — daisyUI documents `stack` on a wrapper `div`.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `items` prop (§2).
- [ ] `<slot />` has no wrapper — a wrapper collapses the stack to one box (§3e.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root is `div`; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] No invented axis — no `color`, `size` or `count` prop (§1, §3c).
- [ ] Every variant class is a literal in a `Record` map — no `` `stack-${direction}` ``.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only, `astro-jsx.d.ts:1186`) **[verified]**.
- [ ] Probe (§5c):
  ```astro
  <Stack class="size-28"><div>A</div><div>B</div><div>C</div></Stack>
  <Stack direction="top" id="x" data-test="y">ok</Stack>
  <Stack direction="middle">must error — not a direction</Stack>
  <Stack color="primary">must error — no colour axis (§1)</Stack>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `ThreeDivs`, `StackedImages`, `StackedCards`, `TopDirection`, `StartDirection`, `EndDirection`, `CardsWithShadow`, `NotificationCards`.

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`Directions`** — all four side by side, since the page shows three of them in separate sections and never `bottom` explicitly (§3d).
- **`FourChildren`** — four cards, where the fourth is invisible behind the third (§3a).
- **`ChildTriesToSize`** — a child with its own `w-16`, overridden by the container (§3c).

## 6. Steps

- [ ] **Step 1:** Resolve §3e.1 (direct children) — blocking, and total: a wrapper leaves no stack at all. Settle §3e.2 (image URLs) with the eight other plans.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate.
- [ ] **Step 4:** Replace `Stack.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `ThreeDivs` shows three offset layers with the **first** on top (§3b); `Directions` leans four different ways (§3d); `FourChildren` still looks like three (§3a); `ChildTriesToSize` ignores the child's width (§3c); `NotificationCards` sizes itself from the cards with no `w-*` (§3c).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="stack[^"]*"[^>]*><div' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Stack` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 5 daisyUI classes reachable: base and 4 directions.
- [ ] Children render as direct children (§3e.1) — checked in the build output.
- [ ] No invented axis — no colour, size or count prop.
- [ ] JSDoc states: first child is the front (§3b), only three layers are distinct (§3a), size the container not the children (§3c), and what the direction names mean (§3d).
- [ ] One story per doc-page example, plus `Directions`, `FourChildren` and `ChildTriesToSize`.
- [ ] Every box in §4's gate ticked.
