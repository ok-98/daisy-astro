# Phone Mockup Component Plan

**daisyUI category:** Mockup
**daisyUI doc page:** https://daisyui.com/components/mockup-phone/ (docs path is `mockup-phone`; this repo's slug is `phone-mockup`)
**Root element:** `div` (all three components)
**Target files:** `packages/daisy-astro/src/components/PhoneMockup/PhoneMockup.astro`, `PhoneMockupCamera.astro`, `PhoneMockupDisplay.astro` (only `PhoneMockup.astro` exists, as a dummy scaffold)
**Story files:** `PhoneMockup.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/mockup.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. Shared file, shared naming inversion

`mockup-phone` lives in the same `mockup.css` as Browser, Code and Window, and carries the same four-way naming divergence (class `mockup-phone`, directory `PhoneMockup`, docs URL `mockup-phone`, repo slug `phone-mockup`). Both points are written up in `plans/components/browser-mockup.md` §0 and are not repeated.

The complete rule set **[verified]**:

```css
.mockup-phone { display:inline-grid; justify-items:center; overflow:hidden;
                aspect-ratio:462/978; width:100%; max-width:462px; padding:6px;
                background-color:#000; border:5px solid #6b6b6b; border-radius:65px }
@supports (corner-shape: superellipse(1.45)) {
  .mockup-phone { corner-shape: superellipse(1.45); border-radius:90px } }

.mockup-phone-camera  { grid-area:1/1/1/1; z-index:1; width:28%; height:3.7%;
                        margin-top:3%; background:#000; border-radius:17px }
.mockup-phone-display { grid-area:1/1/1/1; width:100%; height:100%;
                        border-radius:54px; overflow:hidden }
@supports (corner-shape: superellipse(1.87)) {
  .mockup-phone-display { corner-shape: superellipse(1.87); border-radius:101px } }
.mockup-phone-display > img { object-fit:cover; width:100%; height:100% }
```

A one-cell grid — camera and display both occupy `1/1/1/1`, with the camera on top by `z-index` — the same stacking trick as `plans/components/hero.md` §0, at a smaller scale.

## 1. Variant audit

**3 classes: 1 component + 2 part**, matching the doc page's frontmatter. `grep -oE '\.mockup-phone[a-z0-9-]*' mockup.css | sort -u` returns exactly those 3 **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Component |
|---|---|---|---|---|
| Base | `mockup-phone` | — | — | `PhoneMockup` |
| Part | `mockup-phone-camera` | — | — | `PhoneMockupCamera` |
| Part | `mockup-phone-display` | — | — | `PhoneMockupDisplay` |

**No colour, size, style or state axis** — none exists **[verified]**. Fourteenth component in the library with an empty variant table. The `border-[#ff8938]` in the second doc example is an arbitrary Tailwind value on the root (§3b).

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `PhoneMockup` | `default` | none — grid children | no | a `PhoneMockupCamera` and a `PhoneMockupDisplay` |
| `PhoneMockupCamera` | — | — | — | **none** — empty by design (§3a) |
| `PhoneMockupDisplay` | `default` | none | no | text, or a single `<img>` |

**No named slots on `PhoneMockup`.** Both children are in the same grid cell, so their order does not matter and neither is conditional — sub-components keep the parent at zero logic, the same call as `plans/components/hero.md` §2.

## 3. Five things the naive implementation gets wrong

### 3a. `PhoneMockupCamera` renders an empty element and takes no slot

`<div class="mockup-phone-camera"></div>` in both doc examples **[verified]**, and the CSS gives it a fixed 28% × 3.7% black pill.

So it takes **no slot** — sixth component in the library with none, after Checkbox, `CountdownValue`, File Input, `HeroOverlay` and Loading. Here, as with `HeroOverlay` (`plans/components/hero.md` §3a), because the element *is* the graphic.

It is also the reason the parent is a grid rather than a flex column: the camera sits **over** the display at `z-index: 1` **[verified]**, not above it in flow.

### 3b. The bezel colour is the border, and it is the only thing meant to be customised

`border: 5px solid #6b6b6b` **[verified]** — a hard-coded grey, not a theme token. The doc page's second example overrides it with `class="border-[#ff8938]"` **[verified]**, an arbitrary Tailwind value.

So **no `color` prop**: it would emit a Tailwind arbitrary-value class this library does not own — the same reasoning that rejected one for `plans/components/loading.md` §3a and `plans/components/hero.md` §3b. The JSDoc names the class instead.

Note the body is `background-color: #000` **[verified]**, also literal. A phone mockup does not follow the daisyUI theme, by design.

### 3c. The aspect ratio is fixed, so only the width is yours

`aspect-ratio: 462/978; width: 100%; max-width: 462px` **[verified]** — the mockup fills its container up to 462 px and derives its height. There is no height to set, and setting one fights the ratio.

Consequences worth a JSDoc line: sizing is `class="w-64"` or a narrower container, **not** `h-*`; and `462/978` is an iPhone-shaped ratio, which is what the doc page's title says it is modelling.

`display: inline-grid` **[verified]** means it shrinks to that width rather than filling a block — the same shape as `plans/components/aura.md` §3c.

### 3d. Two nested superellipse rounding blocks, with a plain fallback

Both `.mockup-phone` and `.mockup-phone-display` carry an `@supports (corner-shape: superellipse(…))` block that swaps the radius for a squircle **[verified]** — `65px → 90px` on the frame and `54px → 101px` on the display.

`corner-shape` is the newest CSS in this component, and unlike `plans/components/join.md` §3b's `@scope` the fallback is explicit and good: an unsupporting browser gets ordinary rounded corners at the smaller radii. Nothing to implement; worth one check in Step 5 so a "wrong" corner radius is recognised as the fallback rather than a bug.

`.mockup-phone-display > img` is a **direct-child** rule setting `object-fit: cover; width/height: 100%` **[verified]** — the wallpaper example depends on it, and it is why §3e.1 matters for the display specifically.

### 3e. Unverified assumptions

1. **Do slot children land as direct children?** Blocking in two places: `.mockup-phone`'s children need `grid-area: 1/1/1/1` (they get it from their own classes, so a wrapper would sit in the cell instead and the camera would stop overlapping), and `.mockup-phone-display > img` is a direct-child rule (§3d) — a wrapped image renders at its natural size inside a clipped box. Twenty-third plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **`corner-shape` support** (§3d) — cosmetic, but check before judging the silhouette.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with Avatar, Card, Carousel, Diff, Hero, List and Mask.

**Not shared with Browser Mockup:** that component's selectors are descendant-based (`plans/components/browser-mockup.md` §3e); this one's are not. Same CSS file, opposite conclusion.

## 4. Component implementation

### `PhoneMockup.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * An iPhone-shaped frame. A one-cell grid: the camera sits **over** the
 * display, so their order in the slot does not matter (plan §0, §3a).
 *
 * The aspect ratio is fixed at 462/978 — size it with `class="w-64"`, never
 * with a height (plan §3c).
 *
 * The bezel is a literal grey border, not a theme colour: recolour it with
 * `class="border-[#ff8938]"` as the doc page does (plan §3b).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['mockup-phone', className]} {...rest}>
  <slot />
</div>
```

### `PhoneMockupCamera.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/** The notch pill. **Empty by design** — it takes no children (plan §3a). */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['mockup-phone-camera', className]} {...rest}></div>
```

### `PhoneMockupDisplay.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * The screen. A single `<img>` inside fills it via a direct-child rule, so
 * don't wrap it (plan §3d). For text, add your own layout classes:
 * `class="text-white bg-neutral-900 grid place-content-center"`.
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['mockup-phone-display', className]} {...rest}>
  <slot />
</div>
```

No `<script>` anywhere: pure CSS. None is polymorphic — daisyUI documents all three on a `div`.

### Astro idioms gate

- [ ] `PhoneMockup` and `PhoneMockupDisplay` take plain default slots; **`PhoneMockupCamera` has none** (§3a).
- [ ] `<slot />` has no wrapper in either — the grid cell and the `> img` rule both depend on it (§3e.1).
- [ ] No `Astro.slots.has()` gating — the camera's optionality is expressed by not rendering it.
- [ ] Roots are `div` in all three; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in all three.
- [ ] **No `color` prop** (§3b), no `size`/`height` prop (§3c).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <PhoneMockup class="w-64"><PhoneMockupCamera /><PhoneMockupDisplay>Hi</PhoneMockupDisplay></PhoneMockup>
  <PhoneMockup class="border-[#ff8938]" id="x" data-test="y">ok</PhoneMockup>
  <PhoneMockupCamera>must error — no slot (§3a)</PhoneMockupCamera>
  <PhoneMockup color="primary">must error — no colour axis (§1)</PhoneMockup>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Three files. Doc-page examples in page order (`plans/README.md` §8) — there are only two:

| Doc-page example | Story | Notes |
|---|---|---|
| iPhone mockup | `Default` | display `class="text-white bg-neutral-900 grid place-content-center"`, text `It's Glowtime.` |
| With color and wallpaper | `WithWallpaper` | root `class="border-[#ff8938]"`, display holding a single `<img>` |

Plus `Playground` and `Passthrough`; `PhoneMockupCamera` and `PhoneMockupDisplay` get a `Playground` + `Passthrough` each.

Two beyond the doc page:

- **`NoCamera`** — display only, showing that the camera is optional and the display fills the whole frame.
- **`Narrow`** — `class="w-48"` beside a full-width one, demonstrating §3c's width-only sizing.

Both doc examples are 462 px tall at full width; the stories constrain the width (`w-64`) so several fit in the canvas, with a comment noting the doc page renders them unconstrained.

## 6. Steps

- [ ] **Step 1:** Resolve §3e.1 (direct children, both levels) — blocking. Settle §3e.3 (image URLs) with the seven other plans.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `PhoneMockup.astro` scaffold and create the two part components per §4, then walk the gate.
- [ ] **Step 4:** Replace `PhoneMockup.stories.ts` and add the two sub-component story files per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is a black phone-shaped frame with a grey bezel and a small notch pill at the top of the screen — the notch **overlapping** the display, not above it (§3a); `WithWallpaper` fills the screen edge-to-edge with the image and shows an orange bezel (§3b, §3d); `Narrow` keeps the same proportions at a smaller width (§3c); check the corner silhouette against §3d's `corner-shape` fallback.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="mockup-phone[^"]*"[^>]*><div class="mockup-phone-camera"></div>' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div class="mockup-phone-display[^"]*"[^>]*><img' storybook-static/astro-prerendered-stories.json | head
  ```
  The second proves the image is a direct child (§3d, §3e.1).
- [ ] **Step 7:** Update the `Phone` row (slug `phone-mockup`) in `plans/README.md` to **Implemented**, noting the two part components.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 3 daisyUI classes reachable, one per component.
- [ ] `PhoneMockupCamera` renders empty and accepts no slot (§3a).
- [ ] An `<img>` inside the display is a direct child and fills the screen (§3d) — checked in the build output.
- [ ] No invented axis — no colour, size or height prop (§3b, §3c).
- [ ] JSDoc states: fixed aspect ratio, width-only sizing (§3c); the bezel is a border class (§3b); the camera overlaps the display (§3a); don't wrap the image (§3d).
- [ ] One story per doc-page example, plus `NoCamera` and `Narrow`.
- [ ] Every box in §4's gate ticked.
