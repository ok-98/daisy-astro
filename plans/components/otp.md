# OTP Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/otp/
**Root element:** `label` — **not** the `div` in the scaffold (§0)
**Target file:** `packages/daisy-astro/src/components/Otp/Otp.astro` (currently a dummy scaffold with the wrong root)
**Story file:** `packages/daisy-astro/src/components/Otp/Otp.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'label'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Otp.astro` and 10 stories are in the repo per §4/§5, with the scaffold's wrong root fixed and asserted: **23 label roots, 0 div roots**, and the first span is a direct child in all 23 (§8). Step 5 (visual pass) is open and carries §3e.1. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/otp.css` and the doc page source. §3e lists what is **unverified**.

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

1. **`field-sizing: content` and `:has()` support.** The width ladder is `:has()` and the input relies on `field-sizing` **[verified]**. Both **reach the built stylesheet** — `.otp:has(>span:first-child)` through `:nth-child(8)`, and `field-sizing:content` on the input **[verified 2026-08-30]** — so anything wrong at Step 5 is browser support, not a missing rule. Without `:has()` the container has no width at all; without `field-sizing` the input's intrinsic width may not track. A collapsed or misaligned OTP has one of these two causes, not a component fault.
2. ~~**Do slot children land as direct children of `.otp`?**~~ **Answered 2026-08-30: yes.** `<label class="otp…"><span></span>` matches in all 23 rendered OTPs — no wrapper between the root and the boxes, so the `> span` rules and their `:nth-child` offsets all apply. Consistent with the library-wide answer in `plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3; this was the failure where a wrapper would have collapsed every box onto the first position.
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

- [x] **Step 1: done at the markup and stylesheet level.** §3e.2 is answered — slot children are direct children in all 23 rendered OTPs. §3e.1's two rules are both present in the built CSS, so support is the only remaining variable and it moves to Step 5.
- [x] **Step 2: skipped as planned.** `DaisyColor`/`DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done — the scaffold's root is fixed.** `label`, not `div` (§0). Gate walked; the probe errored on all three intended lines. This bug was different in kind from the missing-`type` family, and the audit in `plans/components/file-input.md` §0a records it as such.
- [x] **Step 4: done.** `Otp.stories.ts`, 10 stories per §5. The stories derive `maxlength` and `pattern` from the same box count, so §3a's mismatch cannot be written by accident — `MismatchedLength` constructs it deliberately.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and most of this component is only observable there.** Verify: `Default` shows four separate boxes; **clicking any box focuses the field** (§0 — this is what the label root buys, and `ClickToFocus` is the story for it); typing fills the boxes left to right with each character centred over one; the caret disappears once four digits are entered (§3c); the focus ring lands on the boxes with a visible stagger; `Joined` connects them; `Sizes` and `Colors` differ across five and eight; `MismatchedLength` leaves an unreachable fifth box; `NineBoxes` stacks the ninth on the first; RTL leaves the code left-to-right (§3d).
- [x] **Step 6: done — forwarding confirmed and §0 asserted.** `Passthrough` renders `<label class="otp otp-accent otp-lg otp-joined mine" id="otp-1" data-test="yes" style="opacity:.9">`. Across every story: **23 label roots, 0 div roots.** Full output in §8.
- [x] **Step 7: done — the `OTP` row in `plans/README.md` says Implemented**, and `plans/components/file-input.md` §0a's audit log records OTP as resolved.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 15 daisyUI classes reachable: base, `joined`, 5 sizes, 8 colours.
- [x] **Root is `<label>`** — asserted in the build output (23 of 23). That clicking a box *focuses* the input follows from it, but is a runtime behaviour and stays for Step 5 (§0).
- [x] Slot children render as direct children (§3e.2).
- [x] No invented axis — no `length` prop (§3b), no input props (§2).
- [x] JSDoc leads with the span-count/`maxlength` rule (§3a), and covers the eight-box cap, the `<label>` root, the hidden caret (§3c) and the font-family warning (§3d).
- [x] `plans/components/file-input.md` §0's scaffold audit is updated (§3e).
- [x] One story per doc-page example, plus `MismatchedLength`, `NineBoxes` and `ClickToFocus`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default      → <label class="otp"><span></span><span></span><span></span><span></span>
               <input type="text" autocomplete="one-time-code" inputmode="numeric"
                      maxlength="4" pattern="[0-9]{4}" required /></label>
SixDigits    → six spans, maxlength="6", pattern="[0-9]{6}"
Joined       → <label class="otp otp-joined">…
Sizes        → otp-xs … otp-xl, four boxes each
Colors       → otp-neutral … otp-error, four boxes each
Mismatched…  → five spans against maxlength="4", beside a matched four
NineBoxes    → eight spans, then nine
Passthrough  → <label class="otp otp-accent otp-lg otp-joined mine" id="otp-1" data-test="yes"
                 style="opacity:.9">…
```

What this settles:

- **The scaffold's root bug is gone and cannot return unnoticed**: 23 label roots, **0** div roots across every story. With a div the component would still render correctly and simply refuse to focus when clicked — the quiet kind of failure.
- **§3e.2**: `<label class="otp…"><span></span>` matches all 23, so the boxes are direct children and every `> span:nth-child(n)` offset applies.
- The input's attributes pass through untouched as slot content — no input props were re-exposed through the wrapper (§2, §3b).
- `.otp:has(>span:first-child)` through `:nth-child(8)` and `field-sizing:content` are all in the built stylesheet, so §3e.1 reduces to browser support.
- All 15 classes have rules in the built stylesheet.

Not settled here, and it is most of the component: click-to-focus, the caret behaviour, the staggered focus ring, and whether the characters actually land inside the boxes. All Step 5.
