# Status Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/status/
**Root element:** `span` by default, polymorphic — see §3b
**Target file:** `packages/daisy-astro/src/components/Status/Status.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Status/Status.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/status.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. A dot, with a highlight

```css
.status { display:inline-block; aspect-ratio:1; width:.5rem; height:.5rem;
          vertical-align:middle; border-radius:var(--radius-selector);
          background-color: color-mix(in oklab, var(--color-base-content) 20%, transparent);
          color: color-mix(in oklab, var(--color-black) 30%, transparent);
          background-image: radial-gradient(circle at 35% 30%, oklch(1 0 0 / calc(var(--depth) * .5)), #0000);
          background-position:50%; background-repeat:no-repeat;
          box-shadow: 0 2px 3px -1px color-mix(in oklab, currentColor calc(var(--depth) * 100%), #0000) }
.status-primary { background-color:var(--color-primary); color:var(--color-primary) }  /* …×8 */
.status-xs { width:.125rem; height:.125rem }  /* sm .25, md .5, lg .75, xl 1rem */
```

**[all verified]**. The `radial-gradient` at 35 %/30 % is a specular highlight and the `box-shadow` a drop shadow, both scaled by the theme's `--depth` — which is why a Status looks like a small bead rather than a flat circle.

Each colour class sets **both** `background-color` and `color` **[verified]**, so the dot and its shadow tint together.

## 1. Variant audit

**14 classes: 1 base + 8 colour + 5 size**, matching the doc page's frontmatter. `grep -oE '\.status[a-z0-9-]*' status.css | sort -u` returns exactly those 14 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `status` | — | — | Always applied. Defaults to a dimmed base-content dot. |
| Colour | `status-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | Matches exactly — import it. Sets background **and** shadow colour. |
| Size | `status-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches exactly — import it. **Non-linear steps** — §3c. |

**No style axis and no animation axis** — the two animated examples use Tailwind's `animate-ping` / `animate-bounce` **[verified]**. §3d.

## 2. Slots

**None.** Every doc example is an empty `<span>` or `<div>` **[verified]** — the element *is* the dot, and content would render on top of a 0.5 rem circle.

Tenth component in the library with no slot, and the same reason as `plans/components/hero.md` §3a's `HeroOverlay` and `plans/components/loading.md` §2: the element is the graphic.

## 3. Five things the naive implementation gets wrong

### 3a. It is empty, so `aria-label` is the only accessible name

An empty inline element announces nothing. Every doc example after the first carries `aria-label` **[verified]**, and the colour example varies it meaningfully: `"status"` for the four brand colours, but `"info"`, `"success"`, `"warning"`, `"error"` for the semantic ones.

**Not defaulted.** A generic `aria-label="status"` would be worse than none — it tells a screen-reader user that something has a status without saying which. And in the most common use, a Status inside an `Indicator` next to a labelled element, the dot is decorative and wants `aria-hidden="true"` instead.

Same call as `plans/components/avatar.md` §3c's presence dot, `plans/components/divider.md` §3e and `plans/components/loading.md` §3d: the JSDoc names both remedies, `...rest` carries them, and `WithAccessibleName` (§5) shows one.

### 3b. The doc page uses `span` for one example and `div` for the rest

The first example is `<span class="status">`; every later one is `<div aria-label="status" class="status">` **[verified]** — with no stated reason, since `.status` is `display: inline-block` either way.

**Default `span`**, because a status dot almost always sits inside a sentence, a Badge or an `Indicator`, and a `<div>` inside phrasing content is the trap `plans/components/badge.md` §3a documented. `Polymorphic<{ as: Tag }>` covers the `div` form.

That brings `plans/README.md` §5c's silent generic-inference failure — the probe in §4 is mandatory.

### 3c. The size steps are not the usual ladder

`.125rem`, `.25rem`, `.5rem`, `.75rem`, `1rem` **[verified]** — xs is **a quarter** of md, and xl is only double it. Unlike every other size axis in the library, these are literal pixel-ish values rather than multiples of `--size-selector`.

Practical consequence: `size="xs"` is a 2 px dot, effectively invisible against most backgrounds at normal zoom. Worth a JSDoc line, and `Sizes` (§5) makes it obvious rather than surprising.

### 3d. Animation is a Tailwind utility, not a modifier — and the ping example needs a second dot

Both animated examples are caller classes **[verified]**:

- `class="animate-bounce"` on a single dot;
- `class="animate-ping"` on a **duplicate** dot stacked under a static one, using `<div class="inline-grid *:[grid-area:1/1]">` as the wrapper **[verified]** — the ping expands and fades while the solid dot stays put.

**No `animation` prop.** It would emit Tailwind utilities this library does not own (`plans/components/loading.md` §3a's reasoning), and the ping form needs *two* elements plus a grid wrapper, which no boolean can express.

The JSDoc shows both snippets — the ping one especially, since "why does my ping dot disappear" is what happens when you animate the only dot you have.

### 3e. Unverified assumptions

1. **`--depth` sensitivity.** Both the highlight and the shadow are multiplied by `var(--depth)` **[verified]**, a theme variable. In a theme with `--depth: 0` a Status is a flat circle with no bead effect — correct, but worth confirming once so it is not mistaken for a broken gradient.
2. **Nothing structural** — no child selectors, no parts, no slot **[verified]**; the shared slot-wrapping question does not apply.
3. **Generic prop inference** — `Polymorphic` brings §5c's silent failure (§3b).

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * A small status bead. The element **is** the dot — it takes no children
 * (plan §2).
 *
 * It announces nothing on its own: add `aria-label="Online"` when the state is
 * the information, or `aria-hidden="true"` when it merely decorates something
 * already labelled (plan §3a).
 *
 * Animation is a Tailwind class, not a prop (plan §3d):
 *
 * ```astro
 * <Status color="info" class="animate-bounce" />
 *
 * <div class="inline-grid *:[grid-area:1/1]">
 *   <Status color="error" class="animate-ping" />
 *   <Status color="error" />
 * </div>
 * ```
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  color?: DaisyColor;
  /** Note the steps are uneven: xs is 2px, md 8px, xl 16px (plan §3c). */
  size?: DaisySize;
}>;

// Full literal class names. NEVER `status-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'status-primary', secondary: 'status-secondary', accent: 'status-accent',
  neutral: 'status-neutral', info: 'status-info', success: 'status-success',
  warning: 'status-warning', error: 'status-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'status-xs', sm: 'status-sm', md: 'status-md', lg: 'status-lg', xl: 'status-xl',
};

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'span', color, size, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['status', color && COLOR[color], size && SIZE[size], className]} {...rest}></Tag>

```

No `<script>`: pure CSS. Note the self-closing render — **no `<slot />`** (§2).

### Astro idioms gate

- [ ] **No `<slot />`** — the element is the dot (§2).
- [ ] No `Astro.slots.has()` gating — there are no slots.
- [ ] Default root is `span`, with `as` via `Polymorphic` (§3b).
- [ ] No `<script>` added, and **no `animation` prop** (§3d).
- [ ] `...rest` spread onto the root — this is what carries `aria-label` and `aria-hidden` (§3a).
- [ ] No ARIA defaults (§3a).
- [ ] Every variant class is a literal in a `Record` map — no `` `status-${color}` ``.
- [ ] **`type Props` precedes every `const`**, with `as Props<HTMLTag>` (§3e.3).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Status />
  <Status color="success" size="lg" aria-label="Online" />
  <Status as="div" class="animate-bounce" aria-hidden="true" />
  <Status color="banana">must error — not a DaisyColor</Status>
  <Status animation="ping">must error — animation is a class (§3d)</Status>
  <Status>must error — no slot (§2)</Status>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `Sizes` (five), `Colors` (eight, with the page's own varied `aria-label`s), `WithPingAnimation`, `WithBounceAnimation`.

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`WithAccessibleName`** — a bare dot, one with `aria-label`, and one with `aria-hidden`, with a devtools note (§3a).
- **`InIndicator`** — a Status as an `IndicatorItem`, which is the doc example on `plans/components/indicator.md`'s page and the most common real use; cross-referenced both ways.
- **`SinglePing`** — `animate-ping` on the **only** dot, so it fades to nothing — showing why the doc's ping example stacks two (§3d).

## 6. Steps

- [ ] **Step 1:** Check §3e.1 (`--depth`) once so a flat dot in a zero-depth theme is recognised.
- [ ] **Step 2:** No new shared unions — `DaisyColor`/`DaisySize` reused unchanged. `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate. **Run the probe** — the generic failure is silent, and the no-slot rule must actually error.
- [ ] **Step 4:** Replace `Status.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is a small dimmed bead with a visible highlight (§0); `Colors` shows eight tints with matching shadows; `Sizes` shows the **uneven** ladder, with xs barely visible (§3c); `WithPingAnimation` pulses around a solid dot while `SinglePing` fades away entirely (§3d); `InIndicator` pins to a corner.
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<span class="status[^"]*"[^>]*></span>' storybook-static/astro-prerendered-stories.json | head
  ```
  Every rendered status must be empty (§2).
- [ ] **Step 7:** Update the `Status` row in `plans/README.md` to **Implemented**, and cross-reference `InIndicator` from `plans/components/indicator.md` §5's `StatusIndicator` story.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 14 daisyUI classes reachable: base, 8 colours, 5 sizes.
- [ ] `color` uses `DaisyColor` and `size` uses `DaisySize`, imported, neither redeclared.
- [ ] No slot, and every rendered element is empty (§2) — asserted in the build output.
- [ ] Default root is `span`; `as="div"` available; probe passes (§3b).
- [ ] No invented axis — no animation prop (§3d), no ARIA defaults (§3a).
- [ ] JSDoc states: it announces nothing by default with both remedies (§3a), the uneven size steps (§3c), and both animation recipes including why ping needs two dots (§3d).
- [ ] One story per doc-page example, plus `WithAccessibleName`, `InIndicator` and `SinglePing`.
- [ ] Every box in §4's gate ticked.
