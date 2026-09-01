# Select Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/select/
**Root element:** `select`
**Target file:** `packages/daisy-astro/src/components/Select/Select.astro` (currently a dummy scaffold whose markup is already correct)
**Story file:** `packages/daisy-astro/src/components/Select/Select.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'select'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor` and `DaisySize` unchanged** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/select.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01), sixth of the Stage 4 cluster. `Select.astro` and 20 stories. §3's five findings all held; no corrections. §6 Step 7's cross-plan action turned out **already done**: `TextInput` shipped first and its `size` JSDoc already cites this plan's §3c (§3f). §3e.3's raw-markup fallback is discharged — the fieldset example composes the real components. Step 5 (visual pass) is open, and it carries §3e.1, the two dropdown-styling examples.
---

## 0. File Input's shape, on a real `<select>`

Same axes as File Input — 8 colours, 5 sizes, `ghost` as the only style **[verified]** — and the same `--input-color` and `--join-*` protocols. **`plans/components/file-input.md` is the reference for those decisions.**

What is different, and what this plan is about: the dropdown arrow is a **background image**, not a pseudo-element (§3a); `appearance: none` is doing real work and the doc page has an example for turning it back off (§3b); and `size` collides with a native attribute that, unlike on Checkbox/Radio/Range, **is meaningful on `<select>`** (§3c).

Unlike three of its four siblings, the scaffold is **correct** — `<select>` needs no `type` attribute, so the missing-`type` family (`plans/components/file-input.md` §0) does not reach here.

## 1. Variant audit

**15 classes: 1 base + 1 style + 8 colour + 5 size**, matching the doc page's frontmatter. `grep -oE '\.select[a-z0-9-]*' select.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `select` | — | — | Always applied. |
| Style | `select-ghost` | `ghost` | `boolean` | One class → boolean, per `plans/components/file-input.md` §1. |
| Colour | `select-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | Matches exactly — import it. Sets `--input-color` **[verified]**. |
| Size | `select-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches exactly — import it. **Collides with a *meaningful* native attribute** — §3c. |

**No disabled class** — `disabled` is native and styled directly, per `plans/components/checkbox.md` §3d.

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — the `<option>`s | no | `<option disabled selected>Pick a color</option>` plus the choices |

Single default slot, no gating.

**No `options` array prop.** Every example's first option is `disabled selected` — a placeholder, not a value — and options carry `value`, `disabled` and `selected` individually. An array API would have to model all of that and would gain nothing over writing `<option>`s.

**No `placeholder` prop** either: the placeholder *is* the first `<option disabled selected>` **[verified]**, and pretending otherwise would hide a standard HTML idiom the caller needs to know anyway. One JSDoc line showing it.

## 3. Five things the naive implementation gets wrong

### 3a. The arrow is two linear-gradients, drawn on the element's background

```css
.select { appearance:none; padding-inline:.75rem 1.75rem;
  background-image: linear-gradient(45deg,#0000 50%,currentColor 50%),
                    linear-gradient(135deg,currentColor 50%,#0000 50%);
  background-position: calc(100% - 20px) calc(1px + 50%), calc(100% - 16.1px) calc(1px + 50%);
  background-size: 4px 4px, 4px 4px; background-repeat: no-repeat }
[dir=rtl] .select { /* mirrored positions */ }
```

**[verified]** — the chevron is a pair of 4×4 px gradient triangles positioned from the right edge, with the `1.75rem` right padding reserving space for them. RTL is handled by mirrored positions **[verified]**.

Two consequences worth JSDoc lines:

- **A caller's `bg-*` class replaces `background-color`, not `background-image`** — so recolouring works, but `bg-none` or a background *image* utility erases the arrow.
- **The arrow follows `currentColor`**, so `class="text-primary"` tints it independently of `color`, which sets the border.

### 3b. `appearance: none` is why the dropdown is styleable — and the doc page shows how to opt out

`appearance: none` **[verified]** is what lets daisyUI restyle the closed control at all. The page's second-to-last example, *"Using OS native style for the options dropdown"*, adds `class="appearance-none"` **[verified]** — which reads as a no-op but is not: Tailwind's `appearance-none` re-declares the property at utility specificity, and daisyUI's own `@layer` placement means the two behave differently for the **open list**.

The last example goes further with `[&::picker(select)]:max-h-26` **[verified]** — the CSS `::picker(select)` pseudo-element from customisable-select, which is very new.

Both are **caller classes, not props**: they are Tailwind utilities and a bleeding-edge pseudo-element this library should not wrap. But they belong in the JSDoc because "how do I style the open dropdown" is the question this component attracts, and daisyUI has two documented answers. §3e.1 covers checking that they actually do anything in the target browsers.

### 3c. `size` collides — and this time the native attribute is *not* meaningless

Fourth appearance of the collision after Checkbox, File Input and Radio — but the first where it costs something. `size` on a `<select>` is a real, useful attribute: it turns the dropdown into a **scrolling list box of N rows** **[per the HTML spec]**, which is a different control.

So a caller who wants `<select size="5">` cannot express it through this component: the prop is typed `DaisySize` and shadows it.

**Decision: keep `size` as the daisyUI axis anyway.** Consistency across Checkbox, File Input, Radio, Range and this component matters more than one rare attribute, the list-box form is not something daisyUI styles (`.select` sets a fixed `height: var(--size)` **[verified]**, which fights it), and the escape hatch is one line of raw `<select>` if someone truly needs it.

**But this is the precedent Text Input must not inherit.** `plans/components/checkbox.md` §3b, `plans/components/file-input.md` §3b and `plans/components/radio.md` §3c all carry the forward note; this plan is the first where the tradeoff is real rather than notional, and `plans/components/text-input.md` should cite it when deciding.

### 3d. Fixed height, clamped width, and free `join` composition

`height: var(--size)`; `width: clamp(3rem, 20rem, 100%)`; `flex-shrink: 1` **[verified]** — a Select is ~20 rem wide by default and shrinks below that, exactly like File Input (`plans/components/file-input.md` §3d).

The corner radii are `var(--join-ss, var(--radius-field))` and friends **[verified]**, so a Select inside a `Join` squares its edges with **no prop** — the protocol documented in `plans/components/join.md` §0.

Also inherited from `plans/components/label.md` §3b: a `<span class="label">` as a **direct child** of a `.select` wrapper becomes a bordered affix. That wrapper is a `<label class="select">`, not this component — worth one JSDoc cross-reference, since it is the shape the Label page uses.

`text-overflow: ellipsis; white-space: nowrap; overflow: hidden` **[verified]** — long option text truncates rather than widening the control.

### 3f. The Text Input forward note was already carried

**2026-09-01.** §3c asked §6 Step 7 to add its finding — that this is the
first component where the `size` collision costs something real — to
`plans/components/text-input.md`'s forward note.

**Text Input shipped first** (2026-09-01, earlier the same day) and already
carries it: its `size` JSDoc reads *"for consistency across all six form
controls (plan §0e, following `plans/components/select.md` §3c)"*, and
`text-input.md` §0e cites this section by name while arguing that the cost is
**lower** there than here — Input's native `size` is a width hint that
daisyUI's own `width: clamp(3rem, 20rem, 100%)` already overrides, whereas a
`<select size="5">` is a structurally different control.

So the chain is complete in both directions and nothing needed editing. Third
Step 7 in this cluster to turn out to be a no-op, after
`plans/components/join.md` §3f and `plans/components/text-input.md`'s audit row
— which is what happens when cross-plan actions are recorded on both sides
rather than only in the plan that discovers them.

### 3e. Unverified assumptions

1. **`appearance-none` and `::picker(select)`** (§3b) — the last two doc examples. `::picker(select)` is part of the customisable-select proposal and may be unsupported; if so the story renders identically to `Default` and should say so rather than looking broken.
2. **`selected` on an `<option>` through the story pipeline** — every example relies on a `disabled selected` first option. Related to `plans/components/checkbox.md` §3f.1.
3. **Cross-component composition** — the fieldset example needs `fieldset`/`legend`/`label`. Raw markup until those land.

**Not a risk here:** the only child rule is the caller's own `<option>`s, which the browser requires to be direct children anyway **[verified — no `.select > *` rule exists]**. The shared slot-wrapping question does not apply.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * A styled native `<select>`. Options are slot content, and the placeholder is
 * the standard first-option idiom (plan §2):
 *
 * ```astro
 * <Select>
 *   <option disabled selected>Pick a color</option>
 *   <option>Crimson</option>
 * </Select>
 * ```
 *
 * The dropdown arrow is drawn with background gradients and follows
 * `currentColor` — `class="text-primary"` tints it, and a background-image
 * utility erases it (plan §3a).
 *
 * ~20rem wide, fixed height; inside a `Join` it squares its edges with no prop
 * (plan §3d).
 */
interface Props extends HTMLAttributes<'select'> {
  color?: DaisyColor;
  /**
   * Shadows the native `size` attribute, which on a `<select>` means "show N
   * rows as a list box" — that form is not expressible through this component
   * (plan §3c).
   */
  size?: DaisySize;
  ghost?: boolean;
}

// Full literal class names. NEVER `select-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'select-primary', secondary: 'select-secondary', accent: 'select-accent',
  neutral: 'select-neutral', info: 'select-info', success: 'select-success',
  warning: 'select-warning', error: 'select-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'select-xs', sm: 'select-sm', md: 'select-md', lg: 'select-lg', xl: 'select-xl',
};

const { color, size, ghost = false, class: className, ...rest } = Astro.props;
---

<select
  class:list={[
    'select',
    color && COLOR[color],
    size && SIZE[size],
    { 'select-ghost': ghost },
    className,
  ]}
  {...rest}
>
  <slot />
</select>
```

No `<script>`: pure CSS, RTL arrow mirroring included (§3a). Not polymorphic — `<select>` is the element.

### Astro idioms gate

- [ ] Content arrives via the default slot as `<option>`s — no `options` array, no `placeholder` prop (§2).
- [ ] No `Astro.slots.has()` gating.
- [ ] Root is `<select>`; no `as` prop.
- [ ] No `<script>` added; no `disabled` branching (§1).
- [ ] `...rest` spread onto the root, so `name`, `required`, `multiple`, `disabled` and `value` work with no declarations.
- [ ] `ghost` is a boolean, not a one-value union (§1).
- [ ] `size`'s collision is documented **with its real cost**, and the Text Input forward note is restated (§3c).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] Probe (§5c):
  ```astro
  <Select><option disabled selected>Pick</option><option>A</option></Select>
  <Select color="primary" size="lg" ghost name="color" required />
  <Select class="appearance-none [&::picker(select)]:max-h-26">ok</Select>
  <Select color="banana">must error — not a DaisyColor</Select>
  <Select size={5}>must error — size is DaisySize, not the row count (§3c)</Select>
  <Select variant="outline">must error — only `ghost` exists (§1)</Select>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8): `Default`, `Ghost`, `WithFieldsetAndLabels` (raw markup, §3e.3), `Primary`, `Secondary`, `Accent`, `Neutral`, `Info`, `Success`, `Warning`, `Error`, `Sizes` (five), `Disabled`, `NativeDropdownStyle`, `CustomDropdownHeight`.

Plus `Playground` and `Passthrough`. Three beyond the doc page:

- **`Colors`** — all eight in one column, since the page shows them in eight sections.
- **`InJoin`** — a Select and a Button in a `join`, showing §3d's free corner squaring.
- **`LongOption`** — an option longer than the control, demonstrating §3d's ellipsis rather than growth.

## 6. Steps

- [x] **Step 1: as far as the build can answer it.** Both dropdown-styling examples exist as stories with comments saying what "renders identically to `Default`" means; §3e.1 is a browser-support question that only Step 5 can close. §3e.2 is answered: 30 `<option disabled selected>` placeholders survive into the output with both attributes intact. §3e.3 is discharged — the fieldset example composes the real `Fieldset`, `FieldsetLegend` and `Label`.
- [x] **Step 2: skipped as planned.** `DaisyColor` and `DaisySize` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** The scaffold's markup was already right, so the work was the props and the JSDoc, as §6 predicted. Gate walked; the probe errors on `color="banana"`, `size={5}` — the collision, made concrete — and `variant="outline"`.
- [x] **Step 4: done.** `Select.stories.ts`, 20 stories: 15 doc-page examples plus `Playground`, `Passthrough`, `Colors`, `InJoin` and `LongOption`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and two stories need the dropdown opened.** Verify: `Default` shows its placeholder and a chevron on the right; **`Colors` changes the border while the chevron stays `currentColor`** (§3a); `Sizes` shows five distinct heights; `Ghost` drops the border until focus; `InJoin` has square inner corners with nothing passed (§3d); `LongOption` **truncates with an ellipsis** rather than widening (§3d); an RTL canvas moves the chevron to the left (§3a); and **`NativeDropdownStyle` / `CustomDropdownHeight` differ from `Default` only once opened** — if they do not, that is §3e.1's answer, not a broken story.
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<select class="select select-info select-lg select-ghost mine" id="select-1" data-test="yes" style="letter-spacing:1px" name="colour" required>`. Full output in §8.
- [x] **Step 7: done — the `Select` row in `plans/README.md` says Implemented.** §3c's forward note to Text Input needed no edit: it was already carried, in both directions (§3f).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 15 daisyUI classes reachable: base, `ghost`, 8 colours, 5 sizes.
- [x] `color` uses `DaisyColor` and `size` uses `DaisySize`, imported, neither redeclared.
- [x] No invented axis — no `options`/`placeholder` props (§2), no `variant` union (§1).
- [x] JSDoc states: the placeholder idiom (§2), the gradient arrow and what erases it (§3a), the `size` collision **and its real cost** (§3c), and free `Join` composition (§3d).
- [x] The Text Input forward note records §3c (§6 Step 7).
- [x] One story per doc-page example, plus `Colors`, `InJoin` and `LongOption`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 204 files, 0 errors, 0 warnings, 0 hints.

```
Passthrough → <select class="select select-info select-lg select-ghost mine" id="select-1"
                data-test="yes" style="letter-spacing:1px" name="colour" required>
                <option disabled selected>Passthrough</option><option>Crimson</option>…</select>
InJoin      → <div class="join"><select class="select join-item">…</select>
                <button class="btn join-item">Apply</button></div>
                             ↑ no prop passed for the corners (§3d)
```

Counts across the 20 stories:

```
select roots 31  → an <option> is the immediate first child  31 of 31
<option disabled selected> placeholders  30
  (the 31st is Disabled, whose single option is not a placeholder)
colours: all 8 | sizes: all 5 | ghost 2 | join-item 2
appearance-none 1 | ::picker(select) 1
```

What this settles:

- **§3e.2**: `disabled selected` survives on 30 first options with both attributes intact, which is the entire placeholder mechanism (§2) and the thing a story pipeline could quietly have dropped.
- **§2's decision holds**: options are slot content the caller writes. An `options` array prop would have had to model `value`, `disabled` and `selected` per item and would have gained nothing.
- **§3d's join protocol needs no prop**: `select.join-item` sits beside `button.join-item` with the corner radii coming from `--join-*`.
- **§3e.3 is discharged** — `WithFieldsetAndLabels` composes `Fieldset`, `FieldsetLegend` and `Label`, so no raw-markup fallback remains in this component.
- **All 15 classes are reachable**, and the two caller-class dropdown examples reach the output verbatim, `[&::picker(select)]:max-h-26` included.

Not settled here: the chevron's colour and position, the five heights, the ellipsis, and whether either dropdown-styling example does anything in this browser. All Step 5.
