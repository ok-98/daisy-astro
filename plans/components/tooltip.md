# Tooltip Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/tooltip/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Tooltip/Tooltip.astro`
**Story file:** `packages/daisy-astro/src/components/Tooltip/Tooltip.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import as `../../lib/variants`. **`DaisyColor` does not fit as-is here** (§0d).
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/tooltip.css` and the doc page's `classnames` frontmatter. Both agree on **seventeen** classes:

```
.tooltip
.tooltip-content                                          (part)
.tooltip-top .tooltip-bottom .tooltip-left .tooltip-right (side, default: top)
.tooltip-start .tooltip-center .tooltip-end               (cross-axis alignment)
.tooltip-open                                             (modifier)
.tooltip-primary .tooltip-secondary .tooltip-accent
.tooltip-info .tooltip-success .tooltip-warning .tooltip-error   (colour — SEVEN, §0d)
```

Sixteen doc examples. There is no size axis.

### 0a. The tooltip text is a CSS `content: attr()`, and an empty one suppresses the whole tooltip

```css
.tooltip > .tooltip-content,
.tooltip[data-tip]:before { --tw-content: attr(data-tip); content: var(--tw-content);
                            position:absolute; opacity:0; pointer-events:none; … }
```

The bubble is a **pseudo-element** fed by the `data-tip` attribute. So the primary content route is an attribute, not a slot — the one component in this batch where that is correct rather than a smell.

The visibility gate is stricter than "hover":

```css
:is(
  .tooltip:is([data-tip]:not([data-tip=""]), :has(.tooltip-content:not(:empty))).tooltip-open,
  .tooltip:is([data-tip]:not([data-tip=""]), :has(.tooltip-content:not(:empty))):hover,
  .tooltip:is([data-tip]:not([data-tip=""]), :has(.tooltip-content:not(:empty))):has(:focus-visible)
) > .tooltip-content, … :before, … :after { opacity:1; --tt-pos:0rem }
```

Read plainly: the tooltip shows on **hover**, on **`:focus-visible` of anything inside**, or when **`.tooltip-open`** is present — but *only if* `data-tip` is a non-empty string **or** a non-empty `.tooltip-content` child exists. A `data-tip=""` or an empty content div produces no bubble and no tail at all, rather than an empty box.

Two consequences:

- `tip=""` is a valid, meaningful "no tooltip" — do not treat empty string as an error or coerce it away.
- The `:has(:focus-visible)` arm is why the tooltip is keyboard-reachable at all. That is CSS daisyUI already ships; no script (`plans/README.md` §6).

### 0b. Two content routes, and the second is an optional wrapped slot

The frontmatter calls `tooltip-content` *"Optional. Setting a div as the content of the tooltip instead of the `data-tip` text"*, and the doc's second example is:

```html
<div class="$$tooltip">
  <div class="$$tooltip-content">
    <div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>
  </div>
  <button class="$$btn">Hover me</button>
</div>
```

`.tooltip > .tooltip-content` shares every declaration with the `:before` bubble, so the two routes are alternatives, not layers: `data-tip` for plain text, a `tooltip-content` child for markup.

**Treatment: a named slot with a generated wrapper**, gated with `Astro.slots.has()` — precisely the case `plans/README.md` §5 describes. Not a `TooltipContent` sub-component: the wrapper carries no options of its own, and the doc example decorates an **inner** div (`animate-bounce text-orange-400 …`) rather than the wrapper, so nothing needs to reach it.

Gating is not cosmetic here. An ungated empty `<div class="tooltip-content">` would be inert thanks to `:not(:empty)` (§0a), but it would also sit in the DOM of every tooltip that uses `tip` instead — noise for no reason.

The trigger goes in the **default** slot. Document order in daisyUI's example is content-then-trigger, but both are absolutely positioned or in flow independently, so order is not load-bearing; follow the doc's order anyway.

### 0c. Two placement axes whose meaning swaps with the side

```css
.tooltip-top    > .tooltip-content { inset: auto auto var(--tt-off) 50%;  transform: translateX(var(--tt-trans,-50%)) translateY(var(--tt-pos,.25rem)) }
.tooltip-bottom > .tooltip-content { inset: var(--tt-off) auto auto 50%;  … }
.tooltip-left   > .tooltip-content { right: var(--tt-off); inset-block: var(--tt-inset,50% auto); transform: … translateY(var(--tt-trans,-50%)) }
.tooltip-right  > .tooltip-content { left:  var(--tt-off); inset-block: var(--tt-inset,50% auto); … }

.tooltip-start  { --tt-trans:0;    --tt-inset:0 auto;   --tt-tail-inset:var(--tt-tail-off) auto }
.tooltip-center { --tt-trans:-50%; --tt-inset:50% auto; --tt-tail-inset:50% auto }
.tooltip-end    { --tt-trans:0;    --tt-inset:auto 0;   --tt-tail-inset:auto var(--tt-tail-off) }
```

`start`/`center`/`end` set `--tt-trans` and `--tt-inset`, which the side rules consume on **whichever axis is the cross axis**: horizontal for `top`/`bottom`, vertical for `left`/`right`. So `tooltip-left tooltip-start` means "on the left, aligned to the top", and the doc's Left/Right examples are laid out in a column precisely to show that.

That is a genuine documentation obligation — "start" meaning "top" is not guessable — and it is why the two axes stay two props rather than collapsing into a twelve-value enum.

**Prop names follow the precedent already set twice.** `indicator.md` §1 named this shape `align` (cross-axis) + `position`, and `toast.md` §0b reused it. Same here: `position?: 'top' | 'bottom' | 'left' | 'right'` and `align?: 'start' | 'center' | 'end'`. Three components, one vocabulary.

`tooltip-top` is the frontmatter default and `.tooltip`'s base rules already place the bubble on top, so `position` emits nothing when undefined. `align` has no marked default; the base `--tt-trans:-50%` fallback is `center`'s value, so undefined behaves as centred.

### 0d. Seven colours, not eight — `DaisyColor` does not fit

```css
.tooltip { --tt-bg: var(--color-neutral); … }
.tooltip-primary { --tt-bg: var(--color-primary) }
…
.tooltip-error   { --tt-bg: var(--color-error) }
```

There is **no `.tooltip-neutral`**, in the CSS or in the frontmatter. Neutral is the *base* colour — `--tt-bg` defaults to it — so a neutral class would be a no-op and daisyUI does not ship one.

Every other coloured component in this library has taken `DaisyColor` unchanged. Tooltip is the first that cannot. Two options, and the second is better:

1. Declare a local seven-value union — duplicates seven literals and drifts if `DaisyColor` ever changes.
2. **`Exclude<DaisyColor, 'neutral'>`** — derives from the shared union, stays in sync, and states the exclusion in the type itself.

Take option 2, and keep the `Record` map keyed on it so the exhaustiveness check still fires if `DaisyColor` gains a member.

Each colour class also sets the text colour on the bubble (`color: var(--color-primary-content)`), so contrast is handled — nothing to expose.

### 0e. The responsive story is bigger here than anywhere, and daisyUI documents it twice

Seventh utilities-layer component with breakpoint copies (after Table, Textarea, Text Input, Timeline, Toast, Toggle). But Tooltip is the only one with **two dedicated doc examples**, and the first where the **base class itself** is used responsively:

```html
<div class="lg:tooltip" data-tip="hello">                            <!-- tooltip only above lg -->
<div class="tooltip tooltip-start md:tooltip-right md:tooltip-center" data-tip="hello">
```

`lg:tooltip` is a real feature: no tooltip on touch-sized screens, where hover does not exist, and it is the correct answer to "how do I not show a hover-only affordance on mobile". It is also **unreachable from any prop** — the component always emits `tooltip`. A caller wanting it writes `<div class="lg:tooltip">` by hand around a bare trigger, or the component would need a `responsive` escape hatch this plan deliberately does not add.

Both examples get stories (§8 requires one story per doc example anyway), and the `lg:tooltip` limitation gets a JSDoc line naming it explicitly rather than being discovered as a missing feature.

Note the second example stacks `md:tooltip-right md:tooltip-center` — both axes overridden at one breakpoint, which is the clearest possible demonstration that they are independent (§0c).

### 0f. Accessibility: the bubble is a pseudo-element and screen readers will not read it

`content: attr(data-tip)` on `::before` is not reliably exposed to assistive technology, and `pointer-events: none` means it cannot be hovered or selected. daisyUI adds no `role="tooltip"`, no `aria-describedby`, and nothing to associate the bubble with the trigger.

The `:has(:focus-visible)` arm (§0a) makes it *visually* keyboard-accessible, which is genuinely more than many CSS tooltips manage — but a screen-reader user gets nothing.

**Decision: document, do not invent.** The same call `toast.md` §0f made, and for a firmer reason: the accessible name belongs on the **trigger**, which is slot content this component cannot reach. The JSDoc must say that `tip` is decorative for assistive technology and that the trigger needs its own `aria-label` or `aria-describedby`, and one story must show it. Silence here would be the real failure.

### 0g. Scaffold check

```astro
<div class:list={['tooltip', className]} {...rest}><slot /></div>
```

Root, base class, merge and spread all correct — third clean scaffold in the batch after Table (`table.md` §0f) and Toast (`toast.md` §0g). Everything else is missing.

### 0h. Attribute collisions

- `position` — not an HTML attribute. Free (cleared in `toast.md` §0h).
- `align` — declared only on `TableHTMLAttributes` (`astro-jsx.d.ts:963`), `TdHTMLAttributes` (`:993`), `ThHTMLAttributes` (`:1003`). Not on `HTMLAttributes<'div'>`. Free.
- `open` — declared on `DetailsHTMLAttributes` and `DialogHTMLAttributes` only, not on a `<div>`. Free.
- `color` — shadows the obsolete non-standard `color` attribute on base `HTMLAttributes` (`:602`), the accepted tradeoff.
- `tip` — free; rendered as `data-tip`, not as a prop name that survives to the DOM.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Text | — (`data-tip` attribute) | `tip` | `string` | Rendered as `data-tip`. Empty string = no tooltip, deliberately (§0a). |
| Side | `tooltip-top` `tooltip-bottom` `tooltip-left` `tooltip-right` | `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `top` is the default — emit nothing when undefined. Name matches `indicator.md` / `toast.md` (§0c). |
| Cross-axis | `tooltip-start` `tooltip-center` `tooltip-end` | `align` | `'start' \| 'center' \| 'end'` | Horizontal for top/bottom, **vertical for left/right** (§0c). Undefined behaves as `center`. |
| Force open | `tooltip-open` | `open` | `boolean` | Used by 14 of 16 doc examples so the tooltip is visible in a static page. |
| Color | `tooltip-primary` … `tooltip-error` | `color` | `Exclude<DaisyColor, 'neutral'>` | **Seven values.** Neutral is the base and has no class (§0d). |

Not built: `lg:tooltip` and responsive placement (§0e — caller classes; `lg:tooltip` is not expressible through this component at all).

## 2. Slots

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `tip` | `div.tooltip-content` | **yes** → gate with `Astro.slots.has()` | The rich-content alternative to `data-tip` (§0b) |
| `default` | none — the root `<div>` itself | no | The trigger: `<button class="btn">Hover me</button>` |

`tip` and the `tip` **prop** are two routes to the same bubble. If both are supplied, the `.tooltip-content` child wins visually (it is a real element painted over the `:before` pseudo-element's position). Rather than leaving that to chance, note in the JSDoc that they are alternatives, and consider it a documentation matter, not a runtime guard — unlike the void-element cases in `text-input.md` §2 and `toggle.md` §2, nothing is silently *lost* here.

**Direct-child dependency:** `.tooltip > .tooltip-content` is direct-child-scoped, as is the visibility gate's `:has(.tooltip-content:not(:empty))`. Since the component generates that wrapper itself, the risk is only that Astro interposes something between the root and the generated `<div>` — narrower than the `aura.md` §3e.1 unknown, but check it in the same probe (§6 Step 3). The **default** slot has no direct-child requirement; the trigger only needs to be a descendant for `:has(:focus-visible)`.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

interface Props extends HTMLAttributes<'div'> {
  /** Tooltip text, rendered as `data-tip`. An empty string shows no tooltip.
   *  For markup instead of text, use the `tip` slot. Note: the bubble is a CSS
   *  pseudo-element and is not read by screen readers — give the trigger its
   *  own aria-label or aria-describedby. */
  tip?: string;
  /** Which side of the trigger the bubble sits on. Default `top`. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along the cross axis: horizontal for top/bottom, VERTICAL for
   *  left/right — `align="start"` with `position="left"` means top-aligned.
   *  Undefined behaves as `center`. */
  align?: 'start' | 'center' | 'end';
  /** Show the tooltip without hover or focus. */
  open?: boolean;
  /** Bubble colour. Neutral is the default and has no class in daisyUI. */
  color?: Exclude<DaisyColor, 'neutral'>;
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
type TooltipColor = Exclude<DaisyColor, 'neutral'>;

interface Props extends HTMLAttributes<'div'> {
  tip?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  color?: TooltipColor;
}

// Full literal class names. NEVER `tooltip-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<TooltipColor, string> = {
  primary: 'tooltip-primary',
  secondary: 'tooltip-secondary',
  accent: 'tooltip-accent',
  info: 'tooltip-info',
  success: 'tooltip-success',
  warning: 'tooltip-warning',
  error: 'tooltip-error',
};

const POSITION: Record<'top' | 'bottom' | 'left' | 'right', string> = {
  top: 'tooltip-top',
  bottom: 'tooltip-bottom',
  left: 'tooltip-left',
  right: 'tooltip-right',
};

const ALIGN: Record<'start' | 'center' | 'end', string> = {
  start: 'tooltip-start',
  center: 'tooltip-center',
  end: 'tooltip-end',
};

const { tip, position, align, open, color, class: className, ...rest } = Astro.props;

const hasTipSlot = Astro.slots.has('tip');
---
{/* The bubble is a ::before fed by data-tip, or a .tooltip-content child — use
    one or the other. An empty data-tip shows nothing at all, by design. Shows
    on hover, on :focus-visible of anything inside, or with `open`. The bubble
    is a pseudo-element: screen readers do not read it, so label the trigger.
    "Tooltip only on large screens" is `class="lg:tooltip"` on your own wrapper
    — this component always emits `tooltip`. */}
<div
  class:list={[
    'tooltip',
    position && POSITION[position],
    align && ALIGN[align],
    color && COLOR[color],
    { 'tooltip-open': open },
    className,
  ]}
  data-tip={tip}
  {...rest}
>
  {hasTipSlot && (
    <div class="tooltip-content">
      <slot name="tip" />
    </div>
  )}
  <slot />
</div>
```

### Astro idioms gate

- [ ] Content arrives via slots and the `data-tip` attribute daisyUI's CSS actually reads — not invented content props.
- [ ] The optional `.tooltip-content` wrapper is gated with `Astro.slots.has()` (§0b).
- [ ] Root element is `<div>`, matching all sixteen examples.
- [ ] **No `<script>`** — hover, `:focus-visible` and force-open are all CSS (§0a).
- [ ] `...rest` spread onto the root, so `id`, `aria-*` and `data-*` reach it. `data-tip` is set from the prop **before** the spread, so an explicit `data-tip` in `...rest` still wins — acceptable and worth one comment.
- [ ] Not polymorphic: `.tooltip` is a container in every example.
- [ ] No prop collides: `position`, `align`, `open`, `tip` are all clear on `HTMLAttributes<'div'>`; `color` shadows only the obsolete attribute (§0h).
- [ ] **Every variant class is a full literal in a `Record` map / object key.**
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe (below).
- [ ] `astro check` passes.

```astro
<Tooltip tip="hello"><button class="btn">Hover me</button></Tooltip>
<Tooltip position="left" align="start" open color="primary" tip="hi"><button /></Tooltip>
<Tooltip><div slot="tip"><b>Wow!</b></div><button /></Tooltip>
<!-- each of these must be an error: -->
<Tooltip color="neutral" />
<Tooltip position="start" />
<Tooltip align="top" />
```

`color="neutral"` failing is the point of `Exclude` — make it an explicit probe line (§0d).

## 5. Storybook stories

| Doc-page example | Story name | Props |
|---|---|---|
| Tooltip | `Default` | `tip="hello"` |
| Tooltip with tooltip-content | `RichContent` | `tip` slot with the doc's `animate-bounce` div |
| Force open | `ForceOpen` | `tip="hello" open` |
| Top | `Top` | three: `open position="top"` × `align` start / — / end |
| Bottom | `Bottom` | same, `position="bottom"` |
| Left | `Left` | same, `position="left"` — laid out in a column |
| Right | `Right` | same, `position="right"` — column, right-aligned |
| Primary…Error colors (7 examples) | `ColorPrimary` … `ColorError` | `open color="…"`, trigger is a matching `Button` |
| Responsive tooltip. only show for large screen | `ResponsiveVisibility` | wrapper story: `class="lg:tooltip"` by hand (§0e) |
| Responsive tooltip position | `ResponsivePlacement` | `align="start" class="md:tooltip-right md:tooltip-center"` |

Plus `Playground` (all five controls), `Colors` (all seven at once, since the doc splits them into seven single-colour examples), and `WithAccessibleTrigger` demonstrating §0f.

Five story-writing notes:

- **Almost every story needs `open`.** Fourteen of sixteen doc examples set `tooltip-open`, because a hover-only tooltip is invisible in a static screenshot. Keep that faithfully; it is not the doc page padding its markup.
- **Give the stories vertical room.** The doc wraps its examples in `my-6` / `my-6 mt-12`, and the Left/Right examples use `flex flex-col gap-6`. Without that, force-open bubbles overlap the canvas edge or each other. Same class of story-harness concern as `toast.md` §0a, milder.
- **`ResponsiveVisibility` cannot use the component** (§0e) — `lg:tooltip` needs the base class to be breakpoint-prefixed, and `Tooltip` always emits a bare `tooltip`. Write it as a wrapper story with raw markup and a description saying exactly that, so the gap is documented rather than looking like an oversight.
- **The colour stories compose the real `Button`** with a matching `color`, as the doc does. That is the fourth part-treatment (`chat-bubble.md` §0a) and doubles as an integration check.
- **`Left`/`Right` are where `align`'s axis swap is visible** (§0c). Their descriptions must say that `align="start"` means top-aligned there — a reader comparing `Top` and `Left` side by side will otherwise assume one of them is broken.

```ts
import Tooltip from './Tooltip.astro';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    tip: { control: 'text' },
    position: { control: 'inline-radio', options: [undefined, 'top', 'bottom', 'left', 'right'] },
    align: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end'] },
    open: { control: 'boolean' },
    color: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'],
    },
  },
};

export const Playground = {
  args: { tip: 'hello', slots: { default: '<button class="btn">Hover me</button>' } },
};

export const RichContent = {
  args: {
    slots: {
      tip: '<div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>',
      default: '<button class="btn">Hover me</button>',
    },
  },
};

// …one export per row of the table above, markup copied from the doc page.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled from the shipped CSS and the doc frontmatter — seventeen classes, sixteen examples. Nothing to re-derive.
- [ ] **Step 2:** No new union in `variants.ts`. `Exclude<DaisyColor, 'neutral'>` derives from the shared one (§0d); the `position` and `align` unions stay local, as `toast.md` and `indicator.md` did.
- [ ] **Step 3:** Rewrite `Tooltip.astro` per section 4 and run the probe, `color="neutral"` case included. Then check the built HTML: `div.tooltip-content` must be a **direct child** of `div.tooltip`, and must be **absent** when no `tip` slot is passed (§2).
- [ ] **Step 4:** Write `Tooltip.stories.ts` per section 5. Start with `RichContent` — it is the only story exercising the named slot, and it settles slot handling before the other twenty depend on it.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Tooltip`, verify:
  - `Default` shows on hover **and** on keyboard focus of the button (§0a) — tab to it, do not only mouse over it.
  - `tip=""` shows nothing at all, not an empty bubble (§0a). Add it as a deliberate case.
  - `Top`/`Bottom` move the bubble horizontally with `align`; `Left`/`Right` move it **vertically** (§0c).
  - `Colors` shows seven distinct bubble colours with legible text (each class also sets the content colour, §0d).
  - `ResponsivePlacement` moves from start-aligned top to centred right at the `md` breakpoint — resize, do not trust one width.
  - The tail (`:after`) stays attached to the bubble in all twelve position/align combinations; it is a separately positioned masked element and is the most likely thing to drift.
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class`, plus `aria-describedby` — the one §0f recommends. Confirm an explicit `data-tip` passed through `...rest` overrides the `tip` prop, as the implementation comment claims. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<div[^>]*tooltip[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Update `plans/README.md`'s Tooltip row to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All five axes have typed props; `color` is `Exclude<DaisyColor,'neutral'>` and `color="neutral"` is a type error (§0d).
- [ ] `tip` renders as `data-tip`, and `tip=""` produces no tooltip rather than an empty bubble (§0a).
- [ ] The `tip` slot renders a gated `div.tooltip-content` as a direct child, absent when unused (§0b, §2).
- [ ] `position` and `align` emit nothing when undefined, and the axis-swap on left/right is documented in JSDoc and in the story descriptions (§0c).
- [ ] `align`/`position` prop names match `indicator.md` and `toast.md` (§0c).
- [ ] Keyboard `:focus-visible` triggering verified, not assumed (§0a, §6 Step 5).
- [ ] The screen-reader gap is stated in the JSDoc with the trigger-labelling remedy, and has a story (§0f).
- [ ] `lg:tooltip` documented as not expressible through the component, with a raw-markup story (§0e).
- [ ] `Props` extends `HTMLAttributes<'div'>`; `class` merges through `class:list`.
- [ ] `Playground` exposes all five props as controls.
- [ ] Sixteen doc-example stories plus `Colors`, composing the real `Button` in the colour stories.
- [ ] Every box in section 4's Astro idioms gate ticked.
