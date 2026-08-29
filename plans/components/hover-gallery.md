# Hover Gallery Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/hover-gallery/ — **the source markdown was not retrievable** from the docs repo on 2026-08-29 (the same gap as `plans/components/hover-3d-card.md`). This plan is derived from the shipped CSS, which is complete; **capturing the page's examples is Step 1** (§6).
**Root element:** `div` by default, polymorphic to `figure` — see §3c
**Target file:** `packages/daisy-astro/src/components/HoverGallery/HoverGallery.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/HoverGallery/HoverGallery.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/hovergallery.css`. §3e lists what is **unverified**.

---

## 0. Invisible strips that swap the visible image

```css
.hover-gallery { --items:1; display:inline-grid;
                 grid-template-columns: repeat(var(--items), 1fr);
                 gap:1px; width:100%; overflow:hidden }
.hover-gallery:is(figure) { display:inline-grid }

.hover-gallery:has(> :nth-child(3))  { --items:2 }
.hover-gallery:has(> :nth-child(4))  { --items:3 }
…
.hover-gallery:has(> :nth-child(10)) { --items:9 }

.hover-gallery > * { grid-row:1; opacity:0; object-fit:cover; width:100%; height:100%;
                     &:first-child  { opacity:1; grid-column:1/-1 }
                     &:nth-child(2) { grid-column:1 }
                     …
                     &:nth-child(10){ grid-column:9 }
                     &:nth-child(n+11) { display:none } }
.hover-gallery > :hover { opacity:1; grid-column:1/-1 }
.hover-gallery:has(:hover) > :first-child { display:none }
```

**[all verified]**. Every image occupies grid row 1. The **first** child spans the full width and is the only visible one at rest; children 2…10 are transparent vertical strips laid side by side over it. Hovering strip *k* makes it opaque and expands it to the full width, while the first child is removed.

No JavaScript, no classes beyond the one, and **no markup for the component to generate** — unlike `plans/components/hover-3d-card.md` §0, the "zones" here *are* the images. So this is a one-file, one-class component whose whole plan is the counting rules in §3.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type |
|---|---|---|---|
| Base | `hover-gallery` | — | — |

**One class, no parts, no modifiers.** `grep -oE '\.hover-gallery[a-z0-9-]*' hovergallery.css | sort -u` returns exactly `.hover-gallery` **[verified]**. Eleventh component in the library with an empty variant table.

`--items` is a custom property but is **derived, not configured** — daisyUI sets it from the child count with nine `:has()` rules **[verified]**. Overriding it from a caller would desynchronise the columns from the strips. No prop.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]**.)

## 2. Slots

| Slot | Wrapper element | Optional? | Notes |
|---|---|---|---|
| `default` | none — direct children of `.hover-gallery` | no | the images, `<img>` or anything else |

Single default slot. Children are the API; there is nothing else to pass.

**No `images` array prop.** The children are styled directly (`object-fit: cover; width:100%; height:100%` **[verified]**), so each one is the caller's own `<img>` with its own `alt`, `loading`, `srcset` and sizes — an array would have to re-invent all of it. Same reasoning as `plans/components/carousel.md` §2.

## 3. Five things the naive implementation gets wrong

### 3a. The first child is the resting image, not a hover target

`:first-child` gets `opacity: 1; grid-column: 1/-1`, and **`:has(:hover) > :first-child { display: none }`** **[verified]** — the moment the pointer enters the gallery, the resting image is removed and whichever strip is under the pointer takes over.

So an N-child gallery shows **N−1 hoverable images**, and the first is a separate resting frame. Two ways to use it, both valid and worth naming in the JSDoc:

- **Duplicate the first image** — `[A, A, B, C]` gives a gallery of A/B/C where A is also the resting state. This is almost certainly what the doc page does; confirm at Step 1.
- **Use a distinct cover** — `[cover, A, B, C]` shows a poster frame at rest.

Passing `[A, B, C]` and expecting three hover targets gives two, with A never reachable. That is the most likely first-use mistake, and `MissingRestingFrame` (§5) shows it.

### 3b. It silently caps at ten children

`.hover-gallery > :nth-child(n+11) { display: none }` **[verified]**, and the `--items` ladder stops at `:nth-child(10)` **[verified]**. So a gallery holds a resting frame plus at most **nine** hoverable images; the eleventh child vanishes with no error.

Same class of silent cap as `plans/components/fab.md` §3d's flower. JSDoc states it; `Overflow` (§5) shows it once.

### 3c. `figure` is explicitly supported

`.hover-gallery, .hover-gallery:is(figure) { display: inline-grid }` **[verified]** — daisyUI writes the `:is(figure)` arm specifically, which is `plans/README.md` §6's own signal for exposing the element choice.

So the root is `Polymorphic<{ as: Tag }>` defaulting to `'div'`, with `as="figure"` available — the semantically better choice when the gallery is a self-contained illustration, and the one that lets a caller add a `<figcaption>`… **except** that a `<figcaption>` inside would become a hover strip (§3a). The JSDoc says: `as="figure"` yes, `<figcaption>` outside the gallery.

Being polymorphic brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

### 3d. Every child is stretched, and the gallery has no height

Children get `width: 100%; height: 100%; object-fit: cover` **[verified]** — so mismatched aspect ratios are cropped, not letterboxed, which is the point.

But the root sets `width: 100%` and **no height** **[verified]**, and it is `inline-grid`. With every child stretched to 100% of a row whose height is determined by… the tallest child, which is itself stretched — the practical result is that the gallery needs either an explicit height on the root (`class="h-64"`) or intrinsically-sized images. Confirm which at Step 5; the doc page's examples will settle it. Same family as `plans/components/diff.md` §3c.

`gap: 1px` **[verified]** leaves a hairline between strips at rest — invisible while the first child covers them, visible for a frame during the swap. Not a bug.

### 3e. Unverified assumptions

1. **The doc page's examples**, per the header — including whether the first image is duplicated (§3a) and how the height is established (§3d). Step 1.
2. **Do slot children land as direct children?** Blocking: every rule is `> :nth-child(k)`, so a wrapper would become the single child — one full-width image, no strips, no hover at all. Sixteenth plan to hit the shared question in `plans/components/aura.md` §3e.1.
3. **`:has()` support.** Both the `--items` ladder and the resting-frame removal are `:has()` **[verified]**; without it the gallery renders as a single image with no interaction. Degrades to something sensible — confirm once.
4. **Touch devices.** No `@media (hover: hover)` guard **[verified]**, so on a touchscreen the gallery is a static first image and the strips are unreachable. Worth a JSDoc line rather than a workaround daisyUI does not have.

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * Swaps between images as the pointer moves across them. Pure CSS.
 *
 * The **first child is the resting frame** and is hidden as soon as the
 * pointer enters, so an N-image gallery has N−1 hover targets. Duplicate your
 * first image, or pass a distinct cover (plan §3a).
 *
 * Caps at ten children — the eleventh is `display:none` (plan §3b).
 *
 * `as="figure"` is supported, but a `<figcaption>` inside would become a hover
 * strip — put it outside (plan §3c).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }>;

// No variant class map: daisyUI defines exactly one class here (plan §1).

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'div', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['hover-gallery', className]} {...rest}>
  <slot />
</Tag>
```

No `<script>`: pure CSS.

### Astro idioms gate

- [ ] Content arrives via a plain default slot — no `images` array prop (§2).
- [ ] `<slot />` has no wrapper — every rule is `> :nth-child(k)` (§3e.2).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root defaults to `div` via `Polymorphic`, with `figure` available (§3c).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] No `--items` prop — it is derived (§1).
- [ ] No class interpolation — there are no variant classes.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3c).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <HoverGallery class="h-64"><img src="/a.webp" alt="A" /><img src="/a.webp" alt="A" /></HoverGallery>
  <HoverGallery as="figure" id="x" data-test="y">ok</HoverGallery>
  <HoverGallery items={3}>must error — --items is derived (§1)</HoverGallery>
  <HoverGallery color="primary">must error — no colour axis (§1)</HoverGallery>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. **Doc-page examples to be filled in at Step 1** (§3e.1). Until then:

- `Playground` — four images, the first duplicated (§3a).
- `AsFigure` — `as="figure"` with a `<figcaption>` **outside** the gallery (§3c).
- `MissingRestingFrame` — three distinct images with no duplicate, beside a correct copy, showing that the first is unreachable (§3a).
- `Overflow` — twelve children, so the eleventh and twelfth vanish (§3b).
- `Passthrough` — native attributes and `class` merging.

Every story needs a height (§3d) — a comment says so once Step 5 settles which form the doc page uses.

## 6. Steps

- [ ] **Step 1:** **Open https://daisyui.com/components/hover-gallery/ and capture its examples**, settling §3a (is the first image duplicated?) and §3d (how the height is set). Also resolve §3e.2 — blocking.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate. **Run the probe** — the generic failure is silent.
- [ ] **Step 4:** Write `HoverGallery.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: at rest only one image is visible; moving across the gallery swaps images at even intervals; the number of hover targets is **one fewer** than the child count (§3a); `Overflow` shows nine targets and drops the rest (§3b); `AsFigure` renders a `<figure>` and behaves identically. Check §3e.4 on a touch emulator.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<(div|figure) class="hover-gallery[^"]*"[^>]*><img' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Hover Gallery` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] The single daisyUI class is applied; `--items` stays derived (§1).
- [ ] Children render as direct children — checked in the build output (§3e.2).
- [ ] Root defaults to `div` and accepts `as="figure"`; probe passes (§3c).
- [ ] No invented axis — no `images` prop, no `--items` prop.
- [ ] JSDoc states: the first child is a resting frame (§3a), the ten-child cap (§3b), `figcaption` goes outside (§3c), and hover-only interaction (§3e.4).
- [ ] Doc-page examples captured and storied (§3e.1).
- [ ] Every box in §4's gate ticked.
