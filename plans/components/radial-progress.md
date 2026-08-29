# Radial Progress Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/radial-progress/
**Root element:** `div` — **not** `<progress>`, and daisyUI explains why (§3a)
**Target file:** `packages/daisy-astro/src/components/RadialProgress/RadialProgress.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/RadialProgress/RadialProgress.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/radialprogress.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. One class, three custom properties, and a required value

```css
.radial-progress {
  display:inline-grid; place-content:center; position:relative; flex-shrink:0;
  box-sizing:content-box; vertical-align:middle;
  width:var(--size); height:var(--size); border-radius:9999px; background-color:#0000;
  --value:0; --size:5rem; --thickness:calc(var(--size) / 10);
  --radialprogress:calc(var(--value) * 1%);
  transition: --radialprogress .3s linear;
}
.radial-progress:before { /* the ring: a conic-gradient masked to an annulus */
  background: radial-gradient(farthest-side, currentColor 98%, #0000) top/var(--thickness) var(--thickness) no-repeat,
              conic-gradient(currentColor var(--radialprogress), #0000 0);
  mask: radial-gradient(farthest-side, #0000 calc(100% - var(--thickness)), #000 calc(100% + .5px - var(--thickness)));
  position:absolute; inset:0; border-radius:9999px }
.radial-progress:after {  /* the leading dot */
  inset: calc(50% - var(--thickness) / 2);
  transform: rotate(calc(var(--value) * 3.6deg - 90deg)) translate(calc(var(--size) / 2 - 50%));
  background-color: currentColor; border-radius:9999px; transition: transform .3s linear }
```

**[all verified]**. The API is not classes — it is **`--value`, `--size` and `--thickness`**, exactly as the doc page's info box says. So the whole plan is §3.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type |
|---|---|---|---|
| Base | `radial-progress` | — | — |

**One class, no parts, no modifiers.** `grep -oE '\.radial-progress[a-z0-9-]*' radialprogress.css | sort -u` returns exactly `.radial-progress` **[verified]**.

Sixteenth component in the library with an empty variant table — and the first where that is because **the API is custom properties instead** (§1a). Contrast `plans/components/progress.md` §1, which has eight colour classes for the same job.

### 1a. The real API

| Property | Default | Prop | Notes |
|---|---|---|---|
| `--value` | `0` | `value` (**required**) | 0–100. Drives both the arc and the dot — §3b. |
| `--size` | `5rem` | `size` | Any CSS length. `--thickness` derives from it. |
| `--thickness` | `calc(--size / 10)` | `thickness` | Any CSS length. |

All three are **styles, not classes**, so `plans/README.md` §1b's interpolation ban does not apply — the same reasoning as `plans/components/countdown.md` §3b. `size` and `thickness` are therefore typed `string`, not a union: the doc examples use `12rem`, `2px` and `2rem` **[verified]**, and there is no scale to enumerate.

**No colour axis**: colour is `currentColor` **[verified]** — `class="text-primary"`, per §3c.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — centred by `place-content: center` | **yes** | `70%`, `0%`, … |

Single default slot, no gating, **no fallback content**. Every doc example puts the percentage text inside **[verified]**, but a ring with no label is perfectly valid and the component must not invent one — a `70%` fallback would be wrong the moment a caller wants `7/10` or an icon.

The text is centred by the grid, so it needs no wrapper.

## 3. Five things the naive implementation gets wrong

### 3a. It is a `<div>` on purpose, and `role="progressbar"` is not optional

daisyUI's own info box **[verified]**:

> For Radial progress we need to use a `div` instead of the `progress` tag because browsers can't show text inside `progress` tag, and Firefox doesn't render pseudo-elements inside `progress` tag at all. Adding `role="progressbar"` makes it accessible to screen readers as well.

So a `<div>` root is deliberate, and the accessibility that `plans/components/progress.md` gets free from the native element must be **added here**. Every doc example carries `role="progressbar"` **and** `aria-valuenow` **[verified]**.

**Decision: the component emits both.** `role` is defaulted (destructured, overridable — `plans/components/alert.md` §3b's mechanism), and **`aria-valuenow` is derived from `value`**, so the two cannot drift. That is the same synchronisation argument that gave `CountdownValue` its existence (`plans/components/countdown.md` §0a): a number that must appear in two places should be written once.

Not emitted: `aria-valuemin` / `aria-valuemax`, which default to 0 and 100 for `progressbar` and are what `--value` already assumes.

### 3b. `value` is required, and `--value: 0` is a silent empty ring

The base rule sets `--value: 0` **[verified]**, so an unset value renders a complete, correct-looking ring at zero — not an error, and not indeterminate.

Unlike `plans/components/progress.md` §3a, **there is no indeterminate state here**: `<progress>` has one natively, a `div` does not. So a missing value has no useful meaning, and:

**`value` is a required prop.** Same call as `plans/components/mask.md` §3b's `shape` and `plans/components/chat-bubble.md` §3a's `placement` — where daisyUI's fallback is a silently wrong render rather than a visible failure.

`value` is typed `number` and the JSDoc states the 0–100 range. Values outside it are not clamped by daisyUI **[verified — the CSS multiplies straight through]**: over 100 the conic gradient saturates but the `:after` dot keeps rotating past the top, which looks like a bug. One JSDoc line.

### 3c. Colour is `currentColor`, and the background is a separate concern

Both pseudo-elements use `currentColor` **[verified]**, and `.radial-progress` sets `background-color: #0000`.

So:

- **The ring colour is `class="text-primary"`** — the doc page's "custom color" example **[verified]**. No `color` prop, for the same reason as `plans/components/loading.md` §3a: it would emit a Tailwind utility this library does not own.
- **The disc behind it is a separate class.** The "with background color and border" example is `bg-primary text-primary-content border-4 border-primary` **[verified]** — three independent utilities. A single `color` prop could not express it.

### 3d. `box-sizing: content-box` makes borders add to the size

`box-sizing: content-box` **[verified]** — unusual, since Tailwind's preflight sets `border-box` globally, and it is the second component to opt out after `plans/components/carousel.md` §3b's items.

Consequence: the `border-4` in the doc example **grows the element beyond `--size`** rather than eating into it, which is what keeps the ring's geometry correct. A caller who "fixes" this with `box-border` will see the arc and the dot fall out of alignment.

Two more geometry notes worth a JSDoc line each:

- **`--thickness` derives from `--size`** (10 %) unless set, so changing only `size` scales the ring proportionally — which is usually what you want, and why the doc page's size example sets both **[verified]**.
- **The transition is on `--radialprogress`, a registered custom property** **[verified]**, plus a `transform` transition on the dot. So changing `value` animates smoothly — but only where custom-property transitions are supported (§3e.1).

### 3e. Unverified assumptions

1. **`transition: --radialprogress`** requires the property to be registered with `@property` **[the `@property` declaration is not in `radialprogress.css` — check `daisyui.css`, as `plans/components/countdown.md` §3f.3 had to for `--aura-angle`]**. Without registration the value jumps instead of animating; without `@property` support at all it still renders correctly, just without the tween. Confirm where it is declared.
2. **`mask` support** — the annulus is a `mask: radial-gradient(...)` **[verified]**. Shared with `plans/components/loading.md` §3e.2 and `plans/components/mask.md` §3e.1; one check covers all three, and an unmasked full disc is the symptom.
3. **Custom properties through Astro's `style` attribute** — shared with `plans/components/countdown.md` §3f.1. This component passes three of them and must merge with a caller's own `style` (§4).

**Not a risk here:** no child selectors, no parts **[verified]** — the shared slot-wrapping question does not apply.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A ring showing progress, drawn with a masked conic gradient.
 *
 * A `<div>`, not `<progress>` — browsers cannot put text inside `<progress>`
 * and Firefox will not render its pseudo-elements. That means the
 * accessibility is ours: `role="progressbar"` and `aria-valuenow` are emitted
 * here, derived from `value` (plan §3a).
 *
 * Colour is `currentColor`: `class="text-primary"`. A filled disc behind it is
 * separate — `class="bg-primary text-primary-content border-4 border-primary"`
 * (plan §3c).
 *
 * `box-sizing: content-box`, so a border grows the element rather than eating
 * into the ring — don't override it (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {
  /** **Required**, 0–100. daisyUI defaults `--value` to 0, which renders a
   *  plausible empty ring rather than failing (plan §3b). Not clamped. */
  value: number;
  /** Any CSS length. Default `5rem`; `thickness` derives from it (plan §3d). */
  size?: string;
  /** Any CSS length. Default is 10% of `size`. */
  thickness?: string;
}

// These are CSS custom properties in an inline style, NOT class names, so
// plans/README.md §1b's interpolation ban does not apply (plan §1a).

const {
  value,
  size,
  thickness,
  // `style` is native and would otherwise be clobbered (plan §3e.3).
  style,
  role = 'progressbar',
  'aria-valuenow': ariaValueNow = value,
  class: className,
  ...rest
} = Astro.props;

const vars = [
  `--value:${value};`,
  size ? ` --size:${size};` : '',
  thickness ? ` --thickness:${thickness};` : '',
].join('');
---

<div
  class:list={['radial-progress', className]}
  style={[vars, style].filter(Boolean).join(' ')}
  role={role}
  aria-valuenow={ariaValueNow}
  {...rest}
>
  <slot />
</div>
```

No `<script>`: the arc, the dot and the tween are all CSS (§3d).

### Astro idioms gate

- [ ] `value` is **required** with no default (§3b).
- [ ] `role="progressbar"` and `aria-valuenow` are emitted, both derived/defaulted and overridable (§3a).
- [ ] A caller's `style` is **merged**, not overwritten (§3e.3) — same handling as `plans/components/countdown.md` §4.
- [ ] Content arrives via an optional default slot with **no fallback** (§2).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root is `div`; no `as` prop (§3a).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] **No `color` prop** (§3c); `size` and `thickness` are `string`, not a union (§1a).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <RadialProgress value={70}>70%</RadialProgress>
  <RadialProgress value={70} size="12rem" thickness="2px" class="text-primary" />
  <RadialProgress value={70} style="opacity:.5" aria-label="Upload" />
  <RadialProgress>must error — value is required (§3b)</RadialProgress>
  <RadialProgress value="70">must error — number, not string</RadialProgress>
  <RadialProgress value={70} color="primary">must error — use text-* (§3c)</RadialProgress>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default` (70 %), `DifferentValues` (0/20/60/80/100), `CustomColor` (`text-primary`), `WithBackgroundAndBorder`, `CustomSizeAndThickness` (two, `12rem` with `2px` and `2rem`).

Plus `Playground` (a `value` control, so the tween is visible) and `Passthrough`. Three beyond the doc page:

- **`NoLabel`** — an empty ring, showing §2's optional slot.
- **`OutOfRange`** — `value={130}`, demonstrating §3b's unclamped dot.
- **`AccessibleName`** — devtools check that `role` and `aria-valuenow` match `value` (§3a); this is the one thing invisible in the canvas.

## 6. Steps

- [ ] **Step 1:** Settle §3e.1 (where `--radialprogress` is registered) and §3e.2 (`mask` support) — the first explains a jumpy `Playground`, the second a solid disc.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, then walk the gate.
- [ ] **Step 4:** Replace `RadialProgress.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` is a 70 % arc with a leading dot at the right angle and the label centred; `DifferentValues` sweeps 0→100 with 0 showing an empty ring and 100 a full one; `CustomColor` recolours the ring only; `WithBackgroundAndBorder` fills the disc and the border **grows** the element (§3d); `CustomSizeAndThickness` shows a hairline and a fat ring at the same diameter; dragging `Playground`'s `value` **animates** (§3d, §3e.1); `OutOfRange` shows the dot past the top (§3b).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE 'class="radial-progress[^"]*" style="--value:[0-9]+;[^"]*" role="progressbar" aria-valuenow="[0-9]+"' storybook-static/astro-prerendered-stories.json | head
  ```
  Confirms `--value` and `aria-valuenow` agree (§3a).
- [ ] **Step 7:** Update the `Radial progress` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] The single daisyUI class is applied; the API is the three custom properties (§1, §1a).
- [ ] `value` is required and a missing one is a type error (§3b).
- [ ] `role="progressbar"` and `aria-valuenow` are emitted and always agree with `value` (§3a) — asserted in the build output.
- [ ] A caller's `style` survives alongside the custom properties (§3e.3).
- [ ] No invented axis — no `color` prop (§3c), no size union (§1a).
- [ ] JSDoc states: why it is a `div` (§3a), that colour is `text-*` and the disc is separate (§3c), the `content-box` border behaviour (§3d), and that `value` is unclamped (§3b).
- [ ] One story per doc-page example, plus `NoLabel`, `OutOfRange` and `AccessibleName`.
- [ ] Every box in §4's gate ticked.
