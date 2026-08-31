# Filter Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/filter/
**Root element:** `form` by default, polymorphic to `div` — see §3a
**Target file:** `packages/daisy-astro/src/components/Filter/Filter.astro` (currently a dummy scaffold; its `<form>` root is already right)
**Story file:** `packages/daisy-astro/src/components/Filter/Filter.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): `class:list` for merging; **Filter has no variant classes** so no `Record` map exists (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/filter.css` and `components/button.css`, and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `Filter.astro` and 7 stories, with the options composing the real `Button` as `as="input"`. §3c's cross-plan action is done: `plans/components/button.md` now carries the `aria-label`-as-visible-text rule as its §3c. Step 5 (visual pass) is open, and it carries the collapse behaviour, which is the whole component.
---

## 0. Two classes, and the items are Buttons

The complete unprefixed rule set **[verified]**:

```css
.filter { display:flex; flex-wrap:wrap }
.filter [type=radio] { width:auto }
.filter input { opacity:1; scale:1; overflow:hidden;
                transition: visibility .1s allow-discrete, margin .1s, opacity .3s, padding .3s, border-width .1s;
                &.filter-reset { aspect-ratio:1; &:after { content:"×" } } }
.filter > input:not(:last-child), .filter > :not(:last-child) input { margin-inline-end:.25rem }

/* reset hidden until something is chosen */
.filter:not(:has(:checked:not(.filter-reset))) :is(.filter-reset,[type=reset]):not(:focus-visible) { visibility:hidden }

/* choosing a radio collapses every other option to zero */
.filter:not(:has(:checked:not(.filter-reset))) :is(.filter-reset,[type=reset]):not(:focus-visible),
.filter:not(:has(:focus-visible)):has(:checked:not(.filter-reset,[type=checkbox])) :is(input,button):not(:checked,.filter-reset,[type=reset])
  { opacity:0; border-width:0; width:0; margin-inline:0; padding-inline:0; scale:0 }
```

No JavaScript, and no item class of its own — **every option is a `<input type="radio" class="btn">`**, i.e. this library's `Button` with `as="input"`. So Filter is one thin container component plus a documented composition (§2).

## 1. Variant audit

**2 classes: 1 component + 1 part**, matching the doc page's frontmatter. `grep -oE '\.filter[a-z0-9-]*' filter.css | sort -u` returns exactly `.filter` and `.filter-reset` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `filter` | — | — | Always applied. |
| Part | `filter-reset` | — | — | Caller-applied class on one radio — §3b. |

**No colour, size, style or state axis** — none exists **[verified]**. Eighth component in the library with an empty variant table. All colour and sizing comes from the Button classes on the items.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — direct children of `.filter` | no | the radio/checkbox inputs and the reset control |

Single default slot, no gating.

**`filter-reset` is a caller-applied class**, not a sub-component — the same treatment as `dropdown-content` (`plans/components/dropdown.md` §2) and `fab-main-action` (`plans/components/fab.md` §2). It goes on one of the caller's own radios.

**No `options` array prop.** Each option is a full `<input>` with its own `name`, `value`, `aria-label` and Button classes; an array API would have to re-invent all of it.

**Items compose with `Button`:**

```astro
<Filter>
  <Button as="input" type="reset" shape="square" value="×" />
  <Button as="input" type="radio" name="frameworks" aria-label="Svelte" />
</Filter>
```

## 3. Five things the naive implementation gets wrong

### 3a. Two root elements, and they are not interchangeable

daisyUI documents both, for a concrete reason:

| Root | Reset mechanism | When |
|---|---|---|
| `<form class="filter">` | `<input type="reset" value="×">` — native form reset | the default |
| `<div class="filter">` | a radio carrying `class="filter-reset"` | *"Use this if you can't use a HTML form for some reason"* |

The `<form>` version gets real reset behaviour from the browser for free. The `<div>` version fakes it with an extra radio that is styled as an `×` and, being part of the same radio group, unsets the others when chosen.

So `Filter` is `Polymorphic<{ as: Tag }>` defaulting to `'form'`, and the JSDoc states which reset control belongs with which root. That brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

### 3b. `filter-reset` renders its own `×`, and the plain reset does not

```css
.filter input.filter-reset { aspect-ratio:1; &:after { content:"×" } }
```

**[verified]** — the `filter-reset` radio gets its `×` from CSS and needs no `value` or label. The `<input type="reset">` in the form version has no such rule, which is why every doc example writes `value="×"` on it by hand.

Easy to get backwards: putting `value="×"` on a `filter-reset` radio does nothing (an `<input type="radio">` renders no value), and omitting it from an `<input type="reset">` leaves a button labelled "Reset" by the browser. One JSDoc line each.

### 3c. The visible label of every option is its `aria-label` — and this is missing from the Button plan

```css
.btn:is([type=checkbox], [type=radio]) { appearance:none; &[aria-label]:after { content: attr(aria-label) } }
```

**[verified in `button.css`]**. An `<input>` cannot have children, so daisyUI renders the button's text from the `aria-label` attribute through a pseudo-element. Every option in every Filter example relies on it.

Two consequences:

- **`aria-label` is required on every option**, not optional accessibility polish. Without it the button renders **empty** — a zero-width pill with no text, and no error.
- **This belongs in `plans/components/button.md`.** That plan's §2 says an icon-plus-label button is served by the default slot, which is true for `<button>` but not for `as="input"` — where there is no slot and `aria-label` is the only content mechanism. **Action item for Step 7: add it to the Button plan**, the third cross-plan correction in this directory after `plans/components/card.md` §0a and `plans/components/collapse.md` §0a.

### 3d. Checkboxes are deliberately exempt from the collapse

The collapse selector is `:has(:checked:not(.filter-reset, [type=checkbox]))` **[verified]** — checking a **radio** hides every unchosen sibling, checking a **checkbox** does not.

That is what makes the doc page's third example (multiple choice with checkboxes) show all options at once while the radio examples collapse to one. It is behaviour, not a bug, and it means the same container serves both single- and multi-select filters with no prop.

Note the collapse is also suppressed while anything inside has `:focus-visible` **[verified]** — keyboard users can still tab through the hidden options, which is why the transition includes `visibility … allow-discrete` rather than `display:none`. Do not "optimise" that to `hidden`.

### 3e. Unverified assumptions

1. **Do slotted inputs land as direct children of `.filter`?** The spacing rule is `.filter > input:not(:last-child)` **and** `.filter > :not(:last-child) input` **[verified]** — daisyUI already anticipates one level of wrapping, so this is the first component where a wrapper is partly tolerated. The collapse rules use descendant selectors and would survive. Still worth confirming; twelfth plan to touch the shared question in `plans/components/aura.md` §3e.1, but the weakest instance of it.
2. **`transition: visibility … allow-discrete`** is recent CSS **[verified]**; without it options would pop rather than fade. Cosmetic only.
3. **`autocomplete="off"`** appears on every input in the doc page's rendered examples but not in its copy-paste HTML — the same discrepancy as `plans/components/collapse.md` §3g.4 and `plans/components/drawer.md` §3a. It stops browsers restoring a stale filter selection on reload. Decide in Step 3 whether the stories set it (leaning yes) and record it.

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST be declared before any `const`, or Astro stops inferring it and
// the component silently accepts no props (plans/README.md §5c).
/**
 * A group of radio (or checkbox) buttons where choosing one collapses the
 * others and reveals a reset control. Pure CSS — no script, no state prop.
 *
 * Options are Buttons rendered as inputs, and **their visible text comes from
 * `aria-label`** — an `<input>` has no children (plan §3c):
 *
 * ```astro
 * <Filter>
 *   <Button as="input" type="reset" shape="square" value="×" />
 *   <Button as="input" type="radio" name="frameworks" aria-label="Svelte" />
 * </Filter>
 * ```
 *
 * With `as="div"` there is no form to reset, so put `class="filter-reset"` on
 * an extra radio instead — it draws its own `×` (plan §3a, §3b).
 *
 * Checkboxes do not collapse their siblings, so the same container works for
 * multi-select (plan §3d).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  /** `form` gives native reset; `div` needs a `filter-reset` radio (plan §3a). */
  as: Tag;
}>;

// No variant class map: daisyUI defines one component class and one part class
// for this component, and no modifiers (plan §1).

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'form', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['filter', className]} {...rest}>
  <slot />
</Tag>
```

No `<script>`: the collapse, the reset visibility and the `×` are all CSS (§0).

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `options` array prop (§2).
- [ ] Root defaults to `form` via `Polymorphic<{ as: Tag }>`, with `div` available (§3a).
- [ ] No `Astro.slots.has()` gating — nothing is optional.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root, so `name`, `action` and `onreset` work on the form root.
- [ ] `filter-reset` documented as a caller class, not a prop (§2, §3b).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` on the destructure (§3a).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Filter><input class="btn" type="radio" name="f" aria-label="Svelte" /></Filter>
  <Filter as="div" id="x" data-test="y">ok</Filter>
  <Filter color="primary">must error — no colour axis (§1)</Filter>
  <Filter options={['a']}>must error — options are slot content (§2)</Filter>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Notes |
|---|---|---|
| Filter using HTML form, radio buttons and reset | `Default` | `<form>` root, `type="reset" value="×"` first |
| Filter without HTML form | `WithoutForm` | `as: 'div'`, first radio `class="btn filter-reset"` |
| Filter using HTML form, checkboxes, and a reset button | `Checkboxes` | reset **last**, options do not collapse (§3d) |

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`MissingAriaLabel`** — one option with `aria-label` beside one without, so §3c's invisible-text failure is seen once rather than debugged.
- **`KeyboardReveal`** — a comment plus a `Default` copy; tabbing into a collapsed filter should reveal the hidden options via `:focus-visible` (§3d).

Every story needs distinct radio `name` values — a shared `name` across stories on one docs page would make them one radio group. Same class of hazard as `plans/components/drawer.md` §5's `toggleId`, and worth the same comment.

## 6. Steps

- [x] **Step 1: done.** §3e.1 holds and was the weakest instance of the shared question, as predicted: daisyUI's spacing rule already anticipates one level of wrapping, and the collapse rules are descendant selectors. The build shows 9 inputs as direct children anyway.
- [x] **Step 2: skipped as planned.** No variant axes; `variants.ts` untouched.
- [x] **Step 3: done.** Component written per §4. §3e.3 is decided in favour of the rendered examples: every story sets `autocomplete="off"`, which stops the browser restoring a stale filter selection on reload.

  **The probe caught a real mistake in my own first draft.** The JSDoc contained a markup example, and the angle brackets in it broke `Props` inference on this generic component — exactly the failure `plans/README.md` §5c documents. Two valid probe lines failed alongside the two intended ones; rewriting the comment without markup fixed it. `src/_typecheck.astro` would have caught the same thing once Filter was added to it, which is what that file is for.
- [x] **Step 4: done.** `Filter.stories.ts`, 7 stories, options composing the real `Button`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and the collapse is the component.** Verify: choosing a radio in `WithForm` **collapses every other option to nothing** and reveals the reset; the reset restores them; `WithoutForm` behaves the same with its `filter-reset` radio; **`WithCheckboxes` does not collapse**, which is the deliberate exemption (§3d); tabbing through a collapsed filter still reaches the hidden options, since they use `visibility` rather than `display` (§3d); `MissingAriaLabel`'s first row is three empty pills (§3c); and `ResetMismatch`'s first reset is labelled "Reset" by the browser (§3b).
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<div id="filter-1" data-test="yes" style="letter-spacing:1px" class="filter mine">`. Full output in §8.
- [x] **Step 7: done.** The `Filter` row in `plans/README.md` says Implemented, and **the §3c action item is complete**: `plans/components/button.md` §3c now documents that `as="input"` has no slot and takes its visible text from `aria-label`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] Both daisyUI classes reachable; `filter-reset` documented as caller-applied (§2, §3b).
- [x] Root defaults to `form` and accepts `as="div"`, with the matching reset mechanism documented for each (§3a).
- [x] `type Props` precedes every `const`, destructure annotated, probe passes (§3a).
- [x] No invented axis — no colour, size, `options` prop, or reset prop (§1, §2).
- [x] JSDoc states: options are `Button as="input"` and need `aria-label` for visible text (§3c); checkboxes do not collapse (§3d).
- [x] `plans/components/button.md` is amended per §3c (§6 Step 7).
- [x] Stories use distinct radio `name` values (§5).
- [x] One story per doc-page example, plus `MissingAriaLabel` and `KeyboardReveal`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, 0 warnings, 0 hints.

```
WithForm       → <form class="filter"><input type="reset" value="×" class="btn btn-square"/>
                   <input type="radio" name="frameworks-1" autocomplete="off" aria-label="Svelte" class="btn"/> …
WithoutForm    → <div class="filter"><input type="radio" name="metaframeworks-2" autocomplete="off"
                   aria-label="All" class="btn filter-reset"/> …
WithCheckboxes → <form class="filter"><input type="checkbox" … class="btn"/> ×3, then the reset
Passthrough    → <div id="filter-1" data-test="yes" style="letter-spacing:1px" class="filter mine">…
```

What this settles:

- **Both roots render with their matching reset control**: 5 `form` roots carrying a `type="reset"` input with `value="×"` (4 of them), and 3 `div` roots, 2 of which carry a `filter-reset` radio. The two mechanisms are not interchangeable and the stories keep them paired (§3a, §3b).
- **26 options carry an `aria-label`** — the exception being `MissingAriaLabel`'s deliberately unlabelled row. That attribute is the button's *visible text* for an input root, which is now documented in `plans/components/button.md` §3c rather than only here (§3c).
- **The options are real `Button` components**, rendered as `input.btn` — daisyUI's own markup, reached through composition rather than reproduced by hand.
- Both classes have rules in the built stylesheet.

Not settled here: the collapse, the reset, and the checkbox exemption. All Step 5.
