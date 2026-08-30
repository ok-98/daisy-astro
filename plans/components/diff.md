# Diff Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/diff/
**Root element:** `figure`
**Target file:** `packages/daisy-astro/src/components/Diff/Diff.astro` (currently a dummy scaffold; its root element is already right)
**Story file:** `packages/daisy-astro/src/components/Diff/Diff.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'figure'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b). **Diff has no variant classes**, so no map exists (§1).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Diff uses none of them** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-30). `Diff.astro` and 7 stories are in the repo per §4/§5. §3g.1 is answered in the build output: **8 of 8** item wrappers hold their content as a direct child (§8). Step 5 (visual pass) is open and carries almost everything that matters here — dragging, the keyboard toggle and §3f's iOS behaviour are all runtime. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/diff.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/diff/+page.md` in `saadeghi/daisyui`). §3g lists what is **unverified**.

---

## 0. A fixed three-child structure with no JavaScript

The markup daisyUI documents is the same in both examples, down to the attributes:

```html
<figure class="diff aspect-16/9" tabindex="0">
  <div class="diff-item-1" role="img" tabindex="0">…</div>
  <div class="diff-item-2" role="img">…</div>
  <div class="diff-resizer"></div>
</figure>
```

Three children, always in that order, and the third is **permanently empty**. The slider is not JavaScript: `.diff-resizer` is a `resize: horizontal` box with `opacity: 0`, clipped to its bottom-right corner and stretched with `transform: scaleY(5)` **[verified]** — the browser's native resize grip, made invisible and made tall. Dragging it changes its width, and because `.diff` is `grid-template-columns: auto 1fr` with the resizer, `.diff-item-1` and `.diff-item-2` all in column 1, the `auto` track follows the resizer and clips `.diff-item-1` to it.

So:

- **No `<script>`, no `position`/`value`/`onChange` prop.** There is no state to expose — the width lives in the browser's resize handling and is not readable or settable from markup. `plans/README.md` §6.
- **Named slots, not sub-components.** This is the cleanest named-slot case in the library so far: the structure is fixed, the order is fixed, and one of the three children is markup the caller would only ever copy verbatim. `Diff` renders all three; the caller supplies two pieces of content. Precedent: `plans/components/browser-mockup.md` §2's `toolbar`, and the treatment table in `plans/components/chat-bubble.md` §0a.

**One file.** No `DiffItem` component: the items carry fixed classes, a fixed `role`, a fixed `tabindex` and no variants (§3b), so a wrapper would be three attributes the caller must not get wrong.

## 1. Variant audit

**4 classes: 1 component + 3 part**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.diff[a-z0-9-]*' diff.css | sort -u` returns exactly `.diff`, `.diff-item-1`, `.diff-item-2`, `.diff-resizer` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `diff` | — | — | Always applied to the root `<figure>`. |
| Part | `diff-item-1` | — | — | Wrapper for the `item1` slot — the **clipped overlay** (§3a). |
| Part | `diff-item-2` | — | — | Wrapper for the `item2` slot — the **full-width base** (§3a). |
| Part | `diff-resizer` | — | — | Rendered empty by the component; never a slot (§0). |

**No colour, size, style or direction axis** — none exists **[verified]**. `rounded-field` and `aspect-16/9` in the doc examples are plain Tailwind on the root, and `aspect-*` is not optional (§3c).

Sixth component in a row with an empty variant table (Breadcrumbs, Browser Mockup, Calendar, Code Mockup, Countdown, Diff).

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

### 1a. Non-class props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `tabindex` | inherited | `'0'` | Required for the keyboard affordance — §3d. |
| `item1Label` | `string` | — | `aria-label` on `.diff-item-1`, which the component marks `role="img"` — §3e. |
| `item2Label` | `string` | — | Same for `.diff-item-2`. |

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `item1` | `div.diff-item-1` (`role="img"`, `tabindex="0"`) | no | an `<img>`, or a `<div class="bg-primary … grid place-content-center">DAISY</div>` |
| `item2` | `div.diff-item-2` (`role="img"`) | no | the same, in its "before" state |

Two named slots, no default slot, no `Astro.slots.has()` gating — both items appear in every example and a diff of one thing is meaningless.

**No `item1Class` / `item2Class`.** Neither doc example puts any class on the item wrappers; all styling goes on the *content inside* them (`bg-primary text-primary-content text-4xl lg:text-9xl font-black grid place-content-center`). So unlike `plans/components/avatar.md` §3a and `plans/components/collapse.md` §3d, there is no styling surface to expose. Add one only if a real case appears.

**No `resizer` slot** — the element is empty by design (§0).

## 3. Seven things the naive implementation gets wrong

### 3a. Item 2 is the base; item 1 is the one that gets clipped

Both items sit in grid column 1 and span all three rows, but they behave differently **[all verified]**:

```css
.diff-item-1 { grid-column-start:1; grid-row:1/span 3; z-index:1; overflow:hidden;
               border-right:2px solid var(--color-base-100) }
.diff-item-2 { grid-column-start:1; grid-row:1/span 3; position:relative }
.diff-item-1 > *, .diff-item-2 > * { width:100cqi; height:100%; position:absolute; left:0;
                                     object-fit:cover; pointer-events:none }
```

`.diff-item-1` has `overflow: hidden`, so it is cropped to the width of the `auto` grid track — which the resizer controls. `.diff-item-2` does not, so its `100cqi`-wide content spills across the whole container and shows through wherever item 1 has been cropped away.

**Item 1 is what the reader drags away to reveal item 2.** In the doc example item 1 is the sharp photo and item 2 is the blurred one, so dragging left reveals the blur. Naming the slots `item1`/`item2` after the classes rather than `before`/`after` is deliberate: which one reads as "before" depends entirely on the content, and daisyUI takes no position.

Also from that rule set: **`pointer-events: none` on every item child** **[verified]**. Links, buttons and form controls inside a Diff are inert. Not a bug to work around — the whole surface is a drag target — but it belongs in the JSDoc, because "my button inside the diff doesn't click" is otherwise unexplainable.

### 3b. The items' attributes are not decoration, and the component owns them

`role="img"` on both items and `tabindex="0"` on item 1 appear in **both** doc examples **[verified]**, and `tabindex` is load-bearing for the keyboard behaviour (§3d). Since §0 puts the item wrappers inside the component, the component emits all of it — a caller cannot forget it, and there is no `DiffItem` for them to get wrong.

That is the argument against a `DiffItem` component in one line: it would exist to be given three fixed attributes.

### 3c. `.diff` has a width but no height — an aspect ratio is effectively required

`.diff` is `width: 100%` with `grid-template-rows: 1fr 1.8rem 1fr` **[verified]** and no height of its own. With nothing to distribute, the two `1fr` rows resolve to zero and all that remains is the 1.8rem resizer row: **a thin horizontal strip with no visible content**.

Both doc examples add `aspect-16/9`. That is not styling garnish; it is what gives the grid something to divide. A caller may equally pass `h-64`, but passing nothing produces a component that looks broken while being perfectly correct.

So the JSDoc says an `aspect-*` or a height is required, `Playground` and every story pass one, and `NoAspectRatio` (§5) shows the failure once. This is the same family as `plans/components/aura.md` §3c and `plans/components/carousel.md` §3d, but stricter — those merely shrink; this one disappears.

### 3d. The keyboard affordance is two focus targets, and it is a toggle, not a slider

The interaction has no JS, so keyboard support is done with `:focus-visible` and hard-coded widths **[all verified]**:

```css
.diff:focus-visible                      { & .diff-resizer { min-width:95cqi; max-width:95cqi } }
.diff:has(.diff-item-1:focus-visible)    { & .diff-resizer { min-width:5cqi;  max-width:5cqi  } }
```

Tab to the `<figure>` → the split snaps to 95% (item 1 almost fully shown). Tab again to `.diff-item-1` → it snaps to 5% (item 2 almost fully shown). That is the whole keyboard story: **a two-position toggle**, not a continuously adjustable slider, and there are no arrow-key controls.

Both `tabindex="0"` attributes are therefore required. The figure's is exposed as a prop defaulted to `'0'` — the mechanism `plans/components/alert.md` §3b established for `role` — so a caller can remove it deliberately; item 1's is emitted unconditionally, since removing it would silently delete half the keyboard behaviour.

Worth stating in the JSDoc that this is a toggle, because a keyboard user finding two focus stops that jump the divider to the extremes is otherwise confusing, and a reviewer may report it as broken.

### 3e. `role="img"` with no accessible name

daisyUI puts `role="img"` on both items and gives neither an `aria-label` **[verified]**. An element with `role="img"` is an image to assistive technology, and an image needs a name; a **focusable** one with no name (item 1, §3d) is worse. The inner `<img alt="daisy">` does not help — its `alt` names the img, not the labelled-as-image wrapper around it.

Same class of gap as `plans/components/avatar.md` §3c's presence dot and `plans/components/carousel.md` §3e's hidden scrollbar, and handled the same way: **the component does not invent copy**, but it does make the fix reachable. `item1Label` and `item2Label` set `aria-label` on the respective wrappers, and every story passes them.

Not defaulted to anything — "Item 1" would be a worse name than none — and not removed from `role="img"` either, since that is daisyUI's documented markup.

### 3f. Browser support is the narrowest in the library, and iOS Safari is a documented exception

The doc page's frontmatter carries a `browserSupport` block: **chrome 105, firefox 110, safari 16, `iossafari: null`**. The `null` is not an oversight — `diff.css` contains a dedicated iOS-Safari branch **[verified]**:

```css
@supports (-webkit-overflow-scrolling:touch) and (overflow:-webkit-paged-x) {
  .diff-item-2:after { content: none }                       /* the drag pill disappears */
  .diff:focus .diff-resizer            { min-width:5cqi;  max-width:5cqi  }
  .diff:has(.diff-item-1:focus) .diff-resizer { min-width:95cqi; max-width:95cqi }
}
```

So on iOS Safari the visible handle is removed and the interaction falls back to the focus toggle (with the two positions swapped relative to the desktop rule). **Dragging does not work there.**

Nothing to implement — daisyUI already degrades — but this belongs in the JSDoc, because a component whose entire purpose is dragging silently losing that on iPhones is the kind of thing that should be known before it ships, not after.

The `cqi` units and `container-type: inline-size` **[verified]** are where the version floor comes from.

### 3g. Unverified assumptions

1. ~~**Does slot content land as a direct child of each item?**~~ **Answered 2026-08-30: yes.** `<div class="diff-item-1"><img` (or `<div`, or `<button`) matches **8 of 8** across the stories, so `.diff-item-N > *` applies to the real content and the two halves stay aligned. This was the variant where a wrapper would have produced a *misaligned comparison* rather than an obviously broken layout — the hardest of the seven to spot by eye. Originally the seventh plan to hit this: `plans/components/aura.md` §3e.1, `plans/components/carousel.md` §3g.1, `plans/components/chat-bubble.md` §3f.1, `plans/components/countdown.md` §3f.2, `plans/components/breadcrumbs.md` §3f.1, `plans/components/alert.md` §3d.2. One answer, recorded in all of them.
2. **Native `resize` inside the Storybook iframe.** The resizer is a real `resize: horizontal` element. Dragging it should work anywhere the CSS is supported, but the canvas iframe plus the framework's injected HTML is exactly the combination worth checking once before filing a bug against the component.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with `plans/components/avatar.md` §3e.2, `plans/components/card.md` §3f.3 and `plans/components/carousel.md` §3g.3 — and Diff needs a matched *pair* (sharp and blurred), so if a local placeholder is needed, two are.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * Side-by-side comparison with a draggable divider. The slider is native CSS
 * `resize`, not JavaScript — there is no way to read or set the split position
 * from markup (plan §0).
 *
 * **Give it an aspect ratio or a height** (`class="aspect-16/9"`), or the grid
 * collapses to a thin strip (plan §3c).
 *
 * `item1` is the clipped overlay; `item2` is the full-width base shown
 * underneath (plan §3a). Content inside either is `pointer-events: none`, so
 * links and buttons in there are inert.
 *
 * Keyboard: focusing the figure snaps the split to 95%, focusing the first
 * item snaps it to 5% — a two-position toggle, not a slider (plan §3d).
 *
 * Not supported on iOS Safari, where daisyUI drops the drag handle and leaves
 * only the focus toggle (plan §3f).
 */
interface Props extends HTMLAttributes<'figure'> {
  /** `aria-label` for the first item, which daisyUI marks `role="img"` (plan §3e). */
  item1Label?: string;
  /** `aria-label` for the second item. */
  item2Label?: string;
}

// No variant class map: daisyUI defines one component class and three part
// classes for this component, and no modifiers at all (plan §1).

const {
  item1Label,
  item2Label,
  // Required for the keyboard affordance (plan §3d). Defaulted, so it stays
  // overridable — the mechanism from plans/components/alert.md §3b.
  tabindex = '0',
  class: className,
  ...rest
} = Astro.props;
---

<figure class:list={['diff', className]} tabindex={tabindex} {...rest}>
  <!--
    Slot content must be the DIRECT child of each item: `.diff-item-N > *` is
    what applies `width:100cqi; height:100%; position:absolute` (plan §3g.1).
  -->
  <div class="diff-item-1" role="img" tabindex="0" aria-label={item1Label}>
    <slot name="item1" />
  </div>
  <div class="diff-item-2" role="img" aria-label={item2Label}>
    <slot name="item2" />
  </div>
  <!-- Always empty: this is the native `resize` grip, invisible and scaled up. -->
  <div class="diff-resizer"></div>
</figure>
```

No `<script>` (§0). Not polymorphic: daisyUI documents `diff` on a `<figure>`, which is also the semantically right element for a compared pair.

### Astro idioms gate

- [ ] Content arrives via the `item1` / `item2` named slots — no `before`/`after` content props (§2).
- [ ] The three children are rendered by the component in daisyUI's order, and `.diff-resizer` is empty (§0).
- [ ] No `Astro.slots.has()` gating — both items are required (§2).
- [ ] Slot content is the **direct child** of each item wrapper — no extra element between (§3g.1).
- [ ] Root element is `figure`, matching both doc examples.
- [ ] No `<script>` added, and **no `position`/`value`/`onChange` prop** (§0).
- [ ] `...rest` spread onto the root element.
- [ ] `tabindex` is defaulted on the figure and emitted unconditionally on item 1 (§3d).
- [ ] `role="img"` on both items, with `aria-label` reachable through `item1Label`/`item2Label` (§3e).
- [ ] No `as` prop, no `DiffItem` component (§0, §3b).
- [ ] No class interpolation anywhere — there are no variant classes (§1).
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Diff class="aspect-16/9 rounded-field" item1Label="After" item2Label="Before">…</Diff>
  <Diff id="x" data-test="y" tabindex="-1" class="aspect-16/9">…</Diff>
  <Diff color="primary">must error — no colour axis (§1)</Diff>
  <Diff position={50}>must error — the split is not settable (§0)</Diff>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8) — there are only two:

| Doc-page example | Story | Props / slots |
|---|---|---|
| Diff | `Default` | `class: 'aspect-16/9 rounded-field'`, `item1` a sharp `<img>`, `item2` the blurred one |
| Diff text | `DiffText` | same wrapper, `item1` `<div class="bg-primary text-primary-content text-4xl lg:text-9xl font-black grid place-content-center">DAISY</div>`, `item2` the `bg-base-200` version |

Plus `Playground` and `Passthrough` (Step 6). No variant axes exist, so there are no axis stories.

Three stories beyond the doc page, each pinning a §3 finding:

- **`NoAspectRatio`** — no `aspect-*` and no height, beside a correct copy. Makes §3c's collapse-to-a-strip visible once, since it is the most likely first-use failure.
- **`KeyboardToggle`** — a comment plus the two focus stops, so §3d's toggle behaviour is discoverable; verified by tabbing, not by looking.
- **`InertContent`** — a `<button>` inside `item1`, demonstrating §3a's `pointer-events: none`. Cheap, and it prevents a false bug report.

```ts
import Diff from './Diff.astro';

// The divider is native CSS `resize`, not JS — the split position cannot be
// read or set (plan §0). Every story needs an aspect ratio or a height, or the
// grid collapses to a strip (plan §3c).

const SHARP = 'https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp';
const BLUR = 'https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a-blur.webp';

export default {
  title: 'Components/Diff',
  component: Diff,
  // No variant argTypes — this component has none (plan §1).
  argTypes: {
    class: { control: 'text' },
    item1Label: { control: 'text' },
    item2Label: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'aspect-16/9 rounded-field',
    item1Label: 'Sharp version',
    item2Label: 'Blurred version',
    slots: {
      item1: `<img alt="daisy" src="${SHARP}" />`,
      item2: `<img alt="daisy" src="${BLUR}" />`,
    },
  },
};

// Regression guard: native attributes survive, caller `class` merges, and the
// labels reach the item wrappers (§3e).
export const Passthrough = {
  args: {
    id: 'diff-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine aspect-16/9',
    item1Label: 'After',
    item2Label: 'Before',
    slots: {
      item1: `<img alt="daisy" src="${SHARP}" />`,
      item2: `<img alt="daisy" src="${BLUR}" />`,
    },
  },
};
```

## 6. Steps

- [x] **Step 1: done for §3g.1** — slot content is a direct child of each item wrapper in all 8 rendered diffs. §3g.2 (native `resize` inside the Storybook iframe) and §3g.3 (image URLs, and this component needs a matched sharp/blurred pair) are runtime and move to Step 5.
- [x] **Step 2: skipped as planned.** No variant axes; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced per §4 — the `figure` root was already right, so the work was the three children and their fixed attributes. Gate walked; the probe errored on both intended lines (`position`, `item1Class`). One deviation from §4's listing: the two structural notes are frontmatter comments rather than HTML comments in the template, since an HTML comment there ships into every rendered diff.
- [x] **Step 4: done.** `Diff.stories.ts`, 7 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and this component is almost entirely interaction.** Verify: `Default` shows a 16:9 box with a vertical divider and a pill handle; **dragging reveals the second image and the two halves stay aligned** — misalignment would mean §3g.1 (already ruled out in markup), refusal to drag at all means §3g.2; `NoAspectRatio` collapses to a strip beside the working copy (§3c); `KeyboardToggle` — tab to the figure, split jumps to ~95%, tab again, ~5%, and confirm arrow keys do **nothing**, so the JSDoc's "toggle, not slider" is accurate (§3d); `InertContent`'s button does not respond to clicks (§3a); and if a device is handy, check iOS Safari once for §3f — expected: no pill, focus toggle only.
- [x] **Step 6: done — forwarding confirmed and the structure asserted.** `Passthrough` renders `<figure class="diff mine aspect-16/9" tabindex="0" id="diff-1" data-test="yes" style="max-width:40rem">` with both labels on their wrappers. Across the stories: 8 figures, 8 empty resizers, 16 `role="img"` items, 12 of them carrying an `aria-label`. Full output in §8.
- [x] **Step 7: done — the `Diff` row in `plans/README.md` says Implemented**, with §3f's narrow browser support noted there so it is visible from the checklist.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 4 daisyUI classes from §1 are reachable: `diff` on the root, `diff-item-1`/`diff-item-2` as slot wrappers, `diff-resizer` rendered empty.
- [x] **No `<script>` and no split-position prop** — the divider is native CSS `resize` (§0).
- [x] Slot content renders as the **direct child** of each item — checked in the build output, not by eye (§3g.1).
- [x] `role="img"` on both items and `tabindex="0"` on the figure and on item 1 (§3b, §3d).
- [x] `item1Label` / `item2Label` reach `aria-label` on their wrappers (§3e).
- [x] No invented axis — no colour, no size, no `item1Class`/`item2Class` (§2), no `DiffItem` component (§0).
- [x] JSDoc states: an aspect ratio or height is required (§3c), item 1 is the clipped overlay (§3a), content inside is inert (§3a), the keyboard behaviour is a toggle (§3d), and iOS Safari has no drag (§3f).
- [x] `Playground` exposes `class` and both label props.
- [x] One story per doc-page example, reproducing that example's markup and copy, plus `NoAspectRatio`, `KeyboardToggle` and `InertContent`.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default       → <figure class="diff rounded-field aspect-16/9" tabindex="0">
                  <div class="diff-item-1" role="img" tabindex="0" aria-label="Sharp version">
                    <img alt="daisy" src="…photo-1560717789-0ac7c58ac90a.webp" /></div>
                  <div class="diff-item-2" role="img" aria-label="Blurred version">
                    <img alt="daisy" src="…-blur.webp" /></div>
                  <div class="diff-resizer"></div></figure>
DiffText      → same wrappers, content is the page's two styled divs
NoAspectRatio → <figure class="diff rounded-field" tabindex="0">…    the collapsing case, beside a correct one
InertContent  → <div class="diff-item-1" …><div class="bg-primary …"><button class="btn">Try me</button></div></div>
Passthrough   → <figure class="diff mine aspect-16/9" tabindex="0" id="diff-1" data-test="yes"
                  style="max-width:40rem">… aria-label="After" … aria-label="Before" …
```

What this settles:

- **§3g.1**: the content is the direct child of its item wrapper in 8 of 8 diffs, so the child selectors that absolutely position and `object-fit: cover` the halves apply to the real content. A wrapper here would have produced a subtly *misaligned* comparison rather than an obviously broken one — the least visible failure of the seven plans that shared this question.
- **The fixed structure is the component's, not the caller's**: 8 figures, 8 empty `diff-resizer`s, and 16 `role="img"` items with the two `tabindex` values in place. None of it can be forgotten, which is the argument against a `DiffItem` component.
- `item1Label` / `item2Label` reach `aria-label` on their own wrappers — 12 of the 16 items are named, the four unnamed ones being the stories that deliberately omit them.
- All 4 classes have rules in the built stylesheet.

Not settled here, and it is the whole point of the component: **whether it drags.** That, the keyboard toggle, the collapse in `NoAspectRatio` and iOS Safari's degraded mode are all Step 5.
