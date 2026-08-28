# Checkbox Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/checkbox/
**Root element:** `input` (void — no slot, see §2)
**Target file:** `packages/daisy-astro/src/components/Checkbox/Checkbox.astro` (currently a scaffold with a real bug — §0)
**Story file:** `packages/daisy-astro/src/components/Checkbox/Checkbox.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'input'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Checkbox uses both `DaisyColor` and `DaisySize`, unchanged** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/checkbox.css`), the doc page source (`packages/docs/src/routes/(routes)/components/checkbox/+page.md` in `saadeghi/daisyui`), and `astro@7.2.4`'s `astro-jsx.d.ts`. §3f lists what is **unverified**.

---

## 0. The scaffold renders a text input

```astro
<input class:list={['checkbox', className]} {...rest} />
```

No `type`. An `<input>` with no `type` attribute is `type="text"` per the HTML spec, so the scaffold produces a **text field wearing a checkbox's styling** — `.checkbox` sets `appearance:none`, a fixed square `--size`, and draws its own tick with a `:before` clip-path **[verified]**, so it *looks* like an unchecked checkbox, accepts typing, and never checks.

`type` is the one attribute this component cannot leave to `...rest` (§3a). Every other axis here is routine — Checkbox has the same colour/size shape as Badge — so the plan is short, and §3 is the part worth reading.

## 1. Variant audit

**14 classes: 1 base + 8 colour + 5 size**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.checkbox[a-z0-9-]*' checkbox.css | sort -u` returns exactly those 14 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `checkbox` | — | — | Always applied. |
| Colour | `checkbox-primary` `-secondary` `-accent` `-neutral` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. Each sets `--input-color` and `color` **[verified]**; see §3e. |
| Size | `checkbox-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Each sets `--size` and `padding` **[verified]**. `md` is the default and still emittable. **Collides with a native attribute — §3b.** |

**No style axis.** There is no `checkbox-outline`, no `checkbox-soft`, no `checkbox-ghost` **[verified]** — unlike Badge and Button. And **no disabled class**: `.checkbox:disabled` styles the native attribute directly **[verified]**, so there is nothing to expose. See §3d.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

**None.** `<input>` is a void element: it cannot have children, so there is no default slot and no named slots.

This is the first component in the library with no slot at all, which makes it the first exception to `plans/README.md` §5's "content always comes in through slots". The rule still holds in spirit — there is simply no content. A naive `<input class="checkbox"><slot /></input>` is invalid HTML; Astro will not save you from it.

The label text is a **sibling**, not a child, and lives in a different daisyUI component:

```html
<label class="label">
  <input type="checkbox" checked class="checkbox" />
  Remember me
</label>
```

So there is **no `label` prop and no wrapping `<label>`**. Wrapping would break the sizes/colours examples (bare inputs, no label) and would duplicate the Label component. `plans/components/label.md` and `plans/components/fieldset.md` are both "Not started"; the composition story (§5) uses raw markup until they exist, and this plan should be cross-referenced from both.

## 3. Six things the naive implementation gets wrong

### 3a. `type="checkbox"` must be emitted, and it arrives in `...rest`

`type` is declared on `InputHTMLAttributes` (`astro-jsx.d.ts`, `type?: HTMLInputTypeAttribute`) **[verified]**, so it is part of the spread and not something the component sees unless it destructures it.

Destructure with a default — the mechanism `plans/components/alert.md` §3b established for `role`:

```ts
const { type = 'checkbox', … , ...rest } = Astro.props;
```

Deterministic, and it leaves the override working. Not hardcoded next to the spread, because duplicate-attribute precedence in Astro is unverified and there is no reason to depend on it either way.

**Why leave it overridable at all**, given `type="radio"` on a `.checkbox` is wrong: Radio is its own daisyUI component with its own class, and the JSDoc says so. Silently ignoring a caller's `type` would be worse than letting them be wrong on purpose.

### 3b. `size` genuinely collides here — and this is the precedent for Text Input

`plans/components/button.md` §3a flagged that `size` is a real HTML attribute "on some elements" and kept the name because Button's default root is `<button>`, where it does not exist. **Checkbox's root is `<input>`, where it does** — `size?: number | string` on `InputHTMLAttributes` **[verified]**. So the variant prop shadows the native attribute and a caller's `size={40}` becomes `checkbox-40`… except it can't, because the prop is typed `DaisySize`, so it is a type error instead. The native attribute is simply unreachable.

**Keep the name.** Per the HTML spec `size` applies only to `text`, `search`, `tel`, `url`, `email` and `password` inputs — browsers ignore it on a checkbox. Nothing real is lost, and renaming would make Checkbox the odd one out against Badge, Button, Card, Aura and Avatar.

**Forward-looking, and the reason this section exists:** the same collision on **Text Input** will *not* be harmless, because `size` is meaningful there. `plans/components/text-input.md` must decide deliberately — rename its variant prop, or accept losing native `size` and document it. Cross-reference this section from that plan when it is written; do not let it inherit Checkbox's answer by default.

### 3c. `indeterminate` cannot be a prop — it is a DOM property, not an attribute

daisyUI styles `.checkbox:indeterminate` with its own dash clip-path **[verified]**, and the doc page's own example says so directly:

```html
<!-- You can make a checkbox indeterminate using JS -->
<script>
  document.getElementById("my-checkbox").indeterminate = true
</script>
```

There is no `indeterminate` content attribute in HTML, and correspondingly **zero occurrences of `indeterminate` in `astro-jsx.d.ts`** **[verified]**. Astro renders HTML; an `indeterminate` prop has nothing to render.

**Decision: no prop.** The alternative was considered and rejected: a bundled component `<script>` doing
`document.querySelectorAll('[data-indeterminate]').forEach(el => el.indeterminate = true)` would be `plans/README.md` §6-compliant (one script per page, `querySelectorAll`, wires every instance) and is two lines. It is still out, because indeterminate is a **runtime state**, not a render-time one — a checkbox that starts indeterminate and is then driven by the caller's own code would fight a component script that only ever runs once. Setting it belongs wherever the rest of the form state lives.

Revisit only if callers actually ask; then it is an opt-in `data-` attribute plus that script, not a prop that pretends to be declarative.

The `Indeterminate` story shows the caller-side one-liner instead (§5).

### 3d. `disabled` needs no special handling here — unlike Button

`plans/components/button.md` §3b branches `disabled` between the native attribute and a `btn-disabled` class, because Button is polymorphic and `<a>`/`<div>` don't support the attribute.

Checkbox has **no such class** — `.checkbox:disabled { cursor:not-allowed; opacity:.2 }` targets the native pseudo-class **[verified]** — and its root is always `<input>`, which supports the attribute. So `disabled` passes straight through `...rest` with no prop, no branch and no ARIA patching.

Stated explicitly because Button's pattern is the kind of thing that gets copied across a library by reflex.

### 3e. `aria-checked` is honoured, and the tick is drawn by daisyUI

Two behaviours worth knowing, neither of which needs a prop **[both verified]**:

- **`.checkbox:checked, .checkbox[aria-checked=true]`** share every rule, so a caller driving state from JS can use `aria-checked` on an unchecked input and get the checked appearance. Same accommodation `plans/components/card.md` §3d found on selectable cards.
- **`appearance: none`** plus a `:before` with two `clip-path` polygons is how the tick and the indeterminate dash are drawn. daisyUI already handles the two places that breaks: `@media (forced-colors: active)` and `@media print` swap the clip-path for a literal `"✔︎"` character. So high-contrast mode and printing are covered — **do not** add a fallback, and do not restore `appearance: auto`.

The colour classes work by setting `--input-color` **[verified]**, a variable shared across daisyUI's input family. That is also the seam the doc page's "custom colors" example uses from the other side, with Tailwind `checked:` variants (`checked:bg-orange-400 checked:border-orange-500`). Caller classes, no prop — and worth one JSDoc line, since `--input-color` is a supported override that no prop exposes.

### 3f. Unverified assumptions

1. **Does `class:list` output survive alongside `checked` in the story renderer?** The doc examples all use `checked="checked"`, and Storybook controls will toggle it. Boolean-attribute handling through `args` → Astro props → rendered HTML is untested here; a `checked={false}` that still emits `checked` would make every story look checked. Check the rendered HTML.
2. **`indeterminate` in the story.** §3c means the `Indeterminate` story needs a real script in the story's own markup. Whether `@storybook-astro/framework`'s slot sanitizer or its script execution path (`plans/README.md` §7) allows that is untested. If it does not, the story degrades to a screenshot-with-comment and says so.
3. **Cross-component composition.** The "with fieldset and label" example needs `fieldset`/`legend`/`label` markup that this library does not wrap yet. Raw HTML in the story until those plans land — no blocker, just a note so the story is not mistaken for a missing composition.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
interface Props extends HTMLAttributes<'input'> {
  color?: DaisyColor;
  /**
   * Shadows the native `size` attribute, which browsers ignore on checkboxes
   * (plan §3b). Sets daisyUI's box size, not a character width.
   */
  size?: DaisySize;
}

// Full literal class names. NEVER `checkbox-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'checkbox-primary',
  secondary: 'checkbox-secondary',
  accent: 'checkbox-accent',
  neutral: 'checkbox-neutral',
  info: 'checkbox-info',
  success: 'checkbox-success',
  warning: 'checkbox-warning',
  error: 'checkbox-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'checkbox-xs',
  sm: 'checkbox-sm',
  md: 'checkbox-md',
  lg: 'checkbox-lg',
  xl: 'checkbox-xl',
};

// `type` is on InputHTMLAttributes and would otherwise stay in `...rest`,
// leaving an untyped input styled as a checkbox (plan §0, §3a).
const { type = 'checkbox', color, size, class: className, ...rest } = Astro.props;
---

<!--
  Void element: no slot. The label is a sibling inside `<label class="label">`
  (plan §2). `disabled` and `checked` pass straight through — daisyUI styles
  the native pseudo-classes (plan §3d). For an indeterminate checkbox, set
  `el.indeterminate = true` in your own script (plan §3c).
-->
<input
  type={type}
  class:list={['checkbox', color && COLOR[color], size && SIZE[size], className]}
  {...rest}
/>
```

That is the whole component. No `<script>`: the tick, the indeterminate dash, the disabled state, forced-colors and print are all daisyUI's CSS (§3e).

Not polymorphic: daisyUI documents `checkbox` on `<input>` only.

### Astro idioms gate

- [ ] **`type="checkbox"` is emitted**, via a destructured default rather than a hardcoded attribute beside the spread (§0, §3a).
- [ ] **No `<slot />`** — `<input>` is void (§2).
- [ ] No wrapping `<label>` and no `label` prop (§2).
- [ ] No `Astro.slots.has()` gating — there are no slots.
- [ ] Root element is `input`, matching every doc example.
- [ ] No `<script>` added, and **no `indeterminate` prop** (§3c).
- [ ] No `disabled` branching — the native attribute is enough (§3d).
- [ ] `...rest` spread onto the root element, so `checked`, `name`, `value`, `required`, `disabled` and `aria-checked` all work with no declarations.
- [ ] `size`'s collision with the native attribute is a **documented** decision, not an accident, and the JSDoc says what it means (§3b).
- [ ] Every variant class is a full literal in a `Record` map — no `` `checkbox-${color}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Checkbox />
  <Checkbox color="primary" size="lg" checked disabled name="remember" value="1" />
  <Checkbox aria-checked="true" id="x" data-test="y" class="checked:bg-orange-400" />
  <Checkbox color="banana">must error — not a DaisyColor</Checkbox>
  <Checkbox size={40}>must error — size is DaisySize, not the native attribute (§3b)</Checkbox>
  <Checkbox variant="outline">must error — no style axis (§1)</Checkbox>
  <Checkbox indeterminate>must error — DOM property, not an attribute (§3c)</Checkbox>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props |
|---|---|---|
| Checkbox | `Default` | `checked: true` |
| With fieldset and label | `WithFieldsetAndLabel` | raw `fieldset`/`legend`/`label` markup around the checkbox (§3f.3) |
| Sizes | `Sizes` | five checkboxes, `xs`…`xl`, all `checked` |
| Colors | `Colors` | eight checkboxes, one per `DaisyColor`, all `checked` |
| Disabled | `Disabled` | two checkboxes, `disabled` and `disabled checked` |
| Indeterminate | `Indeterminate` | a checkbox plus the doc page's own `el.indeterminate = true` script (§3c, §3f.2) |
| Checkbox with custom colors | `CustomColors` | `class: 'border-indigo-600 bg-indigo-500 checked:bg-orange-400 checked:text-orange-800 checked:border-orange-500'` |

Plus `Playground` and `Passthrough` (Step 6). The colour and size axes are each fully covered by a doc example, so no extra axis stories are needed.

Two stories beyond the doc page:

- **`AriaChecked`** — an unchecked input with `aria-checked="true"` beside a really-checked one; they should look identical (§3e).
- **`TypeIsSet`** — not a story. Instead, Step 6's headless grep asserts `type="checkbox"` is present in every rendered checkbox, because §0's failure is invisible in a screenshot.

```ts
import Checkbox from './Checkbox.astro';

// No slots — `<input>` is void. The label is a sibling inside
// `<label class="label">`, which is the Label component (plan §2).

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  args: { checked: true, color: 'primary' },
};

export const Default = {
  args: { checked: true },
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    id: 'cb-1',
    name: 'remember',
    value: '1',
    required: true,
    'data-test': 'yes',
    class: 'mine',
    checked: true,
  },
};
```

## 6. Steps

- [ ] **Step 1:** Nothing to re-read — §1 and §2 are filled from the doc page and the shipped CSS. Check §3f.1 (boolean attributes through story args) before writing the rest of §5, since every story here is driven by `checked`.
- [ ] **Step 2:** No new shared unions — `color` and `size` reuse `DaisyColor`/`DaisySize` unchanged (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Checkbox.astro` scaffold per §4 — **fixing the missing `type`** (§0) — then walk the Astro idioms gate.
- [ ] **Step 4:** Replace `Checkbox.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Checkbox`, verify:
  - `Default` **toggles when clicked** — the §0 check. A box that never checks is a text input.
  - `Playground`'s `checked` control actually changes the rendered state (§3f.1).
  - `Sizes` shows five distinct box sizes; `Colors` shows eight distinct fills with a visible tick in each.
  - `Disabled`: dimmed, `not-allowed` cursor, and genuinely not clickable.
  - `Indeterminate` shows a **dash**, not a tick (§3c) — if the script does not run, say so in the story rather than pretending.
  - `AriaChecked`: the two look identical (§3e).
  - `CustomColors`: orange when checked, indigo when not — proving `--input-color` and the `checked:` variants both reach the element (§3e).
  - Optional, cheap: enable forced-colors / print preview once and confirm the `"✔︎"` fallback appears (§3e). Nothing to fix either way — just confirming daisyUI's fallback is live.
- [ ] **Step 6:** Confirm forwarding via `Passthrough`, and assert the type attribute. Headless check:
  ```bash
  pnpm build-storybook
  grep -rhoE '<input[^>]*class="[^"]*checkbox[^"]*"[^>]*>' storybook-static/astro-prerendered-stories.json | head
  grep -rhoc 'type="checkbox"' storybook-static/astro-prerendered-stories.json
  ```
  Every rendered checkbox must carry `type="checkbox"` — §0's bug is invisible otherwise.
- [ ] **Step 7:** Update the `Checkbox` row in `plans/README.md` to **Implemented**. Add the §3b cross-reference note to the (not yet written) `plans/components/text-input.md` — or record it in `plans/README.md` if that file does not exist yet, so the `size` decision is not inherited silently.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 14 daisyUI classes from §1 are reachable: `checkbox` always, 8 colours via `color`, 5 sizes via `size`.
- [ ] `color` uses `DaisyColor` and `size` uses `DaisySize`, both imported, neither redeclared.
- [ ] **`type="checkbox"` is present in the rendered HTML of every story** (§0) — asserted in the build output, not by eye.
- [ ] No slot, no wrapping `<label>`, no `label` prop (§2).
- [ ] No invented axis — no style/variant prop (§1), no `indeterminate` prop (§3c), no `disabled` branching (§3d).
- [ ] `size`'s native-attribute collision is documented in the JSDoc, and the forward note for Text Input is recorded (§3b).
- [ ] `checked`, `disabled`, `name`, `value`, `required` and `aria-checked` all work through `...rest` with no declarations.
- [ ] `Playground` exposes every prop as a control.
- [ ] One story per doc-page example, reproducing that example's markup, plus `AriaChecked`.
- [ ] Every box in §4's Astro idioms gate ticked.
