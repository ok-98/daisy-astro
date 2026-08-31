# Rating Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/rating/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Rating/Rating.astro` (currently a dummy scaffold; its `div` root is already right)
**Story file:** `packages/daisy-astro/src/components/Rating/Rating.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/rating.css` and the doc page source. §3f lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `Rating.astro` and 12 stories. §3f.1 is answered in the build output — 18 ratings render their items as direct children, which both the sizing rule and the `:has(~ …)` fill rule require (§8). Step 5 (visual pass) is open, and it carries the fill behaviour, which is the whole component.
---

## 0. A radio group where the shapes come from Mask

```css
.rating { display:inline-flex; position:relative; vertical-align:middle;
          --size: var(--size-selector,.25rem) * 6 }
.rating input { appearance:none; cursor:pointer }
.rating *      { width:calc(var(--size) * 1); height:calc(var(--size)); border-radius:0;
                 background-color:var(--color-base-content); opacity:.2;
                 @media (prefers-reduced-motion:no-preference) { animation:.25s ease-out rating } }
.rating .rating-hidden { background-color:#0000; width:.5rem }
.rating :checked, .rating [aria-checked=true], .rating [aria-current=true],
.rating :has(~ :checked, ~ [aria-checked=true], ~ [aria-current=true]) { opacity:1 }
.rating :focus-visible { scale:1.1 }
.rating-half * { width:calc(var(--size) * .5) }
.rating-xs { --size: … * 4 }   /* …sm 5, md 6, lg 7, xl 8 */
```

**[all verified]**. Every item is dimmed to `opacity: .2`, and the **`:has(~ :checked)` rule lights up everything before the checked one** — which is what makes a rating fill left-to-right from a single radio selection, with no JavaScript.

The star shape itself is **not** part of this component: every item carries `mask mask-star-2` from the Mask component **[verified]**. That is the composition `plans/components/mask.md` §3c anticipated.

## 1. Variant audit

**8 classes: 1 component + 2 modifier + 5 size**, matching the doc page's frontmatter. `grep -oE '\.rating[a-z0-9-]*' rating.css | sort -u` returns exactly those 8 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `rating` | — | — | Always applied. |
| Modifier | `rating-half` | `half` | `boolean` | Halves every item's width — §3c. |
| Modifier | `rating-hidden` | — | — | **Caller class on the first item** — §3b. |
| Size | `rating-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches exactly — import it. Sets `--size` **[verified]**. |

**No colour axis** — items default to `--color-base-content` at 20 % opacity, and every coloured example uses a Tailwind `bg-*` on the item **[verified]**. §3d.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — direct children of `.rating` | no | N `<input type="radio" class="mask mask-star-2" aria-label="…">`, or `<div>`s for read-only |

Single default slot, no gating.

**No `value`/`max` props and no generated items.** The items are radios with a shared `name`, individual `aria-label`s, per-item colours in one example, and alternating `mask-half-1`/`mask-half-2` in another **[all verified]**. An `value={3} max={5}` API would have to generate all of that and would block the read-only form (§3e) and the multi-colour example outright.

This is the same rejection as `plans/components/otp.md` §3b, for the same reason: the children carry too much per-item state to be summarised by two numbers.

## 3. Six things the naive implementation gets wrong

### 3a. `aria-label` is the only label, and the items are `appearance: none`

`.rating input { appearance: none }` **[verified]** — the radios have no visual of their own; the mask and the background colour are the entire appearance.

So each item's **`aria-label` is its only accessible name**, and every doc example sets one (`"1 star"`, `"2 star"`, … , `"clear"`) **[verified]**. Without it a screen reader reads five unlabelled radios.

Third component where `aria-label` carries meaning that looks decorative, after `plans/components/filter.md` §3c (where it is the *visible* text) and `plans/components/countdown.md` §3a. Here it is invisible but load-bearing — the JSDoc says so and `MissingAriaLabel` (§5) shows the gap.

### 3b. `rating-hidden` is a real, clickable item — the first one

daisyUI's own subheading: *"`rating-hidden` is a hidden radio at the start to allow users to remove their rating."*

It is `background-color: #0000; width: .5rem` **[verified]** — invisible but **not** `display: none`, so it stays in the radio group and clicking or keyboarding onto it clears the rating. Without it a radio group can never return to "no selection".

Two consequences for the JSDoc:

- **It must be first**, because the `:has(~ :checked)` fill rule lights up everything *before* the checked item — a clear-radio in the middle would be lit by any higher rating.
- **It still needs an `aria-label`** (`"clear"` in the doc example **[verified]**), and it is a caller class on the caller's own input, like `filter-reset` (`plans/components/filter.md` §2).

### 3c. `rating-half` halves every item, so you need twice as many

`.rating-half * { width: calc(var(--size) * .5) }` **[verified]** — it narrows *all* children, including `rating-hidden`.

The doc example pairs it with **ten** items alternating `mask-half-1` / `mask-half-2` **[verified]**, so each visible star is two clickable halves. So:

- `half` is a container prop, but the **per-item `mask-half-*` classes are the caller's** — and `plans/components/mask.md` §3c documented that those zoom the mask rather than clipping it, which is exactly why the container must halve the width too. The two halves of that behaviour live in two components; cross-referenced both ways.
- **Forgetting `rating-half` while using `mask-half-*`** gives full-width boxes each showing half a star — a stretched, gappy row. Forgetting the `mask-half-*` classes while setting `half` gives ten narrow whole stars. `HalfMismatch` (§5) shows one of them.

### 3d. Colour is a `bg-*` on each item, not a prop

`.rating *` sets `background-color: var(--color-base-content)` **[verified]**, and every coloured example overrides it per item — `bg-orange-400`, `bg-green-500`, or five different colours in the heart example **[verified]**.

**No `color` prop.** It would emit a Tailwind utility this library does not own (`plans/components/loading.md` §3a's reasoning), and it could not express the per-item case at all. The JSDoc shows the item class.

Note the opacity split does the work: unselected items are the same colour at `.2`, selected ones at `1` **[verified]** — so one `bg-*` gives both states.

### 3e. The read-only form uses `<div>`s and `aria-current`

The second doc example replaces the radios with plain `<div class="mask mask-star" aria-label="3 star" aria-current="true">` **[verified]**, and the fill rule matches `[aria-current=true]` alongside `:checked` **[verified]**.

So a display-only rating is the same component with different children — no prop, no `readonly`. Worth a JSDoc line, since `readonly` is the first thing a caller will look for.

`[aria-checked=true]` is also matched **[verified]**, for callers driving state from JS.

### 3f. Unverified assumptions

1. **Do slot children land as direct children?** Blocking. `.rating *` and the `:has(~ …)` sibling rule both require the items to be siblings inside `.rating` **[verified]** — a wrapper would make one item of everything and the fill would never work. Twenty-fourth plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **`:has()` support** — the entire fill behaviour is `:has(~ :checked)` **[verified]**. Without it only the selected star lights up, which looks like a different (wrong) design rather than a failure. Check first.
3. **Radio-group isolation across stories** — shared with `plans/components/radio.md` §3d.2; eleven stories here each need their own `name`.
4. **`mask` support** — shared with `plans/components/mask.md` §3e.1 and `plans/components/loading.md` §3e.2. Unmasked squares are the symptom.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A row of rateable shapes. Items are radios sharing one **unique `name`**,
 * shaped by the Mask component and coloured with a `bg-*` class:
 *
 * ```astro
 * <Rating>
 *   <input type="radio" name="rating-1" class="mask mask-star-2 bg-orange-400" aria-label="1 star" />
 *   …
 * </Rating>
 * ```
 *
 * **Every item needs an `aria-label`** — the inputs are `appearance: none`, so
 * it is their only accessible name (plan §3a).
 *
 * For a read-only rating use `<div>`s with `aria-current="true"` on the
 * selected one instead of radios — there is no `readonly` prop (plan §3e).
 *
 * To let users clear the rating, put `class="rating-hidden"` on a first,
 * invisible radio (plan §3b).
 */
interface Props extends HTMLAttributes<'div'> {
  size?: DaisySize;
  /**
   * Halves every item's width for half-star ratings. Pair it with twice as
   * many items carrying alternating `mask-half-1` / `mask-half-2` — the
   * container and the item classes are two halves of one mechanism
   * (plan §3c).
   */
  half?: boolean;
}

// Full literal class names. NEVER `rating-${size}` (plans/README.md §1b).
const SIZE: Record<DaisySize, string> = {
  xs: 'rating-xs', sm: 'rating-sm', md: 'rating-md', lg: 'rating-lg', xl: 'rating-xl',
};

const { size, half = false, class: className, ...rest } = Astro.props;
---

<div class:list={['rating', size && SIZE[size], { 'rating-half': half }, className]} {...rest}>
  <slot />
</div>
```

No `<script>`: the fill, the focus scale and the pop animation are CSS (§0). Not polymorphic — daisyUI documents `rating` on a `div`.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — **no `value`/`max` props, no generated items** (§2).
- [ ] `<slot />` has no wrapper — the items must be siblings (§3f.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root is `div`; no `as` prop.
- [ ] No `<script>` added; no `readonly` prop (§3e).
- [ ] `...rest` spread onto the root.
- [ ] `rating-hidden` and the per-item `mask-*` / `bg-*` classes are documented as caller classes (§3b, §3c, §3d).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] Probe (§5c):
  ```astro
  <Rating><input type="radio" name="r1" class="mask mask-star" aria-label="1 star" /></Rating>
  <Rating size="lg" half id="x" data-test="y">ok</Rating>
  <Rating value={3}>must error — items are slot content (§2)</Rating>
  <Rating readonly>must error — use divs with aria-current (§3e)</Rating>
  <Rating color="primary">must error — colour is a bg-* on each item (§3d)</Rating>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `ReadOnly`, `Star2Warning`, `HeartMultipleColors`, `Star2Green`, `Sizes` (five, **five distinct names**), `WithRatingHidden`, `HalfStars`.

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`MissingAriaLabel`** — one rating with labels beside one without, with a devtools note (§3a).
- **`HalfMismatch`** — `mask-half-*` items **without** `half` on the container, showing the stretched row (§3c).
- **`NoClearOption`** — a rating without `rating-hidden`, demonstrating that it cannot be reset once set (§3b).

**Every story uses a story-scoped `name`** (§3f.3), with a comment — the doc page itself uses `rating-1` … `rating-11` for exactly this reason **[verified]**.

## 6. Steps

- [x] **Step 1: done for §3f.1** — 18 ratings render their items as direct children and as siblings of each other, which is what the `:has(~ :checked)` fill rule and the `.rating *` sizing rule both need. §3f.2 (`:has()`) and §3f.4 (`mask`) are runtime and move to Step 5. §3f.3 is handled by construction: every story scopes its `name`.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, no colour axis; `variants.ts` untouched.
- [x] **Step 3: done.** Component written per §4. Gate walked; the probe errored on all three intended lines — `size="2xl"`, and both of the APIs this plan rejects, `value` and `readonly`.
- [x] **Step 4: done.** `Rating.stories.ts`, 12 stories, each with its own radio-group name.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and the fill is the component.** Verify: **selecting a star lights every star before it**, not just the one clicked — if only the selected star lights, that is `:has()` support rather than a different design (§3f.2); `WithClearItem`'s invisible first item clears the rating when clicked or tabbed to (§3b); `HalfStars` reads as five stars in ten clickable halves, and **`HalfMismatch`'s first row is visibly wrong** (§3c); `MultipleColors` keeps each heart its own colour in both states (§3d); `ReadOnly` shows three filled stars and does not respond to clicks (§3e); and the shapes are masked rather than square (§3f.4).
- [x] **Step 6: done — forwarding confirmed and §3f.1 asserted.** `Passthrough` renders `<div class="rating rating-lg mine gap-1" id="rating-1" data-test="yes" style="letter-spacing:2px">`. Full output in §8.
- [x] **Step 7: done — the `Rating` row in `plans/README.md` says Implemented**, and `plans/components/mask.md` §3c's cross-reference is now live in both directions.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 8 daisyUI classes reachable: base, `half`, 5 sizes, plus `rating-hidden` documented as a caller class.
- [x] Items render as direct siblings and the `:has(~ :checked)` fill works (§0, §3f.1).
- [x] No invented axis — no `value`/`max`, no `readonly`, no `color` (§2, §3d, §3e).
- [x] JSDoc states: every item needs `aria-label` (§3a), `rating-hidden` goes first (§3b), `half` pairs with `mask-half-*` (§3c), colour is a per-item `bg-*` (§3d), and read-only uses `aria-current` (§3e).
- [x] Stories use scoped `name` values (§3f.3).
- [x] The Mask cross-reference is in place, both ways (§3c).
- [x] One story per doc-page example, plus `MissingAriaLabel`, `HalfMismatch` and `NoClearOption`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, 0 warnings, 0 hints.

```
Default        → <div class="rating"><input type="radio" name="rating-1" class="mask mask-star"
                   aria-label="1 star" /> … ×5, the second checked
ReadOnly       → <div class="rating"><div class="mask mask-star" aria-label="1 star"></div> …
                   <div class="mask mask-star" aria-label="3 star" aria-current="true"></div> …
WithClearItem  → <div class="rating rating-lg">
                   <input type="radio" name="rating-7" class="rating-hidden" aria-label="clear" />
                   … five mask-star-2 items after it
HalfStars      → <div class="rating rating-lg rating-half">… ten items alternating
                   mask-half-1 / mask-half-2, each with a half-step aria-label
Passthrough    → <div class="rating rating-lg mine gap-1" id="rating-1" data-test="yes"
                   style="letter-spacing:2px">…
```

What this settles:

- **§3f.1**: 18 ratings hold their items as direct children and as siblings. Both of daisyUI's mechanisms depend on it — `.rating *` for the sizing, and `:has(~ :checked)` for the fill — so a wrapper would have made one item of everything and the fill would never work.
- **The clear item is first in both ratings that have one**, which is not cosmetic: the fill lights everything *before* the checked item, so a clear-radio placed in the middle would be lit by any higher rating (§3b).
- **100 items carry an `aria-label`**, the exception being `MissingAriaLabel`'s deliberately unlabelled group. Since the radios are `appearance: none`, that attribute is the only accessible name they have (§3a).
- **The read-only form is the same component with different children** — divs and one `aria-current="true"`, no `readonly` prop (§3e).
- All 8 classes have rules in the built stylesheet, and the mask and colour classes on the items come from Mask and Tailwind respectively (§0, §3d).

Not settled here: the fill itself. Step 5.
