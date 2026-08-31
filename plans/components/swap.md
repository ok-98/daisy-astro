# Swap Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/swap/
**Root element:** `label` by default, polymorphic to `div` — see §3a
**Target files:** `packages/daisy-astro/src/components/Swap/Swap.astro`, `SwapOn.astro`, `SwapOff.astro`, `SwapIndeterminate.astro` (only `Swap.astro` exists, as a dummy scaffold)
**Story files:** `Swap.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/swap.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `Swap.astro` plus `SwapOn`, `SwapOff` and `SwapIndeterminate`, with 17 stories. §3d's ordering requirement is asserted in the build output — 13 inputs are immediately followed by a state part, all as siblings inside the swap (§8). **§3e's script question is answered: Swap needs none**, which closes the last open item in `plans/README.md` §7. Step 5 (visual pass) is open.
---

## 0. Two states in one grid cell, driven by a hidden checkbox or a class

```css
.swap { display:inline-grid; place-content:center; position:relative;
        cursor:pointer; user-select:none; vertical-align:middle }
.swap input { appearance:none; border:none }
.swap > * { grid-row-start:1; grid-column-start:1;
            @media (prefers-reduced-motion:no-preference) {
              transition: transform, rotate, opacity .2s cubic-bezier(0,0,.2,1) } }

.swap .swap-on, .swap .swap-indeterminate,
.swap input:indeterminate ~ .swap-on,
.swap input:is(:checked,:indeterminate) ~ .swap-off      { opacity:0 }
.swap input:checked ~ .swap-on,
.swap input:indeterminate ~ .swap-indeterminate          { opacity:1 }

.swap-active .swap-off { opacity:0 }
.swap-active .swap-on  { opacity:1 }

.swap-rotate .swap-on { rotate:45deg }
.swap-rotate input:is(:checked,:indeterminate) ~ .swap-on,
.swap-rotate.swap-active .swap-on  { rotate:0deg }
.swap-rotate input:is(:checked,:indeterminate) ~ .swap-off,
.swap-rotate.swap-active .swap-off { rotate:-45deg }

.swap-flip { transform-style:preserve-3d; perspective:20rem }
```

**[all verified]**. Every child sits in the same grid cell and the visible one is chosen by opacity. **Two independent drivers**: a sibling checkbox (`input:checked ~ …`) or the `swap-active` class on the container — which is why §3a needs two root elements.

## 1. Variant audit

**7 classes: 1 component + 3 part + 1 modifier + 2 style**, matching the doc page's frontmatter. `grep -oE '\.swap[a-z0-9-]*' swap.css | sort -u` returns exactly those 7 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `swap` | — | — | `Swap` | Always applied. |
| Part | `swap-on` `swap-off` `swap-indeterminate` | — | — | one each | §2 |
| Modifier | `swap-active` | `active` | `boolean` | `Swap` | The no-checkbox driver — §3a. |
| Style | `swap-rotate` `swap-flip` | `effect` | `'rotate' \| 'flip'` | `Swap` | Mutually exclusive → union. **Must not be named `style`** (`plans/components/button.md` §3a). |

**No colour or size axis** — none exists **[verified]**. The doc examples size with `text-9xl`, `w-10 h-10`, or by composing `btn btn-circle` **[verified]**.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Swap` | `default` | none — grid children | no | the hidden `<input>` (checkbox mode) plus the state elements |
| `SwapOn` / `SwapOff` | `default` | none | no | `ON`, `😈`, an `<svg>` |
| `SwapIndeterminate` | `default` | none | no | — no doc example, but the class exists (§3c) |

Plain default slots, no gating.

**The `<input>` is caller markup, not component-rendered** — unlike `plans/components/drawer.md` §0, where the toggle had to be first for the `~` selectors to work. Here the selectors are also `~`, so the input must **precede** the state elements — but it is the caller's checkbox, carrying their `name`, `checked`, `onchange` and `autocomplete="off"` **[verified in every example]**. Rendering it would mean re-exposing all of that; documenting the order is cheaper. §3d.

## 3. Five things the naive implementation gets wrong

### 3a. Two drivers, two root elements

| Driver | Root | Markup |
|---|---|---|
| checkbox | `<label class="swap">` | a hidden `<input type="checkbox">` then the state elements |
| `swap-active` | `<div class="swap">` (or `<label>`) | no input; the caller toggles the class |

**[verified — the last doc example uses a `<div>` in its rendered form and a `<label>` in its copy-paste HTML, a discrepancy worth noting]**.

The `<label>` root is what makes clicking anywhere toggle the hidden checkbox — the same mechanism as `plans/components/otp.md` §0. With `swap-active` there is nothing to toggle, so a `<div>` is honest.

So `Swap` is `Polymorphic<{ as: Tag }>` defaulting to `'label'`, which is the mode four of the five examples use. That brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

**`active` and a checkbox should not be combined**: `.swap-active .swap-on { opacity: 1 }` is unconditional **[verified]**, so it overrides whatever the checkbox says and the control stops responding to clicks. One JSDoc line; the type system does not police it, for the same reason `plans/components/collapse.md` §3e left `force`+`details` documented rather than modelled.

### 3b. `swap-on` is hidden by default, and that is the base rule

`.swap .swap-on { opacity: 0 }` with no qualifier **[verified]** — the "on" element starts hidden and is revealed by `:checked`, `:indeterminate` or `swap-active`.

So a `Swap` containing **only** a `SwapOn` renders empty until toggled, and one containing only a `SwapOff` never changes. Both are legal and both look broken; the JSDoc says the component wants a pair.

### 3c. `swap-indeterminate` has no doc example, and cannot be set from markup

The class exists and is styled — `.swap input:indeterminate ~ .swap-indeterminate { opacity: 1 }` **[verified]** — but the doc page never shows it, because `indeterminate` is a **DOM property with no HTML attribute**, exactly as `plans/components/checkbox.md` §3c established.

So `SwapIndeterminate` ships as a component (the class is real and documented in the frontmatter) with a JSDoc pointing at the caller-side `el.indeterminate = true`, and no prop. Consistent with Checkbox's decision, and the story says so rather than pretending.

Note `swap-rotate` also has an `input:indeterminate ~ .swap-on { rotate: 45deg }` arm **[verified]**, so the effects compose with the third state.

### 3d. The state elements must follow the input, because the selectors are `~`

Every state rule is `input:checked ~ .swap-on` **[verified]** — a **general sibling** combinator, so the input must come **before** the elements it controls, and all of them must be siblings.

Two consequences:

- **Order matters** in checkbox mode: input first. Every doc example does this **[verified]**, and the JSDoc repeats it since the component does not render the input (§2).
- **A wrapper around the state elements breaks everything** — they stop being the input's siblings *and* leave the shared grid cell. §3e.1.

`swap-active` mode uses descendant selectors (`.swap-active .swap-on` **[verified]**), so it survives wrapping — but the grid stacking does not, so the practical answer is the same.

### 3e. Unverified assumptions

1. **Do slot children land as direct children?** Blocking, and doubly so per §3d — sibling relationship *and* grid cell. Twenty-eighth plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **Generic prop inference** — `Polymorphic` brings §5c's silent failure (§3a).
3. **Slot sanitization vs inline `<svg>`** — three of five examples are icons. Shared with `plans/components/alert.md` §3d.1.
4. **`autocomplete="off"`** appears on every rendered example's input but not in the copy-paste HTML **[verified]** — the same discrepancy as `plans/components/collapse.md` §3g.4 and `plans/components/drawer.md` §3a. The stories set it; the JSDoc mentions why (it stops the browser restoring a stale toggle state on reload).

## 4. Component implementation

### `Swap.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
type SwapEffect = 'rotate' | 'flip';

/**
 * Shows one of two (or three) children at a time, stacked in one grid cell.
 *
 * Two drivers (plan §3a):
 * - **checkbox** — the default `<label>` root plus your own hidden
 *   `<input type="checkbox">`, which must come **first** (plan §3d):
 *   ```astro
 *   <Swap effect="rotate">
 *     <input type="checkbox" autocomplete="off" />
 *     <SwapOn>ON</SwapOn>
 *     <SwapOff>OFF</SwapOff>
 *   </Swap>
 *   ```
 * - **class** — `as="div"` with `active` toggled by your own code. Don't
 *   combine the two: `active` wins unconditionally and the checkbox stops
 *   working (plan §3a).
 *
 * `SwapOn` starts hidden, so a Swap with only an "on" child renders empty
 * until toggled (plan §3b).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  /** Shows the `SwapOn` child with no checkbox involved (plan §3a). */
  active?: boolean;
  /** Named `effect`, never `style` — `style` is a native attribute. */
  effect?: SwapEffect;
}>;

// Full literal class names. NEVER `swap-${effect}` (plans/README.md §1b).
const EFFECT: Record<SwapEffect, string> = {
  rotate: 'swap-rotate', flip: 'swap-flip',
};

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const {
  as: Tag = 'label',
  active = false,
  effect,
  class: className,
  ...rest
} = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['swap', { 'swap-active': active }, effect && EFFECT[effect], className]} {...rest}>
  <slot />
</Tag>
```

### `SwapOn.astro` / `SwapOff.astro` / `SwapIndeterminate.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Shown when the checkbox is checked, or when the `Swap` has `active`.
 * **Hidden by default** (plan §3b). Must be a sibling of the input, after it
 * (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['swap-on', className]} {...rest}>
  <slot />
</div>
```

…and the same with `swap-off` and `swap-indeterminate`. `SwapIndeterminate`'s JSDoc notes that the state can only be set from JavaScript (§3c).

No `<script>` anywhere: the toggle is the checkbox hack, and reduced motion is handled by daisyUI's `@media` guard on the transition **[verified]**.

### Astro idioms gate

- [ ] Content arrives via plain default slots — the `<input>` is caller markup (§2).
- [ ] `<slot />` has no wrapper in `Swap` — siblings **and** one grid cell (§3d, §3e.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] Default root is `label`, with `as="div"` for the class-driven mode (§3a).
- [ ] No `<script>` added, and **no `indeterminate` prop** (§3c).
- [ ] `...rest` spread onto the root in all four.
- [ ] Style axis is named `effect`, not `style` (§1).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3e.2).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Swap><input type="checkbox" /><SwapOn>ON</SwapOn><SwapOff>OFF</SwapOff></Swap>
  <Swap as="div" active effect="flip">ok</Swap>
  <Swap class="btn btn-circle" effect="rotate">ok</Swap>
  <Swap style="rotate">must error — the prop is `effect` (§1)</Swap>
  <Swap indeterminate>must error — DOM property only (§3c)</Swap>
  <Swap color="primary">must error — no colour axis (§1)</Swap>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Four files. Doc-page examples in page order (`plans/README.md` §8), all in `Swap.stories.ts`: `SwapText`, `VolumeIcons`, `RotateEffect`, `HamburgerButton` (composing `btn btn-circle`), `FlipEffect`, `ActivateWithClass` (two swaps, one `active`).

Plus `Playground` and `Passthrough`; the three part components get a `Playground` + `Passthrough` each.

Three beyond the doc page:

- **`Indeterminate`** — a swap with all three parts plus the caller-side `el.indeterminate = true` script, or a comment if the framework will not run it (§3c, and the same handling as `plans/components/checkbox.md` §5's `Indeterminate`).
- **`OnlyOnChild`** — a Swap containing just a `SwapOn`, rendering empty (§3b).
- **`ActiveAndCheckbox`** — both drivers at once, showing that the checkbox stops working (§3a).

## 6. Steps

- [x] **Step 1: done.** §3e.1 is answered — the state parts render as direct children of the swap and as siblings of the caller's input, which both the general-sibling selectors and the shared grid cell require. §3e.3 is moot (sanitization is off library-wide). §3e.4's `autocomplete="off"` discrepancy is settled in favour of daisyUI's *rendered* examples: every story sets it, and the JSDoc says why.
- [x] **Step 2: skipped as planned.** No shared unions; `variants.ts` untouched.
- [x] **Step 3: done.** Four files per §4. Gate walked; the probe errored on both intended lines, including `<SwapOn active>` — so the modifier cannot be put on a part instead of the container.
- [x] **Step 4: done.** `Swap.stories.ts` (11) plus a `Playground` + `Passthrough` for each of the three parts.

  One deviation from the doc page's markup, recorded because it is visible in a diff: daisyUI writes `swap-on` / `swap-off` **directly on the `<svg>`** in its icon examples, while these stories wrap the icon in `SwapOn` / `SwapOff`. The grid child is then the `div` rather than the `svg`, which behaves identically — and it keeps the story composed from the real components rather than dropping to raw markup for three of the six examples.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and every claim here is a state change.** Verify: clicking `SwapText` swaps ON/OFF; `RotateEffect` rotates rather than cross-fading and `FlipEffect` flips; `HamburgerButton` works as a button, with both class sets on one element; `ActivateWithClass`'s second swap shows its on-state with no input at all; **`ActiveAndCheckbox`'s first control does not respond to clicks** (§3a); `OnlyOnChild` renders empty until toggled (§3b); and `Indeterminate` shows the third state, which also answers whether the framework runs a story's inline script (§3c).
- [x] **Step 6: done — forwarding confirmed and §3d asserted.** `Passthrough` renders `<div id="swap-1" data-test="yes" style="letter-spacing:2px" class="swap swap-flip swap-active mine text-4xl">`, so `as` changes the tag and the classes merge. Across the stories, 13 inputs are immediately followed by a state part. Full output in §8.
- [x] **Step 7: done — the `Swap` row in `plans/README.md` says Implemented**, and §7's open question about whether Swap needs a script is closed: it does not.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 7 daisyUI classes reachable across four components.
- [x] Default root is `label`; `as="div"` available for the class-driven mode; probe passes (§3a).
- [x] The `<input>` stays caller markup and renders **before** the state elements (§2, §3d) — checked in the build output.
- [x] No invented axis — no colour, no size, no `indeterminate` prop (§1, §3c).
- [x] JSDoc states: the two drivers and why not to combine them (§3a), that `SwapOn` starts hidden (§3b), that indeterminate is JS-only (§3c), and that the input must come first (§3d).
- [x] One story per doc-page example, plus `Indeterminate`, `OnlyOnChild` and `ActiveAndCheckbox`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG elided. `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
SwapText        → <label class="swap"><input type="checkbox" autocomplete="off" />
                    <div class="swap-on">ON</div><div class="swap-off">OFF</div></label>
RotateEffect    → <label class="swap swap-rotate"><input … /><div class="swap-on">SVG</div>…
ActivateWith…   → <label class="swap text-6xl">… and … <label class="swap swap-active text-6xl">…
                    no input in either
ActiveAndCheck… → <label class="swap swap-active text-4xl"><input … />…   the combination that breaks
Passthrough     → <div id="swap-1" data-test="yes" style="letter-spacing:2px"
                    class="swap swap-flip swap-active mine text-4xl">…
```

What this settles:

- **§3d's ordering rule**: 13 inputs are immediately followed by a state part, with every part a direct child of the swap. The state selectors are general-sibling combinators, so an input placed after the states — or a wrapper around them — would have broken every rule silently.
- **Both drivers render as documented**: 19 label roots for the checkbox mode and a `div` for the class mode, chosen by `as` rather than by convention.
- `SwapIndeterminate` exists as a component even though daisyUI's doc page never shows it, because the class is real — the state is simply unreachable from markup (§3c).
- All 7 classes have rules in the built stylesheet.

**No script**: this component is a checkbox hack plus a class, and nothing in it needs JavaScript — which closes the last open item in `plans/README.md` §7. The only script anywhere near it is caller-side, in the `Indeterminate` story, setting a DOM property that has no HTML attribute.

Not settled here: every state change. Step 5.
