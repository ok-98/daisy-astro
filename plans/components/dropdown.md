# Dropdown Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/dropdown/
**Root element:** `div` by default, `details` when `method="details"` — see §3a
**Target file:** `packages/daisy-astro/src/components/Dropdown/Dropdown.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Dropdown/Dropdown.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); shared unions from `variants.ts` — **Dropdown uses none of them** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/dropdown.css` and the doc page source (`components/dropdown/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01). `Dropdown.astro` and 28 stories. **§3f.1 is answered against §4** — the `display: contents` wrapper it proposed would have broken two sibling rules, so the slot is rendered bare (§3h). §4 was also missing a `triggerClass`, without which not one of the 24 doc examples can be reproduced (§3g). Both were caught by reading the CSS and the examples before writing code, which is what §6 Step 1 asked for. Step 5 (visual pass) is open, and it carries all 12 placements.
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

### 3g. The trigger needs a class prop — correction to §4

**Found while implementing, 2026-09-01.** §4 renders the trigger as
`<summary>` or `<div tabindex="0" role="button">` with no way to class it, and
**every one of the doc page's 24 examples puts a class there**:

```html
<summary class="m-1 btn">open or close</summary>
<div tabindex="0" role="button" class="m-1 btn">Click to open</div>
<div tabindex="0" role="button" class="btn btn-ghost rounded-field">Dropdown</div>
<div tabindex="0" role="button" class="btn btn-circle btn-ghost btn-xs text-info">…</div>
```

The trigger is the visible control; unclassed it is bare text. So `Dropdown`
takes a **`triggerClass`**.

Fourth component in a row where §4 could not reproduce a doc example without
one more class prop for an element the caller cannot reach — after
`plans/components/fab.md` §3g, `plans/components/collapse.md` §3h and
`plans/components/drawer.md` §3i, whose §3i states the check that found this
one first time: **when a component renders an element on the caller's behalf,
read every doc example for a class on that element before deciding it needs no
prop.**

### 3h. §3f.1 resolved: no wrapper, and none was needed — correction to §4

§4 proposed wrapping the default slot in
`<div tabindex="-1" style="display:contents">`, with a note to confirm it does
not disturb `:first-child`. **It does worse than that**, and the CSS says so
before any browser has to:

```css
.dropdown > :not(:has(~ [class*=dropdown-content])):focus { outline-style: none }
.dropdown.dropdown-hover:not(:hover) [tabindex]:first-child:focus:not(:focus-visible)
  ~ .dropdown-content { display: none; opacity: 0 }
```

**[verified]** — both are **sibling** selectors between the trigger and the
content. `display: contents` affects layout, not selector matching, so any
wrapper makes the content stop being the trigger's sibling: the first rule
would strip the trigger's focus outline (its guard can no longer see a
`dropdown-content` sibling), and the second would stop a hover dropdown hiding
correctly after a mouse click.

**So the default slot is rendered bare in both branches**, and the `tabindex`
§4 wanted to put on the wrapper goes on the caller's own content element —
which is what daisyUI's examples do anyway, and which cannot be defaulted
because the value varies: `-1` for a menu panel, `0` for a card panel
**[verified across examples 3 and 22]**.

That makes §2's rule stronger rather than weaker: the caller's element carries
`dropdown-content` **and** its `tabindex`, and this component adds nothing
around it.

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

- [x] **Step 1: done, and it changed §4** — which is what this step exists for. §3f.1's answer is §3h: the `display: contents` wrapper had to go, because two of daisyUI's rules are sibling selectors between the trigger and the content. Reading the examples for the same question also produced §3g. §3f.2 (`position-area` support) and §3f.3 (focus inside the canvas iframe) are browser questions and move to Step 5.
- [x] **Step 2: skipped as planned.** All four unions local; `variants.ts` untouched.
- [x] **Step 3: done, with §3g's added prop and §3h's removed wrapper.** Gate walked; the probe errored on all five intended lines, including `method="popover"` — the method this component deliberately does not cover.
- [x] **Step 4: done.** `Dropdown.stories.ts`, 28 stories: 24 doc-page examples plus `Playground`, `Passthrough`, `ClippedByOverflow` and `ForceCloseBeatsOpen`. Two of them are raw popover markup on purpose (§3b).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and a mouse.** Verify: `FocusMethod` opens on click and closes on blur (§3f.3 — check the canvas iframe before filing a bug); `DetailsMethod` opens with **no disclosure triangle**; **all 12 placement stories point where their names say**, remembering that `align` is horizontal for top/bottom and vertical for left/right (§3c); `OnHover` opens without a click and still opens on one; `ForceClose` refuses; **`ForceCloseBeatsOpen`'s second dropdown stays shut under the mouse** (§3e); and **`ClippedByOverflow` shows the clipped panel beside the popover one that escapes** (§3d).
- [x] **Step 6: done — forwarding confirmed, and the sibling structure asserted.** `Passthrough` renders `<div class="dropdown dropdown-top dropdown-end dropdown-hover dropdown-open mine mt-32" id="dropdown-1" data-test="yes" style="letter-spacing:1px">` with `trigger-marker` on the trigger and the panel as its next sibling. Full output in §8.
- [x] **Step 7: done — the `Dropdown` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 12 daisyUI classes reachable; `dropdown-content` documented as caller-applied (§2).
- [x] `method` picks the right trigger element, and the focus method uses `div[role=button]` (§3a).
- [x] `from` and `align` are independent, and all 12 documented combinations render (§3c).
- [x] `force="close"` beats `hover` and `force="open"` (§3e).
- [x] Method 2 is documented and storied, not componentised (§3b).
- [x] JSDoc states the overflow/top-layer tradeoff (§3d) and that close-on-click is the caller's (§3e).
- [x] No invented axis — no colour, no size, no `contentClass` (§2).
- [x] One story per doc-page example, plus `ClippedByOverflow` and `ForceCloseBeatsOpen`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 196 files, 0 errors, 0 warnings, 0 hints.

```
Passthrough → <div class="dropdown dropdown-top dropdown-end dropdown-hover dropdown-open mine mt-32"
                id="dropdown-1" data-test="yes" style="letter-spacing:1px">
                <div tabindex="0" role="button" class="m-1 btn trigger-marker">Passthrough</div>
                <ul class="menu dropdown-content z-1 bg-base-100 rounded-box w-52 p-2 shadow-sm"
                    tabindex="-1">…</ul></div>
                 ↑ the panel is the trigger's next sibling, with nothing between (§3h)
```

Counts across the 28 stories:

```
.dropdown roots 30 = 28 component-rendered + 2 raw popover markup (§3b)
component-rendered triggers 28 = 27 role="button" divs + 1 <summary>
  → next sibling carries dropdown-content   28 of 28
  → carrying a `btn` class                  28 of 28   (§3g)
top 4 | bottom 3 | left 3 | right 3 | start 1 | center 5 | end 8
hover 4 | open 3 | close 2
all 12 classes have rules in the built stylesheet, with `position-area` and
`@starting-style` present
```

What this settles:

- **§3h, structurally.** All 28 panels are the **immediate next sibling** of their trigger. That is what daisyUI's two sibling rules require, and it is why §4's `display: contents` wrapper could not ship — `display: contents` changes layout, not selector matching, so the wrapper would have left both rules unmatched while looking correct in a screenshot.
- **§3g**: 28 of 28 triggers carry `btn` classes on the element the component renders. Under §4's listing every one of them would have been unstyled text.
- **§3c's two axes really are independent**: the stories emit `top`+`center`, `top`+`end`, `left`+`center`, `right`+`end` and the rest as separate classes on one root. A single seven-value union would have made those combinations unexpressible.
- **§2 holds**: `dropdown-content` is always on the caller's own element — a `Menu` or a `Card` — never on a div this component added, and the `tabindex` beside it varies between `-1` and `0` exactly as daisyUI's examples do.
- **§3b stays composition**: the two popover roots are raw markup with `popovertarget` / `anchor-name` wiring, which has no wrapper for a component to be.

Not settled here: whether any of it opens, where each of the 12 placements lands, and whether the clipped example is visibly clipped. All Step 5.
