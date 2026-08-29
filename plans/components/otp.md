# OTP Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/otp/
**Root element:** `label` — **not** the `div` in the scaffold (§0)
**Target file:** `packages/daisy-astro/src/components/Otp/Otp.astro` (currently a dummy scaffold with the wrong root)
**Story file:** `packages/daisy-astro/src/components/Otp/Otp.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'label'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/otp.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. One real input behind N fake boxes — and the scaffold's root is wrong

```html
<label class="otp">
  <span></span><span></span><span></span><span></span>
  <input type="text" autocomplete="one-time-code" inputmode="numeric"
         maxlength="4" pattern="[0-9]{4}" required />
</label>
```

There is exactly **one `<input>`**, stretched across the whole component with letter-spacing tuned so each character lands over one of the empty `<span>` boxes **[verified]**:

```css
.otp { display:inline-flex; position:relative; font-family:var(--font-mono); direction:ltr;
       --otp-ch:1ch; --otp-gap:calc(var(--otp-ch) * .5); --otp-w:calc(var(--otp-ch) * 2);
       --otp-size:calc(var(--size-field,.25rem) * 10);
       --stride:calc(var(--otp-w) + var(--otp-gap)) }
.otp > input { position:relative; z-index:1; pointer-events:none; background:#0000;
               border-width:0; outline-width:0; field-sizing:content;
               letter-spacing:calc(var(--stride) - var(--otp-ch));
               font-variant-numeric:tabular-nums; &:valid { caret-color:#0000 } }
.otp > span  { position:absolute; inline-size:var(--otp-w); block-size:var(--otp-size);
               border:var(--border) solid var(--input-color); background:var(--color-base-100);
               &:nth-child(2) { left:calc(var(--stride) * 1); transition-delay:20ms } … }
.otp:has(> span:nth-child(4)) { width:calc(var(--stride) * 4) }   /* …:first-child … :nth-child(8) */
```

**The root must be a `<label>`**: the input is `pointer-events: none` **[verified]**, so clicking a box focuses the field only because the label wraps it. The scaffold's `<div>` produces a component that renders correctly and **cannot be focused by clicking** — the same class of silent scaffold bug as `plans/components/checkbox.md` §0 and `plans/components/file-input.md` §0, and the third in this family.

## 1. Variant audit

**15 classes: 1 base + 1 modifier + 5 size + 8 colour**, matching the doc page's frontmatter. `grep -oE '\.otp[a-z0-9-]*' otp.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `otp` | — | — | Always applied. |
| Modifier | `otp-joined` | `joined` | `boolean` | Connects the boxes. One class → boolean. |
| Size | `otp-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. |
| Colour | `otp-neutral` `-primary` `-secondary` `-accent` `-success` `-info` `-warning` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. Each sets `--input-color` **[verified]**, the shared seam noted in `plans/components/checkbox.md` §3e. |

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — direct children of `.otp` | no | N empty `<span>`s **and** the `<input>` |

Single default slot, no gating.

**No `length` prop, and the boxes are not generated** — see §3b for why that is a real decision rather than laziness, and what would have to be true to change it.

**No `<input>` props.** `maxlength`, `pattern`, `inputmode`, `autocomplete`, `name`, `required` all belong to the caller's own `<input>`, which they write inside the slot.

## 3. Five things the naive implementation gets wrong

### 3a. The `<span>` count and the input's `maxlength` must agree, and nothing enforces it

daisyUI's own subheading says it: *"Make sure the number of spans matches the maxlength and the pattern of the input field."*

The container's width comes from `:has(> span:nth-child(n))` **[verified]**, so the boxes decide the geometry while `maxlength` decides how many characters can be typed. Get them out of step and the failure is silent and asymmetric:

- **more spans than `maxlength`** → trailing empty boxes that can never be filled;
- **fewer spans than `maxlength`** → typed characters land outside the last box, on transparent background.

The component cannot check this at build time without parsing slot content. It goes in the JSDoc as the **first** line, and `MismatchedLength` (§5) shows it once.

**Cap: eight boxes.** There are `nth-child` rules for 1–8 only **[verified]**; a ninth span gets no `left` offset, so it stacks on top of the first. Same family of silent cap as `plans/components/fab.md` §3d, `plans/components/hover-gallery.md` §3b and `plans/components/megamenu.md` §3b.

### 3b. Generating the boxes was considered and rejected

A `length={4}` prop that renders four `<span>`s and nothing else would remove the §3a footgun entirely, and it is tempting.

It is out for one concrete reason: **the `<input>` is also a direct child**, and it carries `name`, `pattern`, `maxlength`, `value`, validation attributes and possibly a framework binding. A `length` prop would either have to render the input too — re-exposing a dozen input props through the wrapper — or leave the caller to supply an input whose `maxlength` still has to match a number they passed elsewhere, which is the same footgun with an extra prop.

Recorded as a deliberate rejection, with the condition to revisit: if a `TextInput`-style set of input props is ever worth re-exporting, `length` becomes coherent. Until then the caller writes both halves together, where the mismatch is at least visible in one place.

### 3c. The caret is hidden and the input is untouchable

Two rules that look like bugs **[both verified]**:

- `.otp > input { pointer-events: none }` — the input cannot be clicked directly. The `<label>` root is what delivers focus (§0), and it is the reason the root element matters.
- `.otp > input:valid { caret-color: #0000 }` — once the field satisfies its `pattern`, the caret disappears, because a caret parked after the last character would sit outside the boxes. While the value is incomplete the caret is visible and tracks the active box.

Neither is exposed. Both belong in the JSDoc, because "I can't click it" and "the cursor vanished" are the two things a caller will report.

Focus is drawn on the **boxes**, not the input: `.otp:has(input:valid:focus) > span { outline: 2px solid var(--input-color) }` **[verified]**, with a 20 ms per-box stagger on the border transition **[verified]**.

### 3d. `direction: ltr` is forced, and the font is monospace

`direction: ltr` and `font-family: var(--font-mono)` on the container **[verified]** — a code stays left-to-right inside an RTL page, and the monospace font plus `font-variant-numeric: tabular-nums` is what makes the fixed `--stride` line up.

There is also an `@supports (font: -apple-system-body)` branch that changes `--otp-ch` from `1ch` to `.618164em`, and per-engine `left` nudges for the first span under `-moz-appearance` **[verified]** — daisyUI is compensating for font-metric differences. Nothing to expose; worth knowing that **overriding the font family will break the alignment**, which is the one caller class to warn against.

`field-sizing: content` on the input **[verified]** is recent CSS; §3e.1.

### 3e. Unverified assumptions

1. **`field-sizing: content` and `:has()` support.** The width ladder is `:has()` and the input relies on `field-sizing` **[verified]**. Without `:has()` the container has no width at all; without `field-sizing` the input's intrinsic width may not track. Check first — a collapsed or misaligned OTP has one of these two causes.
2. **Do slot children land as direct children of `.otp`?** Blocking. Every rule is `> span` / `> input` with `:nth-child` offsets **[verified]**, so a wrapper collapses all boxes onto the first position. Twenty-second plan touching the shared question in `plans/components/aura.md` §3e.1.
3. **Boolean/validation attributes through the story `args` pipeline** — shared with `plans/components/checkbox.md` §3f.1; `required` and `pattern` matter here.

**Scaffold audit note:** `plans/components/file-input.md` §0 flagged Radio, Range, Text Input and OTP for the missing-`type` bug. OTP's scaffold has a **different** bug — the wrong root element — so the audit stands for the other three and this one is now resolved.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A one-time-code field: one real `<input>` stretched behind N empty `<span>`
 * boxes, aligned by letter-spacing (plan §0).
 *
 * **The number of spans must equal the input's `maxlength`** — nothing
 * enforces it, and a mismatch silently leaves unreachable boxes or characters
 * outside them (plan §3a). Maximum eight.
 *
 * ```astro
 * <Otp>
 *   <span></span><span></span><span></span><span></span>
 *   <input type="text" autocomplete="one-time-code" inputmode="numeric"
 *          maxlength="4" pattern="[0-9]{4}" required />
 * </Otp>
 * ```
 *
 * The root is a `<label>` because the input is `pointer-events: none` — that
 * is what makes clicking a box focus the field (plan §3c). The caret hides
 * once the value is valid, by design.
 *
 * Don't override the font family: the box alignment depends on the monospace
 * metrics (plan §3d).
 */
interface Props extends HTMLAttributes<'label'> {
  color?: DaisyColor;
  size?: DaisySize;
  /** Connects the boxes into one continuous field. */
  joined?: boolean;
}

// Full literal class names. NEVER `otp-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'otp-primary', secondary: 'otp-secondary', accent: 'otp-accent',
  neutral: 'otp-neutral', info: 'otp-info', success: 'otp-success',
  warning: 'otp-warning', error: 'otp-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'otp-xs', sm: 'otp-sm', md: 'otp-md', lg: 'otp-lg', xl: 'otp-xl',
};

const { color, size, joined = false, class: className, ...rest } = Astro.props;
---

<!-- `<label>`, not `<div>`: the input is pointer-events:none (plan §0). -->
<label
  class:list={['otp', color && COLOR[color], size && SIZE[size], { 'otp-joined': joined }, className]}
  {...rest}
>
  <slot />
</label>
```

No `<script>`: the boxes, the focus ring, the caret and the RTL handling are all CSS (§3c, §3d). Not polymorphic — the `<label>` root is load-bearing.

### Astro idioms gate

- [ ] **Root is `<label>`**, not the scaffold's `div` (§0).
- [ ] Content arrives via a plain default slot — no `length` prop, no input props (§2, §3b).
- [ ] `<slot />` has no wrapper — every rule is `> span` / `> input` (§3e.2).
- [ ] No `Astro.slots.has()` gating.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root.
- [ ] No `as` prop (§4).
- [ ] `color` uses `DaisyColor` and `size` uses `DaisySize`, both imported; neither collides on a `<label>`.
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] Probe (§5c):
  ```astro
  <Otp><span></span><span></span><input type="text" maxlength="2" /></Otp>
  <Otp color="primary" size="lg" joined id="x" data-test="y">ok</Otp>
  <Otp length={4}>must error — boxes are slot content (§3b)</Otp>
  <Otp variant="ghost">must error — only `joined` exists (§1)</Otp>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default` (4 digits), `SixDigits`, `Joined`, `Sizes` (five), `Colors` (eight).

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`MismatchedLength`** — five spans with `maxlength="4"` beside a matched pair, making §3a's failure visible.
- **`NineBoxes`** — nine spans, the ninth stacking on the first (§3a's cap).
- **`ClickToFocus`** — a comment plus one OTP; clicking any box must focus the field, which is what the `<label>` root buys (§0). This is the story that fails if the scaffold's `div` survives.

## 6. Steps

- [ ] **Step 1:** Check §3e.1 (`:has()` and `field-sizing`) — a collapsed OTP has one of those two causes, not a component fault. Resolve §3e.2 (direct children) — blocking.
- [ ] **Step 2:** No new shared unions — `DaisyColor`/`DaisySize` reused unchanged. `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, **changing the root from `div` to `label`** (§0), then walk the gate.
- [ ] **Step 4:** Replace `Otp.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` shows four separate boxes; **clicking any box focuses the field** (§0); typing fills the boxes left to right with each character centred; the caret disappears once four digits are entered (§3c); the focus ring lands on the boxes with a visible stagger; `Joined` connects them; `Sizes` and `Colors` differ across five and eight; `MismatchedLength` and `NineBoxes` misbehave as documented; RTL leaves the code left-to-right (§3d).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<label class="otp[^"]*"[^>]*><span></span>' storybook-static/astro-prerendered-stories.json | head
  ```
  A `<div class="otp"` hit means §0 was not fixed.
- [ ] **Step 7:** Update the `OTP` row in `plans/README.md` to **Implemented**. Note in `plans/components/file-input.md` §0's audit list that OTP is resolved (its bug was the root element, not `type`).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 15 daisyUI classes reachable: base, `joined`, 5 sizes, 8 colours.
- [ ] **Root is `<label>`** and clicking a box focuses the input (§0) — verified in the browser and in the build output.
- [ ] Slot children render as direct children (§3e.2).
- [ ] No invented axis — no `length` prop (§3b), no input props (§2).
- [ ] JSDoc leads with the span-count/`maxlength` rule (§3a), and covers the eight-box cap, the `<label>` root, the hidden caret (§3c) and the font-family warning (§3d).
- [ ] `plans/components/file-input.md` §0's scaffold audit is updated (§3e).
- [ ] One story per doc-page example, plus `MismatchedLength`, `NineBoxes` and `ClickToFocus`.
- [ ] Every box in §4's gate ticked.
