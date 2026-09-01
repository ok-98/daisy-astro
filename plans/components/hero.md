# Hero Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/hero/
**Root element:** `div` (all three components)
**Target files:** `packages/daisy-astro/src/components/Hero/Hero.astro`, `HeroContent.astro`, `HeroOverlay.astro` (only `Hero.astro` exists, as a dummy scaffold)
**Story files:** `Hero.stories.ts` (+ short files per sub-component)

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **Hero has no variant classes** so no `Record` map exists (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/hero.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01). `Hero.astro`, `HeroContent.astro`, `HeroOverlay.astro` and 9 stories. §3e.1 is answered — a part is the direct child in 10 of 10 heroes (§8) — and §3e.3's raw-markup fallback is discharged: the form example composes `Card`, `Fieldset`, `Label`, `TextInput`, `Link` and `Button`. One addition to §4: **§3a's "no slot" cannot be typed, so `HeroOverlay` throws** (§3f). Step 5 (visual pass) is open.
---

## 0. A one-cell grid that stacks its children

```css
.hero { display:grid; place-items:center; width:100%;
        background-position:50%; background-size:cover }
.hero > * { grid-row-start:1; grid-column-start:1 }
.hero-overlay { grid-row-start:1; grid-column-start:1; width:100%; height:100%;
                background-color: color-mix(in oklab, var(--color-neutral) 50%, transparent) }
.hero-content { display:flex; justify-content:center; align-items:center; gap:1rem;
                max-width:80rem; padding:1rem; isolation:isolate }
```

**[all verified]**. Every child is placed in the same grid cell, which is how the overlay sits behind the content without absolute positioning. `isolation: isolate` on the content is what keeps it above the overlay without a `z-index`.

Three classes, no modifiers. The whole plan is §3.

## 1. Variant audit

**3 classes: 1 component + 2 part**, matching the doc page's frontmatter. `grep -oE '\.hero[a-z0-9-]*' hero.css | sort -u` returns exactly `.hero`, `.hero-overlay`, `.hero-content` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Component |
|---|---|---|---|---|
| Base | `hero` | — | — | `Hero` |
| Part | `hero-content` | — | — | `HeroContent` |
| Part | `hero-overlay` | — | — | `HeroOverlay` |

**No colour, size, style or placement axis** — none exists **[verified]**. Ninth component in the library with an empty variant table. Everything that varies in the doc examples (`min-h-screen`, `bg-base-200`, `text-center`, `flex-col lg:flex-row-reverse`) is plain Tailwind (§3b, §3c).

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Hero` | `default` | none — direct children share one grid cell | no | a `HeroOverlay` (optional) and a `HeroContent` |
| `HeroContent` | `default` | none | no | a `<div class="max-w-md">`, an `<img>`, a Card |
| `HeroOverlay` | — | — | — | **none** — the element is empty by design (§3a) |

Plain default slots. **No named slots on `Hero`**: the overlay is optional and its order relative to the content does not matter (both are in the same cell), so sub-components are simpler than gated slots — the opposite call to `plans/components/diff.md` §0, where the structure was fixed and one child was always empty.

## 3. Five things the naive implementation gets wrong

### 3a. `HeroOverlay` renders an empty element and takes no slot

`<div class="hero-overlay"></div>` in the doc example, and the CSS gives it a full-size translucent neutral fill **[verified]**. It exists to be a coloured layer; content inside it would render *behind* `hero-content`'s `isolation: isolate` and be unreachable.

So `HeroOverlay` has no slot — the fourth component in the library with none, after Checkbox, `CountdownValue` and File Input, and here because the element is *meant* to be empty rather than because it is void.

The overlay colour is `--color-neutral` at 50% **[verified]** with no variable to override, so a different tint is `class="bg-black/60"` from the caller. One JSDoc line.

### 3b. The background image is an inline style, not a prop

Every overlay example sets the image with `style="background-image: url(…)"` on the `.hero` root **[verified]** — daisyUI provides no class for it, and Tailwind's `bg-[url(…)]` arbitrary value would be an interpolated class in this library's own source, which `plans/README.md` §1b forbids.

**No `image` prop.** A `image="/photo.webp"` prop would have to build `background-image:url(${src})` — which is a *style*, not a class, so §1b technically permits it (the same reasoning as `plans/components/countdown.md` §3b's `--value`). It is still out: `background-size`, `position` and `repeat` are already the caller's, an `<img>`-based hero is the other half of the doc examples, and a one-property prop that shadows the native `style` attribute would need the same merge dance as `CountdownValue`. The JSDoc shows the inline style instead.

### 3c. The hero has no height, and `hero-content` has a max width

`.hero` sets `width: 100%` and **no height** **[verified]**. Every doc example adds `min-h-screen` (or `min-h-[30rem]` in the rendered demos). Without one the hero is exactly as tall as its content and the `place-items: center` does nothing visible — a hero that looks like a plain div, which is correct rather than broken. Same shape as `plans/components/diff.md` §3c but less severe, since content still shows.

`.hero-content` is capped at `max-width: 80rem` with `padding: 1rem` **[verified]**, and is a **flex row** by default. That is why the figure examples add `flex-col lg:flex-row` — the responsive stacking is caller Tailwind on the content, not a prop, and it is the single most common thing a caller changes. The JSDoc names it.

### 3d. Every child lands in the same cell, so order is (almost) irrelevant

`.hero > * { grid-row-start:1; grid-column-start:1 }` **[verified]** — overlay and content overlap regardless of source order, and `isolation: isolate` on `.hero-content` guarantees it paints above without a `z-index`.

Two things follow:

- **A third child also lands in the same cell**, stacked over both. Usually a mistake; the JSDoc says a Hero holds an optional overlay and one content block.
- **The overlay does not need to come first.** The doc examples write it first for readability; nothing depends on it. Stated so nobody "fixes" a working hero by reordering.

### 3f. "Takes no slot" needs a guard — addition to §4

**Found while walking the gate, 2026-09-01.** §3a says `HeroOverlay` takes no
children and §7 asks to verify that it "accepts no slot". The probe showed it
cannot be verified that way: **`<HeroOverlay>oops</HeroOverlay>` is not a type
error.** `children` is not part of `Props`, so TypeScript has nothing to reject;
the content is simply dropped, because there is no `<slot />` to render it.

Two silent losses in one: the caller's markup disappears, and even if it were
rendered it would sit behind `HeroContent`'s `isolation: isolate` and be
invisible.

**So the component throws**, the library's second such guard after
`plans/components/text-input.md` §2's and for the same reason — the alternative
is markup that renders while quietly discarding what the caller wrote:

```
Error: <HeroOverlay> takes no children — it is an empty tint layer; put content in <HeroContent>.
```

Fired once to prove it does, the way §0k of the Text Input plan established:
a temporary story, a failing build, and the story removed again.

Worth generalising: **a component that renders no `<slot />` should say so at
runtime**, because the type system cannot. That is now two components; a third
would justify a shared helper.

### 3e. Unverified assumptions

1. **Do slot children land as direct children of `.hero`?** Blocking: `.hero > *` is what puts everything in one cell. A wrapper would take the cell itself, and the overlay would then sit *inside* the same stacking context as the content rather than behind it — the tint would cover the text. Fourteenth plan to hit the shared question in `plans/components/aura.md` §3e.1.
2. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with `plans/components/avatar.md` §3e.2, Card, Carousel and Diff.
3. **Cross-component composition** — the form example nests `card`, `card-body`, `fieldset`, `label`, `input`, `link` and `btn`. Raw markup in that story until those plans land, noted in a comment.

## 4. Component implementation

### `Hero.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Full-width banner. A single-cell grid: the optional `HeroOverlay` and the
 * `HeroContent` are stacked in the same cell, so their order does not matter
 * (plan §3d).
 *
 * Give it a height — `class="min-h-screen"` — or it collapses to its content
 * (plan §3c). For a background photo, use an inline style on this element:
 * `style="background-image: url(/photo.webp)"` (plan §3b).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['hero', className]} {...rest}>
  <slot />
</div>
```

### `HeroContent.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * A flex **row** capped at 80rem. For the usual side-by-side-on-desktop
 * layout add `class="flex-col lg:flex-row"` (or `lg:flex-row-reverse`) —
 * daisyUI has no prop for it (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['hero-content', className]} {...rest}>
  <slot />
</div>
```

### `HeroOverlay.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Translucent layer over the hero's background image. **Empty by design** —
 * it takes no children (plan §3a). Retint with `class="bg-black/60"`.
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['hero-overlay', className]} {...rest}></div>
```

No `<script>` anywhere: pure CSS. None is polymorphic — daisyUI documents all three on a `div`.

### Astro idioms gate

- [ ] `Hero` and `HeroContent` take plain default slots; **`HeroOverlay` has none** (§2, §3a).
- [ ] `<slot />` has no wrapper in `Hero` — children must share the grid cell (§3d, §3e.1).
- [ ] No `Astro.slots.has()` gating — the overlay's optionality is expressed by not rendering the component.
- [ ] Roots are `div` in all three; no `as` prop.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in all three — this is what carries the background-image `style` (§3b).
- [ ] **No `image` prop** (§3b), no `height` prop (§3c), no overlay-colour prop (§3a).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <Hero class="min-h-screen bg-base-200"><HeroContent class="text-center">…</HeroContent></Hero>
  <Hero style="background-image:url(/p.webp)"><HeroOverlay /><HeroContent>…</HeroContent></Hero>
  <HeroOverlay>must error — no slot (§3a)</HeroOverlay>
  <Hero image="/p.webp">must error — use an inline style (§3b)</Hero>
  <Hero color="primary">must error — no colour axis (§1)</Hero>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Three files. Doc-page examples in page order (`plans/README.md` §8), all in `Hero.stories.ts`:

| Doc-page example | Story | Notes |
|---|---|---|
| Centered hero | `Centered` | `min-h-[30rem] bg-base-200`, content `text-center` |
| Hero with figure | `WithFigure` | content `flex-col lg:flex-row`, `<img class="max-w-sm rounded-lg shadow-2xl">` |
| Hero with figure but reverse order | `WithFigureReversed` | `lg:flex-row-reverse` |
| Hero with form | `WithForm` | raw card/fieldset markup (§3e.3) |
| Hero with overlay image | `WithOverlay` | inline `style` background + `HeroOverlay` |

Plus `Playground` and `Passthrough`; `HeroContent` and `HeroOverlay` get a `Playground` + `Passthrough` each.

Two beyond the doc page:

- **`NoHeight`** — no `min-h-*`, beside a correct copy, making §3c's collapse visible.
- **`OverlayOrder`** — the overlay rendered *after* the content, identical to `WithOverlay`, demonstrating §3d.

Every story uses `min-h-[30rem]` rather than the doc page's `min-h-screen`, exactly as daisyUI's own rendered demos do — a viewport-height hero in the canvas hides everything else. Comment says so.

## 6. Steps

- [x] **Step 1: done for §3e.1**, where the failure would have been a tint over the text rather than a layout glitch: `.hero > *` is what puts every child in one cell, so a wrapper would take the cell and the overlay would end up in the same stacking context as the content. A part is the direct child in **10 of 10** heroes. §3e.3 is discharged; §3e.2 stays with the other image plans.
- [x] **Step 2: skipped as planned.** No variant classes at all; `variants.ts` untouched.
- [x] **Step 3: done, with §3f's guard added.** The probe errors on `image` and `size`; its third line, children on `HeroOverlay`, **cannot** error — which is what §3f is about.
- [x] **Step 4: done.** `Hero.stories.ts`, 9 stories — 5 doc-page examples plus `Playground`, `Passthrough`, `OverlayOrder` and `NoHeight`, all at `min-h-[30rem]` as daisyUI's own demos are. **No sub-component story files**: `HeroContent` and `HeroOverlay` have no props, and `Passthrough` asserts all three levels at once.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and a resize.** Verify: `Centered` centres both ways; `WithFigure` stacks below `lg` and sits side by side above it; **`WithOverlay` shows the photo dimmed behind *readable* text** — text lost under the tint would mean §3e.1; **`OverlayOrder` looks identical to it** (§3d); and `NoHeight`'s second hero collapses to its content (§3c).
- [x] **Step 6: done — forwarding confirmed at three levels.** `Passthrough` renders `<div class="hero mine min-h-[30rem] rounded" id="hero-1" data-test="yes" style="background-image: url(…); letter-spacing:1px">` around a marked overlay and a marked content block. Full output in §8.
- [x] **Step 7: done — the `Hero` row in `plans/README.md` says Implemented** and names both parts.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 3 daisyUI classes reachable.
- [x] `HeroOverlay` renders empty and accepts no slot (§3a).
- [x] Children render as direct grid children and share one cell (§3d, §3e.1).
- [x] No invented axis — no `image`, `height` or overlay-colour prop (§3a–§3c).
- [x] JSDoc states: give it a height (§3c), background image is an inline style (§3b), `hero-content` is a flex row needing `flex-col lg:flex-row` (§3c), and child order is irrelevant (§3d).
- [x] One story per doc-page example, plus `NoHeight` and `OverlayOrder`, all using `min-h-[30rem]` (§5).
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 203 files, 0 errors, 0 warnings, 0 hints.

```
WithOverlay  → <div class="hero min-h-[30rem] rounded" style="background-image: url(…);">
                 <div class="hero-overlay rounded"></div>
                 <div class="hero-content text-center text-neutral-content">…
OverlayOrder → <div class="hero …" style="background-image: url(…);">
                 <div class="hero-content …">…</div><div class="hero-overlay rounded"></div>
                            ↑ reversed, and identical on screen — §3d
Passthrough  → <div class="hero mine min-h-[30rem] rounded" id="hero-1" data-test="yes"
                 style="background-image: url(…); letter-spacing:1px">
                 <div class="hero-overlay overlay-marker rounded" id="overlay-1" data-test="overlay"></div>
                 <div class="hero-content content-marker …" id="content-1" data-test="content">…
```

Counts across the 9 stories:

```
.hero roots 10  → a hero-content or hero-overlay is the direct child  10 of 10
hero-overlay elements 3  → all 3 render EMPTY
inline background-image styles 3  — no `image` prop anywhere (§3b)
built CSS: .hero, the `.hero > *` single-cell rule, .hero-overlay, .hero-content
```

What this settles:

- **§3e.1**: `.hero > *` is the single-cell rule, so a wrapper would have taken the cell itself and put the overlay in the same stacking context as the content — a tint over the text rather than a visible layout break. 10 of 10 are clean.
- **§3a, twice over**: all three overlays render as `<div class="hero-overlay …"></div>` with nothing inside, and passing children now fails the build rather than dropping them (§3f).
- **§3b**: the background photo is an inline `style` on the hero in all three overlay stories, and `Passthrough` shows it coexisting with a caller's own `letter-spacing` in the same attribute — which is exactly the merge an `image` prop would have had to do.
- **§3d is in the markup**: `OverlayOrder` writes the overlay after the content and is otherwise identical to `WithOverlay`. Whether they *look* identical is Step 5, but the DOM difference is the whole story.
- **§3e.3 is discharged** — the form example is `Card` → `CardBody` → `Fieldset` → `Label` + `TextInput` + `Link` + `Button`, with no raw markup left.

Not settled here: the centring, the responsive stack, and whether the overlaid text is readable. All Step 5.
