# Loading Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/loading/
**Root element:** `span` (void of content — no slot, §2)
**Target file:** `packages/daisy-astro/src/components/Loading/Loading.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Loading/Loading.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'span'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Loading.astro` and 12 stories are in the repo per §4/§5; markup, type probe and CSS coverage verified (§8). Step 5 (visual pass) is open, and it carries the one question that matters most here — whether the SMIL masks actually animate (§3e.1). Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/loading.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. An SVG mask over a currentColor block

```css
.loading { display:inline-block; aspect-ratio:1; vertical-align:middle;
           width: calc(var(--size-selector,.25rem) * 6);
           background-color: currentColor; pointer-events:none;
           mask-image:url("data:image/svg+xml,…<animateTransform …/>…");
           mask-position:50%; mask-size:100%; mask-repeat:no-repeat }
@media (prefers-reduced-motion: no-preference) { .loading { mask-image:url("…dur='2s'…") } }
```

**[verified]**. Every animation is an **inline SVG data-URI used as a mask** over a `currentColor` background — the SVG animates itself with SMIL (`<animateTransform>`, `<animate>`), so there is no CSS keyframe and no JavaScript.

Two things fall out immediately, and they are most of the plan: colour comes from `currentColor` (§3a), and reduced motion is handled by **swapping the mask for a slower one** rather than stopping it (§3c).

## 1. Variant audit

**12 classes: 1 base + 6 style + 5 size**, matching the doc page's frontmatter. `grep -oE '\.loading[a-z0-9-]*' loading.css | sort -u` returns exactly those 12 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `loading` | — | — | Always applied. Carries the **spinner** mask by default (§3b). |
| Style | `loading-spinner` `-dots` `-ring` `-ball` `-bars` `-infinity` | `variant` | `'spinner' \| 'dots' \| 'ring' \| 'ball' \| 'bars' \| 'infinity'` | **Must not be named `style`** (`plans/components/button.md` §3a). Mutually exclusive — each replaces `mask-image` — so a union. Local. |
| Size | `loading-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Sets `width`, with `aspect-ratio: 1` doing the rest. `md` is the default and still emittable. |

**No colour axis** — there is no `loading-primary` **[verified]**. §3a.

## 2. Slots

**None.** Every doc example is `<span class="loading loading-spinner loading-xs"></span>` — self-closing, no content **[verified]**, and content would sit *on top of* the mask rather than beside it.

Fifth component in the library with no slot, after Checkbox, `CountdownValue`, File Input and `HeroOverlay` — and here because the element **is** the graphic, like `HeroOverlay` (`plans/components/hero.md` §3a).

## 3. Five things the naive implementation gets wrong

### 3a. Colour is `currentColor`, set with `text-*`

`background-color: currentColor` **[verified]**, and the doc page's colour example is eight spinners with `text-primary`, `text-secondary`, … — **Tailwind text utilities, not daisyUI classes** **[verified]**.

So **no `color` prop**. A `color?: DaisyColor` would have to emit `text-primary`, which is a Tailwind class this library does not own and would duplicate what `class` already does. Same call as `plans/components/aura.md` §3a and `plans/components/card.md` §1.

The JSDoc says: `class="text-primary"`. Worth being explicit, because Badge, Alert and Progress all *do* have colour props and a caller will look for one here.

Inside a `Button`, the spinner inherits the button's foreground automatically — which is the most common use and needs nothing at all.

### 3b. The base class already draws a spinner

`.loading` on its own carries the full spinner mask **[verified]** — `loading-spinner` re-declares the same graphic. So `<Loading />` with no `variant` is a working spinner, and `variant="spinner"` is the explicit form of the default, exactly like `md` in the size axis.

Consequence: **a typo'd or unset variant never renders "nothing"**, it renders a spinner. That makes the failure mode friendly, and it also means `variant` is genuinely optional rather than effectively required.

### 3c. Reduced motion slows the animation; it does not stop it

The base rule's mask uses `dur='8s'` / `dur='6s'`, and a `@media (prefers-reduced-motion: no-preference)` block swaps in a `dur='2s'` version **[verified]** — i.e. the **default is the slow one** and the fast animation is opt-in via the media query.

That is inverted from the usual pattern (animate by default, disable under `reduce`), and it means a user with reduced motion still sees a slow-moving spinner. daisyUI's choice, matching `plans/components/aura.md` §3d's 4× slowdown. Do **not** add a `motion-reduce:animate-none` default; a caller who wants full stillness adds it.

### 3d. It is decorative markup with no accessible name

`.loading` is `pointer-events: none` **[verified]** and every doc example is an **empty `<span>`** — so a screen reader encounters nothing at all. A loading indicator that announces nothing is the common case for an inline button spinner (where the button's own text still reads), and the wrong case for a full-page loader.

Neither `role="status"` nor `aria-label` is defaulted: `role="status"` on a decorative spinner inside a button would announce an empty live region on every render, which is worse than silence. Same reasoning as `plans/components/divider.md` §3e's `role="separator"` — the right answer depends on the caller's intent.

The JSDoc names both remedies (`aria-label="Loading"`, or `role="status"` with `aria-live` on a wrapper), `...rest` carries them, and `WithAccessibleName` (§5) shows one.

### 3e. Unverified assumptions

1. **SMIL animation support.** Every variant animates via `<animateTransform>` / `<animate>` inside the mask's data-URI **[verified]** — SMIL, not CSS. Support is broad but it is deprecated in some engines' roadmaps, and a mask that fails to animate renders a **static shape**, not nothing. One check in Step 5, and it is the single most likely "why isn't it spinning" cause.
2. **`mask-image` prefixing.** daisyUI emits unprefixed `mask-*` **[verified]**; confirm the shapes render at all in the Storybook browser before judging anything else.

**Not a risk here:** no child selectors, no parts, no `:nth-child` **[verified]** — the shared slot-wrapping question that gates eighteen sibling plans does not apply, and there is no slot anyway. Same conclusion as `plans/components/kbd.md` §3d.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type LoadingVariant = 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';

/**
 * An animated loading indicator. The element **is** the graphic — an SVG mask
 * over a `currentColor` block — so it takes no children (plan §2).
 *
 * Colour comes from the text colour: `class="text-primary"`, or nothing at all
 * inside a `Button`, where it inherits (plan §3a). There is no `color` prop.
 *
 * Decorative by default: add `aria-label="Loading"`, or wrap it in a
 * `role="status"` region, when it is the only thing announcing the wait
 * (plan §3d).
 */
interface Props extends HTMLAttributes<'span'> {
  /**
   * Named `variant`, never `style` — `style` is a native attribute.
   * Omitted renders the spinner, which the base class already carries
   * (plan §3b).
   */
  variant?: LoadingVariant;
  size?: DaisySize;
}

// Full literal class names. NEVER `loading-${variant}` (plans/README.md §1b).
const VARIANT: Record<LoadingVariant, string> = {
  spinner: 'loading-spinner', dots: 'loading-dots', ring: 'loading-ring',
  ball: 'loading-ball', bars: 'loading-bars', infinity: 'loading-infinity',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'loading-xs', sm: 'loading-sm', md: 'loading-md',
  lg: 'loading-lg', xl: 'loading-xl',
};

const { variant, size, class: className, ...rest } = Astro.props;
---

<span class:list={['loading', variant && VARIANT[variant], size && SIZE[size], className]} {...rest}></span>
```

No `<script>`: the animation is SMIL inside the mask, and reduced motion is daisyUI's (§3c). Not polymorphic — daisyUI documents `loading` on a `span`.

### Astro idioms gate

- [ ] **No `<slot />`** — the element is the graphic (§2).
- [ ] No `Astro.slots.has()` gating — there are no slots.
- [ ] Root is `span`; no `as` prop.
- [ ] No `<script>` added, and **no `motion-reduce:` default** (§3c).
- [ ] `...rest` spread onto the root — this is what carries `aria-label` and `role` (§3d).
- [ ] **No `color` prop** (§3a).
- [ ] Style axis is named `variant`, not `style`.
- [ ] Every variant class is a literal in a `Record` map — no `` `loading-${variant}` ``.
- [ ] Probe (§5c):
  ```astro
  <Loading />
  <Loading variant="bars" size="lg" class="text-primary" aria-label="Loading" />
  <Loading color="primary">must error — colour is a text utility (§3a)</Loading>
  <Loading variant="pulse">must error — not a loading style</Loading>
  <Loading>must error — no slot (§2)</Loading>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — each is a size row of one variant: `Spinner`, `Dots`, `Ring`, `Ball`, `Bars`, `Infinity`, then `Colors` (eight `text-*` spinners).

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`DefaultIsSpinner`** — `<Loading />` beside `variant="spinner"`, identical on purpose (§3b).
- **`InButton`** — a `Button` containing a `Loading`, inheriting the button's foreground with no colour class (§3a). The most common real use, and the doc page has no example of it.
- **`WithAccessibleName`** — a bare spinner beside one with `aria-label="Loading"`, with a comment pointing at §3d.

## 6. Steps

- [x] **Step 1: done at the markup level.** All 12 `loading-*` rules are in the built stylesheet. SMIL support (§3e.1) is a runtime question and moves to Step 5 — a static shape there means that, not the component.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 and the gate walked. Two probe lines from §4's listing were dropped as unachievable: `color="primary"` cannot error on any component (`plans/components/avatar.md` §3e.3), and passing children to a slotless component is not a type error either (`plans/components/status.md` §3e.4). The remaining lines — `variant="pulse"`, `size="2xl"` — errored as intended.
- [x] **Step 4: done.** `Loading.stories.ts`, 12 stories per §5. `InButton` composes the real `Button`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: all six variants **animate** — a static shape is §3e.1, the single most likely cause; five distinct sizes per variant; `Colors` shows eight hues; `DefaultIsSpinner` is indistinguishable (§3b); `InButton` matches the button's foreground with no colour class; then enable reduce-motion in the browser and confirm the spinner **slows rather than stops** (§3c).
- [x] **Step 6: done — forwarding confirmed and the empty-element rule asserted.** `Passthrough` renders `<span class="loading loading-ring loading-lg text-primary mine" id="loading-1" data-test="yes" style="opacity:.9" aria-label="Loading"></span>`, and no rendered `.loading` element in any story contains content (§2, checked across all twelve). Full output in §8.
- [x] **Step 7: done — the `Loading` row in `plans/README.md` says Implemented.** Landing this also cleared the `TODO(daisy-astro)` in `Button.stories.ts`: `WithLoadingSpinner` now composes the real component instead of a hardcoded span (`plans/IMPLEMENTATION-ORDER.md` §5.2).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 12 daisyUI classes reachable: base, 6 variants, 5 sizes.
- [x] `size` uses `DaisySize`, imported, not redeclared.
- [x] No slot, and every rendered element is empty (§2).
- [x] No invented axis — **no `color` prop** (§3a), no motion prop (§3c), no ARIA defaults (§3d).
- [x] JSDoc states: colour via `text-*` (§3a), the base class is already a spinner (§3b), reduced motion slows rather than stops (§3c), and it is decorative until labelled (§3d).
- [x] One story per doc-page example, plus `DefaultIsSpinner`, `InButton` and `WithAccessibleName`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Spinner…Infinity → <span class="loading loading-spinner loading-xs"></span> … loading-xl   (one row per variant)
Colors           → <span class="loading loading-spinner text-primary"></span> ×8   ← Tailwind utilities, not daisyUI classes
DefaultIsSpinner → <span class="loading"></span><span class="loading loading-spinner"></span>
InButton         → <button class="btn btn-primary"><span class="loading loading-spinner"></span>Loading</button>
                   <button class="btn btn-primary btn-square"><span class="loading loading-spinner"></span></button>
WithAccessible…  → <span class="loading loading-bars"></span>
                   <span class="loading loading-bars" aria-label="Loading"></span>
Passthrough      → <span class="loading loading-ring loading-lg text-primary mine" id="loading-1"
                     data-test="yes" style="opacity:.9" aria-label="Loading"></span>
```

What this settles:

- **Every rendered `.loading` element is empty**, across all twelve stories (§2).
- `DefaultIsSpinner` shows the bare `loading` class alongside the explicit one — confirming §3b's claim at the markup level, though whether they *look* identical is Step 5.
- Colour is a `text-*` class in the class list, never a `loading-*` one, so §3a's "no colour prop" decision is visible in the output.
- `InButton` carries no colour class at all, which is the point: the spinner inherits through `currentColor`.
- All 12 classes have rules in the built stylesheet.

Not settled here, and it is the whole component: **whether any of it moves.** The animation is SMIL inside a mask data-URI, so it cannot be verified from markup or from the stylesheet. Step 5.
