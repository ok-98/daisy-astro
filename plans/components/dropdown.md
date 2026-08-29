# Dropdown Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/dropdown/
**Root element:** `div` by default, `details` when `method="details"` — see §3a
**Target file:** `packages/daisy-astro/src/components/Dropdown/Dropdown.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Dropdown/Dropdown.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); shared unions from `variants.ts` — **Dropdown uses none of them** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/dropdown.css` and the doc page source (`components/dropdown/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. Three methods, two of which share a wrapper

daisyUI documents three independent mechanisms, with their own structure diagrams:

| Method | Structure | Where `.dropdown` goes |
|---|---|---|
| **1. details/summary** | `<details class="dropdown"><summary class="btn">…</summary><ul class="dropdown-content">` | the wrapper |
| **2. popover + anchor positioning** | a `<button popovertarget>` and a **sibling** `<ul class="dropdown" popover id>` | **the content itself** |
| **3. CSS focus** | `<div class="dropdown"><div tabindex="0" role="button">…</div><ul tabindex="-1" class="dropdown-content">` | the wrapper |

Methods 1 and 3 are the same shape — wrapper, trigger, content — and differ only in the elements and attributes. **Method 2 has no wrapper at all**, so no single component can cover it.

**Decision: `Dropdown.astro` covers methods 1 and 3 via a `method` prop. Method 2 is documented composition with a story, not a component** (§3b). daisyUI recommends method 2 as the modern one (top layer, no `z-index` juggling, no overflow clipping), so the JSDoc points at it rather than hiding it.

## 1. Variant audit

**12 classes: 1 component + 1 part + 7 placement + 3 modifier**, matching the doc page's frontmatter. `grep -oE '\.dropdown[a-z0-9-]*' dropdown.css | sort -u` returns exactly those 12 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `dropdown` | — | — | Always applied. |
| Part | `dropdown-content` | — | — | Wrapper for the default slot. |
| Side | `dropdown-top` `dropdown-bottom` `dropdown-left` `dropdown-right` | `from` | `'top' \| 'bottom' \| 'left' \| 'right'` | Which side the content opens on. `bottom` is daisyUI's default. |
| Align | `dropdown-start` `dropdown-center` `dropdown-end` | `align` | `'start' \| 'center' \| 'end'` | Cross-axis alignment. `start` is the default. |
| Modifier | `dropdown-hover` | `hover` | `boolean` | Opens on hover **as well as** focus. |
| Modifier | `dropdown-open` `dropdown-close` | `force` | `'open' \| 'close'` | Mutually exclusive → union, so the invalid pair is unrepresentable (`plans/components/accordion.md` §1). |

**Placement is two axes, not one** — §3c. **No colour or size axis** exists **[verified]**; `w-52`, `bg-base-100`, `shadow-sm` in every example are caller classes on the content (§3d).

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `trigger` | `summary.btn` (details) / `div[tabindex=0][role=button]` (focus) | no | `open or close`, `Click to open` |
| `default` | `div.dropdown-content`… **no** — see below | no | a `<ul class="menu">` or a `<div class="card">` |

**The `dropdown-content` class goes on the caller's own element, not a wrapper this component adds.** Every doc example writes `class="menu dropdown-content …"` or `class="card card-sm dropdown-content …"` on the same element **[verified]** — the class is a positioning mixin applied to a Menu or a Card, not a box of its own. Wrapping would add a positioned div around an unpositioned menu.

So the default slot is rendered bare, and `contentClass` does not exist. The JSDoc states that slot content **must carry `dropdown-content` itself**, and every story shows it. This is the first component where a part class is the caller's responsibility; it is daisyUI's design, not an omission.

## 3. Six things the naive implementation gets wrong

### 3a. The trigger element differs by method, and `<div>` is deliberate

Method 3 uses `<div tabindex="0" role="button">`, not `<button>`. daisyUI explains why in its own info box: a WebKit bug open since 2008 prevents `<button>` from being focused on click in Safari, so the focus-based dropdown would never open. `role="button"` plus `tabindex="0"` restores the semantics.

Method 1 uses `<summary>`, and daisyUI hides its marker (`.dropdown:is(details) summary::-webkit-details-marker { display: none }` **[verified]**).

The component picks the element from `method`, so the caller cannot get this wrong — and must not "fix" the div back to a `<button>`.

The content also carries `tabindex="-1"` in method 3's examples, which keeps it in the focus-within scope without adding a tab stop. Component-emitted.

### 3b. Method 2 cannot be this component

The popover method is **two siblings with no parent**, wired by three matching identifiers:

```html
<button class="btn" popovertarget="popover-1" style="anchor-name:--anchor-1">Button</button>
<ul class="dropdown menu …" popover id="popover-1" style="position-anchor:--anchor-1">…</ul>
```

`.dropdown` is on the content, `popovertarget` must equal the content's `id`, and `anchor-name` must equal `position-anchor`. A wrapper component would have to render both siblings and invent an id — the same problem `plans/components/drawer.md` §0a solved with a required `toggleId`, except here there is nothing to wrap.

Documented as composition with a `PopoverMethod` story. If it later deserves a component, it is a `DropdownPopover` with a required `anchorId`, added deliberately.

### 3c. Placement is two independent axes

daisyUI's frontmatter lists all seven under "placement", which reads as one union. The CSS shows two **[verified]**:

```css
.dropdown { position-area: var(--anchor-v, bottom) var(--anchor-h, span-right) }
.dropdown-start  { --anchor-h: span-right }
.dropdown-center { --anchor-h: center }
.dropdown-start.dropdown-left { --anchor-h: left; --anchor-v: span-bottom }
```

and the doc page combines them freely: `dropdown-top dropdown-center`, `dropdown-bottom dropdown-end`, `dropdown-left dropdown-center`. A single union would make those seven of the twelve documented combinations unexpressible.

So **`from` (side) and `align` (cross-axis) are separate props**. Note that `align` means *horizontal* alignment for `top`/`bottom` and *vertical* for `left`/`right` — daisyUI's own example headings say so ("aligns to center of button vertically"). One JSDoc line.

### 3d. `z-index: 999` and the overflow problem are why method 2 exists

`.dropdown-content` and `.dropdown[popover]` are `z-index: 999` **[verified]**, yet every doc example *also* adds `z-1` by hand. Neither helps when an ancestor has `overflow: hidden` — a dropdown inside a Card or a Table gets clipped, and no z-index fixes that.

That is exactly what method 2 solves by rendering in the top layer. The JSDoc says: **if the dropdown is inside anything that clips, use the popover method.** Cheaper than a story, and it is the question a user will actually have.

The open/close transition uses `@starting-style` and `transition-behavior: allow-discrete` **[verified]**, both recent; without them the dropdown still works, just without animation.

### 3e. `hover` is additive, and `force` beats everything

`.dropdown-hover:hover .dropdown-content { opacity: 1; scale: 1 }` sits alongside the focus rules **[verified]** — hover does not replace click/focus, it adds to it.

`.dropdown.dropdown-close .dropdown-content` is listed first in the hide rule and every show rule is guarded with `:not(.dropdown-close)` **[verified]**, so `force="close"` wins over hover, focus and `dropdown-open` alike. `force="open"` bypasses focus but is still beaten by `close`.

daisyUI's success box notes there is no built-in close-on-click: `onclick="document.activeElement.blur()"` is its suggestion. **Not implemented here** — that is a runtime behaviour and `plans/README.md` §6 rules out a script for it. Named in the JSDoc so the answer is one line away.

### 3f. Unverified assumptions

1. **Does slot content land as a direct child?** The show/hide rules use `.dropdown .dropdown-content` (descendant) and `:focus-within` **[verified]**, so a wrapper would not break them — but `[tabindex]:first-child` in `:is(.dropdown…) > [tabindex]:first-child { pointer-events: none }` **is** structural. Check the trigger is the first child. Shared with `plans/components/aura.md` §3e.1's list, weaker here.
2. **`position-area` support.** The whole placement system is CSS anchor positioning **[verified]**; daisyUI has an `@supports not (position-area: bottom)` fallback for the popover path only. In a browser without it, wrapper-based dropdowns fall back to the plain `position: absolute` rules and should still work — confirm once.
3. **Focus-based dropdowns inside the Storybook canvas.** Method 3 closes on blur; the canvas iframe's focus handling is worth one check before filing a bug.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type DropdownMethod = 'focus' | 'details';
type DropdownFrom = 'top' | 'bottom' | 'left' | 'right';
type DropdownAlign = 'start' | 'center' | 'end';
type DropdownForce = 'open' | 'close';

interface Props extends HTMLAttributes<'div'> {
  /**
   * `focus` renders `<div tabindex="0" role="button">` — a `<button>` cannot be
   * focused on click in Safari (plan §3a). `details` renders native
   * `<details>`/`<summary>`.
   *
   * For a dropdown inside anything with `overflow: hidden`, use daisyUI's
   * popover method instead — it renders in the top layer (plan §3b, §3d).
   */
  method?: DropdownMethod;
  /** Which side the content opens on. Combines with `align` (plan §3c). */
  from?: DropdownFrom;
  /** Cross-axis alignment: horizontal for top/bottom, vertical for left/right. */
  align?: DropdownAlign;
  /** Opens on hover **in addition to** focus/click (plan §3e). */
  hover?: boolean;
  /** Forces state. `close` beats everything, including `open` (plan §3e). */
  force?: DropdownForce;
}

// Full literal class names. NEVER `dropdown-${from}` (plans/README.md §1b).
const FROM: Record<DropdownFrom, string> = {
  top: 'dropdown-top', bottom: 'dropdown-bottom',
  left: 'dropdown-left', right: 'dropdown-right',
};
const ALIGN: Record<DropdownAlign, string> = {
  start: 'dropdown-start', center: 'dropdown-center', end: 'dropdown-end',
};
const FORCE: Record<DropdownForce, string> = {
  open: 'dropdown-open', close: 'dropdown-close',
};

const { method = 'focus', from, align, hover = false, force, class: className, ...rest } = Astro.props;

const classes = [
  'dropdown',
  from && FROM[from],
  align && ALIGN[align],
  { 'dropdown-hover': hover },
  force && FORCE[force],
  className,
];
---

{
  method === 'details' ? (
    <details class:list={classes} {...rest}>
      <summary><slot name="trigger" /></summary>
      {/* Slot content must carry `dropdown-content` itself (plan §2). */}
      <slot />
    </details>
  ) : (
    <div class:list={classes} {...rest}>
      {/* `div` + role, not `button` — Safari cannot focus buttons on click (plan §3a). */}
      <div tabindex="0" role="button"><slot name="trigger" /></div>
      <div tabindex="-1" style="display:contents"><slot /></div>
    </div>
  )
}
```

The `display: contents` wrapper in the focus branch carries `tabindex="-1"` without becoming a box — confirm it does not disturb `:first-child` (§3f.1); if it does, drop it and document that the caller puts `tabindex="-1"` on their content element alongside `dropdown-content`.

No `<script>`: all three methods are CSS or native HTML (§3e).

### Astro idioms gate

- [ ] Content arrives via `trigger` + default slots; the default slot is **not** wrapped in a `dropdown-content` div (§2).
- [ ] Trigger element follows `method`: `<summary>` or `<div tabindex="0" role="button">` — never a `<button>` (§3a).
- [ ] No `<script>` added; no close-on-click behaviour invented (§3e).
- [ ] `...rest` spread onto the root in both branches.
- [ ] `from` and `align` are separate props (§3c).
- [ ] No `as` prop — the root follows `method`.
- [ ] No variant prop collides with a native attribute: `open` is not used as a prop name (it is `force`), avoiding the `<details open>` clash.
- [ ] Every variant class is a literal in a `Record` map or object key — no `` `dropdown-${x}` ``.
- [ ] Probe (§5c):
  ```astro
  <Dropdown><Fragment slot="trigger">Open</Fragment><ul class="dropdown-content menu">…</ul></Dropdown>
  <Dropdown method="details" from="top" align="end" hover force="open">ok</Dropdown>
  <Dropdown from="upward">must error — not a side</Dropdown>
  <Dropdown color="primary">must error — no colour axis (§1)</Dropdown>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `DetailsMethod`, `PopoverMethod` (raw markup, §3b), `FocusMethod`, then the placement grid — `AlignStart`, `AlignEnd`, `AlignCenter`, `FromTop`, `TopCenter`, `TopEnd`, `FromBottom`, `BottomCenter`, `BottomEnd`, `FromLeft`, `LeftCenter`, `LeftEnd`, `FromRight`, `RightEnd`, `RightCenter` — then `OnHover`, `ForceOpen`, `ForceClose`, `CardAsDropdown`, `InNavbar`, `HelperDropdown`.

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`ClippedByOverflow`** — a focus dropdown inside an `overflow-hidden` box beside a popover one, making §3d's real-world failure and its fix visible in one screenshot.
- **`ForceCloseBeatsOpen`** — `force="close"` with `hover`, demonstrating §3e's precedence.

Every story needs vertical room (`mb-32` / `mt-32` in the doc examples) or the content is clipped by the canvas — a comment says so, the same containment note as `plans/components/dock.md` §5.

## 6. Steps

- [ ] **Step 1:** Resolve §3f.1 (`[tabindex]:first-child` vs the `display:contents` wrapper) — it decides §4's focus branch.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate.
- [ ] **Step 4:** Replace `Dropdown.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: focus method opens on click and closes on blur; details method opens with **no disclosure triangle**; all 12 placement combinations point where their name says; `hover` opens without a click; `force="close"` refuses to open even on hover; `ClippedByOverflow` shows the clipping and the popover fix.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="dropdown[^"]*"[^>]*><div tabindex="0" role="button">' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Dropdown` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 12 daisyUI classes reachable; `dropdown-content` documented as caller-applied (§2).
- [ ] `method` picks the right trigger element, and the focus method uses `div[role=button]` (§3a).
- [ ] `from` and `align` are independent, and all 12 documented combinations render (§3c).
- [ ] `force="close"` beats `hover` and `force="open"` (§3e).
- [ ] Method 2 is documented and storied, not componentised (§3b).
- [ ] JSDoc states the overflow/top-layer tradeoff (§3d) and that close-on-click is the caller's (§3e).
- [ ] No invented axis — no colour, no size, no `contentClass` (§2).
- [ ] One story per doc-page example, plus `ClippedByOverflow` and `ForceCloseBeatsOpen`.
- [ ] Every box in §4's gate ticked.
