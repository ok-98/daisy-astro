# Label Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/label/
**Root element:** `span` (`Label`), `label` (`FloatingLabel`)
**Target files:** `packages/daisy-astro/src/components/Label/Label.astro`, `FloatingLabel.astro` (only `Label.astro` exists, as a dummy scaffold)
**Story files:** `Label.stories.ts`, `FloatingLabel.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): `class:list` for merging; **no variant classes** so no `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/label.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01), second of the Stage 4 cluster. `Label.astro`, `FloatingLabel.astro` and 14 stories. §3's five findings all held. One correction to §4: its `Label` JSDoc is full of angle brackets, which silently break inference on a **generic** component — the trap `plans/README.md` §5c documents, written into the very listing meant to implement it (§3f). Story markup for `input`, `select` and `textarea` carries `TODO(daisy-astro)` markers, this cluster's pass-2 debt. Step 5 (visual pass) is open, and it carries both animations.
---

## 0. Two unrelated components in one file, and neither is a form label

The doc page's `classnames` lists two **components**, not a component and a part: `label` and `floating-label` **[verified]**. They share a CSS file and nothing else.

| Class | What it is | Element in the docs |
|---|---|---|
| `label` | an **affix inside** a `.input` or `.select` — the `https://` before a URL field, the `.com` after a domain | `<span>` |
| `floating-label` | a **wrapper** whose `<span>` animates from placeholder position to above the field on focus | `<label>` |

**Neither is "a label for a form field" in the usual sense.** The thing that looks like one — `<label class="label">Email</label>` stacked above an input — appears throughout the Fieldset and Checkbox doc pages but is just this same `.label` class used loosely. See §3a.

## 1. Variant audit

**2 classes, both "component"**, matching the doc page's frontmatter. `grep -ohE '\.(label|floating-label)[a-z0-9-]*' label.css | sort -u` returns exactly `.label` and `.floating-label` **[verified]**.

| Axis | daisyUI class | Prop | Prop type | Component |
|---|---|---|---|---|
| Base | `label` | — | — | `Label` |
| Base | `floating-label` | — | — | `FloatingLabel` |

**No colour, size or style axis** — none exists **[verified]**. Twelfth component in the library with an empty variant table. `FloatingLabel` picks up its size from the **field inside it** (§3c).

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Label` | `default` | none | no | `https://`, `.com`, `Type`, `Publish date` |
| `FloatingLabel` | `default` | none — direct children of `.floating-label` | no | a `<span>` **and** the field, in either order (§3c) |

Plain default slots, no gating.

**`FloatingLabel` has no separate `text` slot.** Its `<span>` is one of the two children the caller supplies, and the doc examples put it *before* the field in one place and *after* in another **[verified]** — both work, because the span is absolutely positioned. A named slot would fix an order that daisyUI deliberately leaves free.

## 3. Five things the naive implementation gets wrong

### 3a. `Label` renders a `<span>`, not a `<label>`

`.label` is a class-only selector **[verified]** and the doc page uses it on a `<span>` in all four of its own examples — because the surrounding element is *already* a `<label class="input">` wrapping the field:

```html
<label class="input">
  <span class="label">https://</span>
  <input type="text" placeholder="URL" />
</label>
```

Rendering `<label class="label">` here would nest a `<label>` inside a `<label>`, which is invalid and makes the click target ambiguous.

So **`Label`'s root is a `<span>`, and it is polymorphic** — `as="label"` is available for the loose usage seen on the Fieldset and Checkbox pages (`<label class="label">Remember me</label>` around a checkbox), where the element genuinely is a form label. The JSDoc states both shapes and which is which. Being polymorphic brings `plans/README.md` §5c's silent generic-inference failure; the probe in §4 is mandatory.

`.label:has(input) { cursor: pointer }` **[verified]** is the rule that makes the `as="label"` form feel right, and it fires only when a control is inside.

### 3b. Inside an `.input` or `.select`, `Label` becomes a bordered affix

```css
.label:is(.input > *, .select > *) {
  height: calc(100% - .5rem); padding-inline: .75rem; font-size: inherit; align-items: center;
  &:first-child { border-inline-end: var(--border) solid …; margin-inline: -.75rem .75rem }
  &:last-child  { border-inline-start: var(--border) solid …; margin-inline: .75rem -.75rem }
}
```

**[verified]**. The affix styling — full height, a dividing rule, and negative margins that pull it to the field's edge — applies **only** when the label is a **direct child** of `.input` or `.select`, and the border side flips with `:first-child` vs `:last-child`.

Two consequences:

- **Outside a field wrapper the same class is just dimmed inline text** (`color: color-mix(in oklab, currentcolor 60%, transparent)` **[verified]**). Both usages are legitimate; they simply look nothing alike, which is worth one JSDoc line.
- **The affix must be first or last.** A label between two other children of `.input` gets the base styling with no border and no negative margin — silently ordinary text in the middle of a field.

This is the direct-child dependency for this component, and it makes §3e.1 blocking for the affix stories only.

### 3c. `FloatingLabel` is driven by `::placeholder`, so the field needs one

```css
.floating-label > span { position:absolute; opacity:0; pointer-events:none;
                         inset-inline-start:.75rem; top:calc(var(--size-field,.25rem) * var(--top-mul,5));
                         translate:0 -50%; transition:top/translate/scale/opacity .1s ease-out }
:is(.floating-label:focus-within,
    .floating-label:not(:has(input:placeholder-shown, textarea:placeholder-shown))) > span {
  opacity:1; z-index:2; top:0; translate:-12.5% calc(-50% - .125em); scale:.75 }
… and the matching rules hide ::placeholder …
.floating-label:has(:disabled, [disabled]) > span { opacity:0 }
```

**[all verified]**. The span is hidden at rest and floats up on `:focus-within` **or** when the field is no longer showing its placeholder.

So:

- **The field must have a `placeholder` attribute.** Without one, `:placeholder-shown` never matches, `:not(:has(…))` is always true, and the label is stuck in the floated position from the start. The doc examples all set a placeholder, including ones that also set a `value` **[verified]**. This is the component's one real trap; the JSDoc says it and `NoPlaceholder` (§5) shows it.
- **`:placeholder-shown` only exists on `input` and `textarea`.** The responsive example wraps a `<select>` **[verified]**, which has no placeholder — so a select's label relies on `:focus-within` alone and drops back down on blur. daisyUI ships it that way; note it, do not patch it.
- **Size comes from the field**, via `--size-field` **[verified]** — `input-xs`…`input-xl` on the child move the resting position. `FloatingLabel` therefore has **no `size` prop**, and the responsive example puts five prefixed size classes on the *input*.
- **A disabled field hides the label entirely** **[verified]**. Surprising, and worth a JSDoc line.

### 3d. Neither component is what a `<label for>` is for

Both classes are presentational. Associating a label with a control is still the caller's job — `for`/`id`, or wrapping. The Fieldset doc page says so in its own headings (*"Add proper id and for attributes for accessibility"*), and `plans/components/fieldset.md` §2 cross-references here.

So there is **no `for` prop shortcut and no id generation**: `for` arrives through `...rest` when the root is a `<label>`, and means nothing on a `<span>`. One JSDoc line, and it is the reason `as="label"` exists at all (§3a).

### 3f. §4's JSDoc would have broken `Label`'s own inference

**Found while implementing, 2026-09-01.** §4 gives `Label` a polymorphic
`Props`, and §3a even flags the consequence: *"Being polymorphic brings
`plans/README.md` §5c's silent generic-inference failure; the probe in §4 is
mandatory."*

The JSDoc §4 supplies **is** that failure. It writes `` `.input` ``, `` `span` ``
and `` `<label>` `` in prose, and the rule is that **any angle bracket anywhere
in a generic component's frontmatter** stops `Props` being inferred — not just
in code, and JSDoc-versus-`//` makes no difference (`plans/README.md` §5c's
evidence table). Copied as written, the component would have accepted
`<Label size="lg">` with no error, and the probe would have caught it only
because the probe was mandatory.

Rewritten without brackets, with the reason stated in the comment itself, the
way `CardTitle.astro` already does. **Second time a plan's own prose has broken
the component it describes**, after `plans/components/filter.md`, whose comment
claimed to contain no markup while containing some. The lesson is narrow and
worth repeating: in a generic component, the frontmatter is code, comments
included.

### 3e. Unverified assumptions

1. **Do `Label`s land as direct children of `.input`/`.select`?** Blocking for the affix usage only (§3b) — outside a field wrapper nothing depends on position. Seventeenth plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **Cross-component composition.** Every example nests `input`, `select` or `textarea`, whose plans are not written. Raw markup in the stories until they land, noted in a comment.
3. **`:placeholder-shown` on `<select>`** (§3c) — confirm the select story behaves as described rather than assuming the CSS reads as intended.

## 4. Component implementation

### `Label.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * Two usages, one class:
 *
 * - **Affix inside a field** — a direct child of a `.input` or `.select`
 *   wrapper, rendered as a bordered prefix/suffix. Must be the first or last
 *   child (plan §3b). Keep the default `span`: the wrapper is already a
 *   `<label>`, and nesting labels is invalid (plan §3a).
 * - **Standalone text** — dimmed inline text next to a control. Use
 *   `as="label"` here, with `for` or a wrapped input, so it is a real form
 *   label (plan §3a, §3d).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }>;

// No variant class map: daisyUI defines no modifiers for this component (§1).

const { as: Tag = 'span', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['label', className]} {...rest}>
  <slot />
</Tag>
```

### `FloatingLabel.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Wraps a field and a `<span>`; the span floats above the field on focus, or
 * whenever the field is not showing its placeholder.
 *
 * **The field must have a `placeholder`** — without one the label starts
 * floated and never comes down (plan §3c). A `<select>` has no placeholder, so
 * its label reacts to focus only.
 *
 * The span may come before or after the field. Size follows the field's own
 * `input-*` / `select-*` / `textarea-*` class — there is no `size` prop.
 * A disabled field hides the label entirely.
 */
interface Props extends HTMLAttributes<'label'> {}

const { class: className, ...rest } = Astro.props;
---

<label class:list={['floating-label', className]} {...rest}>
  <slot />
</label>
```

No `<script>` in either: pure CSS, RTL included (`:dir(rtl)` arms **[verified]**).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `text` prop, no separate span slot (§2).
- [ ] `Label` defaults to `<span>` and offers `as="label"`; `FloatingLabel` is a `<label>` with no `as` (§3a).
- [ ] `<slot />` has no wrapper in `FloatingLabel` — the span must be a direct child for `> span` to match (§3c).
- [ ] No `Astro.slots.has()` gating.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in both — this is what carries `for` (§3d).
- [ ] No `for` prop and no id generation (§3d).
- [ ] `FloatingLabel` has no `size` prop (§3c).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] **`type Props` precedes every `const` in `Label.astro`**, with `as Props<HTMLTag>` (§3a).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <label class="input"><Label>https://</Label><input type="text" /></label>
  <Label as="label" for="email">Email</Label>
  <FloatingLabel class="w-full max-w-xs"><span>Your Email</span><input class="input" placeholder="mail@site.com" /></FloatingLabel>
  <Label size="lg">must error — no size axis (§1)</Label>
  <FloatingLabel size="lg">must error — size comes from the field (§3c)</FloatingLabel>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8):

`Label.stories.ts`: `ForInput`, `ForInputAtEnd`, `ForSelect`, `ForDateInput`.
`FloatingLabel.stories.ts`: `Default`, `Sizes` (five), `ResponsiveSize` (input, textarea and select).

Plus `Playground` and `Passthrough` in each. Three beyond the doc page:

- **`Standalone`** (`Label`) — `as="label"` with `for`, the Fieldset-page usage, beside an affix one so §3a's two shapes are visible together.
- **`AffixInTheMiddle`** (`Label`) — an affix that is neither first nor last, losing its border and negative margin (§3b).
- **`NoPlaceholder`** (`FloatingLabel`) — a field with no `placeholder`, showing the label stuck in the floated position (§3c). This is the trap the plan exists for.

## 6. Steps

- [x] **Step 1: done for §3e.1**, which is blocking for the affix usage only. The build shows the affix as a direct child of its field wrapper in all 6 affix stories, and `AffixInTheMiddle` deliberately renders the failing case (§8). §3e.2 is the cluster's pass-2 debt, marked per `plans/IMPLEMENTATION-ORDER.md` §5.2. §3e.3 (select behaviour) is runtime and moves to Step 5.
- [x] **Step 2: skipped as planned.** No variant classes at all; `variants.ts` untouched.
- [x] **Step 3: done, with §3f's correction to §4's JSDoc.** The probe was mandatory and earned it: with brackets in the frontmatter `Label` would have accepted anything. As written, the probe errors on all three intended lines and leaves `as="label" for="email"` clean — which is inference working, since `for` is only valid on the label root.
- [x] **Step 4: done.** `Label.stories.ts` (8) and `FloatingLabel.stories.ts` (6).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and both components are animation or state.** Verify: `ForInput` is a full-height prefix with a dividing rule on its trailing edge, `ForInputAtEnd` mirrors it; **`AffixInTheMiddle`'s second field has neither border nor negative margin** (§3b); `Standalone` is dimmed inline text and its wrapped-checkbox variant shows a pointer cursor; `Default` rests inside the field and **rises on focus**, staying risen once typed in; `Sizes` moves the resting position per field size (§3c); the responsive story's **select drops back down on blur** while the input and textarea do not (§3e.3); and **`NoPlaceholder`'s second field starts floated over an empty box** with the third's label hidden entirely (§3c).
- [x] **Step 6: done — forwarding confirmed on both.** `Label`'s `Passthrough` renders `<label for="passthrough-input" id="label-1" data-test="yes" style="letter-spacing:1px" class="label mine">`, which is also the polymorphic root actually changing. Full output in §8.
- [x] **Step 7: done — the `Label` row in `plans/README.md` says Implemented** and names `FloatingLabel`. `plans/components/fieldset.md` §2 and `plans/components/checkbox.md` §2 both already point here; they are the ones that will drop their raw `label` markup in pass 2.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] Both daisyUI classes reachable, as two separate components (§0).
- [x] `Label` defaults to `<span>`; `as="label"` available; probe passes (§3a).
- [x] Affix styling verified as first-child and last-child, and absent in the middle (§3b).
- [x] `FloatingLabel`'s span is a direct child and may be either side of the field (§2, §3c).
- [x] No invented axis — no colour, size, `for` prop, or id generation (§1, §3c, §3d).
- [x] JSDoc states: the two usages of `.label` (§3a, §3b), the required `placeholder` (§3c), select's focus-only behaviour (§3c), disabled hiding the label (§3c), and that association is still the caller's (§3d).
- [x] One story per doc-page example, plus `Standalone`, `AffixInTheMiddle` and `NoPlaceholder`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 199 files, 0 errors, 0 warnings, 0 hints.

```
ForInput    → <label class="input"><span class="label">https://</span>
                <input type="text" placeholder="URL" /></label>
ForInputAtEnd → <label class="input"><input … /><span class="label">.com</span></label>
Passthrough (Label) → <label for="passthrough-input" id="label-1" data-test="yes"
                        style="letter-spacing:1px" class="label mine">Passthrough</label>
Passthrough (Floating) → <label class="floating-label mine w-full max-w-xs" id="floating-1"
                           data-test="yes" style="letter-spacing:1px">
                           <span>Passthrough</span><input … placeholder="type here" …/></label>
```

Counts across the 14 stories:

```
Label roots: 7 span + 3 label   — the default and the as="label" form (§3a)
affix as the FIRST child of a .input/.select wrapper   5
affix as the LAST child                                1
affix in the middle (AffixInTheMiddle, on purpose)     1
one label wraps a control, for the `:has(input)` pointer rule
floating-label roots 14, span written before the field in 6 and after in 8
all 4 rule blocks present in the built stylesheet, `:placeholder-shown` included
```

What this settles:

- **§3a's default is the right one**: 7 of 10 labels are the `span` affix form, and the 3 that are real `<label>` elements all asked for it. Had the component defaulted to `label`, the affix examples would have nested a label inside daisyUI's own `label.input` wrapper.
- **§3b's positional rule is exercised in all three positions** — first, last and middle — and the middle one is a story rather than a footnote, because it is the case that degrades silently.
- **§2's "either side" claim is true in the output**: the span precedes the field in 6 floating labels and follows it in 8, which is why it is not a named slot.
- **The polymorphic root really changes**: `Passthrough` emits a `<label for=…>`, an attribute that would be meaningless — and untyped — on the default span.
- **`Label` and `FloatingLabel` share only a CSS file**: two components, two story files, no shared prop.

Not settled here: the affix borders, the float animation, the select's blur behaviour, and the two `NoPlaceholder` failures. All Step 5.
