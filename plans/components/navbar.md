# Navbar Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/navbar/
**Root element:** `div` (all four components)
**Target files:** `packages/daisy-astro/src/components/Navbar/Navbar.astro`, `NavbarStart.astro`, `NavbarCenter.astro`, `NavbarEnd.astro` (only `Navbar.astro` exists, as a dummy scaffold)
**Story files:** `Navbar.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/navbar.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. Four classes, and the whole CSS is nine declarations

```css
.navbar { display:flex; align-items:center; width:100%; min-height:4rem; padding:.5rem }
:where(.navbar) { position:relative }
.navbar-start  { display:inline-flex; align-items:center; justify-content:flex-start; width:50% }
.navbar-center { display:inline-flex; align-items:center; flex-shrink:0 }
.navbar-end    { display:inline-flex; align-items:center; justify-content:flex-end;   width:50% }
```

**[all verified]**. That is the entire component. Everything else on the doc page — dropdowns, menus, avatars, indicators, search inputs — is other components composed inside it (§2).

Notably, **half the doc examples use no part class at all**, reaching for `flex-1` / `flex-none` instead (§3b).

## 1. Variant audit

**4 classes: 1 component + 3 part**, matching the doc page's frontmatter. `grep -oE '\.navbar[a-z0-9-]*' navbar.css | sort -u` returns exactly those 4 **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Component |
|---|---|---|---|---|
| Base | `navbar` | — | — | `Navbar` |
| Part | `navbar-start` | — | — | `NavbarStart` |
| Part | `navbar-center` | — | — | `NavbarCenter` |
| Part | `navbar-end` | — | — | `NavbarEnd` |

**No colour, size, style or placement axis** — none exists **[verified]**. Thirteenth component in the library with an empty variant table; `bg-neutral text-neutral-content` in the colours example is plain Tailwind (§3d).

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]**.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Navbar` | `default` | none — flex children | no | the three parts, or bare `flex-1`/`flex-none` divs |
| `NavbarStart` / `NavbarCenter` / `NavbarEnd` | `default` | none | no | a logo button, a `Menu`, a `Dropdown`, an `Indicator` |

Plain default slots, no gating.

**No `start`/`center`/`end` named slots on `Navbar`.** The parts are optional and appear in different combinations across the examples — two of them, all three, or none — and a caller may put bare `<div class="flex-1">`s there instead (§3b). Sub-components keep `Navbar` at zero conditional logic, the same call as `plans/components/hero.md` §2.

**No `items` array prop**: every example puts entirely different components in each region.

## 3. Five things the naive implementation gets wrong

### 3a. `navbar-start` and `navbar-end` are exactly 50% each — center is what is left

`width: 50%` on both **[verified]**, and `navbar-center` is `flex-shrink: 0` with no width. So the centre is **not** centred by distributing space; it is squeezed between two fixed halves, and it stays visually centred only while the two halves' content is narrower than 50%.

Consequence worth a JSDoc line: **a long logo in `NavbarStart` pushes the centre off-centre** rather than shrinking it — `flex-shrink: 0` means the centre wins and the halves overflow. That is why the doc examples pair a centre logo with two icon-only sides **[verified]**.

Also: with only `NavbarStart` and `NavbarEnd` present, the two 50% halves fill the bar exactly, which is the common two-region layout.

### 3b. Half the examples do not use the part classes at all

Four of the nine doc examples use `<div class="flex-1">` and `<div class="flex-none">` instead of `navbar-start`/`navbar-end` **[verified]** — a growing region plus a fixed one, which is the right tool when the split is *not* 50/50.

So the JSDoc must say both are valid, and the stories reproduce both. A caller reaching for `NavbarStart` because it sounds right, when they want `flex-1`, will get a logo pinned to the left half and a gap. The two idioms:

| Want | Use |
|---|---|
| two equal halves, or a true centre region | `NavbarStart` / `NavbarCenter` / `NavbarEnd` |
| a growing region plus fixed items | bare `<div class="flex-1">` / `<div class="flex-none">` |

### 3c. `position: relative` is there for the dropdowns

`:where(.navbar) { position: relative }` **[verified]** — wrapped in `:where()` so it has zero specificity and a caller's `sticky`/`fixed` overrides it with no `!important`.

It exists because the doc page's dropdowns are absolutely positioned inside the bar. Worth one JSDoc line, together with the practical note that **a sticky navbar is `class="sticky top-0 z-30"`** — daisyUI provides no modifier for it, and there is no `z-index` on `.navbar` at all **[verified]**, so a bar over other content needs one.

### 3d. The bar has no background of its own

`.navbar` sets no `background-color` **[verified]**. Every doc example adds one — `bg-base-100 shadow-sm`, `bg-neutral text-neutral-content`, `bg-primary text-primary-content`.

So a bare `<Navbar>` is an invisible 4rem-tall flex row. Correct, not broken — the same shape as `plans/components/browser-mockup.md` §3b and `plans/components/fieldset.md` §3c — and the reason there is no `color` prop.

`min-height: 4rem` with `padding: .5rem` **[verified]** is the only size, and there is no size axis; a shorter bar is `class="min-h-0"`.

### 3e. Unverified assumptions

1. **Do slot children land as direct children of `.navbar`?** Mild. The parts are styled by their own classes, not by position — there is no `.navbar > *` rule **[verified]** — so a wrapper would not break the part styling, only the flex layout of whatever it wrapped. Twenty-first plan touching the shared question in `plans/components/aura.md` §3e.1, and among the weakest instances, alongside `plans/components/indicator.md` §3e.1.
2. **Cross-component composition.** Every example beyond the first composes `btn`, `menu`, `dropdown`, `avatar`, `indicator`, `badge`, `card`, `input`, or `collapse`. Raw markup in the stories until those plans are implemented — noted in a comment, since this is the component whose stories will look most like a missing integration.
3. **Slot sanitization vs inline `<svg>`** — every example after the first has icons. Shared with `plans/components/alert.md` §3d.1.

## 4. Component implementation

### `Navbar.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * A 4rem flex row for page navigation. daisyUI gives it **no background** —
 * `class="bg-base-100 shadow-sm"` is what every example adds (plan §3d).
 *
 * Two layouts are both idiomatic (plan §3b):
 * - `NavbarStart` / `NavbarCenter` / `NavbarEnd` — two 50% halves with a
 *   fixed centre between them.
 * - bare `<div class="flex-1">` and `<div class="flex-none">` — a growing
 *   region plus fixed items, for splits that are not 50/50.
 *
 * `position: relative` is set at zero specificity so dropdowns inside can
 * anchor; for a sticky bar add `class="sticky top-0 z-30"` (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {}

// No variant class map: daisyUI defines one component class and three part
// classes here, and no modifiers (plan §1).

const { class: className, ...rest } = Astro.props;
---

<div class:list={['navbar', className]} {...rest}>
  <slot />
</div>
```

### `NavbarStart.astro` / `NavbarCenter.astro` / `NavbarEnd.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * The leading half of a `Navbar` — exactly 50% wide. The centre region does
 * not shrink, so long content here pushes it off-centre (plan §3a).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['navbar-start', className]} {...rest}>
  <slot />
</div>
```

…and the same with `navbar-center` (`flex-shrink: 0`, no width) and `navbar-end` (50%, right-aligned).

No `<script>` anywhere: pure CSS. None is polymorphic — daisyUI documents all four on a `div`. (A `<nav>` root was considered: the doc page uses `div` throughout, and a Navbar usually *contains* a `<nav>` rather than being one — the Menu inside it is the navigation. Unlike `plans/components/breadcrumbs.md` §3b, there is no clear a11y win, so the element stays as documented.)

### Astro idioms gate

- [ ] Content arrives via plain default slots — no named slots, no `items` prop (§2).
- [ ] No `Astro.slots.has()` gating — the parts are optional by not being rendered.
- [ ] Roots are `div` in all four; no `as` prop (§4).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in all four.
- [ ] No invented props — no `color`, `size`, `sticky` or `position` (§3c, §3d).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <Navbar class="bg-base-100 shadow-sm"><NavbarStart>Logo</NavbarStart><NavbarEnd>Login</NavbarEnd></Navbar>
  <Navbar id="x" data-test="y" class="sticky top-0 z-30">ok</Navbar>
  <Navbar color="primary">must error — no colour axis (§1)</Navbar>
  <Navbar sticky>must error — use class="sticky top-0" (§3c)</Navbar>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Four files. Doc-page examples in page order (`plans/README.md` §8), all in `Navbar.stories.ts`: `TitleOnly`, `TitleAndIcon`, `IconsAtStartAndEnd`, `WithMenuAndSubmenu`, `WithSearchAndDropdown`, `WithIconIndicatorAndDropdown`, `CenterLogo`, `ResponsiveDropdownMenu`, `ResponsiveCollapse`, `Colors`.

Plus `Playground` and `Passthrough`; each of the three part components gets a `Playground` + `Passthrough`.

Two beyond the doc page:

- **`FiftyFiftyVsFlex`** — the same content laid out with the part classes and with `flex-1`/`flex-none`, side by side, making §3b's choice concrete.
- **`LongLogoPushesCenter`** — a long title in `NavbarStart` with a `NavbarCenter`, showing §3a's off-centre behaviour.

Several stories need vertical room below the bar for their dropdowns — the doc page adds `mb-32`…`mb-48` to its own demos **[verified]**. The stories do the same, with a comment.

## 6. Steps

- [ ] **Step 1:** Nothing blocking. Confirm §3e.1 in passing.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Navbar.astro` scaffold and create the three part components per §4, then walk the gate.
- [ ] **Step 4:** Replace `Navbar.stories.ts` and add the three sub-component story files per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `TitleOnly` is a 4rem bar with a visible background only because the story adds one (§3d); `CenterLogo` centres its logo with icon groups either side; `LongLogoPushesCenter` visibly shifts (§3a); `FiftyFiftyVsFlex` shows the two idioms differing (§3b); the dropdown stories open **below** the bar without clipping (§3c); `ResponsiveDropdownMenu` swaps a hamburger for a centre menu at `lg`.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="navbar[^"]*"[^>]*><div class="navbar-(start|center|end)' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Navbar` row in `plans/README.md` to **Implemented**, noting the three part components.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 4 daisyUI classes reachable, one per component.
- [ ] No invented axis — no colour, size, or sticky prop (§3c, §3d).
- [ ] JSDoc states: no background of its own (§3d), the two layout idioms (§3b), the 50%/fixed-centre behaviour (§3a), and how to make it sticky (§3c).
- [ ] One story per doc-page example, plus `FiftyFiftyVsFlex` and `LongLogoPushesCenter`.
- [ ] Stories leave room below the bar for dropdowns (§5).
- [ ] Every box in §4's gate ticked.
