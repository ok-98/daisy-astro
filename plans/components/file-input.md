# File Input Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/file-input/
**Root element:** `input` (void — no slot)
**Target file:** `packages/daisy-astro/src/components/FileInput/FileInput.astro` (currently a scaffold with the same missing-`type` bug as Checkbox — §0)
**Story file:** `packages/daisy-astro/src/components/FileInput/FileInput.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'input'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/fileinput.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. The scaffold renders a text input

```astro
<input class:list={['file-input', className]} {...rest} />
```

No `type`. An `<input>` with no `type` is `type="text"` per spec, so the scaffold produces a **text field wearing file-input styling** — and unlike Checkbox, the failure is louder here, because `::file-selector-button` never renders and the control simply has no "Choose file" button.

This is the **second** component to ship with this exact bug (`plans/components/checkbox.md` §0). Both scaffolds were generated from the same template, so **Radio, Range, Text Input and OTP should be checked for it too** when their plans are written — noted here so the pattern is caught once rather than five times.

Fix is the same: destructure `type` with a default (§3a).

### 0a. Audit log — closed, reopened, and closed again

The list above was drawn from *components named after an input type*, and on that basis the audit closed at Text Input (`plans/components/text-input.md` §0i), which turned out clean because `<input>` already defaults to `type="text"`.

**That criterion was wrong.** `plans/components/theme-controller.md` §0b found a sixth instance the list could never have contained: `theme-controller` names a *behaviour*, not a type, yet its CSS depends on the type more strictly than any of them — the theme selector is `input.theme-controller[value=x]:checked`, and only a checkbox or radio can be `:checked`.

Corrected criterion:

> **every component whose CSS matches on `:checked`, `:indeterminate`, or an `[type=…]` attribute.**

It proved itself one plan later: `plans/components/toggle.md` §0a found Toggle under it, where the size classes literally select `.toggle-xs[type=checkbox]`, so without the attribute every size class silently no-ops while the base pill still renders.

Full log:

| Component | Plan | Outcome |
|---|---|---|
| Checkbox | `checkbox.md` §0 | bug — missing `type="checkbox"` |
| File Input | this plan | bug — missing `type="file"` |
| Radio | `radio.md` §3c | bug — **fixed in code 2026-08-30**, asserted: 45/45 rendered radios carry `type` |
| Range | `range.md` | bug; closed the original list — **fixed in code 2026-08-30**, asserted: 29/29 rendered sliders carry `type` |
| OTP | `otp.md` §0 | different defect — wrong root element (`div` → `label`); **fixed in code 2026-08-30**, asserted: 23 label roots, 0 div roots |
| Text Input | `text-input.md` §0i | **clean** — `type="text"` is the spec default |
| Theme Controller | `theme-controller.md` §0b | bug — reopened the audit, corrected the criterion |
| Toggle | `toggle.md` §0a | bug — found *by* the corrected criterion |

Under the corrected criterion the list is now complete: no other component's CSS matches on `:checked`, `:indeterminate` or `[type=…]`. Any new component that does must be checked before its plan is written.

## 1. Variant audit

**15 classes: 1 base + 1 style + 8 colour + 5 size**, matching the doc page's frontmatter. `grep -oE '\.file-input[a-z0-9-]*' fileinput.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `file-input` | — | — | Always applied. |
| Style | `file-input-ghost` | `ghost` | `boolean` | **One class, so a boolean** — not a `variant` union, unlike Badge and Button. Same call as `card-side` (`plans/components/card.md` §1) and `drawer-end`. |
| Colour | `file-input-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. Each sets `--input-color` **[verified]**. |
| Size | `file-input-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Each sets `--size`. `md` is the default and still emittable. **Collides with the native `size` attribute** — §3b. |

**No disabled class** — `disabled` is the native attribute, styled directly **[verified]**; no branching, the same as `plans/components/checkbox.md` §3d.

## 2. Slots

**None.** `<input>` is void. Third component in the library with no slot, after Checkbox and Countdown's `CountdownValue`.

The "Choose file" button is `::file-selector-button` — a **pseudo-element**, not markup (§3c) — so there is nothing to slot into it. The label and helper text are siblings inside a `Fieldset` (`plans/components/fieldset.md`), not children.

## 3. Five things the naive implementation gets wrong

### 3a. `type="file"` must be emitted

`type` is declared on `InputHTMLAttributes` **[verified in `astro-jsx.d.ts`]**, so it arrives inside `...rest` and the component never sees it unless it destructures it. Fix with a default, the mechanism `plans/components/alert.md` §3b established for `role`:

```ts
const { type = 'file', … , ...rest } = Astro.props;
```

Left overridable rather than hardcoded — silently ignoring a caller's `type` would be worse than letting them be deliberately wrong — but the JSDoc points at Text Input and Checkbox for other types.

### 3b. `size` collides with the native attribute — the Checkbox precedent applies

`size?: number | string` is on `InputHTMLAttributes` **[verified]**, so the variant prop shadows it. Per the HTML spec `size` applies only to `text`, `search`, `tel`, `url`, `email` and `password` inputs, so browsers ignore it on `type="file"` and nothing real is lost.

Keep the name, for the same reasons as `plans/components/checkbox.md` §3b: it is the natural name and renaming would make this component the odd one out. **The forward note stands: Text Input is where this collision actually costs something**, and `plans/components/text-input.md` must decide deliberately rather than inherit this answer.

### 3c. The "Choose file" button is a pseudo-element styled like a Button

```css
.file-input::file-selector-button {
  height: calc(100% + var(--border) * 2); margin-inline-end: 1rem; margin-block: calc(var(--border) * -1);
  --btn-bg: var(--btn-color, var(--color-base-200)); --btn-fg: var(--color-base-content);
  border-color: var(--btn-border); background-color: var(--btn-bg); box-shadow: …
}
```

**[verified]** — daisyUI reuses Button's own custom properties to make the browser's built-in button match `btn`. Consequences worth a JSDoc line each:

- **There is no element to target.** No icon slot, no custom label text, no per-instance styling beyond CSS. The button's *text* ("Choose file", "Browse…") is browser- and locale-controlled and cannot be changed from markup at all.
- **A caller who needs a custom trigger** builds the usual `<label>`-wrapping-a-hidden-input pattern themselves; daisyUI's File Input is deliberately the plain native control.
- The button colour follows `--btn-color`, so `style="--btn-color: …"` is a supported override that no prop exposes — the same seam `plans/components/checkbox.md` §3e noted for `--input-color`.

### 3d. It has an intrinsic width and join support

`width: clamp(3rem, 20rem, 100%)` **[verified]** — so a File Input is ~20rem wide by default, not full-width, and shrinks only below that. `w-full` is the caller's if they want it; the doc's Sizes example uses a flex column to keep them centred.

The corner radii are written as `var(--join-ss, var(--radius-field))` and friends **[verified]**, which is daisyUI's join protocol: a File Input inside a `join` squares off the right edges automatically. So it composes with the Join component with **no prop and no `join` boolean** — unlike `plans/components/accordion.md` §3c, where the item needed one. Worth one JSDoc line and a story.

### 3e. Unverified assumptions

1. **`::file-selector-button` cross-browser.** The standard pseudo-element replaced `::-webkit-file-upload-button`; daisyUI targets only the standard one **[verified]**. Confirm the button is styled in the Storybook browser rather than falling back to the OS default — a plain grey button is the symptom.
2. **Boolean/file attributes through the story `args` pipeline.** Shared with `plans/components/checkbox.md` §3f.1; `disabled` and `multiple` are the ones exercised here.
3. **Cross-component composition.** The "with fieldset and label" example needs `fieldset`/`legend`/`label` markup that this library does not wrap yet — raw HTML in the story until those plans land, noted in a comment.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * The native file picker. The "Choose file" button is
 * `::file-selector-button` — a pseudo-element — so its text is
 * browser-controlled and there is nothing to slot into it (plan §3c).
 *
 * ~20rem wide by default; pass `class="w-full"` if you want it to fill
 * (plan §3d). Inside a `join` it squares its edges automatically, with no prop.
 */
interface Props extends HTMLAttributes<'input'> {
  color?: DaisyColor;
  /**
   * Shadows the native `size` attribute, which browsers ignore on
   * `type="file"` (plan §3b). Sets daisyUI's control height.
   */
  size?: DaisySize;
  /** daisyUI's only style modifier for this component (plan §1). */
  ghost?: boolean;
}

// Full literal class names. NEVER `file-input-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'file-input-primary', secondary: 'file-input-secondary',
  accent: 'file-input-accent', neutral: 'file-input-neutral',
  info: 'file-input-info', success: 'file-input-success',
  warning: 'file-input-warning', error: 'file-input-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'file-input-xs', sm: 'file-input-sm', md: 'file-input-md',
  lg: 'file-input-lg', xl: 'file-input-xl',
};

// `type` is on InputHTMLAttributes and would otherwise stay in `...rest`,
// leaving an untyped input styled as a file picker (plan §0, §3a).
const { type = 'file', color, size, ghost = false, class: className, ...rest } = Astro.props;
---

<!--
  Void element: no slot. `disabled`, `multiple`, `accept`, `name` and `required`
  all pass through untouched — daisyUI styles the native states (plan §1).
-->
<input
  type={type}
  class:list={[
    'file-input',
    color && COLOR[color],
    size && SIZE[size],
    { 'file-input-ghost': ghost },
    className,
  ]}
  {...rest}
/>
```

No `<script>`: pure CSS. Not polymorphic — daisyUI documents `file-input` on `<input>` only.

### Astro idioms gate

- [ ] **`type="file"` is emitted** via a destructured default (§0, §3a).
- [ ] **No `<slot />`** — `<input>` is void (§2).
- [ ] No `Astro.slots.has()` gating — there are no slots.
- [ ] No `<script>` added; no `disabled` branching (§1).
- [ ] `...rest` spread onto the root, so `accept`, `multiple`, `name`, `required` and `disabled` work with no declarations.
- [ ] `size`'s collision with the native attribute is a documented decision (§3b).
- [ ] `ghost` is a boolean, not a one-value union (§1).
- [ ] Every variant class is a literal in a `Record` map or object key — no `` `file-input-${color}` ``.
- [ ] Probe (§5c):
  ```astro
  <FileInput />
  <FileInput color="primary" size="lg" ghost accept="image/*" multiple name="files" />
  <FileInput disabled class="w-full" id="x" data-test="y" />
  <FileInput color="banana">must error — not a DaisyColor</FileInput>
  <FileInput size={40}>must error — size is DaisySize (§3b)</FileInput>
  <FileInput variant="outline">must error — only `ghost` exists (§1)</FileInput>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `Ghost`, `WithFieldsetAndLabel` (raw markup, §3e.3), `Sizes` (five), `Colors` (eight), `Disabled`.

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`InJoin`** — a File Input and a Button inside a `join`, showing §3d's automatic corner squaring.
- **`Multiple`** — `multiple accept="image/*"`, the two attributes callers actually reach for, proving they pass through.
- **`TypeIsSet`** — not a story; Step 6's grep asserts `type="file"`, because §0's failure is invisible in a screenshot.

## 6. Steps

- [ ] **Step 1:** Nothing to re-read. Check §3e.1 (`::file-selector-button` support) before judging any story's appearance.
- [ ] **Step 2:** No new shared unions — `DaisyColor`/`DaisySize` reused unchanged. `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the scaffold per §4, **fixing the missing `type`** (§0), then walk the gate. **Also open the Radio, Range, Text Input and OTP scaffolds and note whether they have the same bug** — record the answer in their plans.
- [ ] **Step 4:** Replace `FileInput.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` shows a **"Choose file" button** styled like a `btn` and opens a file dialog on click — a bare text field means §0; `Sizes` shows five heights with the button scaling too; `Colors` changes the border via `--input-color`; `Ghost` drops the border; `Disabled` is inert; `InJoin` has square inner corners (§3d).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoc 'type="file"' storybook-static/astro-prerendered-stories.json
  ```
  Every rendered file input must carry it (§0).
- [ ] **Step 7:** Update the `File Input` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 15 daisyUI classes reachable: base, `ghost`, 8 colours, 5 sizes.
- [ ] **`type="file"` present in every rendered story** (§0) — asserted in the build output.
- [ ] `color` uses `DaisyColor` and `size` uses `DaisySize`, imported, neither redeclared.
- [ ] No slot, no wrapping label, no icon prop (§2, §3c).
- [ ] No invented axis — no `variant` union (§1), no `join` prop (§3d), no `disabled` branching.
- [ ] `size`'s native collision documented, and the Text Input forward note re-stated (§3b).
- [ ] JSDoc states: the button is a pseudo-element with browser-controlled text (§3c), the ~20rem intrinsic width (§3d), and free `join` composition (§3d).
- [ ] The scaffold audit for Radio / Range / Text Input / OTP is done and recorded (§0).
- [ ] One story per doc-page example, plus `InJoin` and `Multiple`.
- [ ] Every box in §4's gate ticked.
