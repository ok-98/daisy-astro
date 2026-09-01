# Textarea Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/textarea/
**Root element:** `textarea`
**Target file:** `packages/daisy-astro/src/components/Textarea/Textarea.astro`
**Story file:** `packages/daisy-astro/src/components/Textarea/Textarea.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'textarea'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions (`DaisyColor`, `DaisySize`) come from `packages/daisy-astro/src/lib/variants.ts` — import as `../../lib/variants`.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).


> **Status:** **Implemented** (2026-09-01), fifth of the Stage 4 cluster. `Textarea.astro` and 9 stories. **§0a's whitespace bug was real** — the scaffold shipped it — and is fixed and asserted: 19 of 20 rendered textareas have zero characters between their tags (§8). §2's slot probe was run and **settles the shared slot-wrapping question in the one place a wrapper could not hide**; recorded in `plans/components/aura.md` §3e.1. No corrections to §0. Step 5 (visual pass) is open.
---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/textarea.css` and the doc page's `classnames` frontmatter. Both agree on **fifteen** classes:

```
.textarea
.textarea-ghost
.textarea-neutral .textarea-primary .textarea-secondary .textarea-accent
.textarea-info .textarea-success .textarea-warning .textarea-error
.textarea-xs .textarea-sm .textarea-md .textarea-lg .textarea-xl
```

Three clean axes — colour (8, exactly `DaisyColor`), size (5, exactly `DaisySize`), and one boolean style (`ghost`). No part classes, no `textarea-bordered` (that was daisyUI 4; it is gone).

### 0a. The scaffold has a whitespace bug that silently kills `placeholder`

```astro
<textarea class:list={['textarea', className]} {...rest}>
  <slot />
</textarea>
```

`<textarea>` is a raw-text element: **everything between the tags is its value**, including the newlines and indentation. The HTML parser drops one leading newline and nothing else, so this scaffold renders a textarea whose initial value is roughly `"  \n"` — two spaces. A non-empty value means the browser never shows `placeholder`, and a form submits whitespace instead of an empty string.

Every single one of the doc page's six examples writes `<textarea class="textarea" placeholder="Bio"></textarea>` — empty, with the placeholder carrying the visible text. The bug is therefore on the exact path every documented use takes.

Fix: no whitespace between the tags.

```astro
<textarea ...><slot /></textarea>
```

This is the sixth scaffold defect found in this batch, after the missing-`type` group (Checkbox, File Input, Radio, Range — audit opened in `file-input.md` §0, closed in `range.md`), OTP's wrong root element (`otp.md` §0), and the wrong class level on Stat and Tab. It is a different failure mode from all of them — the markup is structurally correct and only the *formatting* is wrong — so add it to the audit list: **any component whose root is a raw-text element must be written with no whitespace around `<slot />`.** In this library that is `<textarea>` and nothing else (`<title>`, `<script>`, `<style>` are not components here). No further sweep needed.

### 0b. Textarea ships in the utilities layer — responsive variants, same as Table

`textarea.css` opens with `@layer utilities{@layer daisyui.l1.l2.l3{.textarea{…`, and the file contains `.sm\:textarea`, `.md\:textarea-primary`, `.lg\:textarea-xl`, … at all five breakpoints. Same finding as `table.md` §0a and the same conclusion: the `color`/`size`/`ghost` props set the **base** value; responsive overrides are caller classes (`class="textarea-sm lg:textarea-lg"`). An object-valued prop would have to interpolate class names, which §1b forbids.

### 0c. Size changes the font size only — not the height, not the padding

```css
.textarea    { min-height:5rem; padding-block:.5rem; padding-inline:.75rem;
               font-size:max(var(--font-size,0rem), var(--font-size-min,.875rem)) }
.textarea-xs { --font-size-min:.6875rem }
.textarea-sm { --font-size-min:.75rem }
.textarea-md { --font-size-min:.875rem }
.textarea-lg { --font-size-min:1.125rem }
.textarea-xl { --font-size-min:1.375rem }
```

That is the **entire** definition of the five size classes. Padding and `min-height` are fixed on `.textarea`. This differs from every other sized daisyUI component planned so far (Button, Badge, Table, Input all rescale padding), so a size story that only checks "do these look different" will barely register a change — check the computed `font-size`, not the box.

Height is a caller class: the doc's fieldset example writes `<textarea class="textarea h-24">`. Do **not** add a `rows` convenience prop — `rows` is already on `TextareaHTMLAttributes` and flows through `...rest` for free.

### 0d. `--font-size` vs `--font-size-min`, and the iOS zoom guard

`font-size: max(var(--font-size,0rem), var(--font-size-min,.875rem))` exists so this rule can win:

```css
@media (pointer:coarse){ @supports (-webkit-touch-callout:none){
  .textarea:focus,.textarea:focus-within{ --font-size:1rem } } }
```

On iOS Safari, a focused input under 16px triggers an automatic page zoom. daisyUI raises the font to 1rem on focus for coarse pointers only. So **the focused size of `textarea-xs` is deliberately not `textarea-xs`'s size on a touch device.** Don't file that as a bug during story review, and don't override `--font-size` from the component.

### 0e. `.floating-label` integration is real and depends on the size class

```css
.floating-label:has(.textarea-xs){ --top-mul:3; --font-size:.6875rem }
… one per size, up to --top-mul:7 for xl
```

A caller wrapping `<Textarea size="sm" />` in daisyUI's `floating-label` gets correct label positioning **only because the size class lands on the textarea itself**. This is the standing rule again — "the prop belongs on whichever component's root daisyUI writes the class on" (carousel `snap`, chat `color`, dock `active`, indicator placement, steps `color`, tab `active`) — and it is satisfied here for free. Cross-reference from `label.md`: the floating-label wrapper is Label's business, not Textarea's; Textarea's only obligation is to keep the size class on the root, which it does.

### 0f. `.textarea` also works as a *wrapper* class — undocumented, not built

```css
.textarea textarea { appearance:none; background:#0000; border:none; … }
.textarea:has(>textarea[disabled]) { … }
.textarea:has(>textarea[disabled])>textarea[disabled]{ cursor:not-allowed }
```

These rules only fire when `.textarea` is on an element that *contains* a `<textarea>` — i.e. daisyUI supports `<div class="textarea"><textarea></textarea><button/></div>` for a textarea with adornments, the same dual pattern Input has.

**Not in the frontmatter, not in any example.** Same treatment as `row-hover` in `table.md` §0b: record it, build nothing. A caller who wants adornments writes the wrapper by hand and puts a bare `<textarea>` inside. Revisit only if the doc page starts showing it.

### 0g. `value` is a lie on `<textarea>`

`TextareaHTMLAttributes` declares `value?: string | string[] | number` (`astro-jsx.d.ts` — the Textarea interface sits immediately after `TableHTMLAttributes` at `:962`). HTML has no `value` **attribute** on `<textarea>`; the initial value is the element's text content. A caller passing `value="hello"` gets `<textarea value="hello">` — an inert attribute and an empty textarea.

Nothing to enforce in the component (the type comes from Astro, not from us), but the initial value belongs in the default slot, and that is exactly why §0a's whitespace fix matters. Say so in the component's doc comment.

### 0h. Attribute collisions

- `color` — shadows the obsolete non-standard `color` attribute on base `HTMLAttributes` (`astro-jsx.d.ts:602`), the same tradeoff Button and Badge already accepted. Keep the name.
- `size` — **not** present on `TextareaHTMLAttributes` (verified: `cols`, `rows`, `wrap`, `maxlength`, `minlength`, `dirname`, `autocomplete`, `autocorrect`, `form`, `name`, `placeholder`, `readonly`, `required`, `disabled`, `value`). No collision, unlike Input where `size` is native and `select.md` had to note the forwarding tradeoff.
- `ghost` — free.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Color | `textarea-neutral` `textarea-primary` `textarea-secondary` `textarea-accent` `textarea-info` `textarea-success` `textarea-warning` `textarea-error` | `color` | `DaisyColor` | Shared union, exact 8-value match. Sets `--input-color`, which drives border, inset shadow and focus outline. |
| Size | `textarea-xs` `textarea-sm` `textarea-md` `textarea-lg` `textarea-xl` | `size` | `DaisySize` | `textarea-md` is the default — leave undefined for it. Font size only (§0c). |
| Style | `textarea-ghost` | `ghost` | `boolean` | Removes background, border and shadow until focus. |

Not built: responsive variants (§0b, caller classes), the wrapper pattern (§0f).

## 2. Slots

Single default slot, no gating needed — it is the textarea's **initial value**, not decoration.

Two hard constraints:
1. **No whitespace around `<slot />`** (§0a).
2. No named slots. `<textarea>` is a raw-text element; any element placed inside it is serialized as literal text, so a named slot could never render markup.

The shared slot-wrapping unknown (`aura.md` §3e.1, now ~30 plans) is *moot* here: even if Astro wrapped slot content in an element, the parser would flatten it to text. If the probe in §6 Step 3 shows a wrapper element's tags appearing as visible `&lt;span&gt;` text inside the box, that is the answer to the shared question — record it there, it settles the question for every other plan.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

interface Props extends HTMLAttributes<'textarea'> {
  /** Border / focus-outline colour. */
  color?: DaisyColor;
  /** Base size. Font size only — not height or padding. Responsive sizes are
   *  caller classes: class="textarea-sm lg:textarea-lg" */
  size?: DaisySize;
  /** No background, border or shadow until focused. */
  ghost?: boolean;
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'textarea'> {
  color?: DaisyColor;
  size?: DaisySize;
  ghost?: boolean;
}

// Full literal class names. NEVER `textarea-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  neutral: 'textarea-neutral',
  primary: 'textarea-primary',
  secondary: 'textarea-secondary',
  accent: 'textarea-accent',
  info: 'textarea-info',
  success: 'textarea-success',
  warning: 'textarea-warning',
  error: 'textarea-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'textarea-xs',
  sm: 'textarea-sm',
  md: 'textarea-md',
  lg: 'textarea-lg',
  xl: 'textarea-xl',
};

const { color, size, ghost, class: className, ...rest } = Astro.props;
---
{/* <textarea> is a raw-text element: whitespace between these tags becomes the
    field's value and suppresses `placeholder`. Keep the slot tight. Height is a
    caller class (h-24); the initial value is the slot, never a `value` attr. */}
<textarea
  class:list={[
    'textarea',
    color && COLOR[color],
    size && SIZE[size],
    { 'textarea-ghost': ghost },
    className,
  ]}
  {...rest}
><slot /></textarea>
```

### Astro idioms gate

- [ ] Content arrives via the slot, not a `value` content prop (§0g).
- [ ] **No whitespace between `<textarea …>` and `<slot />` and `</textarea>`** (§0a) — the one gate item unique to this component.
- [ ] No optional styled wrappers — nothing to gate.
- [ ] Root element is `<textarea>`, matching every doc example. Not the `<div>` wrapper form (§0f).
- [ ] No `<script>` — focus styling, disabled styling and the iOS zoom guard are all CSS.
- [ ] `...rest` spread onto `<textarea>`, so `placeholder`, `rows`, `disabled`, `required`, `name`, `readonly`, `maxlength` need no declared props.
- [ ] Not polymorphic: the frontmatter says "For `<textarea>` element".
- [ ] `color` shadows only the obsolete `color` attribute (`astro-jsx.d.ts:602`); `size` and `ghost` are free (§0h).
- [ ] **Every variant class is a full literal in a `Record` map / object key.**
- [ ] Not generic, so §5c's `type Props`-before-`const` rule is advisory — keep the order anyway.
- [ ] Prop typing verified with a throwaway probe: `<Textarea color="primary" size="xl" ghost placeholder="Bio" />` must pass and `<Textarea color="danger" />` must error.
- [ ] `astro check` passes.

## 5. Storybook stories

| Doc-page example | Story name | Slots / props it needs |
|---|---|---|
| Textarea | `Default` | `placeholder="Bio"`, no slot content |
| Ghost (no background) | `Ghost` | `ghost`, `placeholder="Bio"` |
| With form control and labels | `WithFieldset` | Compose the real `Fieldset` + `Label`; `class="h-24"` on the textarea |
| Textarea colors | `Colors` | all 8 values, `placeholder` naming each |
| Sizes | `Sizes` | all 5 values |
| Disabled | `Disabled` | `disabled`, `placeholder="Bio"` |

Plus `Playground` with all three controls.

`WithFieldset` composes existing components rather than hand-writing `fieldset`/`label` markup — the fourth part-treatment from `chat-bubble.md` §0a, and it doubles as an integration check against `fieldset.md` and `label.md`.

Two story-specific notes:

- **Slot content is not the normal case here.** Five of the six doc examples pass no slot at all; the text is `placeholder`. Write them that way. Add one extra story, `WithInitialValue`, whose slot is `Hello` — it is the only story that can catch a regression of §0a's whitespace bug, and its acceptance criterion is that the rendered value is exactly `Hello` with no surrounding spaces.
- **`Sizes` needs a real assertion.** Per §0c the boxes are the same height and padding at every size; only the font changes. Note in the story description that the check is computed `font-size` (.6875 → 1.375rem), not visual box size, and that on a touch-pointer device the focused size will read 1rem regardless (§0d).

```ts
import Textarea from './Textarea.astro';

export default {
  title: 'Components/Textarea',
  component: Textarea,
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    ghost: { control: 'boolean' },
  },
};

export const Playground = {
  args: { placeholder: 'Bio' },
};

export const Ghost = {
  args: { ghost: true, placeholder: 'Bio' },
};

export const Disabled = {
  args: { disabled: true, placeholder: 'Bio' },
};

// Regression guard for the raw-text whitespace bug (§0a): value must be
// exactly "Hello", and Default's placeholder must be visible.
export const WithInitialValue = {
  args: { slots: { default: 'Hello' } },
};

// …one export per row of the table above.
```

## 6. Steps

- [x] **Step 1: nothing to re-derive.** Fifteen classes, three axes, agreed by the CSS and the frontmatter.
- [x] **Step 2: skipped as planned.** `DaisyColor` and `DaisySize` match exactly; `variants.ts` untouched.
- [x] **Step 3: done, and both probes were run.**
  - `<Textarea placeholder="Bio" />` renders `<textarea class="textarea" placeholder="Bio"></textarea>` — **zero characters between the tags.** The scaffold really did have §0a's bug; the fix is asserted rather than assumed.
  - `<Textarea><span>x</span></Textarea>` renders `<textarea class="textarea"><span>x</span></textarea>`. **No wrapper is inserted**, which is what §2 predicted would settle the shared question — recorded in `plans/components/aura.md` §3e.1.

  The type probe errors on `color="danger"` and `size="huge"` and accepts `rows`, `maxlength`, `required` and `name` through the spread.
- [x] **Step 4: done.** `Textarea.stories.ts`, 9 stories — 6 doc-page examples plus `Playground`, `Passthrough` and `WithInitialValue`, the §0a guard.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and, for one story, devtools.** Verify: `Default` **shows its placeholder** (if it does not, §0a has regressed); `Colors` shows 8 distinct borders that intensify on focus; **`Sizes` looks almost unchanged** and the real check is computed `font-size`, .6875rem to 1.375rem, not the box (§0c) — and on a touch-pointer device a focused field reads 1rem whatever its size (§0d); `Ghost` is borderless until focused; `Disabled` is greyed with `cursor: not-allowed`.
- [x] **Step 6: done — forwarding confirmed, including textarea-specific attributes.** `Passthrough` renders `<textarea class="textarea textarea-success textarea-lg textarea-ghost mine h-24" id="textarea-1" data-test="yes" style="letter-spacing:1px" name="bio" rows="4" maxlength="200" required placeholder="Passthrough">`, where `rows` and `maxlength` prove the right attribute interface is inherited rather than just the base one. Full output in §8.
- [x] **Step 7: done — the `Textarea` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All three documented axes have typed props; the undocumented wrapper form (§0f) and responsive variants (§0b) are recorded as caller-side, not silently dropped.
- [x] `Props` extends `HTMLAttributes<'textarea'>`.
- [x] `class` from a caller merges through `class:list`.
- [x] **Rendered output has no whitespace inside `<textarea>`** — verified in the built HTML, not by eye (§0a).
- [x] `Playground` exposes all three props as controls.
- [x] `Colors` and `Sizes` render every value of their axis.
- [x] Six stories, one per doc-page example, plus `WithInitialValue` as the §0a regression guard.
- [x] `WithFieldset` composes the real `Fieldset`/`Label` components.
- [x] The slot-wrapping probe result recorded in `aura.md` §3e.1 (§2).
- [x] Every box in section 4's Astro idioms gate ticked, including the whitespace item.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 203 files, 0 errors, 0 warnings, 0 hints.

```
Default          → <textarea class="textarea" placeholder="Bio"></textarea>
                                                                   ↑ nothing between the tags
WithInitialValue → <textarea class="textarea" placeholder="Bio (should not show)">Hello</textarea>
slot probe       → <textarea class="textarea"><span>x</span></textarea>   (temporary, removed)
Passthrough      → <textarea class="textarea textarea-success textarea-lg textarea-ghost mine h-24"
                     id="textarea-1" data-test="yes" style="letter-spacing:1px" name="bio" rows="4"
                     maxlength="200" required placeholder="Passthrough"></textarea>
```

Counts across the 9 stories:

```
textarea roots 20 → 19 have ZERO characters between their tags
                    the 20th is WithInitialValue, whose value is exactly `Hello`
whitespace-only values: none
colours: all 8 | sizes: all 5 | ghost 2
```

What this settles:

- **§0a was a real bug and is now guarded.** The scaffold wrote `<slot />` on its own indented line, which on a raw-text element makes the field's value a couple of spaces — enough to suppress `placeholder` on the exact path all six doc examples take, and to submit whitespace instead of an empty string. 19 of 20 rendered textareas are now byte-empty, and the one that is not contains exactly what it was given.
- **The shared slot-wrapping question, settled where it could not hide.** Everywhere else a wrapper would be invisible structure that a `:nth-child` rule quietly stops matching. Here it would be **literal visible text inside the box**. Nothing was added. Recorded in `plans/components/aura.md` §3e.1.
- **§0g's warning is not theoretical**: the initial value is the slot, and `Passthrough` shows that `value` was never needed — `rows`, `maxlength`, `required` and `name` all arrive through the spread.
- All 15 classes are reachable: 8 colours, 5 sizes, ghost, base.

Not settled here: the focus colours, the font-size ladder, and the ghost and disabled states. All Step 5, and `Sizes` needs devtools rather than eyes (§0c).
