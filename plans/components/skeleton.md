# Skeleton Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/skeleton/
**Root element:** `div` by default, polymorphic — see §3b
**Target file:** `packages/daisy-astro/src/components/Skeleton/Skeleton.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Skeleton/Skeleton.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/skeleton.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. Two classes, one shimmer, two different things being shimmered

```css
.skeleton { border-radius: var(--radius-box); background-color: var(--color-base-300);
            will-change: background-position; background-size: 200%; background-position-x: -50%;
            background-image: linear-gradient(105deg, #0000 0% 40%, var(--color-base-100) 50%, #0000 60% 100%) }
@media (prefers-reduced-motion: no-preference) { .skeleton { animation: 1.8s ease-in-out infinite skeleton } }
@media (prefers-reduced-motion: reduce)       { .skeleton { transition-duration: 15s } }

.skeleton-text { color: #0000; background-clip: text;
                 background-image: linear-gradient(105deg,
                   color-mix(in oklab, var(--color-base-content) 20%, transparent) 0% 40%,
                   var(--color-base-content) 50%,
                   color-mix(in oklab, var(--color-base-content) 20%, transparent) 60% 100%) }

@keyframes skeleton { 0% { background-position: 150% } to { background-position: -50% } }
```

**[all verified]**. `skeleton` shimmers a **box**; `skeleton-text` re-points the same animation at the **glyphs** via `background-clip: text` and a transparent `color`. Two modes of one component, and the second is the interesting one (§3a).

## 1. Variant audit

**2 classes: 1 component + 1 modifier**, matching the doc page's frontmatter. `grep -oE '\.skeleton[a-z0-9-]*' skeleton.css | sort -u` returns exactly `.skeleton` and `.skeleton-text` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `skeleton` | — | — | Always applied. |
| Modifier | `skeleton-text` | `text` | `boolean` | Shimmers the text instead of the box — §3a. One class → boolean. |

**No colour or size axis** — none exists **[verified]**. Every doc example sizes with `h-4 w-28`, `h-32 w-full`, `w-16 h-16 rounded-full` — plain Tailwind (§3c).

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none | **yes** | empty for a box; the placeholder text for `skeleton-text` |

Single default slot, no gating, **no fallback content**.

The two modes want opposite things: a box skeleton is **empty** (all four block examples **[verified]**), and a text skeleton **must have text** (§3a). One optional slot serves both; the JSDoc says which mode wants which.

## 3. Four things the naive implementation gets wrong

### 3a. `skeleton-text` needs text, and it sets `color: transparent`

`color: #0000` with `background-clip: text` **[verified]** — the glyphs become a window onto the shimmer gradient. So:

- **With no content it renders nothing at all** — not an empty box, since the base `background-color` is painted behind text-clipped glyphs that do not exist. `text` plus an empty slot is invisible.
- **The text is still in the accessibility tree and still selectable**, which is right for the doc example's use (`AI is thinking harder...`) — it is real copy being animated, not a placeholder shape.
- **A caller's `text-*` colour class does nothing**, because `color` is transparent by design and the visible colour comes from the gradient's `--color-base-content` stops.

`EmptyTextMode` (§5) shows the first point once; the other two are JSDoc lines.

### 3b. The root should follow the mode

The four box examples use `<div>`; the text example uses `<span>` **[verified]** — because a shimmering phrase belongs inline, in a sentence.

So `Skeleton` is `Polymorphic<{ as: Tag }>` defaulting to `'div'`, with `as="span"` for the text mode. Not switched automatically from `text`: a caller may well want a block-level shimmering heading, and a prop that silently changes the element is worse than one line of JSDoc.

That brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

### 3c. It has no size, and that is the whole API

`.skeleton` sets no width, height or display **[verified]** — a `<div class="skeleton">` with no size classes is a zero-height block, i.e. invisible.

Every doc example supplies both dimensions, and the shape (`rounded-full` for the avatar circle) too **[verified]**. So sizing is entirely `class`, there is no `size` prop, and the JSDoc leads with it — this is the component most likely to be reported as "renders nothing".

Note `border-radius: var(--radius-box)` is the default **[verified]**, which is why the circle example has to override it.

### 3d. Reduced motion swaps the animation for a 15-second transition

```css
@media (prefers-reduced-motion: no-preference) { animation: 1.8s ease-in-out infinite skeleton }
@media (prefers-reduced-motion: reduce)        { transition-duration: 15s }
```

**[verified]** — under `reduce` the shimmer **stops** (no animation is declared) and a very slow transition duration is set instead, which affects nothing here since no property transitions.

Net effect: a reduced-motion user sees a **static grey box**. That is a fourth distinct policy across the library, after `plans/components/aura.md` §3d (4× slower), `plans/components/loading.md` §3c (slower mask) and `plans/components/progress.md` §3a (stops). Recorded, not harmonised — and worth a JSDoc line, because a static skeleton with no other loading signal communicates nothing.

### 3e. Unverified assumptions

1. **`background-clip: text` support** — the whole text mode depends on it **[verified as the mechanism]**. Without it, `color: transparent` still applies and the text is **invisible** rather than falling back to solid. Check first; it is the one failure here that loses content.
2. **Nothing structural** — no child selectors, no parts **[verified]**; the shared slot-wrapping question does not apply.
3. **Generic prop inference** — `Polymorphic` brings §5c's silent failure (§3b).

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * A shimmering loading placeholder.
 *
 * **It has no size of its own** — `class="h-32 w-full"` is required, and every
 * doc example supplies both dimensions (plan §3c).
 *
 * Two modes:
 * - default: an **empty** box. `<Skeleton class="h-4 w-28" />`
 * - `text`: shimmers the **glyphs** instead, so it needs content and wants an
 *   inline root: `<Skeleton text as="span">AI is thinking…</Skeleton>` (plan §3a).
 *
 * Under `prefers-reduced-motion: reduce` the shimmer stops entirely — pair it
 * with another loading signal if that matters (plan §3d).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  /** Animates the text colour instead of the background. Requires content. */
  text?: boolean;
}>;

// Booleans as object keys are literals in source, so they satisfy §1b as
// written; there is no multi-value axis, so no Record map is needed.

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'div', text = false, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['skeleton', { 'skeleton-text': text }, className]} {...rest}>
  <slot />
</Tag>
```

No `<script>`: pure CSS (§3d).

### Astro idioms gate

- [ ] Content arrives via an optional default slot with **no fallback** (§2).
- [ ] No `Astro.slots.has()` gating.
- [ ] Default root is `div`, with `as` via `Polymorphic`; **not** switched automatically by `text` (§3b).
- [ ] No `<script>` added, and no reduced-motion override (§3d).
- [ ] `...rest` spread onto the root.
- [ ] **No `size`/`width`/`height` props** (§3c), no colour prop (§1).
- [ ] `text` is a boolean, not a one-value union (§1).
- [ ] No class interpolation — `skeleton-text` is an object key (§1b).
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3e.3).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Skeleton class="h-32 w-32" />
  <Skeleton text as="span">AI is thinking harder...</Skeleton>
  <Skeleton class="h-16 w-16 rounded-full shrink-0" id="x" data-test="y" />
  <Skeleton size="lg">must error — no size axis (§3c)</Skeleton>
  <Skeleton color="primary">must error — no colour axis (§1)</Skeleton>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default` (`h-32 w-32`), `CircleWithContent`, `RectangleWithContent`, `SkeletonText` (`as="span"`).

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`NoSize`** — a `<Skeleton />` with no classes beside a sized one, showing §3c's invisible result. The single most useful story here.
- **`EmptyTextMode`** — `text` with no children, rendering nothing (§3a).
- **`ReducedMotion`** — a comment plus one skeleton; verified by toggling the OS/browser setting, since §3d cannot be seen otherwise.

## 6. Steps

- [ ] **Step 1:** Check §3e.1 (`background-clip: text`) — invisible text in `SkeletonText` is that, not the component.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate. **Run the probe** — the generic failure is silent.
- [ ] **Step 4:** Replace `Skeleton.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is a grey rounded box with a diagonal shimmer sweeping left; `CircleWithContent` and `RectangleWithContent` match the doc layouts; `SkeletonText` shimmers the **letters** with the box background not visible (§3a); `NoSize` renders nothing (§3c); `EmptyTextMode` renders nothing (§3a); then enable reduced motion and confirm the shimmer **stops** (§3d).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<(div|span) class="skeleton[^"]*"' storybook-static/astro-prerendered-stories.json | head
  ```
- [ ] **Step 7:** Update the `Skeleton` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] Both daisyUI classes reachable: base and `text`.
- [ ] Default root is `div`; `as="span"` available and **not** implied by `text`; probe passes (§3b).
- [ ] No invented axis — no size, no colour (§1, §3c).
- [ ] JSDoc leads with "it has no size" (§3c), and covers the two modes (§3a) and the reduced-motion stop (§3d).
- [ ] One story per doc-page example, plus `NoSize`, `EmptyTextMode` and `ReducedMotion`.
- [ ] Every box in §4's gate ticked.
