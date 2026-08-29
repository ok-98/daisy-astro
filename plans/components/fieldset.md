# Fieldset Component Plan

**daisyUI category:** Data Input
**daisyUI doc page:** https://daisyui.com/components/fieldset/
**Root element:** `fieldset` (`Fieldset`), `legend` (`FieldsetLegend`)
**Target files:** `packages/daisy-astro/src/components/Fieldset/Fieldset.astro`, `FieldsetLegend.astro` (only `Fieldset.astro` exists, as a dummy scaffold)
**Story files:** `Fieldset.stories.ts`, `FieldsetLegend.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'fieldset'>`; `class:list` for merging; **Fieldset has no variant classes** so no `Record` map exists (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/fieldset.css` and the doc page source. §3d lists what is **unverified**.

---

## 0. Three classes ship, two are documented

The complete unprefixed rule set **[verified]**:

```css
.fieldset { display:grid; grid-template-columns:1fr; grid-auto-rows:max-content;
            gap:.375rem; padding-block:.25rem; font-size:.75rem }
.fieldset-legend { display:flex; align-items:center; justify-content:space-between; gap:.5rem;
                   margin-inline-end:auto; margin-bottom:-.25rem; padding-block:.5rem;
                   font-weight:600; color:var(--color-base-content) }
.fieldset-label  { display:flex; align-items:center; gap:.375rem;
                   color:color-mix(in oklab, var(--color-base-content) 60%, transparent) }
.fieldset-label:has(input) { cursor:pointer }
```

**`fieldset-label` is in the CSS but not in the doc page's `classnames` frontmatter**, and no example uses it — every description and inline label in all five examples is `class="label"`, i.e. daisyUI's separate **Label** component **[verified]**. Treat `fieldset-label` as legacy: not exposed, mentioned in §3b so its existence in a class dump is not mistaken for an omission.

So this component is two files and no variants (§1). The value of the plan is §3.

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type | Component |
|---|---|---|---|---|
| Base | `fieldset` | — | — | `Fieldset` |
| Part | `fieldset-legend` | — | — | `FieldsetLegend` |
| — | `fieldset-label` | — | — | not exposed (§0, §3b) |

**No colour, size, style or state axis** — none exists **[verified]**. Seventh component in the library with an empty variant table. The `bg-base-200 border border-base-300 p-4 rounded-box w-xs` in four of the five doc examples is plain Tailwind on the root (§3c).

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Fieldset` | `default` | none — direct children of `.fieldset` | no | a `FieldsetLegend`, then labels, inputs, joins, buttons |
| `FieldsetLegend` | `default` | none | no | `Page title`, `Login`, `Settings` |

Plain default slots, no named slots, no gating.

**No `legend` prop on `Fieldset`.** A `<legend>` must be the *first child* of a `<fieldset>` per HTML, and the caller already writes every other child — a prop would render the legend for them while they hand-write the rest, which is the worst of both. Content comes in through slots (`plans/README.md` §5), and `FieldsetLegend` is a one-class component on the same test as `CardTitle`.

**No `label` handling.** The descriptions and inline labels in every example are `class="label"` from the separate Label component (`plans/components/label.md`, not started). Cross-reference it from both sides when it lands.

## 3. Four things the naive implementation gets wrong

### 3a. `<fieldset>` and `<legend>` are the point — do not substitute divs

`.fieldset` and `.fieldset-legend` are class-only selectors **[verified]**, so they would technically work on a `<div>`. They must not be: `<fieldset>`/`<legend>` is the native grouping mechanism assistive technology uses to announce "you are in the *Login* group" when focus enters any control inside, and `<fieldset disabled>` disables every control it contains for free.

So neither component is polymorphic, and there is no `as` prop. This is the opposite call to `plans/components/breadcrumbs.md` §3b — there the semantic element had to be *added* because daisyUI used a bare `div`; here daisyUI already uses the right elements and the job is to not lose them.

Two things this buys the caller with no props at all, both worth a JSDoc line: `disabled` on the `Fieldset` cascades to every control inside, and `form="…"` associates the whole group with a form elsewhere in the document. Both arrive through `...rest`.

### 3b. `fieldset-label` exists but the docs use `label`

Per §0. If someone greps the CSS and finds `.fieldset-label`, the answer is: daisyUI ships it, documents `label` instead, and every example uses `label`. Exposing it would create a second way to do the same thing and would drift from the docs.

The one behaviour worth knowing is `.fieldset-label:has(input) { cursor: pointer }` **[verified]** — Label has an equivalent, so nothing is lost.

### 3c. The grid gap is the layout, and the box is the caller's

`.fieldset` is a single-column grid with `gap: .375rem` and `grid-auto-rows: max-content` **[verified]**. That gap is the whole vertical rhythm of a daisyUI form — labels, inputs and helper text are **siblings**, not nested pairs.

Consequence: wrapping a label and its input in a `<div>` for convenience **breaks the spacing**, because the wrapper becomes one grid row and the inner pair loses the gap. The doc page's "multiple inputs" example is deliberately flat for this reason. One JSDoc line, and `WrappedPair` (§5) shows the difference.

The background, border, padding, radius and width are all caller classes (`bg-base-200 border border-base-300 p-4 rounded-box w-xs`) — daisyUI gives the fieldset no box of its own **[verified]**. A bare `<Fieldset>` is an unstyled column, which is correct rather than broken; the same shape as `plans/components/browser-mockup.md` §3b.

`.fieldset-legend` carries `margin-bottom: -.25rem` and `margin-inline-end: auto` **[verified]** — it deliberately pulls the first field up and shrinks to its content, which is why it looks correct with `justify-content: space-between` even as a lone child.

### 3d. Unverified assumptions

1. **Does slot content land as direct children of `.fieldset`?** Blocking for the spacing: `.fieldset` is a grid and its children are the rows (§3c). A wrapper would make the entire form one row and collapse every gap. Eleventh plan to hit this shared question; see `plans/components/aura.md` §3e.1 and the list it carries.
2. **`<legend>` placement through the slot pipeline.** HTML requires `<legend>` to be the first child of `<fieldset>`; browsers reparent or ignore a misplaced one. Since the caller supplies it via the default slot, confirm the rendered order in Step 6 rather than assuming.

## 4. Component implementation

### `Fieldset.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Groups related form controls. A real `<fieldset>`, so `disabled` cascades to
 * every control inside and `form="…"` associates the group — both through
 * plain attributes (plan §3a).
 *
 * It is a single-column grid whose **children are the rows**: keep labels,
 * inputs and helper text as flat siblings, or the gap collapses (plan §3c).
 * Put the `FieldsetLegend` first, as HTML requires.
 *
 * daisyUI gives it no box — `class="bg-base-200 border border-base-300 p-4
 * rounded-box w-xs"` is what the doc examples add.
 */
interface Props extends HTMLAttributes<'fieldset'> {}

const { class: className, ...rest } = Astro.props;
---

<fieldset class:list={['fieldset', className]} {...rest}>
  <slot />
</fieldset>
```

### `FieldsetLegend.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/** Must be the first child of its `Fieldset` (plan §3d.2). */
interface Props extends HTMLAttributes<'legend'> {}

const { class: className, ...rest } = Astro.props;
---

<legend class:list={['fieldset-legend', className]} {...rest}>
  <slot />
</legend>
```

No `<script>` in either: pure CSS. Neither is polymorphic (§3a).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `legend` prop (§2).
- [ ] `<slot />` has no wrapper in `Fieldset` — its children are grid rows (§3c, §3d.1).
- [ ] Roots are `<fieldset>` and `<legend>`, never divs, and neither has an `as` prop (§3a).
- [ ] No `Astro.slots.has()` gating — nothing is optional.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in both files — this is what carries `disabled` and `form` (§3a).
- [ ] `fieldset-label` is **not** exposed (§0, §3b).
- [ ] No class interpolation — there are no variant classes (§1).
- [ ] Probe (§5c):
  ```astro
  <Fieldset class="w-xs"><FieldsetLegend>Login</FieldsetLegend><input class="input" /></Fieldset>
  <Fieldset disabled form="signup" id="x" data-test="y">ok</Fieldset>
  <Fieldset legend="Login">must error — legend is a component (§2)</Fieldset>
  <Fieldset color="primary">must error — no colour axis (§1)</Fieldset>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `Fieldset.stories.ts`:

| Doc-page example | Story | Notes |
|---|---|---|
| Fieldset, legend and label | `Default` | `class: 'w-xs'`, legend + input + `<p class="label">` |
| Fieldset with background and border | `WithBox` | adds `bg-base-200 border border-base-300 p-4 rounded-box` |
| Fieldset with multiple inputs | `MultipleInputs` | three flat label/input pairs |
| Fieldset with multiple join items | `WithJoin` | a `join` wrapping an input and a button |
| Login form with fieldset | `LoginForm` | email, password, submit |

Plus `Playground` and `Passthrough`. `FieldsetLegend.stories.ts` gets a `Playground` + `Passthrough`.

Two stories beyond the doc page:

- **`Disabled`** — `disabled` on the `Fieldset` with three controls inside, showing §3a's free cascade. Nothing else in the library demonstrates a native grouping behaviour.
- **`WrappedPair`** — a flat label/input pair beside one wrapped in a `<div>`, making §3c's collapsed gap visible.

The doc examples' `label` and `input` classes are written as raw markup until `plans/components/label.md` and `plans/components/text-input.md` land — noted in a comment so the raw markup is not mistaken for a missing composition.

## 6. Steps

- [ ] **Step 1:** Resolve §3d.1 (direct grid children) — blocking for spacing. Confirm §3d.2 (`<legend>` first) at the same time.
- [ ] **Step 2:** No new shared unions; `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Fieldset.astro` scaffold and create `FieldsetLegend.astro` per §4, then walk the gate.
- [ ] **Step 4:** Replace `Fieldset.stories.ts` and create `FieldsetLegend.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook`, verify: `Default` has even `.375rem` gaps between legend, input and helper text; `WithBox` is a bordered card with the legend inside it; `MultipleInputs` keeps a consistent rhythm across all six children; `WrappedPair` visibly loses it (§3c); `Disabled` greys out and blocks every control (§3a).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<fieldset class="fieldset[^"]*"[^>]*><legend' storybook-static/astro-prerendered-stories.json | head
  ```
  Confirms the legend is the first child with no wrapper between (§3d).
- [ ] **Step 7:** Update the `Fieldset` row in `plans/README.md` to **Implemented**, noting `FieldsetLegend` as part of it.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] Both documented classes reachable; `fieldset-label` deliberately not exposed (§0, §3b).
- [ ] Roots are native `<fieldset>`/`<legend>`; `disabled` cascades and `form` associates, with no props (§3a).
- [ ] Slot content renders as direct grid children (§3c, §3d.1) — checked in the build output.
- [ ] `<legend>` renders first (§3d.2).
- [ ] No invented axis — no colour, size, `legend` prop, or box defaults (§1, §2, §3c).
- [ ] JSDoc states: keep children flat (§3c), the box is caller-supplied (§3c), and `disabled`/`form` come free (§3a).
- [ ] One story per doc-page example, plus `Disabled` and `WrappedPair`.
- [ ] Every box in §4's gate ticked.
