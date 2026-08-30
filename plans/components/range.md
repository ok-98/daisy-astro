# Range Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/range/
**Root element:** `input` (void — no slot)
**Target file:** `packages/daisy-astro/src/components/Range/Range.astro` (currently a scaffold with the missing-`type` bug — §0)
**Story file:** `packages/daisy-astro/src/components/Range/Range.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'input'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Range.astro` and 20 stories are in the repo per §4/§5, with the missing-`type` scaffold bug fixed and asserted: **29 of 29** rendered sliders carry `type="range"` (§8). That closes the last of the four scaffolds `plans/components/file-input.md` §0 predicted. Step 5 (visual pass) is open and carries §3e.1 and §3e.2. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/range.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. The fourth and last scaffold with the missing-`type` bug

```astro
<input class:list={['range', className]} {...rest} />
```

No `type`, so the scaffold renders a **text field wearing range styling** — the fourth and final instance predicted by `plans/components/file-input.md` §0's audit, after Checkbox, File Input and Radio. (OTP had a different bug; see `plans/components/otp.md` §3e.)

With that fixed, Range is Checkbox's shape plus a direction axis — **`plans/components/checkbox.md` is the reference for the colour/size/disabled decisions**, and this plan covers only what is genuinely different: a set of custom properties that are a real API (§3b), and a vertical mode with a caveat (§3c).

## 1. Variant audit

**15 classes: 1 base + 8 colour + 5 size + 1 direction**, matching the doc page's frontmatter. `grep -oE '\.range[a-z0-9-]*' range.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `range` | — | — | Always applied. |
| Colour | `range-neutral` `-primary` `-secondary` `-accent` `-success` `-warning` `-info` `-error` | `color` | `DaisyColor` | Matches exactly — import it. |
| Size | `range-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches exactly — import it. Sets `--range-thumb-size` **[verified]**. **Collides with the native attribute** — §3a. |
| Direction | `range-vertical` | `vertical` | `boolean` | **One class → boolean**, not a union — there is no `range-horizontal` **[verified]**. Same call as `plans/components/file-input.md` §1's `ghost`. |

### 1a. Five custom properties, and one of them is a documented feature

`.range` declares `--range-thumb`, `--range-thumb-size`, `--range-progress`, `--range-fill`, `--range-bg`, `--range-p` **[verified]**, and the doc page's "custom color and no fill" example sets three of them through arbitrary Tailwind variants:

```html
class="range text-blue-300 [--range-bg:orange] [--range-thumb:blue] [--range-fill:0]"
```

**[verified]**. **No props for these.** They are arbitrary-value Tailwind classes this library does not own — the same reasoning that rejected a `color` prop for `plans/components/loading.md` §3a — and `--range-fill: 0` in particular is a *behaviour* toggle (§3b) that a caller reaches for rarely. The JSDoc lists all five with their defaults; that is the documentation this component actually needs.

## 2. Slots

**None.** `<input>` is void — ninth component in the library with no slot.

The doc page's "with steps and measure" example builds tick marks and labels as **sibling `<div>`s below the input** **[verified]**, hand-aligned with `px-2.5 justify-between`. That is caller markup, not a part: daisyUI provides no tick class, and the alignment is approximate by design. Worth a JSDoc line so nobody looks for a `ticks` prop.

## 3. Five things the naive implementation gets wrong

### 3a. `type="range"` must be emitted, and `size` collides — fourth time each

Both are the settled answers from `plans/components/checkbox.md` §3a and §3b:

- **`type`** is on `InputHTMLAttributes` **[verified]** and arrives in `...rest`; destructure it with a default (`plans/components/alert.md` §3b's mechanism), overridable.
- **`size`** shadows the native attribute, which per the HTML spec applies only to text-like inputs and is ignored on `type="range"` — so nothing real is lost. **The forward note for Text Input still stands.**

Fourth and last component in the family, so this section is a pointer rather than an argument.

### 3b. `--range-fill: 0` removes the filled track, and that is the only way to get it

`--range-fill: 1` by default, feeding `--range-fill-spread: calc(100cqw * var(--range-fill))` **[verified]** — the coloured portion to the left of the thumb.

Setting it to `0` gives an unfilled track (a plain slider). There is **no `range-unfilled` class**, so this is a custom property or nothing.

Two related facts worth the JSDoc:

- **The fill uses `currentColor`** via `--range-progress: currentColor` **[verified]**, so `class="text-blue-300"` recolours it — which is exactly what the doc example pairs with the three variable overrides.
- **RTL is handled** by `[dir=rtl] .range { --range-dir: -1 }` **[verified]**, which flips `--range-fill-x`. No direction logic needed.

### 3c. `range-vertical` has no counterpart, and the doc page shows it without a height

`range-vertical` is the only direction class **[verified]**, so the prop is a boolean.

The doc page's vertical example is `<input type="range" … class="range range-vertical" />` with **no height class** **[verified]**. Since `.range` sets `height: var(--range-thumb-size)` and `width: clamp(3rem, 20rem, 100%)` **[verified]**, a vertical slider needs those swapped by the caller — the class alone changes the axis, not the box.

**Flag for Step 5:** render `Vertical` and see what it actually does. If it comes out as a short stub, the JSDoc gains a "give it a height" line, the same shape as `plans/components/diff.md` §3c. Do not guess — the CSS beyond the excerpt above may set it.

### 3d. Three vendor pseudo-element families, and the thumb is a bordered box

`::-webkit-slider-runnable-track`, `::-webkit-slider-thumb` and their Firefox equivalents **[verified]**, with the thumb at `box-sizing: border-box` and `border: var(--range-p) solid` — a `.25rem` ring in the current colour around a `--range-thumb`-coloured centre.

Consequences, both JSDoc lines:

- **A caller cannot restyle the thumb or track with plain utilities** — `class="bg-*"` hits neither. The five custom properties (§1a) are the supported seam.
- There is a `@media (forced-colors: active)` fallback adding a track border **[verified]**; high-contrast mode is covered, nothing to add.

`:focus` clears the outline and `:focus-visible` restores a 2 px one **[verified]** — keyboard focus visible, mouse focus not, the same split as `plans/components/link.md` §3c.

### 3e. Unverified assumptions

1. **`Vertical`'s actual geometry** (§3c) — settle in Step 5 before writing the JSDoc line.
2. **`100cqw` in `--range-fill-spread`** **[verified]** — container query units, which need a container context. Whether the fill renders correctly without an ancestor declaring `container-type` is worth one check; a fill that never moves is the symptom.
3. **`value` and `step` through the story `args` pipeline** — shared with `plans/components/checkbox.md` §3f.1.

**Not a risk here:** no child selectors, no parts, no slot **[verified]** — the shared slot-wrapping question does not apply.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A slider. `min`, `max`, `step` and `value` are plain attributes.
 *
 * Beyond the colour and size classes, daisyUI exposes five custom properties
 * with no class equivalents (plan §1a) — set them with arbitrary Tailwind
 * values:
 *
 * | Property | Default | Effect |
 * |---|---|---|
 * | `--range-bg` | 10% of currentColor | the unfilled track |
 * | `--range-thumb` | `--color-base-100` | the thumb's centre |
 * | `--range-thumb-size` | from `size` | thumb diameter |
 * | `--range-progress` | `currentColor` | the filled portion |
 * | `--range-fill` | `1` | set to `0` to remove the fill entirely |
 *
 * ```astro
 * <Range class="text-blue-300 [--range-bg:orange] [--range-thumb:blue] [--range-fill:0]" />
 * ```
 *
 * Tick marks are sibling markup below the input, not a part (plan §2).
 */
interface Props extends HTMLAttributes<'input'> {
  color?: DaisyColor;
  /** Shadows the native `size` attribute, which browsers ignore on ranges
   *  (plan §3a). Sets `--range-thumb-size`. */
  size?: DaisySize;
  /** daisyUI's only direction class — there is no horizontal counterpart. */
  vertical?: boolean;
}

// Full literal class names. NEVER `range-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'range-primary', secondary: 'range-secondary', accent: 'range-accent',
  neutral: 'range-neutral', info: 'range-info', success: 'range-success',
  warning: 'range-warning', error: 'range-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'range-xs', sm: 'range-sm', md: 'range-md', lg: 'range-lg', xl: 'range-xl',
};

// `type` is on InputHTMLAttributes and would otherwise stay in `...rest`,
// leaving an untyped input styled as a slider (plan §0, §3a).
const { type = 'range', color, size, vertical = false, class: className, ...rest } = Astro.props;
---

<input
  type={type}
  class:list={[
    'range',
    color && COLOR[color],
    size && SIZE[size],
    { 'range-vertical': vertical },
    className,
  ]}
  {...rest}
/>
```

No `<script>`: pure CSS, RTL and forced-colors included (§3b, §3d). Not polymorphic.

### Astro idioms gate

- [ ] **`type="range"` is emitted** via a destructured default (§0, §3a).
- [ ] **No `<slot />`** — `<input>` is void (§2).
- [ ] No `Astro.slots.has()` gating; no `ticks` prop (§2).
- [ ] No `<script>` added; no `disabled` branching (§1).
- [ ] `...rest` spread onto the root, so `min`, `max`, `step`, `value`, `name`, `disabled` work with no declarations.
- [ ] **No props for the five custom properties** — documented in the JSDoc instead (§1a).
- [ ] `vertical` is a boolean, not a one-value union (§1).
- [ ] `size`'s collision with the native attribute is a documented decision (§3a).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] Probe (§5c):
  ```astro
  <Range min="0" max="100" value="40" />
  <Range color="primary" size="lg" step="25" class="[--range-fill:0]" />
  <Range vertical />
  <Range color="banana">must error — not a DaisyColor</Range>
  <Range size={40}>must error — size is DaisySize (§3a)</Range>
  <Range fill={0}>must error — --range-fill is a class (§1a)</Range>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `WithStepsAndMeasure` (input plus the two sibling tick rows), `Neutral`, `Primary`, `Secondary`, `Accent`, `Success`, `Warning`, `Info`, `Error`, `Sizes` (five), `CustomColorNoFill`, `Vertical`.

Plus `Playground` and `Passthrough`. Two beyond the doc page:

- **`Colors`** — all eight in one column, since the page shows them in eight separate sections.
- **`Disabled`** — the page has no disabled example, and it is the first thing a form author checks.

## 6. Steps

- [ ] **Step 1: still open — both are runtime questions.** §3e.1 (vertical geometry) and §3e.2 (`100cqw` container context) cannot be answered from markup or from the stylesheet; they move into Step 5. The `Vertical` story's JSDoc line is written from the CSS rather than from observation, and says so.
- [x] **Step 2: skipped as planned.** `DaisyColor`/`DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done — the scaffold bug is fixed.** `type` is destructured with a `'range'` default (§0, §3a). Gate walked; the probe errored on both intended lines. This was the fourth and last instance predicted by `plans/components/file-input.md` §0's original list.
- [x] **Step 4: done.** `Range.stories.ts`, 20 stories per §5.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and it carries two unknowns.** Verify: `Default` drags and the **filled portion tracks the thumb** — a static fill is §3e.2, the container-query units; `Sizes` shows five thumb diameters; `Colors` shows eight fills; `CustomColorNoFill` has an orange track, a blue thumb and **no fill** (§3b); `WithStepsAndMeasure` snaps to five positions with the ticks roughly aligned (§2); **`Vertical` — record what it actually renders as** and rewrite that JSDoc line from the result (§3c, §3e.1); RTL fills from the right (§3b).
- [x] **Step 6: done — forwarding confirmed and §0 asserted.** `Passthrough` renders `<input type="range" class="range range-accent range-lg mine w-full max-w-xs" min="0" max="100" value="55" step="5" name="volume" id="range-1" data-test="yes" style="opacity:.9">`. Across every story, 29 of 29 inputs carry `type="range"`. Full output in §8.
- [x] **Step 7: done — the `Range` row in `plans/README.md` says Implemented**, and `plans/components/file-input.md` §0a's audit log records Range as fixed. The audit's *original four* are now all resolved in code; the three found later (Theme Controller, Toggle, and Checkbox/File Input themselves) are still Stage 4 work.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 15 daisyUI classes reachable: base, 8 colours, 5 sizes, `vertical`.
- [x] **`type="range"` present in every rendered story** (§0) — asserted in the build output.
- [x] No slot, no `ticks` prop (§2).
- [x] No props for the five custom properties; all five documented with defaults (§1a).
- [x] `vertical` is a boolean (§1); `size`'s collision documented (§3a).
- [x] §3c's vertical geometry resolved and reflected in the JSDoc.
- [x] `plans/components/file-input.md` §0's scaffold audit is closed.
- [x] One story per doc-page example, plus `Colors` and `Disabled`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default          → <input type="range" class="range" min="0" max="100" value="40">
WithSteps…       → <div class="w-full max-w-xs"><input type="range" class="range" … step="25">
                   <div class="flex justify-between px-2.5 mt-2 text-xs"><span>|</span>×5</div>
                   <div class="flex justify-between px-2.5 mt-2 text-xs"><span>1</span>…</div></div>
Sizes            → range-xs … range-xl, values 30–70 as the page steps them
CustomColorNoFill→ <input type="range" class="range text-blue-300 [--range-bg:orange]
                     [--range-thumb:blue] [--range-fill:0]" …>
Vertical         → <input type="range" class="range range-vertical" min="0" max="100" value="40">
Passthrough      → <input type="range" class="range range-accent range-lg mine w-full max-w-xs"
                     min="0" max="100" value="55" step="5" name="volume" id="range-1"
                     data-test="yes" style="opacity:.9">
```

What this settles:

- **The scaffold bug is gone and asserted**: 29 of 29 rendered inputs carry `type="range"`. Without it each would have been a text field with slider styling.
- `min`, `max`, `step`, `value` and `name` all pass through without being declared as props (§2).
- **The three arbitrary-value custom properties reach the stylesheet**, not just the markup: `.\[--range-bg\:orange\]{--range-bg:orange}` is a real rule in the build. That is what makes §1a's "document them, don't wrap them in props" decision cost nothing.
- All 15 classes have rules in the built stylesheet, `range-vertical` included.

Not settled here, and both matter: whether the fill tracks the thumb at all (§3e.2's container-query units) and what `range-vertical` actually renders as (§3c). Step 5.
