# Validator Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/validator/
**Root element:** — **no `Validator` component is built** (§0a). This plan ships `ValidatorHint` only.
**Target file:** `packages/daisy-astro/src/components/Validator/ValidatorHint.astro` (and **deletes** `Validator.astro`)
**Story file:** `packages/daisy-astro/src/components/Validator/Validator.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<Tag>` from `astro/types`; `ValidatorHint` is polymorphic via `Polymorphic<{ as: Tag }>` (§0e).
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- No shared variant union applies — neither class has a colour or size axis.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/validator.css` — **six declaration blocks in the entire file** — and the doc page's `classnames` frontmatter. Both agree on **two** classes:

```
.validator        "For input, select, textarea"
.validator-hint   "for the hint text that appears after the input if it's invalid"
```

Twelve doc examples.

### 0a. `.validator` has no styles of its own — it is a modifier for other components

The complete set of rules mentioning `.validator` (not `.validator-hint`):

```css
:is(.validator:user-valid, .validator:has(:user-valid)),                            /* + :focus, :checked, [aria-checked=true], :focus-within */
  { --input-color: var(--color-success) }

:is(.validator:user-invalid, .validator:has(:user-invalid),
    .validator[aria-invalid]:not([aria-invalid=false]),
    .validator:has([aria-invalid]:not([aria-invalid=false]))),                       /* + the same four */
  { --input-color: var(--color-error) }
```

That is all of it. `.validator` sets **one custom property** and nothing else — no border, no colour, no layout. `--input-color` is the variable that `.input`, `.select`, `.textarea`, `.checkbox`, `.toggle`, `.radio`, `.file-input` and `.range` already read for their border and focus ring (verified in `text-input.md` §0, `textarea.md` §0, `toggle.md` §0d).

So a bare `<input class="validator">` is **completely unstyled**, and every one of the twelve doc examples pairs `validator` with another component class: `input validator`, `select validator`, `checkbox validator`, `toggle validator`.

**This is the third "not a component" finding in the batch**, and each has a different shape:

| Component | Shape |
|---|---|
| Pagination (`pagination.md`) | the class does not exist at all |
| Theme Controller (`theme-controller.md` §0a) | the class exists only as a selector hook inside theme rules |
| **Validator** | the class exists and has a rule, but the rule only sets a variable another component consumes |

**Decision: delete `Validator.astro`.** The scaffold renders `<input class="validator" />`, which is a bare unstyled input — wrong in kind, not merely incomplete. Same disposition as `pagination.md`: the row stays in the checklist, the component file goes, and the directory keeps the stories plus the one class that *is* a real element.

### 0b. `validator` stays a caller class — and this plan is where that is decided library-wide

Two ways to expose it:

1. A `validator?: boolean` prop on the eight form controls that read `--input-color`.
2. A caller class: `<TextInput class="validator" />`.

**Take the caller class.** It is one literal class name that `class:list` already merges; a boolean would be eight props across eight files to keep in sync, all emitting the same string, with no behaviour of their own. `plans/README.md` §1b's no-interpolation concern does not arise — the literal lives in the caller's source, where Tailwind scans it.

This is not a new decision so much as the ratification of one already made in passing: `text-input.md` §0f lists `validator` in its "four integrations that need no props at all" table, and `select.md`, `textarea.md`, `checkbox.md` and `toggle.md` all reference it the same way. **This plan is the record of it** — before now it was an assumption repeated in five places with no single justification.

The JSDoc obligation moves with it: each of those eight components should carry one line saying `validator` is a caller class on it and `ValidatorHint` is a **sibling**, because "why is my hint not showing" is the question this arrangement generates (§0d).

### 0c. `:user-valid` / `:user-invalid` are the point, not `:valid` / `:invalid`

daisyUI matches on `:user-valid` and `:user-invalid`, which differ from `:valid`/`:invalid` in exactly one way that matters: **they only match after the user has interacted with the control.**

Without that, every `required` field on a freshly loaded form would render red before anyone typed anything — the classic broken-validation look. This is the single design decision that makes the component usable, and it is invisible from the markup.

Consequences for the stories, which are what makes this worth writing down:

- **A story cannot show the error state by rendering it.** There is no class, no attribute and no prop that produces `:user-invalid` — the user must type and blur, or submit. Screenshot-style stories will show every example in its neutral state and look like nothing works.
- The doc page hits this too, which is why its Select example is captioned *"Click the button before picking an option to see the error color"* and ships a `<button type="submit">`.
- Three routes exist and the stories should use all three: type-then-blur (`Default`), submit an empty required field (`SelectRequired`, `FormValidation`), and `aria-invalid` (§0d) for a state that can be rendered directly.

The doc page carries **no `browserSupport` block**, unlike Theme Controller (`theme-controller.md` §0e), so no version floor is stated here. Do not invent one — note instead that `:user-*` pseudo-classes are newer than `:valid`/`:invalid` and confirm behaviour in the target browsers during Step 5.

### 0d. `aria-invalid` is an equal first-class trigger

```css
.validator[aria-invalid]:not([aria-invalid=false]),
.validator:has([aria-invalid]:not([aria-invalid=false])) { --input-color: var(--color-error) }
```

Present in the invalid rule, absent from the valid one. So a framework driving validation in JavaScript sets `aria-invalid="true"` and gets daisyUI's error styling plus the hint, with no dependency on native constraint validation at all. The `:not([aria-invalid=false])` guard means `aria-invalid="false"` correctly reads as valid.

Not in the frontmatter — same treatment as `row-hover` (`table.md` §0b) and `[aria-checked]` (`toggle.md` §0d): **record it, and here also use it**, because it is the only way to render an invalid state statically (§0c). One story, `AriaInvalid`, and one JSDoc line.

The `:has()` variants mean this works on the wrapper form too: `<label class="input validator">` around an `<input aria-invalid="true">`.

### 0e. `.validator-hint` is a real element with three documented traps

```css
.validator-hint { visibility: hidden; margin-top: .5rem; font-size: .75rem }
:is(.validator:user-invalid, …) ~ .validator-hint { visibility: visible; color: var(--color-error) }
:is(.validator:user-invalid, …) ~ .validator-hint { display: revert-layer }   /* second layer */
```

The doc page's INFO box spells out three behaviours, and all three are non-obvious:

1. **The combinator is `~`, a *general* sibling.** Any earlier invalid `.validator` sibling reveals *every* later `.validator-hint` in the same parent. daisyUI's advice: wrap each control in a `fieldset` (or a `label`) to scope it — which is exactly what the *"Form requirement validator"* example does, giving each field its own `<fieldset>` / `<label>` wrapper. **The hint must be a sibling of the validator element, not a child of it, and not in a different parent.**
2. **A hidden hint still occupies space**, by design — `visibility: hidden`, not `display: none`, so the layout does not shift when the message appears.
3. **Adding Tailwind's `hidden` collapses it**, and the third rule is what makes that work: `display: revert-layer` un-does `display:none` when the sibling is invalid. Without that second layer, a `hidden` hint would never appear. Four of the twelve examples use `validator-hint hidden`.

That third behaviour is the typed home this component gets: **`collapse?: boolean`**, adding `hidden`. Naming it `hidden` would collide with the global `hidden` HTML attribute on `HTMLAttributes`; `collapse` says what it does (no reserved space) without shadowing anything.

Root element: the examples use `<div>` (2), `<p>` (7) and `<span>` (1). No class is element-specific, so `ValidatorHint` is **polymorphic** via `Polymorphic<{ as: Tag }>`, defaulting to `'p'` — the majority. This makes it the one component in this plan subject to `plans/README.md` §5c: `type Props` **must** precede every `const`, and the destructure must be annotated `as Props<HTMLTag>`, or Astro silently accepts no props.

### 0f. Attribute collisions

- `collapse` — not an HTML attribute; free. (Deliberately not named `hidden`, which is a global attribute on base `HTMLAttributes`.)
- `as` — the standard polymorphic prop, as used elsewhere in this library.
- No `color`, no `size`, so `astro-jsx.d.ts:602` is not in play.

---

## 1. Variant audit

daisyUI documents two classes and **no modifiers** for either.

### `validator` — not a component (§0a, §0b)

| Axis | daisyUI class | Exposure |
|---|---|---|
| — | `validator` | **Caller class** on TextInput / Select / Textarea / Checkbox / Toggle / Radio / FileInput / Range. No prop, no component. |

### `ValidatorHint`

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Element | — | `as` | `HTMLTag` | `Polymorphic<{ as: Tag }>`, default `'p'`. Doc uses `p`, `div`, `span` (§0e). |
| Collapse | Tailwind `hidden` | `collapse` | `boolean` | Reserves no space while valid. Works because of daisyUI's `display: revert-layer` rule (§0e). |

Not built: `aria-invalid` (§0d — a caller attribute on the validator element, with a story), the `~` scoping requirement (§0e — a documentation obligation, unenforceable from a sibling component).

## 2. Slots

| Component | Slot | Wrapper | Optional? | Source |
|---|---|---|---|---|
| `ValidatorHint` | `default` | none — the root element itself | no | "Enter valid email address", multi-line `<br/>` lists |

Single default slot, no gating.

The multi-line examples (`Password`, `Username`) put `<br/>`-separated lines directly in the slot, so the slot must accept markup, not just text. No named slots — the hint is one block of content.

**No direct-child dependency** on the hint itself: the `~` combinator looks at the hint's *siblings*, not its children. But that same combinator means the *component's placement* is load-bearing in a way slots cannot express — see §0e trap 1, and §5's structural note.

## 3. Props interface

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

type Props<Tag extends HTMLTag = 'p'> = Polymorphic<{ as: Tag }> & {
  /** Reserve no space while the field is valid, instead of the default
   *  visibility:hidden. Adds Tailwind's `hidden`; daisyUI's
   *  `display: revert-layer` rule is what lets it reappear when invalid. */
  collapse?: boolean;
};
---
```

## 4. Component implementation

```astro
---
// ValidatorHint.astro
import type { HTMLTag, Polymorphic } from 'astro/types';

// §5c: `type Props` MUST come before any `const` in a generic component, or
// Astro silently accepts no props at all. This is the one component in this
// plan where that rule bites.
type Props<Tag extends HTMLTag = 'p'> = Polymorphic<{ as: Tag }> & {
  collapse?: boolean;
};

const { as: Tag = 'p', collapse, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---
{/* Must be a SIBLING that comes AFTER the .validator element, in the same
    parent — daisyUI reveals it with `~`. That combinator is a *general*
    sibling, so any earlier invalid validator in the same parent reveals every
    later hint: wrap each control in its own fieldset or label to scope it.
    Hidden hints still reserve space by default (no layout shift); pass
    `collapse` to opt out. */}
<Tag class:list={['validator-hint', { hidden: collapse }, className]} {...rest}>
  <slot />
</Tag>
```

`Validator.astro` is **deleted** in the same change (§0a).

### Astro idioms gate

- [ ] Content arrives via the slot, not content props.
- [ ] Nothing optional to gate with `Astro.slots.has()` — the hint has one required slot.
- [ ] Root element is polymorphic (`p` / `div` / `span` all appear in the doc), via `Polymorphic<{ as: Tag }>` (§0e).
- [ ] No `<script>` — `:user-invalid`, `aria-invalid` and the sibling reveal are all CSS.
- [ ] `...rest` spread onto the root element.
- [ ] `collapse` collides with nothing; deliberately not named `hidden` (§0f).
- [ ] **The one Tailwind class emitted (`hidden`) is a literal object key**, not interpolated.
- [ ] **`type Props` is declared before any `const`, and the destructure is annotated `as Props<HTMLTag>`** (§5c) — mandatory here, since the generic failure is silent.
- [ ] Prop typing verified with a throwaway probe (below) — also mandatory for the same reason.
- [ ] `astro check` passes.

```astro
<ValidatorHint>Enter valid email address</ValidatorHint>
<ValidatorHint as="span" collapse>Required</ValidatorHint>
<ValidatorHint as="div" id="hint">Must be 10 digits</ValidatorHint>
<!-- must be an error: -->
<ValidatorHint as="p" href="/x">no</ValidatorHint>
```

## 5. Storybook stories

Every story is **structural** — a validator-classed control plus a sibling hint — so none of them can be expressed by `args` on a single component. All twelve need wrapper story components holding the real composed markup, the same route `timeline.md` §5 and `theme-controller.md` §5 take.

| Doc-page example | Story name | Composition |
|---|---|---|
| Validator | `Default` | `TextInput type="email" required class="validator"` |
| Validator and validator-hint | `WithHint` | + `ValidatorHint` |
| Password requirement validator | `Password` | `pattern`, `minlength`, multi-line hint |
| Username requirement validator | `Username` | `pattern`, `minlength`, `maxlength` |
| Phone Number requirement validator | `Phone` | `type="tel" class="validator tabular-nums"` |
| URL input requirement validator | `Url` | `type="url" value="https://"` |
| Date input requirement validator | `DateRange` | `type="date" min max` |
| Number input requirement validator | `NumberRange` | `type="number" min="1" max="10"` |
| Checkbox requirement validator | `CheckboxRequired` | compose `Checkbox` |
| Toggle requirement validator | `ToggleRequired` | compose `Toggle` |
| Select requirement validator | `SelectRequired` | compose `Select` + `Button type="submit"` inside a `<form>` |
| Form requirement validator | `FormValidation` | full form, per-field `fieldset`/`label` wrappers, `collapse` hints |

Plus:
- `Playground` — controls for `ValidatorHint`'s `as` and `collapse`, with a fixed invalid input beside it.
- `AriaInvalid` — the only story that shows the error state without interaction (§0c, §0d).
- `HintScopeTrap` — two inputs and two hints in **one** parent, showing that invalidating the first reveals both, next to the same pair wrapped in `fieldset`s showing correct scoping (§0e trap 1). This is the highest-value story in the set: it is the failure mode the `~` combinator produces, and it is invisible until it happens in someone's form.

Three further notes:

- **Most stories look identical until you interact with them** (§0c). Every story description must say what to do — "type an invalid address then click away", "submit without choosing". Without that a reviewer sees twelve neutral inputs and concludes the component does nothing.
- **`collapse` needs a before/after pair**, not a single story: the point is the layout shift, so show a collapsed hint and a default one side by side and invalidate both.
- **Compose the real components** — `TextInput`, `Select`, `Checkbox`, `Toggle`, `Button`, `Fieldset`, `Label`. This story file is the widest integration check in the library, since `validator` is defined entirely by what other components do with `--input-color` (§0a).

```ts
import ValidatorHint from './ValidatorHint.astro';

export default {
  title: 'Components/Validator',
  component: ValidatorHint,
  argTypes: {
    as: { control: 'inline-radio', options: ['p', 'div', 'span'] },
    collapse: { control: 'boolean' },
  },
};

// Structural stories render wrapper .astro components — a validator control and
// its sibling hint cannot be expressed through args on one component.
export const Playground = {
  args: { slots: { default: 'Enter valid email address' } },
};

export const AriaInvalid = {
  // wrapper renders: <TextInput class="validator" aria-invalid="true" /> + <ValidatorHint>
};

// …one export per row of the table above.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled — the CSS file is six blocks long and quoted in full above, and the frontmatter lists two classes. Nothing to re-derive.
- [ ] **Step 2:** No union needed anywhere; `HTMLTag` comes from `astro/types`.
- [ ] **Step 3:** **Delete `packages/daisy-astro/src/components/Validator/Validator.astro`** (§0a) and create `ValidatorHint.astro` per section 4. Run the probe — the §5c generic failure is silent, so a probe that *fails to error* on `<ValidatorHint as="p" href="/x">` means the typing did not take.
- [ ] **Step 4:** Write `Validator.stories.ts` plus the wrapper story components. Start with `WithHint`, then `HintScopeTrap`.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Validator`, verify **by interacting**, not by looking:
  - `Default` stays neutral on load, turns red only after typing an invalid address and blurring, and green after a valid one — this is the `:user-*` behaviour and the whole point (§0c).
  - `WithHint`'s hint reserves space while invisible, then appears in error colour.
  - `FormValidation`'s `collapse` hints reserve no space, then appear on submit — proving `display: revert-layer` (§0e trap 3).
  - `HintScopeTrap` reproduces the leak in the unwrapped pair and not in the wrapped one (§0e trap 1).
  - `AriaInvalid` is red on load with no interaction (§0d).
  - `SelectRequired` turns red only after clicking Submit, matching the doc's own caption.
  - `CheckboxRequired` / `ToggleRequired` colour the box and track, confirming `--input-color` reaches components other than `.input`.
- [ ] **Step 6:** Attribute forwarding story on `ValidatorHint`: `id`, `data-*`, `style`, `class`, plus `role="alert"` — worth showing, since an error message is a reasonable live region and daisyUI ships no semantics of its own. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<(p|div|span)[^>]*validator-hint[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Documentation, in `plans/README.md` unless stated:
  1. Set the Validator row to **Implemented**, noting that no `Validator` component exists.
  2. Add the one-line `validator` JSDoc note to **TextInput, Select, Textarea, Checkbox, Toggle, Radio, FileInput and Range** — caller class on the control, `ValidatorHint` as a sibling after it (§0b).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] `Validator.astro` deleted; no component emits a bare `validator` class (§0a).
- [ ] The caller-class decision is recorded here with its reasoning, and the eight form controls carry the JSDoc line (§0b, §6 Step 7).
- [ ] `ValidatorHint` is polymorphic with `p` as the default, and **`type Props` precedes every `const`** with the `as Props<HTMLTag>` annotation (§0e, §5c).
- [ ] The probe confirms the generic typing actually took — an invalid attribute must error (§6 Step 3).
- [ ] `collapse` adds `hidden` and is verified to reappear when invalid (§0e trap 3).
- [ ] The `~` general-sibling scoping trap is documented in JSDoc **and** demonstrated by `HintScopeTrap` (§0e trap 1).
- [ ] The reserved-space-by-default behaviour is documented as intentional, not a bug (§0e trap 2).
- [ ] `aria-invalid` recorded as an undocumented-but-supported trigger and used by `AriaInvalid` (§0d).
- [ ] Every story description says what interaction to perform (§0c).
- [ ] Twelve doc-example stories, composing the real form-control components.
- [ ] Every box in section 4's Astro idioms gate ticked.
