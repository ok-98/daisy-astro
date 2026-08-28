# Carousel Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/carousel/
**Root element:** `div` (both `Carousel` and `CarouselItem`)
**Target files:** `packages/daisy-astro/src/components/Carousel/Carousel.astro`, `CarouselItem.astro` (`Carousel.astro` is a dummy scaffold; `CarouselItem.astro` does not exist yet)
**Story files:** `Carousel.stories.ts`, `CarouselItem.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Carousel uses none of them** (§1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/carousel.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/carousel/+page.md` in `saadeghi/daisyui`). §3g lists what is **unverified**.

---

## 0. This is a scroll-snap container, not a slider widget

The complete unprefixed rule set **[verified]** — seven rules, no JavaScript anywhere:

```css
.carousel { display:inline-flex; overflow-x:scroll; scroll-snap-type:x mandatory; scrollbar-width:none }
@media (prefers-reduced-motion:no-preference) { .carousel { scroll-behavior:smooth } }
.carousel::-webkit-scrollbar { display:none }
.carousel-item { display:flex; flex:none; box-sizing:content-box; scroll-snap-align:start }
.carousel-vertical   { flex-direction:column; overflow-y:scroll; scroll-snap-type:y mandatory }
.carousel-horizontal { flex-direction:row;    overflow-x:scroll; scroll-snap-type:x mandatory }
.carousel-start  .carousel-item { scroll-snap-align:start }
.carousel-center .carousel-item { scroll-snap-align:center }
.carousel-end    .carousel-item { scroll-snap-align:end }
```

Both "interactive" doc examples — indicator buttons and next/prev buttons — are **plain anchor links** (`<a href="#slide2" class="btn btn-circle">❯</a>`) that let the browser's fragment navigation do the scrolling. There is no autoplay, no current-index state, no transition engine.

**So this component ships no `<script>`, no `autoplay` prop, no `interval` prop and no `activeIndex` prop.** `plans/README.md` §6 is explicit: do not add a script to reimplement behaviour daisyUI already gets from CSS. Anyone who wants a real slider wants a slider library, and that is not what daisyUI's Carousel is. This paragraph exists because "carousel" is the single most likely component in the library to attract invented behaviour.

### 0a. Two files

`carousel-item` is a real daisyUI class carrying real rules, so it earns a component — the same test `plans/components/accordion.md` §0 and `plans/components/card.md` §0a applied, and the one `plans/components/breadcrumbs.md` §2 failed.

| File | Renders | Owns |
|---|---|---|
| `Carousel.astro` | `div.carousel` | `snap` and `direction` (§3a) |
| `CarouselItem.astro` | `div.carousel-item` | nothing but the class — no props of its own (§3b) |

Both live in `src/components/Carousel/` per `plans/README.md` §3b.

## 1. Variant audit

**7 classes: 1 component + 1 part + 3 modifier + 2 direction**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.carousel[a-z0-9-]*' carousel.css | sort -u` returns exactly those 7 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `carousel` | — | — | `Carousel` | Always applied. |
| Part | `carousel-item` | — | — | `CarouselItem` | Always applied. |
| Snap | `carousel-start` `carousel-center` `carousel-end` | `snap` | `'start' \| 'center' \| 'end'` | **`Carousel`** | Mutually exclusive → union. Goes on the **container**, not the item — §3a. `start` is daisyUI's documented default and is still emittable. |
| Direction | `carousel-horizontal` `carousel-vertical` | `direction` | `'horizontal' \| 'vertical'` | `Carousel` | Mutually exclusive → union. `horizontal` is the default and is still emittable. `direction` is absent from `HTMLAttributes` (it exists only on `SVGAttributes`, `astro-jsx.d.ts:1186`) **[verified]** — the same check `plans/components/alert.md` §1 ran. |

**No colour axis, no size axis, no style axis** — none exists **[verified]**. Every dimension in every doc example (`w-64`, `w-96`, `w-full`, `w-1/2`, `h-96`, `h-full`, `max-w-md`, `rounded-box`, `bg-neutral`, `p-4`, `space-x-4`) is plain Tailwind — see §3c and §3d.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, not props; the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Carousel` | `default` | none — direct children of `.carousel` | no | the `carousel-item` divs |
| `CarouselItem` | `default` | none — children of `.carousel-item` | no | an `<img>`, optionally plus an absolutely-positioned nav overlay |

Plain default slots, no named slots, no `Astro.slots.has()` gating — there is no optional styled wrapper in this component.

No `items` array prop and no `src`/`alt` props on `CarouselItem`: the "next/prev buttons" example puts an entire absolutely-positioned button bar inside each item alongside the image, which an array API would block. Content comes in through slots (`plans/README.md` §5) — the same reasoning as `plans/components/breadcrumbs.md` §2.

**`id` on each item is how the anchor-link examples work** (`<div id="slide1" class="carousel-item">` ↔ `<a href="#slide1">`). It needs no prop — it arrives through `...rest` from `HTMLAttributes<'div'>`. Worth naming in the JSDoc, since it is the only "API" the interactive examples have.

## 3. Seven things the naive implementation gets wrong

### 3a. `snap` belongs on the container, not the item

The obvious reading of "snap this item to center" is an item-level prop. daisyUI does the opposite: the modifier classes go on `.carousel` and reach the items through **descendant** selectors, `.carousel-center .carousel-item { scroll-snap-align: center }` **[verified]**.

Put `snap` on `CarouselItem` and it emits `carousel-center` on an element that no rule targets that way — a class with no matching CSS, `plans/README.md` §1b's failure arriving through a misplaced prop rather than through interpolation. The item's own `scroll-snap-align: start` from `.carousel-item` would remain in force, so the carousel would keep working while ignoring the prop entirely.

`CarouselItem` therefore has **no variant props at all** — one class, native passthrough, nothing else.

### 3b. `.carousel-item` is `box-sizing: content-box`

**[verified]**, and it is the only place in daisyUI's CSS this component touches the box model. Tailwind's preflight sets `box-sizing: border-box` globally, so a carousel item is a deliberate exception.

Consequence: **padding and border on a `CarouselItem` add to its width instead of fitting inside it.** `<CarouselItem class="w-full p-4">` is wider than the container and breaks the snap alignment — with no error, just a carousel that scrolls slightly past each slide.

This is why the "Full-bleed carousel" example puts `p-4 space-x-4` on the **container** and `rounded-box` on the images, never padding on the items. Document it in `CarouselItem`'s JSDoc; do not "fix" it by forcing `box-border`, which would change daisyUI's intended sizing.

### 3c. Items never shrink, so the caller must size them

`.carousel-item { flex: none }` **[verified]** — no grow, no shrink, basis auto. Item width is therefore whatever its content or the caller's class says, and every doc example sets one:

| Example | Item class |
|---|---|
| Snap to start / center / end | none — items are image-sized |
| Full width items | `w-full` (container `w-64`) |
| Half width items | `w-1/2` (container `w-96`) |
| Vertical | `h-full` (container `h-96`) |

No `itemWidth` prop: it would re-implement `w-*` for one component, and `w-1/2` versus `w-full` is exactly the kind of choice Tailwind already expresses. One JSDoc line saying items are caller-sized.

### 3d. `.carousel` is `inline-flex`, so it has no width of its own

**[verified]** — shrink-to-fit. Every doc example gives the container a width (`w-64`, `w-96`, `w-full`, `max-w-md`) or, for the vertical case, a height (`h-96`). Without one the carousel is exactly as wide as its content and never scrolls, which looks like the component doing nothing.

Same shape as `plans/components/aura.md` §3c and `plans/components/browser-mockup.md` §3b: not a prop, but stated in the JSDoc and demonstrated by every story passing a size class.

For `direction="vertical"` a **height** is required rather than a width, and the items need `h-full` — that pairing is easy to get half-right, so `VerticalCarousel` is a story rather than a footnote.

### 3e. The scrollbar is hidden, which is an accessibility problem daisyUI leaves to you

`.carousel` sets `scrollbar-width: none` **and** `::-webkit-scrollbar { display: none }` **[verified]**. So the only scroll affordances are dragging, a trackpad, and — in some browsers — the keyboard.

A scroll container with no focusable content is **not keyboard-reachable in Chrome or Safari** unless it carries `tabindex="0"`; Firefox focuses scrollable regions automatically. With the scrollbar hidden there is also no visual cue that more content exists. That is a WCAG 2.1.1 concern, and it is real whenever the items are images rather than links.

**Decision: do not add `tabindex="0"` by default, but document it and show both remedies.** Unlike `plans/components/breadcrumbs.md` §3b's `nav` landmark — a pure gain with no downside — a `tabindex="0"` on a large region adds a tab stop with no accessible name, which can be worse than the problem for a carousel whose items are already links. daisyUI's own answer is the anchor-link pattern in the last two examples, and that is the better default.

So `Carousel`'s JSDoc says: give the carousel `tabindex="0"` and an `aria-label` when its items are not independently focusable, or provide anchor-link controls as the doc page does. Both are one caller attribute away, and `KeyboardAccessible` (§5) shows the first.

### 3f. `carousel-vertical` does not reset `overflow-x`

`.carousel` sets `overflow-x: scroll` unconditionally, and `.carousel-vertical` adds `flex-direction: column`, `overflow-y: scroll` and `scroll-snap-type: y mandatory` — but **no `overflow-x` override** **[verified]**.

In practice a column-direction flex container rarely overflows horizontally, so this is usually invisible. It stops being invisible when an item is wider than the container: the carousel then scrolls in both axes, with **both scrollbars hidden** (§3e), so the content can be dragged sideways for no reason and never scrolled back by keyboard.

Nothing to fix in the component — this is daisyUI's CSS. Named here so that "my vertical carousel wobbles sideways" resolves in one step instead of being blamed on the wrapper.

### 3g. Unverified assumptions

1. **Does slot content land as direct children of `.carousel`?** Blocking, and for a different reason than its siblings. `.carousel-start .carousel-item` is a **descendant** selector, so an injected wrapper would not break the snap classes — but `.carousel` is a **flex container** and `.carousel-item` is `flex: none`, so a wrapper would become the single flex item and every slide would collapse into one non-snapping column. Same question as `plans/components/aura.md` §3e.1, `plans/components/alert.md` §3d.2 and `plans/components/breadcrumbs.md` §3f.1 — different failure, one shared answer. Record it in all of them.
2. **Slot sanitization vs `<img>` and the nav overlay.** Every example is images; the next/prev example nests `<a class="btn btn-circle">` inside an absolutely-positioned `<div>` inside each item. Conservative sanitizer defaults (`plans/README.md` §4) could drop either. Shared with `plans/components/card.md` §3f.2.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with `plans/components/avatar.md` §3e.2 and `plans/components/card.md` §3f.3 — pick one local placeholder for all three if not.
4. **Anchor-link scrolling inside a Storybook iframe.** The interactive examples rely on `href="#slide2"` fragment navigation. Inside an iframe with its own URL this normally still works, but it is exactly the kind of thing that doesn't — and if it fails, the component is fine and the story is not. Check before filing a bug against either.

## 4. Component implementation

### `Carousel.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type CarouselSnap = 'start' | 'center' | 'end';
type CarouselDirection = 'horizontal' | 'vertical';

interface Props extends HTMLAttributes<'div'> {
  /**
   * Where items snap. Goes on the container, not the item — daisyUI reaches
   * the items through `.carousel-center .carousel-item` (plan §3a).
   * Defaults to daisyUI's `start` behaviour when omitted.
   */
  snap?: CarouselSnap;
  /** `vertical` needs a height on this element and `h-full` on items (plan §3d). */
  direction?: CarouselDirection;
}

// Full literal class names. NEVER `carousel-${snap}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const SNAP: Record<CarouselSnap, string> = {
  start: 'carousel-start',
  center: 'carousel-center',
  end: 'carousel-end',
};

const DIRECTION: Record<CarouselDirection, string> = {
  horizontal: 'carousel-horizontal',
  vertical: 'carousel-vertical',
};

const { snap, direction, class: className, ...rest } = Astro.props;
---

<!--
  `.carousel` is inline-flex with no width of its own — pass `w-*` (or `h-*`
  for vertical) yourself (plan §3d). The scrollbar is hidden by daisyUI; add
  `tabindex="0"` + `aria-label`, or anchor-link controls, when the items are
  not focusable (plan §3e). Slot content must be the items themselves — a
  wrapper would become the only flex child (plan §3g.1).
-->
<div
  class:list={['carousel', snap && SNAP[snap], direction && DIRECTION[direction], className]}
  {...rest}
>
  <slot />
</div>
```

### `CarouselItem.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * No variant props: the snap modifiers live on the parent `Carousel`
 * (plan §3a). Size the item yourself — `flex: none` means it never grows or
 * shrinks (plan §3c). Note `box-sizing: content-box`: padding and borders add
 * to the width rather than fitting inside it (plan §3b).
 *
 * Give it an `id` to target it from an anchor-link control, which is how
 * daisyUI's interactive examples work (plan §2).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['carousel-item', className]} {...rest}>
  <slot />
</div>
```

**No `<script>` in either file, and no autoplay/index/interval props** — §0. This is the component where that restraint matters most.

Neither is polymorphic: daisyUI documents both classes on `div` only.

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `items` array, no `src`/`alt` props (§2).
- [ ] `<slot />` has **no wrapper element** in either component — a wrapper collapses the flex row (§3g.1).
- [ ] No `Astro.slots.has()` gating — nothing is optional (§2).
- [ ] Root is `div` in both, matching every doc example.
- [ ] **No `<script>` added, and no autoplay/interval/activeIndex prop** (§0).
- [ ] `...rest` spread onto the root element in both files — `id` passthrough is what the anchor-link examples depend on (§2).
- [ ] No `as` prop in either component.
- [ ] `snap` is on `Carousel`, **not** on `CarouselItem` (§3a).
- [ ] No variant prop collides with a native attribute: `snap` is not an HTML attribute; `direction` is absent from `HTMLAttributes` **[verified]**.
- [ ] Every variant class is a full literal in a `Record` map — no `` `carousel-${snap}` `` anywhere.
- [ ] Neither is generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c):
  ```astro
  <Carousel class="w-96 rounded-box"><CarouselItem>ok</CarouselItem></Carousel>
  <Carousel snap="center" direction="vertical" class="h-96">ok</Carousel>
  <CarouselItem id="slide1" class="w-full">ok</CarouselItem>
  <Carousel snap="middle">must error — not a snap value</Carousel>
  <Carousel color="primary">must error — no colour axis (§1)</Carousel>
  <CarouselItem snap="center">must error — snap is a Carousel prop (§3a)</CarouselItem>
  <Carousel autoplay>must error — daisyUI's carousel has no JS (§0)</Carousel>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. `Carousel.stories.ts` carries the doc examples (all of them are about the container); `CarouselItem.stories.ts` is a short `Playground` + `Passthrough`.

Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Snap to start (default) | `SnapStart` | `class: 'rounded-box'`, 7 image items, no `snap` prop |
| Snap to center | `SnapCenter` | `snap: 'center'` |
| Snap to end | `SnapEnd` | `snap: 'end'` |
| Carousel with full width items | `FullWidthItems` | container `w-64`, items `w-full`, images `w-full` |
| Vertical carousel | `Vertical` | `direction: 'vertical'`, container `h-96`, items `h-full` |
| Carousel with half width items | `HalfWidthItems` | container `w-96`, items `w-1/2` |
| Full-bleed carousel | `FullBleed` | `snap: 'center'`, container `max-w-md p-4 space-x-4 bg-neutral rounded-box`, images `rounded-box` — note the padding is on the **container** (§3b) |
| Carousel with indicator buttons | `WithIndicators` | 4 items with `id="item1"`…, plus the page's `<a href="#item1" class="btn btn-xs">` row below |
| Carousel with next/prev buttons | `WithNextPrev` | 4 items with `id="slide1"`…, each holding an image plus the absolutely-positioned `❮`/`❯` overlay |

Plus `Playground` and `Passthrough`. The snap axis is covered by three doc examples and the direction axis by `Vertical`, so no extra axis stories are needed.

Two stories beyond the doc page, each pinning a §3 hazard:

- **`KeyboardAccessible`** — the same carousel twice, once bare and once with `tabindex="0" aria-label="Product photos"`, so §3e's remedy is copyable rather than described.
- **`PaddedItem`** — one item with `class="w-full p-4"` beside a correct one, making §3b's `content-box` overflow visible.

```ts
import Carousel from './Carousel.astro';

// daisyUI's Carousel is a CSS scroll-snap container. The "interactive"
// examples below are anchor links, not JS — see plans/components/carousel.md §0.

const IMGS = [
  'photo-1559703248-dcaaec9fab78',
  'photo-1565098772267-60af42b81ef2',
  'photo-1572635148818-ef6fd45eb394',
  'photo-1494253109108-2e30c049369b',
  'photo-1550258987-190a2d41a8ba',
  'photo-1559181567-c3190ca9959b',
  'photo-1601004890684-d8cbf643f5f2',
].map((n) => `https://img.daisyui.com/images/stock/${n}.webp`);

const items = (itemClass = '', imgClass = '') =>
  IMGS.map(
    (src) =>
      `<div class="carousel-item ${itemClass}"><img src="${src}" class="${imgClass}" alt="Carousel slide" /></div>`,
  ).join('');

export default {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    snap: { control: 'radio', options: [undefined, 'start', 'center', 'end'] },
    direction: { control: 'radio', options: [undefined, 'horizontal', 'vertical'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'w-96 rounded-box', slots: { default: items() } },
};

export const SnapStart = {
  args: { class: 'rounded-box', slots: { default: items() } },
};

// Regression guard: native attributes survive and caller `class` merges.
// `class` is load-bearing here — the carousel has no width of its own (§3d).
export const Passthrough = {
  args: {
    id: 'carousel-1',
    'data-test': 'yes',
    style: 'outline:1px dashed',
    class: 'mine w-96 rounded-box',
    slots: { default: items() },
  },
};
```

Whether the stories can use `CarouselItem` as a component rather than a raw HTML string depends on `plans/components/card.md` §3f.4 — resolve that once and apply the answer here.

## 6. Steps

- [ ] **Step 1:** Resolve §3g.1 (direct children of the flex container) — blocking, and the shared question across four plans now. Settle §3g.3 (image URLs) with Avatar and Card, and check §3g.4 (fragment links in the Storybook iframe) before writing the interactive stories.
- [ ] **Step 2:** No new shared unions — both unions are local, and there is no colour or size axis (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Carousel.astro` dummy scaffold and create `CarouselItem.astro` per §4, then walk the Astro idioms gate. Pay attention to the `snap`-on-container check (§3a).
- [ ] **Step 4:** Replace `Carousel.stories.ts` and create `CarouselItem.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Carousel`, verify:
  - `Playground` renders and every control changes the markup.
  - Dragging `SnapStart` **snaps** — releasing mid-slide settles on a slide boundary rather than stopping free. If it scrolls freely, the items are not direct flex children (§3g.1) and nothing else below will be meaningful.
  - `SnapStart` / `SnapCenter` / `SnapEnd` settle a slide to the left edge / middle / right edge respectively.
  - No scrollbar is visible in any story (§3e) — expected, not a bug.
  - `Vertical` scrolls **down**, with items filling the height (§3d).
  - `FullWidthItems` shows exactly one slide at a time; `HalfWidthItems` shows two.
  - `PaddedItem` overflows past its neighbour, unlike the unpadded one (§3b).
  - `WithIndicators` and `WithNextPrev`: clicking a control jumps to the right slide (§3g.4).
  - `KeyboardAccessible`: tab into the second carousel and scroll it with the arrow keys; confirm the bare one cannot be reached (§3e).
- [ ] **Step 6:** Confirm forwarding via `Passthrough` — `id`, `data-*`, `style`, `class` all survive on both components. Headless check, which also answers §3g.1:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="carousel[^"]*"[^>]*><div class="carousel-item' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div id="slide[0-9]" class="carousel-item[^"]*"' storybook-static/astro-prerendered-stories.json | head
  ```
  The first must match: `carousel-item` immediately inside `carousel`, no wrapper between. The second confirms `id` passthrough, which the anchor examples depend on.
- [ ] **Step 7:** Update the `Carousel` row in `plans/README.md` to **Implemented**, noting `CarouselItem` as part of it (same convention as Accordion/AccordionItem).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 7 daisyUI classes from §1 are reachable: `carousel` always, `carousel-item` always, 3 snaps via `snap`, 2 directions via `direction`.
- [ ] **No `<script>`, no autoplay/interval/activeIndex prop** — daisyUI's carousel is pure CSS plus anchor links (§0).
- [ ] No invented axis — no `color`, no `size`, no `itemWidth` (§3c).
- [ ] `snap` is a `Carousel` prop and `CarouselItem` has no variant props (§3a).
- [ ] Slot content renders as **direct children** of `.carousel` — checked in the build output, not by eye (§3g.1).
- [ ] `id` passes through `CarouselItem` so the anchor-link examples work (§2).
- [ ] Caller `class` merges through `class:list` in both components — load-bearing, since the carousel has no width of its own (§3d).
- [ ] JSDoc states: items are caller-sized (§3c), items are `content-box` (§3b), the container needs a width or height (§3d), and the scrollbar is hidden with the two accessibility remedies (§3e).
- [ ] `Playground` exposes every prop as a control; `CarouselItem` has its own `Playground` and `Passthrough`.
- [ ] One story per doc-page example, reproducing that example's markup and copy, plus `KeyboardAccessible` and `PaddedItem`.
- [ ] Every box in §4's Astro idioms gate ticked.
