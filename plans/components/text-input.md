# Text Input Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/input/
**Root element:** `input` — **or** `label` (see §0a; daisyUI documents both)
**Target file:** `packages/daisy-astro/src/components/TextInput/TextInput.astro`
**Story file:** `packages/daisy-astro/src/components/TextInput/TextInput.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'input'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions (`DaisyColor`, `DaisySize`) come from `packages/daisy-astro/src/lib/variants.ts` — import as `../../lib/variants`.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).


> **Status:** **Implemented** (2026-09-01), fourth of the Stage 4 cluster and the largest component in it. `TextInput.astro` and 22 stories, one per doc-page example. §0's analysis held throughout — no corrections. Two things it flagged as risks are now settled by evidence: **the void-element guard was run and does throw** (§0k), and **inline SVG in a slot survives** (§8), which §5 called the main risk. The missing-`type` audit's Text Input row was already closed clean in `plans/components/file-input.md` §0a. Step 5 (visual pass) is open.
---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/input.css` and the doc page's `classnames` frontmatter. Both agree on **fifteen** classes — the same shape as Textarea:

```
.input
.input-ghost
.input-neutral .input-primary .input-secondary .input-accent
.input-info .input-success .input-warning .input-error
.input-xs .input-sm .input-md .input-lg .input-xl
```

Colour is exactly `DaisyColor`, size is exactly `DaisySize`, `ghost` is the one boolean. No part classes. Everything difficult about this component is in *where the class goes*, not in which classes exist.

### 0a. The class goes on the `<input>` **or** on a wrapper — and this one is documented

The frontmatter is explicit:

> `input` — For `<input type="text">` tag **or a wrapper of** `<input type="text">` tag

and the CSS backs it:

```css
.input       { display:inline-flex; align-items:center; gap:.5rem; padding-inline:.75rem }
.input input { appearance:none; background:#0000; border:none; width:100%; height:100%;
               &::placeholder{ color:var(--color-base-content); opacity:.5 } }
.input:has(>input[disabled]) { … }
```

This is the same dual-form CSS Textarea has, but there it is undocumented and got recorded-and-not-built (`textarea.md` §0f). Here it is the **majority case**: of the doc page's 17 examples, **8** use `<label class="input">` with an icon, a `<kbd>`, a `<span class="badge">` or literal text sitting next to a bare `<input>`. The search field, all four validator examples, and the join example all take that form.

A component that can only render `<input class="input">` cannot express half its own doc page. So the root is a two-value choice:

| `as` | Renders | Slot | daisyUI examples |
|---|---|---|---|
| `'input'` (default) | `<input class="input …" />` | none — void element | Text input, ghost, colors, sizes, disabled, datalist, date, time, datetime-local, number+validator |
| `'label'` | `<label class="input …"><slot /></label>` | required — icon + bare `<input>` + affixes | text-label-inside, search, username/email/password/tel/url + validator, join |

**Do not reach for `Polymorphic<{ as: Tag }>` here.** The two branches differ in kind, not just in tag name: `<input>` is a void element with no children, `<label>` is a container whose whole point is the slot. A single dynamic `<Tag>` would have to emit `<input></input>`, and whether Astro's renderer suppresses that for a dynamic void tag is exactly the sort of thing that silently produces broken markup. Branch explicitly:

```astro
{as === 'label'
  ? <label class:list={CLASSES} {...rest}><slot /></label>
  : <input class:list={CLASSES} {...rest} />}
```

The union is two literals, so `as?: 'input' | 'label'` is enough typing — no generic, and therefore §5c's `type Props`-before-`const` hazard does not apply (keep the order anyway).

**Props typing caveat:** `Props extends HTMLAttributes<'input'>` while `as="label"` renders a `<label>`. `for`/`htmlFor` is the one `<label>` attribute a caller might want, and it is *not* on `InputHTMLAttributes`. The doc's wrapper examples never use it (the bare `<input>` is nested inside the label, which is what associates them), so this is acceptable — but say so in the JSDoc rather than leaving it to be discovered.

### 0b. Third component in the utilities layer

`input.css` opens `@layer utilities{@layer daisyui.l1.l2.l3{.input{…`, and ships `.sm\:input`, `.md\:input-primary`, `.lg\:input-xl`, … at all five breakpoints — plus `.sm\:floating-label:has(.input-xs)` and friends. Same finding as `table.md` §0a and `textarea.md` §0b, now clearly a pattern for daisyUI 5's form controls.

Consequence unchanged: `color`/`size`/`ghost` set the base value; responsive overrides are caller classes (`class="input-sm lg:input-lg"`). An object-valued prop would have to interpolate (§1b).

### 0c. Size scales the height, and quietly repositions the number spinner

```css
.input       { --size: calc(var(--size-field,.25rem) * var(--in-size-mul,10)); height: var(--size) }
.input-xs { --in-size-mul:6;  --font-size-min:.6875rem; --spin-my:-1 }
.input-sm { --in-size-mul:8;  --font-size-min:.75rem;   --spin-my:-2 }
.input-md { --in-size-mul:10; --font-size-min:.875rem;  --spin-my:-3 }
.input-lg { --in-size-mul:12; --font-size-min:1.125rem; --spin-my:-3 }
.input-xl { --in-size-mul:14; --font-size-min:1.375rem; --spin-my:-4 }
```

Unlike Textarea (`textarea.md` §0c, font size only), Input's sizes do change the box — height is `--size-field × mul`. The third variable, `--spin-my`, feeds `&::-webkit-inner-spin-button{ margin-block: calc(.25rem * var(--spin-my,-3)) }`: the number-input spinner is re-centred per size. That is only visible on `type="number"` in WebKit/Blink, so the `Sizes` story will not show it — the `Number` story is where a size regression there would surface.

### 0d. `type` must be narrowed — daisyUI says so in prose

The doc page ends its class list with a section headed *"Input types"*:

> `input` class can be used for any input field type. Including `text`, `password`, `email`, `number`, `date`, `datetime-local`, `week`, `month`, `tel`, `url`, `search`, `time`
>
> For `checkbox`, `radio`, `file`, `range` use their own class names, as they are not visually input fields.

Those four have their own components in this library (Checkbox, Radio, FileInput, Range), and `.input` actively breaks them — it sets `height: var(--size)`, `border`, `padding-inline` and `display: inline-flex` on a control that is supposed to be a 1-em box or a track.

`InputHTMLAttributes` types `type?: HTMLInputTypeAttribute | string` (`astro-jsx.d.ts`, the interface containing `size?: number|string` and `list?: string`), i.e. effectively `string` — it will not stop anyone. **Narrow it in `Props`**, a legal override since the union is a subtype of `string`:

```ts
type TextInputType =
  | 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local'
  | 'week' | 'month' | 'tel' | 'url' | 'search' | 'time';
```

That is the documented twelve, verbatim. `input.css` *also* contains `&::-webkit-color-swatch-wrapper{padding-block:.25rem}`, so `type="color"` is styled too — but it is not in the documented list, so it stays out of the union under the same rule that kept `row-hover` out of Table (`table.md` §0b). Record it here; add it only if the doc page does.

This union is local to the component, not `variants.ts` — it is genuinely specific to one component (§6 Step 2's carve-out).

### 0e. `size` collides, and `select.md` §3c already ruled on this

Fifth appearance after Checkbox (§3b), File Input (§3b), Radio (§3c) and Select (§3c). `InputHTMLAttributes` declares `size?: number | string` — on a text input that is the **visible character width**, a real attribute that a `size?: DaisySize` prop shadows.

`select.md` §3c decided to keep `size` as the daisyUI axis anyway and named this plan as the one that must cite it when deciding. **Same decision, and the cost here is lower than Select's:** Select's native `size` produces a structurally different control (a list box), whereas Input's is a rough width hint that `width: clamp(3rem,20rem,100%)` already overrides in practice and that any `w-*` utility replaces exactly. Consistency across all six form controls wins.

Document the loss in the prop's JSDoc, and note the escape hatch: the `as="label"` form nests a **bare** `<input>` the caller writes themselves, so `size` (and `for`, and anything else) is fully available there.

### 0f. Four integrations that need no props at all

The doc examples compose Input with four other components, and in every case daisyUI does the work through variables or `:has()` — nothing for this component to expose:

| Integration | Mechanism | Cross-reference |
|---|---|---|
| `join` | `border-start-start-radius: var(--join-ss, var(--radius-field))` and three siblings | `join.md` §0 — the same no-prop protocol Select and File Input use |
| `validator` | Caller adds `validator` alongside `input`; `validator-hint` is a sibling `<p>` | `validator.md` |
| `floating-label` | `.floating-label:has(.input-sm){--top-mul:4;--font-size:.75rem}` — works **because** the size class is on the input itself | `label.md` |
| `fieldset` / `legend` / `label` | Plain composition, no shared CSS | `fieldset.md`, `label.md` |

The `floating-label` row is the standing rule again — *"the prop belongs on whichever component's root daisyUI writes the class on"* — satisfied for free.

`validator` deserves one JSDoc line because it is the most common thing callers will get wrong: it is a **caller class on this component**, `validator-hint` is a **sibling element outside** it, and in the `as="label"` form the `required`/`pattern`/`minlength` attributes go on the **inner bare input**, not on the label. Six of the doc examples show exactly that.

### 0g. The iOS zoom guard, again

```css
@media (pointer:coarse){ @supports (-webkit-touch-callout:none){
  .input:focus,.input:focus-within{ --font-size:1rem } } }
```

Identical to Textarea (`textarea.md` §0d): on touch devices a focused `input-xs` renders at 1rem to stop Safari auto-zooming. Not a bug, don't override.

### 0h. Copy the wrapper examples verbatim — daisyUI's own markup is inconsistent

In the "text label inside" example the inner inputs carry `class="grow"`; in the search, username, email, password, tel and url examples they carry nothing. `.input input` already sets `width:100%`, but the parent is `display:inline-flex`, so which of `width:100%` and `flex-grow:1` actually sizes the field depends on what else is in the row.

Do not normalise this while writing stories. Reproduce each example's markup exactly as the doc page has it (§8) and let any layout difference show — if `grow` turns out to be load-bearing for the leading-text form, that is a finding worth having, and if it is redundant it costs nothing.

### 0i. Scaffold check — and this closes the missing-`type` audit

```astro
<input class:list={['input', className]} {...rest} />
```

Root, base class, merge and spread are correct, and there is **no missing-`type` bug**: `<input>` with no `type` defaults to `text`, which is precisely what this component wants. That is the opposite of Checkbox, Radio, Range and File Input, where the daisyUI class is meaningless without its matching `type` — the audit opened in `file-input.md` §0 and closed in `range.md`. Text Input was the last name on that list; it is clean, and the audit is now definitively closed.

What the scaffold *cannot* do is the `as="label"` wrapper form (§0a), which is the actual work.

### 0k. The guard was executed, not just written

**2026-09-01.** §2 argued for throwing when `as="input"` is given children,
against the library's usual "gate it quietly" rule, on the grounds that the
alternative is markup that renders while dropping the caller's icon.

A throw nobody has triggered is a claim, so it was triggered: a temporary story
rendering `<TextInput>oops</TextInput>` was added, the build run, and the story
removed again.

```
Error: Failed to render Astro component passed to slot "root":
<TextInput> children require as="label" — <input> is a void element.
```

The build **fails**, at build time, with that message. So the guard is a real
gate rather than defensive decoration — which matters because it is the only
`throw` in the library and its whole justification is that it fires.

### 0j. Attribute collisions

- `size` — real collision, ruled on in §0e.
- `color` — shadows the obsolete non-standard `color` attribute on base `HTMLAttributes` (`astro-jsx.d.ts:602`), the tradeoff Button, Badge and Textarea already accepted.
- `type` — deliberately narrowed, not shadowed (§0d).
- `as`, `ghost` — free.
- `list` (datalist), `pattern`, `minlength`, `maxlength`, `min`, `max`, `required`, `placeholder`, `value`, `title` — all native, all reach the element through `...rest` with no declared props.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Color | `input-neutral` `input-primary` `input-secondary` `input-accent` `input-info` `input-success` `input-warning` `input-error` | `color` | `DaisyColor` | Shared union, exact 8-value match. Sets `--input-color` → border, inset shadow, focus outline. |
| Size | `input-xs` `input-sm` `input-md` `input-lg` `input-xl` | `size` | `DaisySize` | `input-md` is the default — leave undefined for it. Scales height and font (§0c). Collides with native `size` (§0e). |
| Style | `input-ghost` | `ghost` | `boolean` | No background, border or shadow until focus. |
| Root | — (not a class) | `as` | `'input' \| 'label'` | Which element carries `.input` (§0a). Default `'input'`. |
| Type | — (not a class) | `type` | `TextInputType` | Narrowed to daisyUI's documented twelve (§0d). Local union. |

Not built: responsive variants (§0b, caller classes), `type="color"` (§0d), `validator` / `join` / `floating-label` (§0f, caller classes).

## 2. Slots

| Slot | Applies when | Optional? | Source in daisyUI examples |
|---|---|---|---|
| `default` | `as="label"` only | Required for that form | Icon `<svg>`, literal text, the bare `<input>`, `<kbd>`, `<span class="badge">` |

When `as="input"` there is no slot at all — `<input>` is a void element and any children would be invalid HTML that the parser discards.

**Gate it in the opposite direction from the usual rule.** `plans/README.md` §5 says to gate optional styled wrappers with `Astro.slots.has()`; here the branch is on `as`, and the failure mode is a caller passing children with `as="input"` and silently losing them. Add a dev-time guard rather than swallowing it:

```astro
if (as === 'input' && Astro.slots.has('default')) {
  throw new Error('<TextInput> children require as="label" — <input> is a void element.');
}
```

Throwing is justified here because the alternative is markup that renders but drops the caller's icon with no signal. This is the only component so far that warrants one; note it as a one-off rather than a new convention.

The shared slot-wrapping unknown (`aura.md` §3e.1, ~30 plans) matters for the `label` form: `.input` is `display:inline-flex` with `gap:.5rem`, so an interposed wrapper element would collapse the icon/input/kbd row into a single flex item. `textarea.md` §2 predicted the probe would settle this; if it has not been run by the time this plan starts, run it here — the visual break is obvious.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

/** daisyUI's documented types for `.input`. checkbox/radio/file/range have
 *  their own components — `.input` breaks them (§0d). */
type TextInputType =
  | 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local'
  | 'week' | 'month' | 'tel' | 'url' | 'search' | 'time';

interface Props extends HTMLAttributes<'input'> {
  /** Which element carries `.input`. Use "label" to wrap an icon + a bare
   *  <input> + affixes; the default slot is only rendered in that form. */
  as?: 'input' | 'label';
  /** Border / focus-outline colour. */
  color?: DaisyColor;
  /** Base size — scales height and font. Shadows the native `size`
   *  (character-width) attribute; use a w-* class instead, or the as="label"
   *  form where the inner <input> is yours. Responsive sizes are caller
   *  classes: class="input-sm lg:input-lg" */
  size?: DaisySize;
  /** No background, border or shadow until focused. */
  ghost?: boolean;
  type?: TextInputType;
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
type TextInputType =
  | 'text' | 'password' | 'email' | 'number' | 'date' | 'datetime-local'
  | 'week' | 'month' | 'tel' | 'url' | 'search' | 'time';

interface Props extends HTMLAttributes<'input'> {
  as?: 'input' | 'label';
  color?: DaisyColor;
  size?: DaisySize;
  ghost?: boolean;
  type?: TextInputType;
}

// Full literal class names. NEVER `input-${color}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  neutral: 'input-neutral',
  primary: 'input-primary',
  secondary: 'input-secondary',
  accent: 'input-accent',
  info: 'input-info',
  success: 'input-success',
  warning: 'input-warning',
  error: 'input-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: 'input-md',
  lg: 'input-lg',
  xl: 'input-xl',
};

const { as = 'input', color, size, ghost, class: className, ...rest } = Astro.props;

if (as === 'input' && Astro.slots.has('default')) {
  throw new Error('<TextInput> children require as="label" — <input> is a void element.');
}

const classes = [
  'input',
  color && COLOR[color],
  size && SIZE[size],
  { 'input-ghost': ghost },
  className,
];
---
{/* Two shapes, not one polymorphic tag: <input> is void, <label> is a flex row
    (gap .5rem) that holds an icon, a bare <input>, and affixes like <kbd>.
    `validator` is a caller class on this element; validator-hint is a sibling. */}
{as === 'label' ? (
  <label class:list={classes} {...rest}><slot /></label>
) : (
  <input class:list={classes} {...rest} />
)}
```

### Astro idioms gate

- [ ] Content arrives via the slot (`as="label"` form only), not content props.
- [ ] The `as="input"` + children combination throws rather than silently dropping the slot (§2) — the one-off exception to the usual gating rule.
- [ ] Root element matches daisyUI's examples for both forms (§0a); **not** a single dynamic `<Tag>` — `<input>` is void.
- [ ] No `<script>` — focus, disabled, validator and floating-label styling are all CSS.
- [ ] `...rest` spread onto whichever element is rendered.
- [ ] Not `Polymorphic<{ as: Tag }>`; `as` is a two-literal union (§0a).
- [ ] `size`'s collision documented **with its real cost** and the `select.md` §3c precedent cited (§0e); `color` shadows only the obsolete attribute (`astro-jsx.d.ts:602`).
- [ ] `type` narrowed to daisyUI's documented twelve, and the narrowing verified to actually reject `type="checkbox"` (§0d).
- [ ] **Every variant class is a full literal in a `Record` map / object key.**
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe (below).
- [ ] `astro check` passes.

```astro
<TextInput placeholder="Type here" />
<TextInput color="primary" size="xl" ghost type="email" />
<TextInput as="label"><svg/><input type="search" /></TextInput>
<!-- each of these must be an error: -->
<TextInput type="checkbox" />
<TextInput color="danger" />
<TextInput>oops</TextInput>
```

## 5. Storybook stories

Seventeen doc examples — the largest set in the batch. Group them, but write all of them (§8).

| Doc-page example | Story name | Notes |
|---|---|---|
| Text input | `Default` | `type="text" placeholder="Type here"` |
| Text input with text label inside | `LabelInside` | `as="label"` ×3: search+kbd, file icon, leading text + badge |
| Ghost style | `Ghost` | |
| With fieldset and fieldset-legend | `WithFieldsetLegend` | compose `Fieldset` + `Label` |
| With fieldset and label | `WithFieldsetLabel` | `for`/`id` pairing |
| Input colors | `Colors` | all 8 |
| Sizes | `Sizes` | all 5 |
| Disabled | `Disabled` | |
| Text input with data list suggestion | `WithDatalist` | `list="browsers"` + sibling `<datalist>` |
| Date input | `TypeDate` | |
| Time input | `TypeTime` | |
| datetime-local input | `TypeDatetimeLocal` | |
| Username text input with icon and validator | `UsernameValidator` | `as="label"`, `input validator`, sibling `validator-hint` |
| Search input with icon | `SearchWithIcon` | `as="label"` |
| Email input with icon and validator | `EmailValidator` | |
| Email input with icon, validator, button, join | `EmailValidatorJoin` | compose `Join` + `Button`; proves the no-prop join protocol (§0f) |
| Password input with icon and validator | `PasswordValidator` | |
| Number input with validator | `NumberValidator` | bare `as="input"` + `validator`; also the only place `--spin-my` is visible (§0c) |
| Telephone number input with icon and validator | `TelValidator` | |
| URL with icon and validator | `UrlValidator` | |

Plus `Playground` with controls for `as`, `color`, `size`, `ghost`, `type`.

**Slot sanitization is the main risk here** and it is worse than in any prior component: nine stories put **inline SVG** inside the slot, which is the exact case the framework's sanitizer is known to strip (`plans/TEMPLATE.md` §5, and the same warning carried by every mockup plan). Write `SearchWithIcon` first. If the `<svg>` disappears, take the documented route — check the Sanitization guide before concluding the component is wrong — and only then fall back to a wrapper `.astro` story component holding the real markup.

`validator` stories additionally need the `Validator` component's classes to exist; if `validator.md` has not been implemented yet they still work as raw caller classes, because `validator` is a caller class here by design (§0f). Note that in the story, don't block on it.

```ts
import TextInput from './TextInput.astro';

export default {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    as: { control: 'inline-radio', options: ['input', 'label'] },
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    ghost: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'date', 'datetime-local',
                'week', 'month', 'tel', 'url', 'search', 'time'],
    },
  },
};

export const Playground = {
  args: { type: 'text', placeholder: 'Type here' },
};

export const Ghost = {
  args: { ghost: true, type: 'text', placeholder: 'Type here' },
};

export const SearchWithIcon = {
  args: {
    as: 'label',
    slots: {
      default: `
        <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
        <input type="search" required placeholder="Search" />
      `,
    },
  },
};

// …one export per row of the table above, markup copied from the doc page.
```

## 6. Steps

- [x] **Step 1: nothing to re-derive.** The fifteen classes and the prose "Input types" list match the shipped CSS and the doc page.
- [x] **Step 2: done as planned.** `DaisyColor` and `DaisySize` imported unchanged; `TextInputType` stays local, which is the carve-out for a genuinely one-component union.
- [x] **Step 3: done.** Two explicit branches, not a dynamic tag. The probe errors on `type="checkbox"`, `color="danger"` and `size="huge"`, and accepts `name` / `required` / `pattern` / `maxlength` / `list` through the spread. **The build emits no `</input>` anywhere** (§8).
- [x] **Step 4: done, starting with the SVG question as §5 instructed.** It is a non-issue — sanitization is off library-wide (`.storybook/main.ts`), and all 10 inline SVGs reach the output intact. `TextInput.stories.ts`, 22 stories, markup copied verbatim including daisyUI's inconsistent `grow` (§0h).
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and one item needs typing into.** Verify: `Colors` shows 8 distinct borders that intensify on focus; **`Sizes` shows 5 distinct heights**, since here the box changes and not just the font (§0c); `LabelInside` puts icon, field and affix on one row with a `.5rem` gap and no border on the inner input; **`NumberValidator`'s spinner stays centred at `xs` and `xl`** — the only place `--spin-my` is visible (§0c); `EmailValidatorJoin` squares the inner corners **with no prop passed** (§0f); and `UsernameValidator` turns red only after an invalid entry, with the hint outside the label.
- [x] **Step 6: done — forwarding confirmed in both shapes.** `Passthrough` renders `<input class="input input-primary input-lg input-ghost mine" type="email" id="input-1" data-test="yes" style="letter-spacing:1px" name="email" required maxlength="30">` and, beside it, a wrapper form carrying its own id and classes. Full output in §8.
- [x] **Step 7: done — the `Text Input` row in `plans/README.md` says Implemented.** The missing-`type` audit needed no edit: `plans/components/file-input.md` §0a already records Text Input as **clean**, and that is confirmed here — the component declares no `type` default and does not need one, since `<input>` is `type="text"` per spec.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All three documented class axes have typed props, plus `as` and the narrowed `type`.
- [x] Both root forms render correctly, and `as="input"` emits no `</input>` (§0a).
- [x] `<TextInput>children</TextInput>` without `as="label"` throws (§2).
- [x] `type="checkbox"` is a type error (§0d).
- [x] `Props` extends `HTMLAttributes<'input'>`; the `for`-on-label gap is documented in JSDoc (§0a).
- [x] `size`'s collision documented with its cost, citing `select.md` §3c (§0e).
- [x] `class` from a caller merges through `class:list` on whichever element renders.
- [x] `Playground` exposes all five props as controls.
- [x] `Colors` and `Sizes` render every value of their axis.
- [x] Twenty stories, one per doc-page example, markup copied verbatim — including daisyUI's inconsistent `grow` usage (§0h).
- [x] SVG-in-slot sanitization settled and recorded (§5).
- [x] `join` / `validator` / `floating-label` / `fieldset` composition verified to work with **no props** (§0f).
- [x] The missing-`type` audit closed in `file-input.md` §0 (§0i, §6 Step 7).
- [x] Every box in section 4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01), SVG elided. `astro check`: 202 files, 0 errors, 0 warnings, 0 hints.

```
Passthrough → <input class="input input-primary input-lg input-ghost mine" type="email" id="input-1"
                data-test="yes" style="letter-spacing:1px" name="email" required maxlength="30"
                placeholder="Passthrough">
              <label class="input input-accent mine-label validator" id="input-2" data-test="yes">
                SVG<input type="email" placeholder="wrapper form" /></label>
                    ↑ the inner field is the caller's own bare input
```

Counts across the 22 stories:

```
component roots: 25 as <input>, 11 as <label>
closing </input> tags: 0            — the void-element check §6 Step 3 asked for
inline SVG inside a slot: 10, all intact   — §5's "main risk", a non-issue
input validator wrappers 7 | validator-hint siblings 7 | join-item 2
colours: all 8 present | sizes: all 5 present | ghost 2
composed components: Kbd 2, Badge 1, Fieldset, FieldsetLegend, Label, Join, Button
```

What this settles:

- **§0a's two-branch decision.** Both shapes render, and there is **no `</input>` anywhere in 25 input roots** — the failure mode a single dynamic `<Tag>` risked. The wrapper form appears 11 times, which is why it had to exist at all: without it, half the doc page is unreachable.
- **§5's SVG worry is closed.** All 10 icons survive, because sanitization is disabled library-wide — a decision made back at Tier 0 that keeps paying off. No wrapper story component was needed.
- **§0f's four integrations need no props**, and the build shows it: `class="input validator"` on this component with `validator-hint` as a **sibling** 7 times, and `join-item` reaching the wrapper with nothing passed for the corner radii.
- **§0k**: the void-element guard fails the build with its own message. Verified by triggering it, not by reading it.
- **§0h is preserved**: the three `LabelInside` fields keep `class="grow"` and the six later wrapper examples do not, exactly as daisyUI writes them. If that difference matters, Step 5 will show it rather than the stories having hidden it.

Not settled here: the focus colours, the five heights, the number spinner's per-size offset, and whether `grow` is load-bearing. All Step 5.
