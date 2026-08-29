# Mask Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/mask/
**Root element:** `img` by default, polymorphic — see §3a
**Target file:** `packages/daisy-astro/src/components/Mask/Mask.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Mask/Mask.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/mask.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. Fifteen shapes, all SVG data-URI masks

```css
.mask { display:inline-block; vertical-align:middle;
        mask-position:50%; mask-size:contain; mask-repeat:no-repeat }
.mask-squircle { mask-image:url("data:image/svg+xml,…<path d='M100 0C20 0 0 20…'/>…") }
… one per shape …
.mask-half-1 { mask-position:0;    mask-size:200% }
.mask-half-2 { mask-position:100%; mask-size:200% }
.mask-half-1:where(:dir(rtl), [dir=rtl], [dir=rtl] *) { mask-position:100% }
.mask-half-2:where(:dir(rtl), [dir=rtl], [dir=rtl] *) { mask-position:0 }
```

**[all verified]**. Every shape is a static SVG path used as a `mask-image` — no animation (contrast `plans/components/loading.md` §0, which uses the same technique with SMIL inside).

Like Join, Mask is really a **utility**: it crops whatever element carries it, and daisyUI's own examples put it directly on an `<img>` rather than on a wrapper.

## 1. Variant audit

**17 classes: 1 base + 15 shape + 2 modifier** — but the doc page's frontmatter lists **only 15 style entries plus the 2 modifiers and the base**, and `grep -oE '\.mask[a-z0-9-]*' mask.css | sort -u` returns exactly those 17 **[verified]**, with `mask-hexagon` and `mask-hexagon-2` counted separately.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `mask` | — | — | Always applied. |
| Shape | `mask-squircle` `-heart` `-hexagon` `-hexagon-2` `-decagon` `-pentagon` `-diamond` `-square` `-circle` `-star` `-star-2` `-triangle` `-triangle-2` `-triangle-3` `-triangle-4` | `shape` | 15-value union | Mutually exclusive — each replaces `mask-image`. Local union; **effectively required** (§3b). |
| Modifier | `mask-half-1` `mask-half-2` | `half` | `'1' \| '2'` | Mutually exclusive → union. Crops to one half of the shape (§3c). |

**No colour or size axis** — none exists **[verified]**. Every doc example sizes with `w-40 h-40`, which is caller Tailwind (§3d).

## 2. Slots

| Slot | Wrapper element | Optional? | Notes |
|---|---|---|---|
| `default` | none — inside the masked element | **yes** | empty when the root is an `<img>` (§3a) |

The slot exists only for non-`img` roots: `<Mask as="div">` wrapping content, which is what the Avatar doc page does (`<div class="w-24 mask mask-heart"><img …></div>`). With the default `<img>` root the slot must stay empty — `<img>` is void.

**No `src`/`alt` props.** Both arrive through `...rest` and are type-narrowed by `as` (§3a).

## 3. Five things the naive implementation gets wrong

### 3a. The doc page masks the `<img>` itself, not a wrapper

Every example on this page is `<img class="mask mask-squircle" src=… alt=…>` **[verified]** — the mask is applied to the image directly.

But `plans/components/avatar.md` §5's `WithMask` story uses the other shape, straight from the Avatar doc page: `<div class="w-24 mask mask-heart"><img …></div>`, where the mask is on the Avatar's inner div and the image fills it.

Both are correct, and which one you want depends on whether the element needs to size the image (`object-fit`) or just crop itself. So the root is **`Polymorphic<{ as: Tag }>` defaulting to `'img'`**, with `as="div"` for the wrapper form. That brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

A guard worth the JSDoc line: with the default `<img>` root, **passing slot content produces invalid HTML**, since `<img>` is void. §5's probe covers it, and the JSDoc says which root takes children.

### 3b. `shape` is effectively required — the base class masks nothing

`.mask` alone sets `mask-position`, `mask-size` and `mask-repeat` but **no `mask-image`** **[verified]**. So `<Mask />` with no shape renders the element completely unmasked — visually identical to not using the component at all.

That is the opposite of `plans/components/loading.md` §3b, where the base class already carried a graphic. Here the failure is silent and total.

**Decision: `shape` is a required prop**, like `plans/components/chat-bubble.md` §3a's `placement` and `plans/components/drawer.md` §0a's `toggleId`. There is no sensible default — daisyUI marks none of the fifteen as one — and a component called `Mask` that masks nothing is worse than a type error.

### 3c. `mask-half-1` / `-2` work by zooming the mask, not by clipping

```css
.mask-half-1 { mask-position: 0;    mask-size: 200% }
.mask-half-2 { mask-position: 100%; mask-size: 200% }
```

**[verified]** — the mask is scaled to twice the element and anchored to one edge, so the element shows the left or right half of the shape **stretched across its full width**, not a half-width crop.

Consequence worth stating: to get the visual "half a star" the caller must also halve the element's width, which is exactly what the Rating component does (`plans/components/rating.md`, not yet written — cross-reference it from both sides when it lands, since half-star ratings are the main use of these two classes).

RTL is handled by mirrored `:where(:dir(rtl), …)` rules **[verified]** — no direction logic here.

### 3d. `mask-size: contain` means the element's box decides the shape's aspect

`mask-size: contain` with `mask-position: 50%` **[verified]** — the shape scales to fit the element and centres, so a non-square element gets a shape floating in empty space rather than a stretched one.

Every doc example uses `w-40 h-40` **[verified]**, and the SVGs themselves are square or near-square (the decagon is `192×200`). So: **give it a square box**, or expect letterboxing. One JSDoc line; `NonSquare` (§5) shows it.

`display: inline-block; vertical-align: middle` **[verified]** — so a masked image sits on the text baseline like any inline image and needs no wrapper for layout.

### 3e. Unverified assumptions

1. **`mask-image` support and prefixing.** daisyUI emits unprefixed `mask-*` **[verified]**. Shared with `plans/components/loading.md` §3e.2 — one check covers both, and an unmasked rectangle is the symptom.
2. **Generic prop inference** — `Polymorphic` brings §5c's silent failure. The probe is mandatory (§3a).
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with Avatar, Card, Carousel, Diff, Hero and List.

**Not a risk here:** no child selectors, no parts, no `:nth-child` **[verified]** — the shared slot-wrapping question does not apply. Same conclusion as `plans/components/kbd.md` §3d.

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
type MaskShape =
  | 'squircle' | 'heart' | 'hexagon' | 'hexagon-2' | 'decagon' | 'pentagon'
  | 'diamond' | 'square' | 'circle' | 'star' | 'star-2'
  | 'triangle' | 'triangle-2' | 'triangle-3' | 'triangle-4';
type MaskHalf = '1' | '2';

/**
 * Crops an element to a shape with a CSS mask.
 *
 * Defaults to `<img>`, as daisyUI's own examples do. Use `as="div"` to wrap
 * other content — the Avatar page's shape (plan §3a). With the `img` root the
 * slot must stay empty.
 *
 * Give it a **square** box (`class="w-40 h-40"`): the mask is `contain`-sized,
 * so a non-square element leaves empty space rather than stretching (plan §3d).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  /** **Required** — the base class carries no shape at all (plan §3b). */
  shape: MaskShape;
  /**
   * Shows one half of the shape by zooming the mask to 200%, not by clipping —
   * halve the element's width too (plan §3c).
   */
  half?: MaskHalf;
}>;

// Full literal class names. NEVER `mask-${shape}` (plans/README.md §1b).
const SHAPE: Record<MaskShape, string> = {
  squircle: 'mask-squircle', heart: 'mask-heart',
  hexagon: 'mask-hexagon', 'hexagon-2': 'mask-hexagon-2',
  decagon: 'mask-decagon', pentagon: 'mask-pentagon',
  diamond: 'mask-diamond', square: 'mask-square', circle: 'mask-circle',
  star: 'mask-star', 'star-2': 'mask-star-2',
  triangle: 'mask-triangle', 'triangle-2': 'mask-triangle-2',
  'triangle-3': 'mask-triangle-3', 'triangle-4': 'mask-triangle-4',
};

const HALF: Record<MaskHalf, string> = { '1': 'mask-half-1', '2': 'mask-half-2' };

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'img', shape, half, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['mask', SHAPE[shape], half && HALF[half], className]} {...rest}>
  <slot />
</Tag>
```

No `<script>`: pure CSS, RTL included (§3c).

### Astro idioms gate

- [ ] `shape` is **required** with no default (§3b).
- [ ] Default root is `img`, with `as` via `Polymorphic`; the slot is only for non-void roots (§3a).
- [ ] No `Astro.slots.has()` gating.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root — carries `src`, `alt`, `loading`, `srcset` on `img`.
- [ ] No `src`/`alt` props (§2).
- [ ] Every variant class is a literal in a `Record` map — no `` `mask-${shape}` ``.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3e.2).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Mask shape="squircle" src="/a.webp" alt="A" class="w-40 h-40" />
  <Mask as="div" shape="heart" class="w-24"><img src="/a.webp" alt="A" /></Mask>
  <Mask shape="star" half="1" class="w-20 h-40" />
  <Mask src="/a.webp" />                 <!-- must error — shape is required (§3b) -->
  <Mask shape="octagon" />               <!-- must error — not a shape -->
  <Mask shape="star" half="3" />         <!-- must error — 1 | 2 -->
  <Mask shape="circle" color="primary" /><!-- must error — no colour axis (§1) -->
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — one per shape, fifteen in all: `Squircle`, `Heart`, `Hexagon`, `Hexagon2`, `Decagon`, `Pentagon`, `Diamond`, `Square`, `Circle`, `Star`, `Star2`, `Triangle`, `Triangle2`, `Triangle3`, `Triangle4`. Each `class="w-40 h-40"`, matching the page's rendered demos.

Plus `Playground` and `Passthrough`. Four beyond the doc page:

- **`AllShapes`** — the fifteen in one grid, since the page shows them one at a time and comparing them is the actual use case.
- **`Halves`** — `half="1"` and `half="2"` on a star at half width, showing §3c's zoom-not-clip behaviour and the width adjustment it needs.
- **`AsWrapper`** — `as="div"` around an image, the Avatar-page form (§3a).
- **`NonSquare`** — a `w-64 h-24` heart, showing §3d's letterboxing.

## 6. Steps

- [ ] **Step 1:** Check §3e.1 (`mask-image` support) — an unmasked rectangle in every story means that, not the component. Settle §3e.3 (image URLs) with the six other plans.
- [ ] **Step 2:** No new shared unions — both unions are local (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate. **Run the probe** — the generic failure is silent and `shape` being required must actually error.
- [ ] **Step 4:** Replace `Mask.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: all fifteen shapes crop distinctly at `w-40 h-40`; the four triangles point in four different directions; `star` and `star-2` differ in weight; `hexagon` is vertical and `hexagon-2` horizontal; `Halves` shows left and right halves of the same star; `NonSquare` letterboxes rather than stretching (§3d); RTL swaps the two halves with no code change (§3c).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<img class="mask mask-[a-z0-9-]+[^"]*"' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Mask` row in `plans/README.md` to **Implemented**. Cross-reference §3c from `plans/components/rating.md` when it is written.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 17 daisyUI classes reachable: base, 15 shapes, 2 halves.
- [ ] `shape` is required and a missing one is a type error (§3b).
- [ ] Default root is `img`; `as="div"` works and takes children; probe passes (§3a).
- [ ] No invented axis — no colour, no size, no `src`/`alt` props (§1, §2).
- [ ] JSDoc states: `shape` is required (§3b), halves zoom rather than clip (§3c), a square box is expected (§3d), and which root takes children (§3a).
- [ ] One story per doc-page example, plus `AllShapes`, `Halves`, `AsWrapper` and `NonSquare`.
- [ ] Every box in §4's gate ticked.
