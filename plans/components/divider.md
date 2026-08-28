# Divider Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/divider/
**Root element:** `div` (not `<hr>` — see §3e)
**Target file:** `packages/daisy-astro/src/components/Divider/Divider.astro` (currently a dummy scaffold — and its whitespace is a bug, §0)
**Story file:** `packages/daisy-astro/src/components/Divider/Divider.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Divider uses `DaisyColor`, not `DaisySize`** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/divider.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/divider/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. The empty divider depends on `:empty`, and the scaffold breaks it

```css
.divider:not(:empty) { gap: 1rem }
```

**[verified]**. That one rule is what makes "Divider with no text" render as a single continuous line: with no children there is no gap, so the `:before` and `:after` bars meet in the middle. Add text and the 1rem gap appears to sit either side of it.

The scaffold writes the slot on its own line:

```astro
<div class:list={['divider', className]} {...rest}>
  <slot />
</div>
```

which puts a newline and indentation inside the element. Whether that still counts as `:empty` is the difference between a clean line and a line with a **1rem hole in the middle of it, for every divider that has no text** — the most common way this component is used. §3a covers it and §4 writes the slot without surrounding whitespace.

That is the whole reason this small component gets a plan: the axes are routine, the whitespace is not.

## 1. Variant audit

**13 classes: 1 base + 8 colour + 2 direction + 2 placement**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.divider[a-z0-9-]*' divider.css | sort -u` returns exactly those 13 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `divider` | — | — | Always applied. |
| Colour | `divider-neutral` `-primary` `-secondary` `-accent` `-success` `-warning` `-info` `-error` | `color` | `DaisyColor` | Matches `DaisyColor` exactly — import it. Colours the **lines only**, not the text — §3d. |
| Direction | `divider-vertical` `divider-horizontal` | `direction` | `'vertical' \| 'horizontal'` | Mutually exclusive → union. **The names describe the layout being divided, not the line** — §3b. `vertical` is daisyUI's default and is still emittable. |
| Placement | `divider-start` `divider-end` | `placement` | `'start' \| 'end'` | Mutually exclusive → union. Implemented by *hiding* one of the two line halves — §3c. |

**No size axis, no style axis** — there is no `divider-lg`, no `divider-dash` **[verified]**. The line thickness is a fixed `.125rem` and the track is a fixed `1rem`.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — the doc page's `lg:divider-horizontal` example uses one directly; caller-side classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — the text sits between the two pseudo-element bars | **yes** — an empty divider is a documented example (§0) | `OR`, `Start`, `Default`, `End`, or nothing |

Single default slot, no gating — but the slot being **genuinely optional matters more here than anywhere else in the library**, because `:empty` changes the rendering (§0, §3a).

No fallback content: `<slot>OR</slot>` would make the documented empty divider impossible to express, the same reasoning as `plans/components/badge.md` §3c's empty badge.

No `text` prop: content comes in through slots (`plans/README.md` §5), and the doc examples put plain text there.

## 3. Six things the naive implementation gets wrong

### 3a. Whitespace inside the element may defeat `:empty`

CSS Selectors Level 3 defined `:empty` as matching only elements with **no child nodes at all**, whitespace text nodes included. Selectors Level 4 loosened it to ignore whitespace-only text. Browser behaviour has been converging on the Level 4 rule, but this component cannot afford to guess: if the older behaviour applies anywhere it matters, every text-less divider gets `gap: 1rem` and renders with a gap in the middle of an otherwise unbroken line.

**The fix costs nothing and removes the question entirely** — write the slot with no surrounding whitespace:

```astro
<div class:list={[…]} {...rest}><slot /></div>
```

Astro preserves the whitespace it finds in a template, so this is a formatting decision with a rendering consequence. A formatter that reflows that line would silently reintroduce the bug, which is worth a comment in the file rather than trusting future editors.

Confirm in Step 5 by rendering an empty divider and checking the DOM for text nodes, not by squinting at the line (§3f.1).

### 3b. `divider-horizontal` draws a *vertical* line

daisyUI names the classes after **the layout being divided**, not the line:

| Class | daisyUI's description | The line you see |
|---|---|---|
| `divider-vertical` (default) | "Divide vertical elements (on top of each other)" | a **horizontal** bar |
| `divider-horizontal` | "Divide horizontal elements (next to each other)" | a **vertical** bar |

**[verified in the CSS]** — `.divider-horizontal.divider { flex-direction: column; width: 1rem; height: auto }` with `:before`/`:after` becoming `width:.125rem; height:100%`.

The prop keeps daisyUI's names rather than being "fixed" to `line="vertical"`: renaming would make this library's docs disagree with daisyUI's, and anyone reading both would be worse off. The JSDoc spells out the mapping instead — this is a documentation problem, not an API one.

Two related facts worth knowing:

- `.divider` is `align-self: stretch` **[verified]**, which is why a `divider-horizontal` fills the height of a flex row without an explicit height.
- The margin flips with the direction via `--divider-m` (`1rem 0` vs `0 1rem`) **[verified]**, so the spacing is always across the divider, never along it.

### 3c. `placement` works by deleting half the line

```css
.divider-start:before { display: none }
.divider-end:after    { display: none }
```

**[verified]**. There is no alignment property involved — "push the text to the start" is implemented as "remove the bar that would have been before it".

Two consequences:

- **The names read backwards if you expect them to name the hidden half.** `divider-start` puts the *text* at the start, which means the *start-side bar* is the one that disappears. The JSDoc says so in those words.
- Because they target different pseudo-elements, `divider-start` and `divider-end` could technically both apply and leave a divider with **no lines at all**. The union makes that unrepresentable, the same reasoning `plans/components/accordion.md` §1 used for `icon` and `force`.

### 3d. The colour classes colour the lines, not the text

Every colour rule is `.divider-primary:before, .divider-primary:after { background-color: … }` **[verified]** — pseudo-element backgrounds only. The divider's text keeps the inherited colour.

So `<Divider color="primary">OR</Divider>` is a primary-coloured rule with ordinary text, which is what the doc page's colours example shows. A caller who wants both writes `class="text-primary"` alongside.

Also worth one JSDoc line: the default line colour comes from `--divider-color` **[verified]**, so `style="--divider-color: …"` is a supported override that no prop exposes — the same seam `plans/components/checkbox.md` §3e noted for `--input-color`.

### 3e. `div`, not `<hr>`

The semantic instinct for a divider is `<hr>`. It cannot work here: `<hr>` is a **void element**, so it can hold no text, and daisyUI's line is drawn with `:before`/`:after` — which void elements do not generate. Every doc example uses a `<div>`.

On the accessibility side, daisyUI adds no `role`. `role="separator"` would be defensible for a divider with text and arguably wrong for a purely decorative one, where `aria-hidden="true"` fits better. **Neither is defaulted**: unlike `plans/components/breadcrumbs.md` §3b's `nav` landmark — a clear gain with no downside — the right answer here depends on the caller's intent. `role` passes through `...rest`, and the JSDoc names both options.

### 3f. Unverified assumptions

1. **Does the rendered empty divider have zero child nodes?** The point of §3a. Check the DOM, not the pixels — a gap of exactly 1rem in a thin line is easy to miss and easy to misattribute to margin.
2. **Whether the installed browsers apply the Selectors 4 `:empty` rule.** Worth one check alongside §3f.1: if they do, the whitespace fix is belt-and-braces rather than load-bearing, and that is still the right code to ship.

**Not a risk here:** this is the first component in a while with **no child selectors at all** — the lines are pseudo-elements on the root, and `:not(:empty)` cares only that children exist, not what they are. So the blocking slot-wrapping question that gates seven sibling plans (`plans/components/aura.md` §3e.1 and the list it carries) does not apply. A wrapper around slot content would be harmless — except that it would make an "empty" divider non-empty, which is §3a from a different direction.

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type DividerDirection = 'vertical' | 'horizontal';
type DividerPlacement = 'start' | 'end';

interface Props extends HTMLAttributes<'div'> {
  /** Colours the two line halves, not the text (plan §3d). */
  color?: DaisyColor;
  /**
   * daisyUI names these after the layout being divided, not the line:
   * `vertical` (default) divides stacked elements and draws a **horizontal**
   * bar; `horizontal` divides side-by-side elements and draws a **vertical**
   * bar (plan §3b). Responsive form: `class="lg:divider-horizontal"`.
   */
  direction?: DividerDirection;
  /**
   * Pushes the text to the start or end by hiding the line half on that side
   * (plan §3c).
   */
  placement?: DividerPlacement;
}

// Full literal class names. NEVER `divider-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'divider-primary',
  secondary: 'divider-secondary',
  accent: 'divider-accent',
  neutral: 'divider-neutral',
  info: 'divider-info',
  success: 'divider-success',
  warning: 'divider-warning',
  error: 'divider-error',
};

const DIRECTION: Record<DividerDirection, string> = {
  vertical: 'divider-vertical',
  horizontal: 'divider-horizontal',
};

const PLACEMENT: Record<DividerPlacement, string> = {
  start: 'divider-start',
  end: 'divider-end',
};

const { color, direction, placement, class: className, ...rest } = Astro.props;
---

<!--
  KEEP `<slot />` ON THIS LINE, with no whitespace around it. daisyUI gates the
  1rem gap on `.divider:not(:empty)`, and a newline inside the element can make
  a text-less divider non-empty — putting a gap in the middle of a line that
  should be continuous (plan §3a). Do not let a formatter reflow this.
-->
<div
  class:list={[
    'divider',
    color && COLOR[color],
    direction && DIRECTION[direction],
    placement && PLACEMENT[placement],
    className,
  ]}
  {...rest}
><slot /></div>
```

No `<script>`: pure CSS, print styles included (`@media print { .divider:before, .divider:after { border: .5px solid } }` **[verified]**).

Not polymorphic, and specifically **not `<hr>`** (§3e).

### Astro idioms gate

- [ ] **`<slot />` has no surrounding whitespace**, and a comment says why (§3a). This is the one gate item unique to this component.
- [ ] Content arrives via the default slot — no `text` prop (§2).
- [ ] No fallback slot content — an empty divider is documented (§2).
- [ ] No `Astro.slots.has()` gating — daisyUI handles the empty case in CSS via `:not(:empty)` (§0).
- [ ] Root element is `div`, not `<hr>` (§3e).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element, so `role` and `aria-hidden` are reachable (§3e).
- [ ] No `as` prop.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (it exists only on `SVGAttributes`, `astro-jsx.d.ts:1186`) **[verified]**; `placement` is not an HTML attribute; `color` shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the tradeoff Button already accepted.
- [ ] Every variant class is a full literal in a `Record` map — no `` `divider-${color}` `` anywhere.
- [ ] Not generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c):
  ```astro
  <Divider>OR</Divider>
  <Divider />
  <Divider color="primary" direction="horizontal" placement="start">Start</Divider>
  <Divider class="lg:divider-horizontal" role="separator" id="x" data-test="y">OR</Divider>
  <Divider color="banana">must error — not a DaisyColor</Divider>
  <Divider direction="diagonal">must error — not a direction value</Divider>
  <Divider size="lg">must error — no size axis (§1)</Divider>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8). Each reproduces the page's surrounding flex wrapper and `card bg-base-300` content blocks, since a divider on its own shows nothing about how it behaves between elements:

| Doc-page example | Story | Props |
|---|---|---|
| Divider | `Default` | `OR` between two stacked content blocks |
| Divider horizontal | `Horizontal` | `direction: 'horizontal'`, blocks side by side |
| Divider with no text | `NoText` | **no slot content** — the §0 case |
| responsive (lg:divider-horizontal) | `Responsive` | `class: 'lg:divider-horizontal'`, wrapper `flex-col lg:flex-row` — no `direction` prop (§1) |
| Divider with colors | `Colors` | nine dividers: default plus one per `DaisyColor`, labelled |
| Divider in different positions | `Placements` | `start`, default, `end` |
| Divider in different positions (horizontal) | `PlacementsHorizontal` | the same three with `direction: 'horizontal'`, in an `h-52` flex row |

Plus `Playground` and `Passthrough` (Step 6). All three axes are covered by doc examples, so no extra axis stories are needed.

Two stories beyond the doc page:

- **`EmptyVsText`** — an empty divider directly above one with text, at the same width. The empty one must be a single unbroken line; if it has a 1rem notch, §3a is live. This is the story that catches the bug the plan exists for.
- **`ColorIsLineOnly`** — `color="primary"` beside `color="primary" class="text-primary"`, making §3d's split obvious.

```ts
import Divider from './Divider.astro';

// The empty-divider case depends on `.divider:not(:empty)`, so `NoText` must
// pass NO slot content at all — not an empty string with whitespace.
// See plans/components/divider.md §0 and §3a.

const BLOCK = '<div class="card bg-base-300 rounded-box grid h-20 place-items-center">content</div>';

export default {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
    },
    direction: { control: 'radio', options: [undefined, 'vertical', 'horizontal'] },
    placement: { control: 'radio', options: [undefined, 'start', 'end'] },
  },
};

export const Playground = {
  args: { slots: { default: 'OR' } },
};

export const NoText = {
  // No `slots` key at all — see the note above.
  args: {},
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` is how the responsive direction arrives (§1).
export const Passthrough = {
  args: {
    id: 'divider-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    role: 'separator',
    slots: { default: 'Passthrough' },
  },
};
```

The stories that need surrounding content blocks compose them the way the framework's docs recommend (a decorator or a wrapping story) — check that before inventing a helper.

## 6. Steps

- [ ] **Step 1:** Nothing to re-read — §1 and §2 are filled from the doc page and the shipped CSS. Note that §3f removes the slot-wrapping unknown that gates seven sibling plans; no cross-plan dependency here.
- [ ] **Step 2:** No new shared unions — `color` reuses `DaisyColor`, both other unions are local, no size axis (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Divider.astro` dummy scaffold per §4, **with `<slot />` written without surrounding whitespace** (§3a), then walk the Astro idioms gate.
- [ ] **Step 4:** Replace `Divider.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Divider`, verify:
  - **`NoText` is one unbroken line** — no notch in the middle. Then inspect it in devtools and confirm the element has **no child nodes** (§3a, §3f.1). Do both; the visual check alone can miss a 1rem gap in a 2px line.
  - `EmptyVsText`: the gap appears only on the one with text.
  - `Default` sits between the two blocks with equal margin above and below; `Horizontal` sits between them left-to-right and stretches to the blocks' height (§3b).
  - `Responsive` is a horizontal bar below `lg` and a vertical bar above it, with the wrapper flipping too.
  - `Colors`: eight distinct line colours, and the **text stays the default colour** in all of them (§3d).
  - `Placements`: `start` has no bar before the text, `end` has none after it (§3c).
  - Optional: print-preview one story once and confirm the `.5px` border fallback appears (§4).
- [ ] **Step 6:** Confirm forwarding via `Passthrough` — `id`, `data-*`, `style`, `class`, `role` all survive. Headless check, which is also the definitive answer to §3a:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="divider[^"]*"[^>]*></div>' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div class="divider[^"]*"[^>]*>[[:space:]]+</div>' storybook-static/astro-prerendered-stories.json | head
  ```
  The first must match for `NoText`; the second must return **nothing**. A hit on the second means whitespace is being emitted inside the element.
- [ ] **Step 7:** Update the `Divider` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 13 daisyUI classes from §1 are reachable: `divider` always, 8 colours via `color`, 2 directions via `direction`, 2 placements via `placement`.
- [ ] `color` uses `DaisyColor`, imported, not redeclared.
- [ ] **A text-less `<Divider />` renders with no child nodes and no gap** — confirmed in the build output, not by eye (§0, §3a).
- [ ] `<slot />` is written with no surrounding whitespace, with a comment explaining why (§3a).
- [ ] No fallback slot content, no `text` prop, no `Astro.slots.has()` gating (§2).
- [ ] Root is a `div`, not `<hr>`, and `role`/`aria-hidden` pass through (§3e).
- [ ] No invented axis — no `size`, no style/variant prop (§1).
- [ ] JSDoc states: `direction` names the layout not the line (§3b), `placement` hides a line half (§3c), colour applies to the lines only (§3d), and `--divider-color` is an available override.
- [ ] `Playground` exposes every prop as a control.
- [ ] One story per doc-page example, reproducing that example's markup and copy, plus `EmptyVsText` and `ColorIsLineOnly`.
- [ ] Every box in §4's Astro idioms gate ticked.
