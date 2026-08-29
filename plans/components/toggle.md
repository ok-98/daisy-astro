# Toggle Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/toggle/
**Root element:** `input` (`type="checkbox"`) — **or** `label` (see §0b)
**Target file:** `packages/daisy-astro/src/components/Toggle/Toggle.astro`
**Story file:** `packages/daisy-astro/src/components/Toggle/Toggle.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'input'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions (`DaisyColor`, `DaisySize`) come from `packages/daisy-astro/src/lib/variants.ts` — import as `../../lib/variants`.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/toggle.css` and the doc page's `classnames` frontmatter. Both agree on **fourteen** classes:

```
.toggle
.toggle-neutral .toggle-primary .toggle-secondary .toggle-accent
.toggle-info .toggle-success .toggle-warning .toggle-error
.toggle-xs .toggle-sm .toggle-md .toggle-lg .toggle-xl
```

Colour is exactly `DaisyColor`, size is exactly `DaisySize`, and there is **no style axis** — no `toggle-ghost`, no outline. Eight doc examples.

### 0a. Missing `type` — and the corrected audit criterion catches it immediately

```astro
<input class:list={['toggle', className]} {...rest} />
```

The frontmatter says *"For `<input type="checkbox">`"*, and the CSS is stricter than that phrasing suggests — **the size classes select on the attribute**:

```css
.toggle-xs[type=checkbox], .toggle-xs:has([type=checkbox]) { --size: calc(var(--size-selector,.25rem) * 4) }
.toggle-md[type=checkbox], .toggle-md:has([type=checkbox]) { --size: calc(var(--size-selector,.25rem) * 6) }
.toggle-xl[type=checkbox], .toggle-xl:has([type=checkbox]) { --size: calc(var(--size-selector,.25rem) * 8) }
```

Without `type="checkbox"` the base `.toggle` still renders a pill, but **every size class silently does nothing** — and the checked state (`.toggle:checked`, `.toggle:has(>input:checked)`) never fires either.

This is the missing-`type` defect for the **eighth** time, and it lands exactly where `theme-controller.md` §0b predicted. That plan reopened the audit `file-input.md` §0 had closed and restated its criterion as:

> every component whose CSS matches on `:checked`, `:indeterminate`, or an `[type=…]` attribute

Toggle matches on all three. The corrected criterion found it one plan later, which is the evidence that the criterion is the right one. Add Toggle to `file-input.md` §0's list (§6 Step 7).

**Decision:** render `type="checkbox"` explicitly. Unlike Text Input (`text-input.md` §0d), where a narrowed union of twelve types was the right answer, Toggle has exactly one legal type — so it is a fixed attribute, not a prop. A caller who passes `type` through `...rest` would override it and break the component; that is acceptable (they asked for it) and not worth guarding.

### 0b. The class goes on the input **or** on a wrapping `<label>` — second documented dual form

The doc's seventh example carries its own sub-heading:

> #### Use toggle class for a label, put a checkbox and 2 icons inside it.

```html
<label class="toggle text-base-content">
  <input type="checkbox" />
  <svg aria-label="enabled" …/>
  <svg aria-label="disabled" …/>
</label>
```

and the CSS supports it throughout: `.toggle:has([type=checkbox])`, `.toggle > *`, `.toggle:has(>input:checked)`, `.toggle:has(:focus-visible)`.

Same shape as Text Input (`text-input.md` §0a) and the same resolution: `as?: 'input' | 'label'`, defaulting to `'input'`, with an **explicit branch** rather than `Polymorphic<{ as: Tag }>` — `<input>` is void, `<label>` is a container whose whole point is the slot.

`text-input.md` also settled the accompanying details, which carry over unchanged:
- `Props extends HTMLAttributes<'input'>` even when a `<label>` renders; `for` is unavailable in that form, and no doc example needs it because the input is nested inside.
- Children passed with `as="input"` throw rather than silently disappearing (§2).

One difference worth flagging: Text Input's wrapper form is the *majority* of its examples, while Toggle's is one of eight. `as="input"` is genuinely the common case here.

### 0c. In the label form the children are positional, and daisyUI's own labels look inverted

```css
.toggle > *:nth-child(2) { color: var(--color-base-100); rotate: 0deg }
.toggle > *:nth-child(3) { color: var(--color-base-100); opacity: 0; rotate: -15deg }
.toggle:has(:checked) > *:nth-child(2) { opacity: 0; rotate: 15deg }
.toggle:has(:checked) > *:nth-child(3) { opacity: 1; rotate: 0deg }
```

The `<input>` is child 1, so **child 2 is the first icon and child 3 the second**. Child 2 is visible while unchecked and rotates out when checked; child 3 does the reverse.

daisyUI's example puts `aria-label="enabled"` (a checkmark) on child 2 and `aria-label="disabled"` (an X) on child 3 — which by the rules above means the **checkmark shows while the toggle is off**. That reads backwards.

**Do not "fix" it.** Reproduce the doc markup verbatim (§8) and make it an explicit verification step (§6 Step 5): observe which icon is visible in each state and record the answer in this plan. Either the CSS ordering is what it looks like and daisyUI's example is mislabelled, or something in the cascade flips it. Asserting either without looking is exactly the failure this workflow exists to avoid.

Whatever the outcome, the JSDoc must state the positional contract — *first icon = one state, second icon = the other* — because a caller who adds a third icon or reorders them gets silent breakage.

### 0d. Colour only applies while checked

```css
.toggle-primary:checked, .toggle-primary[aria-checked=true] { --input-color: var(--color-primary) }
… one per colour, all gated the same way …
```

Every colour class is `:checked`-only. An unchecked `toggle-primary` is visually identical to an unchecked `toggle-error` — both fall back to `.toggle`'s `--input-color: color-mix(in oklab, var(--color-base-content) 50%, #0000)`.

That is why the doc's Colors example writes `checked="checked"` on **all eight** inputs. The `Colors` story must do the same, or it renders eight identical grey pills and proves nothing.

Two related notes:
- `[aria-checked=true]` is honoured alongside `:checked` in every colour rule and in the base checked rule. That supports a `role="switch"` implementation driven by ARIA rather than the checkbox state. It is **not** in the frontmatter — same treatment as `row-hover` (`table.md` §0b): recorded, not built.
- The custom-colours example (`border-indigo-600 bg-indigo-500 checked:bg-orange-400 …`) is entirely caller classes and needs no props.

### 0e. `indeterminate` cannot be set declaratively — it is a DOM property

```css
.toggle:indeterminate { grid-template-columns: .5fr 1fr .5fr }   /* knob centred */
```

daisyUI's own example says so outright:

```html
<!-- You can make a checkbox indeterminate using JS -->
<script>document.getElementById("my-toggle").indeterminate = true</script>
<input type="checkbox" class="$$toggle" id="my-toggle" />
```

`indeterminate` has **0 occurrences anywhere in `astro-jsx.d.ts`** — verified. There is no attribute; there is only the IDL property. So:

- **No `indeterminate` prop.** A prop would have to emit a `<script>`, and `plans/README.md` §6 forbids adding script for what daisyUI does not itself script — and here daisyUI explicitly hands the job to the caller.
- The `Indeterminate` story needs the property set from the story side (a play function, or a story-local script), not from the component. Note the §6 rule that a bundled component script would run once per page while a page may hold many toggles — another reason this belongs to the caller.

### 0f. Sixth utilities-layer component with breakpoint copies

`toggle.css` opens `@layer utilities{@layer daisyui.l1.l2.l3{.toggle{…` and emits `.sm\:toggle-xl:has([type=checkbox])` and the rest at all five breakpoints. Sixth after Table, Textarea, Text Input, Timeline and Toast.

No doc example uses them, so — as with Toast (`toast.md` §0d) — one JSDoc line, no story: responsive size or colour is a caller class (`class="toggle-sm lg:toggle-lg"`).

### 0g. Attribute collisions

- `color` — shadows the obsolete non-standard `color` attribute on base `HTMLAttributes` (`astro-jsx.d.ts:602`), accepted by Button, Badge, Textarea and Text Input already.
- `size` — collides with `InputHTMLAttributes`' `size?: number | string`, for the **sixth** time (Checkbox §3b, File Input §3b, Radio §3c, Select §3c, Text Input §0e). Cost here is the lowest of the six: `size` is meaningless on a checkbox in the first place. Keep the daisyUI axis, per `checkbox.md` §3b's original call.
- `as` — free.
- `type` — not a prop; fixed to `checkbox` (§0a).
- `checked`, `disabled`, `name`, `value`, `aria-checked` — native, all through `...rest`.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Color | `toggle-neutral` `toggle-primary` `toggle-secondary` `toggle-accent` `toggle-info` `toggle-success` `toggle-warning` `toggle-error` | `color` | `DaisyColor` | Shared union, exact 8-value match. **Only visible while checked** (§0d). |
| Size | `toggle-xs` `toggle-sm` `toggle-md` `toggle-lg` `toggle-xl` | `size` | `DaisySize` | `toggle-md` is the default — leave undefined for it. Sets `--size` as a multiple of `--size-selector` (xs = ×4 … xl = ×8). Requires `type="checkbox"` to match (§0a). |
| Root | — (not a class) | `as` | `'input' \| 'label'` | Which element carries `.toggle` (§0b). Default `'input'`. |

No style axis exists. Not built: `indeterminate` (§0e), `[aria-checked]` support (§0d), responsive variants (§0f).

## 2. Slots

| Slot | Applies when | Optional? | Source in daisyUI examples |
|---|---|---|---|
| `default` | `as="label"` only | Required for that form | A bare `<input type="checkbox">` followed by exactly two icons |

When `as="input"` there is no slot — `<input>` is void.

Apply the guard `text-input.md` §2 introduced, for the identical reason:

```astro
if (as === 'input' && Astro.slots.has('default')) {
  throw new Error('<Toggle> children require as="label" — <input> is a void element.');
}
```

**Direct-child dependency, and it is sharper than usual.** `.toggle > *:nth-child(2)` and `:nth-child(3)` address the icons *by index* (§0c). An interposed wrapper does not merely shift the count — it collapses all three children into one, and neither icon ever animates. Shared unknown from `aura.md` §3e.1; `timeline.md` §2 and `toast.md` §2 both queue the same probe. If it is still open, the `IconsInside` story is a good place to settle it, since the failure is immediately visible.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

interface Props extends HTMLAttributes<'input'> {
  /** Which element carries `.toggle`. Use "label" to wrap a bare checkbox plus
   *  exactly two icons; the default slot is only rendered in that form, and the
   *  icons are addressed by position — first icon is one state, second is the
   *  other. */
  as?: 'input' | 'label';
  /** Knob/track colour. Only visible while the toggle is checked. */
  color?: DaisyColor;
  /** Base size. Shadows the native `size` attribute, which is meaningless on a
   *  checkbox. Responsive sizes are caller classes: class="toggle-sm lg:toggle-lg" */
  size?: DaisySize;
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
interface Props extends HTMLAttributes<'input'> {
  as?: 'input' | 'label';
  color?: DaisyColor;
  size?: DaisySize;
}

// Full literal class names. NEVER `toggle-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  neutral: 'toggle-neutral',
  primary: 'toggle-primary',
  secondary: 'toggle-secondary',
  accent: 'toggle-accent',
  info: 'toggle-info',
  success: 'toggle-success',
  warning: 'toggle-warning',
  error: 'toggle-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'toggle-xs',
  sm: 'toggle-sm',
  md: 'toggle-md',
  lg: 'toggle-lg',
  xl: 'toggle-xl',
};

const { as = 'input', color, size, class: className, ...rest } = Astro.props;

if (as === 'input' && Astro.slots.has('default')) {
  throw new Error('<Toggle> children require as="label" — <input> is a void element.');
}

const classes = [
  'toggle',
  color && COLOR[color],
  size && SIZE[size],
  className,
];
---
{/* type="checkbox" is not optional: the size classes select `[type=checkbox]`
    and the checked state selects `:checked`, so without it the sizes silently
    do nothing. Colours only show while checked. `indeterminate` is a DOM
    property with no attribute — set it from your own script. */}
{as === 'label' ? (
  <label class:list={classes} {...rest}><slot /></label>
) : (
  <input type="checkbox" class:list={classes} {...rest} />
)}
```

### Astro idioms gate

- [ ] Content arrives via the slot (`as="label"` form only), not content props.
- [ ] `as="input"` + children throws rather than silently dropping the slot (§2).
- [ ] Root element matches daisyUI's examples for both forms (§0b); **not** a single dynamic `<Tag>` — `<input>` is void.
- [ ] `type="checkbox"` rendered explicitly (§0a).
- [ ] **No `<script>`** — the switch is a native checkbox styled with CSS. `indeterminate` is explicitly the caller's script (§0e).
- [ ] `...rest` spread onto whichever element renders, so `checked`, `disabled`, `name`, `value`, `aria-checked` need no declared props.
- [ ] Not `Polymorphic<{ as: Tag }>`; `as` is a two-literal union.
- [ ] `color` shadows only the obsolete attribute (`astro-jsx.d.ts:602`); `size`'s collision is the sixth and cheapest (§0g).
- [ ] **Every variant class is a full literal in a `Record` map.**
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe (below).
- [ ] `astro check` passes.

```astro
<Toggle checked />
<Toggle color="primary" size="xl" checked />
<Toggle as="label" class="text-base-content"><input type="checkbox" /><svg/><svg/></Toggle>
<!-- each of these must be an error: -->
<Toggle color="danger" />
<Toggle>oops</Toggle>
```

## 5. Storybook stories

| Doc-page example | Story name | Props / slots |
|---|---|---|
| Toggle (switch) | `Default` | `checked` |
| With fieldset and label | `WithFieldset` | compose `Fieldset` + `Label`; "Remember me" |
| Sizes | `Sizes` | all 5, each `checked` |
| Colors | `Colors` | all 8, each `checked` — **required**, see §0d |
| Disabled | `Disabled` | two: `disabled`, and `disabled checked` |
| Indeterminate | `Indeterminate` | property set from the story side (§0e) |
| Toggle with icons inside | `IconsInside` | `as="label" class="text-base-content"` + bare checkbox + two `<svg>` |
| Toggle with custom colors | `CustomColors` | the doc's Tailwind classes, verbatim |

Plus `Playground` with `as`, `color`, `size`, `checked` and `class` controls.

Four story-writing notes:

- **`Colors` and `Sizes` must render every input `checked`** (§0d). This is not cosmetic: unchecked, all eight colours are the same grey, and a reviewer would reasonably conclude the colour prop is broken.
- **`IconsInside` is the sanitization canary.** Same inline-SVG risk as `text-input.md` §5 and `theme-controller.md` §5 — and here the icons are addressed by `:nth-child`, so a sanitizer that drops one silently reindexes the other. Write this story first.
- **`Indeterminate` needs the property set after render.** A play function is the clean route; a story-local `<script>` also works. Do not add anything to the component.
- **Record the icon-order finding** (§0c) in this story's description once observed: state plainly which icon is visible when unchecked.

```ts
import Toggle from './Toggle.astro';

export default {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    as: { control: 'inline-radio', options: ['input', 'label'] },
    color: {
      control: 'select',
      options: [undefined, 'neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    checked: { control: 'boolean' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { checked: true },
};

export const CustomColors = {
  args: {
    checked: true,
    class: 'border-indigo-600 bg-indigo-500 checked:border-orange-500 checked:bg-orange-400 checked:text-orange-800',
  },
};

// …one export per row of the table above, markup copied from the doc page.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled from the shipped CSS and the doc frontmatter — fourteen classes, eight examples. Nothing to re-derive.
- [ ] **Step 2:** No new union; `DaisyColor` and `DaisySize` match exactly. The two-literal `as` union stays local.
- [ ] **Step 3:** Rewrite `Toggle.astro` per section 4 and run the probe. Confirm in the built HTML that `type="checkbox"` is present in the `as="input"` form and that the `as="label"` form emits no `</input>` of its own.
- [ ] **Step 4:** Write `Toggle.stories.ts`, starting with `IconsInside` to settle SVG sanitization.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Toggle`, verify:
  - `Sizes` shows five visibly different pill widths — this is the direct test that `type="checkbox"` is present (§0a). If all five look identical, the attribute is missing.
  - `Colors` shows eight distinct checked colours, and toggling one off returns it to grey (§0d).
  - `IconsInside` swaps the two icons on toggle. **Record which icon is visible when unchecked** and write the answer into §0c and the story description (§0c).
  - `Indeterminate` centres the knob rather than parking it at either end (§0e).
  - `Disabled` shows both states at 30% opacity with a hollow knob.
  - `CustomColors` overrides both the unchecked and checked appearance from caller classes alone.
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class`, plus `name`, `value`, `disabled` and `aria-checked`. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<(input|label)[^>]*toggle[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Update `plans/README.md`'s Toggle row to **Implemented**, and add **Toggle** to the reopened missing-`type` audit list in `file-input.md` §0 as its eighth finding — noting that `theme-controller.md` §0b's corrected criterion is what caught it (§0a).
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] `type="checkbox"` rendered explicitly, verified by the `Sizes` story actually differing (§0a).
- [ ] Both root forms render correctly, and `as="input"` emits no `</input>` (§0b).
- [ ] `<Toggle>children</Toggle>` without `as="label"` throws (§2).
- [ ] All 8 colours and all 5 sizes have typed props from the shared unions.
- [ ] `Colors` and `Sizes` stories render every input `checked` (§0d).
- [ ] The icon-order question resolved by observation and written down (§0c).
- [ ] No `indeterminate` prop and no component script; the story sets the DOM property itself (§0e).
- [ ] `[aria-checked=true]` support recorded as undocumented and not built (§0d).
- [ ] `Props` extends `HTMLAttributes<'input'>`; `class` merges through `class:list` on whichever element renders.
- [ ] `Playground` exposes `as`, `color`, `size`, `checked` and `class`.
- [ ] Eight doc-example stories, markup copied verbatim including the icon order.
- [ ] Toggle added to `file-input.md` §0's reopened audit (§6 Step 7).
- [ ] Every box in section 4's Astro idioms gate ticked.
