# Mask Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/mask/
**Root element:** `img` by default, polymorphic — see §3a
**Target file:** `packages/daisy-astro/src/components/Mask/Mask.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Mask/Mask.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Mask.astro` and 21 stories are in the repo per §4/§5; markup, type probe and CSS coverage verified (§8). Building it turned up two silent type-inference failures that also affected Button and Badge — §3e.4 and §3e.5, now rules in `plans/README.md` §5c. Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/mask.css` and the doc page source. §3e lists what is **unverified**.

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

1. **`mask-image` support and prefixing.** daisyUI emits unprefixed `mask-*` **[verified]**, and all 17 rules are in the built stylesheet **[verified 2026-08-30]**. Whether the browser honours them is Step 5; an unmasked rectangle in every story is the symptom, and it means this, not the component.
2. ~~**Generic prop inference.**~~ **Resolved, and it was real** — twice over, see §3e.4 and §3e.5. The probe was not optional.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Still open, shared with Avatar, Card, Carousel, Diff, Hero and List. A blank box at Step 5 means swap in a local image.
4. **A less-than sign in a frontmatter comment kills inference** — found here, 2026-08-30, and initially mis-diagnosed. The first reading was "a JSDoc block above `type Props` breaks it", because switching that block to `//` comments appeared to fix it. It did not: the `//` rewrite had also dropped the markup examples. Bisected properly while building Status — JSDoc and `//` behave identically, and the trigger is any `<` in the frontmatter, comments included, which truncates Astro's TypeScript parse.

   This plan's §4 listing put `<img>` and an `as="div"` example in exactly that position. **Mask then shipped broken for one commit**: the fix was verified with a probe, the probe was deleted, the documentation comment was re-added afterwards, and `astro check` had no usage left to fail on. That gap is now closed by `src/_typecheck.astro` (`plans/README.md` §5c). Corrected rule and evidence table in that section.
5. **A polymorphic `Props` needs a default type parameter** — found here, and it was **not** Mask-specific. `type Props<Tag extends HTMLTag>` resolves `Tag` only when the caller passes `as`; omit it and the default element's own attributes are rejected. Here that meant `<Mask shape="squircle" src="…" />` — the component's primary use — failing to type-check. Probing Button and Badge with the same shape showed both already shipped broken (`<Button type="submit">`, `<Badge title="t">`), so all three were fixed to `Tag extends HTMLTag = '<default tag>'` in the same commit. Rule added to `plans/README.md` §5c, amendments in `button.md` §8d and `badge.md` §8a.

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

- [x] **Step 1: done.** All 17 `mask-*` rules are in the built stylesheet (§3e.1). §3e.3 (image URLs) is still shared and open.
- [x] **Step 2: skipped as planned.** Both unions stay local; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 and the gate walked. The probe earned its keep twice — §3e.4 and §3e.5 — and `shape` being required is confirmed by a real type error ("Property 'shape' is missing … but required").
- [x] **Step 4: done.** `Mask.stories.ts`, 21 stories per §5, with the doc page's own `alt` text and photo.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: all fifteen shapes crop distinctly at `w-40 h-40`; the four triangles point four ways; `star` and `star-2` differ in weight; `hexagon` is vertical and `hexagon-2` horizontal; `Halves` shows left and right halves of the same star; `NonSquare` letterboxes rather than stretching (§3d); RTL swaps the halves with no code change (§3c); the images load at all (§3e.3).
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<img src="…" alt="Circle CSS mask" id="mask-1" data-test="yes" style="opacity:.9" class="mask mask-circle w-40 h-40 mine"/>`. Full output in §8.
- [x] **Step 7: done — the `Mask` row in `plans/README.md` says Implemented.** §3c's cross-reference is now live in both directions: Rating landed on 2026-08-31, and its §3c explains why the container has to halve the item width when these mask halves are used — the two halves of one behaviour, in two components.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 17 daisyUI classes reachable: base, 15 shapes, 2 halves.
- [x] `shape` is required and a missing one is a type error (§3b).
- [x] Default root is `img`; `as="div"` works and takes children; probe passes (§3a).
- [x] No invented axis — no colour, no size, no `src`/`alt` props (§1, §2).
- [x] JSDoc states: `shape` is required (§3b), halves zoom rather than clip (§3c), a square box is expected (§3d), and which root takes children (§3a).
- [x] One story per doc-page example, plus `AllShapes`, `Halves`, `AsWrapper` and `NonSquare`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 146 files, 3 errors — all three from the throwaway probe, all intended, none after deleting it.

```
Squircle    → <img src="…photo-1567653418876-5bb0e566e1c2.webp" alt="Squircle CSS mask" class="mask mask-squircle w-40 h-40"/>
… one per shape, all fifteen, same photo and the page's own alt text …
Triangle4   → <img … alt="Triangle-4 CSS mask" class="mask mask-triangle-4 w-40 h-40"/>
AllShapes   → <div class="flex flex-wrap items-center gap-2"> ×15 at w-24 h-24 </div>
Halves      → <img … class="mask mask-star w-40 h-40"/>
              <img … class="mask mask-star mask-half-1 w-20 h-40"/>
              <img … class="mask mask-star mask-half-2 w-20 h-40"/>
AsWrapper   → <div class="mask mask-heart w-24"><img src="…" alt="Heart CSS mask" /></div>
NonSquare   → <img … class="mask mask-heart w-64 h-24"/>
Passthrough → <img src="…" alt="Circle CSS mask" id="mask-1" data-test="yes" style="opacity:.9" class="mask mask-circle w-40 h-40 mine"/>
```

What this settles:

- Both roots work and produce the two documented shapes: the mask on the `<img>` itself (the Mask page) and on a wrapper `div` around an image (the Avatar page, §3a).
- `src`, `alt`, `id`, `data-*` and `style` all forward, and caller `class` merges after the mask classes — with **no** `as` passed, which is the case §3e.5 had to be fixed for.
- All 17 `mask-*` rules exist in the built stylesheet, halves included.
- The story `alt` text matches the doc page verbatim ("Squircle CSS mask", "Hexagon-2 CSS mask", …), so a story is a direct diff against its example.

Not settled here: every shape question is visual — whether the fifteen actually crop differently, whether the halves read as halves, whether `NonSquare` letterboxes. All Step 5.
