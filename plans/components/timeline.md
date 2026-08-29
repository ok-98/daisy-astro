# Timeline Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/timeline/
**Root element:** `ul` (items are `li` — see §0b)
**Target file:** `packages/daisy-astro/src/components/Timeline/Timeline.astro`
**Sub-components:** `TimelineItem.astro`, `TimelineStart.astro`, `TimelineMiddle.astro`, `TimelineEnd.astro` (same directory, per `plans/README.md` §3b)
**Story file:** `packages/daisy-astro/src/components/Timeline/Timeline.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'ul'>` / `HTMLAttributes<'li'>` / `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- No shared variant union applies — Timeline has no colour or size axis.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/timeline.css` and the doc page. Both agree on **nine** classes:

```
.timeline
.timeline-start  .timeline-middle  .timeline-end          (parts)
.timeline-box  .timeline-compact  .timeline-snap-icon     (modifiers)
.timeline-horizontal  .timeline-vertical                  (direction)
```

Fourteen doc examples — six horizontal, six vertical, one responsive, one snap-icon.

### 0a. The connector lines are `<hr>` elements, and their position in the `<li>` is the whole layout

The doc page opens with an info box:

> The `hr` tag at the beginning or end of each item, displays a line to connect items.

and the CSS reads them positionally:

```css
.timeline > li > hr:first-child { grid-row-start:2; grid-column-start:1 }   /* incoming */
.timeline > li > hr:last-child  { grid-area: 2/3/auto/none }                /* outgoing */
.timeline :where(hr) { background-color: var(--color-base-300); height:.25rem }
```

So each `<li>` carries **0, 1 or 2** `<hr>`s: the first item omits the leading one, the last item omits the trailing one, and every item in between has both. The radius rules then round the exposed ends — five separate `:has()`/`:not(:has())` selectors exist purely to cap whichever line is at the edge of the strip.

This is the single thing a naive implementation gets wrong, and it is the reason `TimelineItem` earns its existence (§0c): the caller should say "this item has a line before / after", not remember to hand-place two `<hr>`s in the right sibling positions.

Two details that follow:

- **`:where(hr)` has zero specificity**, which is why the *"Timeline with colorful lines"* example recolours individual connectors with a plain `class="bg-primary"` on the `<hr>` and wins with no `!important`. Colouring lines is therefore a per-`<hr>` caller concern, not a Timeline prop.
- **`@media print { border: .1px solid var(--color-base-300) }`** on the `hr` — `background-color` does not print by default, so daisyUI adds a border in print. Free; nothing to expose.

### 0b. Root is `<ul>`, items are `<li>`, and the scaffold's root is already right

`.timeline > li` is the grid that positions every part:

```css
.timeline    { display:flex; position:relative }
.timeline>li { display:grid; position:relative; align-items:center; flex-shrink:0;
               grid-template-rows:    var(--timeline-row-start,minmax(0,1fr)) auto var(--timeline-row-end,minmax(0,1fr));
               grid-template-columns: var(--timeline-col-start,minmax(0,1fr)) auto var(--timeline-col-end,minmax(0,1fr)) }
```

Every selector in the file goes through `> li`, so the item element is not negotiable — an item rendered as anything else gets no grid and collapses. The scaffold's `<ul class="timeline">` root is correct; what it lacks is any of the item or part structure.

### 0c. Five components, and each one earns its place

Applying the four part-treatments (`chat-bubble.md` §0a):

| daisyUI class | Treatment | Why |
|---|---|---|
| `timeline` | `Timeline` (`ul`) | container, carries direction + 2 modifiers |
| — (`<li>`) | `TimelineItem` (`li`) | no class of its own, but owns the `<hr>` placement rule (§0a), which is the component's real value |
| `timeline-start` | `TimelineStart` (`div`) | carries `box` |
| `timeline-middle` | `TimelineMiddle` (`div`) | no `box` — see below |
| `timeline-end` | `TimelineEnd` (`div`) | carries `box` |

`TimelineItem` is the unusual one: a sub-component with **no daisyUI class at all**, justified purely by behaviour. That is a departure worth stating — everywhere else in this library a sub-component exists because a class needs a home. Here the alternative is a caller hand-placing `<hr>` siblings in first/last position, which is exactly the error §0a describes.

The three part components are thin (`<div class:list={['timeline-start', box && 'timeline-box', className]}><slot/></div>`), but they are what gives `timeline-box` a typed home and keeps `class` reaching the right element — the *"icon snapped to the start"* example writes `class="timeline-start md:text-end mb-10"`, so arbitrary caller classes on a part are a real, documented need.

`box` is deliberately **not** on `TimelineMiddle`. The frontmatter is explicit: *"`timeline-box` — Applies a box style to timeline-start or timeline-end"*, and no example boxes the middle (it holds the icon).

### 0d. Horizontal is the default, but `timeline-horizontal` still has to exist

```css
.timeline            { display:flex }            /* → flex-direction: row */
.timeline-horizontal { flex-direction: row }
.timeline-vertical   { flex-direction: column }
```

The frontmatter marks `timeline-horizontal` as *"horizontal layout (default)"*, and the CSS agrees: bare `.timeline` and `.timeline-horizontal` produce the same layout (the `> li > hr` rules in each block are equivalent). Six examples use bare `<ul class="timeline">`.

So `direction?: 'horizontal' | 'vertical'` emits a class only when set — undefined is horizontal, no class needed.

**But do not delete `horizontal` from the union as redundant.** The responsive example is:

```html
<ul class="timeline timeline-vertical lg:timeline-horizontal">
```

`lg:timeline-horizontal` is what *undoes* `timeline-vertical` above the breakpoint, and that is a caller class (§0e). Keeping `'horizontal'` in the prop's union makes the pair discoverable and lets someone set it explicitly when they want the class present.

### 0e. Responsive variants — fourth utilities-layer component, and the first whose docs actually use them

`timeline.css` opens `@layer utilities{@layer daisyui.l1.l2.l3{.timeline{…` and emits `.sm\:timeline`, `.lg\:timeline-horizontal`, `.md\:timeline-compact` … at all five breakpoints. Same finding as `table.md` §0a, `textarea.md` §0b and `text-input.md` §0b.

The difference: **daisyUI's own examples use them here**, twice —

```html
<ul class="timeline timeline-vertical lg:timeline-horizontal">
<ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
```

— including a `max-*` variant. In the other three components the capability existed but no example exercised it, so the "responsive axes are caller classes" rule was a prediction; here it is demonstrated. Both stories must show it, and the JSDoc should quote these two class strings verbatim, because they are the only documentation of the feature.

(Compare `text-rotate.md` §0g: being in `@layer utilities` does **not** guarantee breakpoint copies — that file has none. Check the file, don't infer.)

### 0f. `compact` and `snapIcon` reshape the grid via custom properties

```css
.timeline-compact                        { --timeline-row-start: 0 }
.timeline-compact .timeline-start        { grid-area:3/1/4/4; place-self:flex-start center }
.timeline-compact li:has(.timeline-start) .timeline-end { grid-row-start:auto; grid-column-start:none }
.timeline-compact.timeline-vertical > li { --timeline-col-start: 0 }
.timeline-compact.timeline-vertical .timeline-start { grid-area:1/3/4/4; place-self:center flex-start }

.timeline-snap-icon > li                 { --timeline-col-start:.5rem; --timeline-row-start:minmax(0,1fr) }
.timeline-vertical.timeline-snap-icon>li { --timeline-col-start:minmax(0,1fr); --timeline-row-start:.5rem }
```

Both are **compound** with `timeline-vertical` — each has a vertical-specific override, so `compact` and `snapIcon` do materially different things depending on `direction`. The two booleans and `direction` are therefore not independent axes, and a `Playground` that exposes all three is genuinely useful rather than combinatorial noise.

`timeline-compact` means "forces all items on one side" (frontmatter): with `--timeline-row-start: 0` the start cell collapses and `.timeline-start` is re-placed into the end cell's row. That is why the snap-icon example pairs `max-md:timeline-compact` with `timeline-vertical` — on narrow screens both sides fold onto one.

### 0g. `hr` classes need props, for the same reason `text-rotate`'s `align` did

The colourful-lines example puts `class="bg-primary"` on individual `<hr>`s — and since `TimelineItem` generates those `<hr>`s, a caller's `class` (which merges onto the `<li>`) cannot reach them.

Standing rule, sixth application (carousel `snap`, chat `color`, dock `active`, indicator placement, steps `color`, tab `active`, text-rotate `align`): *the prop belongs on whichever element the class lands on* — and when the component generates that element, a prop is the only route.

So `TimelineItem` takes `lineBeforeClass` and `lineAfterClass`, separately, because the doc's example genuinely differs per side (item 1: no leading line, trailing `bg-primary`; item 2: leading `bg-primary`, trailing plain). One combined `lineClass` would not express it.

These are `string` pass-throughs, not variant maps, so §1b's no-interpolation rule is satisfied trivially — the literals live in the caller's source where Tailwind scans them.

### 0h. Attribute collisions

- `direction` — appears in `astro-jsx.d.ts` **only** on `SVGAttributes` (`:1186`), not on `HTMLAttributes` or `UlHTMLAttributes`. Free, and already verified in an earlier plan.
- `compact`, `snapIcon`, `box`, `lineBefore`, `lineAfter`, `lineBeforeClass`, `lineAfterClass` — none exist on any HTML attribute interface. Free.
- No `color` or `size` prop on any of the five components, so `astro-jsx.d.ts:602` is not in play.

---

## 1. Variant audit

### `Timeline` (`ul.timeline`)

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Direction | `timeline-horizontal` `timeline-vertical` | `direction` | `'horizontal' \| 'vertical'` | Undefined = horizontal (§0d). Emit the class only when set. |
| Compact | `timeline-compact` | `compact` | `boolean` | Folds both sides onto one; behaves differently with `direction="vertical"` (§0f). |
| Snap icon | `timeline-snap-icon` | `snapIcon` | `boolean` | Snaps `.timeline-middle` to the start edge instead of centring it. |

### `TimelineItem` (`li`)

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Incoming line | — (`<hr>` as first child) | `lineBefore` | `boolean` | Default `true`. Set `false` on the first item (§0a). |
| Outgoing line | — (`<hr>` as last child) | `lineAfter` | `boolean` | Default `true`. Set `false` on the last item. |
| Line colour | — (caller class on the `<hr>`) | `lineBeforeClass` / `lineAfterClass` | `string` | The only route to a generated element (§0g). |

### `TimelineStart` / `TimelineEnd` (`div`)

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Box style | `timeline-box` | `box` | `boolean` | Frontmatter scopes it to start/end only (§0c). |

### `TimelineMiddle` (`div`)

No props beyond `HTMLAttributes<'div'>`.

Not built: responsive variants (§0e — caller classes, `lg:timeline-horizontal` and `max-md:timeline-compact`), `<hr>` print styling (§0a — free).

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI examples |
|---|---|---|---|---|
| `Timeline` | `default` | none — the `<ul>` itself | no | the `<li>` items |
| `TimelineItem` | `default` | none — the `<li>` itself, between the two `<hr>`s | no | the part divs |
| `TimelineStart` | `default` | `div.timeline-start` | no | a year, or a `<time>` + heading + prose |
| `TimelineMiddle` | `default` | `div.timeline-middle` | no | an `<svg>` icon |
| `TimelineEnd` | `default` | `div.timeline-end` | no | the event text |

No `Astro.slots.has()` gating anywhere: none of these wrappers is optional — a caller who does not want a part simply does not render that component. That is the point of splitting them, and it is what the *"bottom side only"* / *"top side only"* / *"without icons"* examples do.

**The shared slot-wrapping unknown (`aura.md` §3e.1) is decisive again**, harder than in most plans. Three separate selectors count direct children:

- `.timeline > li` — an interposed element between `<ul>` and the items kills every grid.
- `.timeline > li > hr:first-child` / `:last-child` — the `<hr>`s must be literal first/last children of the `<li>`, so anything wrapping `TimelineItem`'s slot content *between* them breaks the connector placement.
- `.timeline:not(:has(.timeline-middle)) :first-child hr:last-child` — the edge-rounding rules walk the same tree.

`text-rotate.md` §2 queued this probe as decisive; if it is still open when this plan starts, run it here first (§6 Step 3).

## 3. Props interface

```astro
---
// Timeline.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'ul'> {
  /** Layout axis. Horizontal is daisyUI's default, so leaving this undefined
   *  emits no class. Responsive switching is a caller class:
   *  class="lg:timeline-horizontal" alongside direction="vertical". */
  direction?: 'horizontal' | 'vertical';
  /** Fold both sides onto one. Pairs with direction — the vertical variant
   *  collapses a column rather than a row. Responsive: class="max-md:timeline-compact" */
  compact?: boolean;
  /** Snap the middle (icon) part to the start edge instead of centring it. */
  snapIcon?: boolean;
}
---
```

```astro
---
// TimelineItem.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'li'> {
  /** Render the incoming connector <hr>. Set false on the first item. */
  lineBefore?: boolean;
  /** Render the outgoing connector <hr>. Set false on the last item. */
  lineAfter?: boolean;
  /** Classes for the generated <hr>s — the only way to reach them. daisyUI's
   *  `:where(hr)` base style has zero specificity, so `bg-primary` just wins. */
  lineBeforeClass?: string;
  lineAfterClass?: string;
}
---
```

```astro
---
// TimelineStart.astro / TimelineEnd.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  /** Bordered, padded card style. daisyUI scopes timeline-box to start/end. */
  box?: boolean;
}
---
```

## 4. Component implementation

```astro
---
// Timeline.astro
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'ul'> {
  direction?: 'horizontal' | 'vertical';
  compact?: boolean;
  snapIcon?: boolean;
}

// Full literal class names. NEVER `timeline-${direction}` — an interpolated
// class gets no CSS from daisyUI (plans/README.md §1b).
const DIRECTION: Record<'horizontal' | 'vertical', string> = {
  horizontal: 'timeline-horizontal',
  vertical: 'timeline-vertical',
};

const { direction, compact, snapIcon, class: className, ...rest } = Astro.props;
---
{/* Horizontal is daisyUI's default, so `direction` is undefined-by-default and
    emits nothing. Responsive switching is a caller class — daisyUI's own
    examples use `lg:timeline-horizontal` and `max-md:timeline-compact`. */}
<ul
  class:list={[
    'timeline',
    direction && DIRECTION[direction],
    { 'timeline-compact': compact, 'timeline-snap-icon': snapIcon },
    className,
  ]}
  {...rest}
>
  <slot />
</ul>
```

```astro
---
// TimelineItem.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'li'> {
  lineBefore?: boolean;
  lineAfter?: boolean;
  lineBeforeClass?: string;
  lineAfterClass?: string;
}

const {
  lineBefore = true,
  lineAfter = true,
  lineBeforeClass,
  lineAfterClass,
  class: className,
  ...rest
} = Astro.props;
---
{/* The <hr>s ARE the connector lines, and daisyUI reads them by position:
    hr:first-child is the incoming line, hr:last-child the outgoing one.
    Omit lineBefore on the first item and lineAfter on the last, or the strip
    overhangs its ends. */}
<li class:list={[className]} {...rest}>
  {lineBefore && <hr class:list={[lineBeforeClass]} />}
  <slot />
  {lineAfter && <hr class:list={[lineAfterClass]} />}
</li>
```

```astro
---
// TimelineStart.astro  (TimelineEnd.astro is identical with 'timeline-end')
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  box?: boolean;
}

const { box, class: className, ...rest } = Astro.props;
---
<div class:list={['timeline-start', { 'timeline-box': box }, className]} {...rest}>
  <slot />
</div>
```

```astro
---
// TimelineMiddle.astro
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---
<div class:list={['timeline-middle', className]} {...rest}>
  <slot />
</div>
```

### Astro idioms gate

- [ ] Content arrives via slots on all five components, not content props.
- [ ] Nothing optional to gate with `Astro.slots.has()` — an unwanted part is an unrendered component (§2).
- [ ] Root elements match daisyUI's examples exactly: `ul` → `li` → `div`. Every selector goes through `> li` (§0b).
- [ ] No `<script>` — the entire component is CSS grid plus `:has()`.
- [ ] `...rest` spread onto each root element.
- [ ] Nothing polymorphic: `<li>` is required by `.timeline > li`, and the parts are `<div>` in all fourteen examples.
- [ ] No prop collides: `direction` is `SVGAttributes`-only (`astro-jsx.d.ts:1186`); the rest are not HTML attributes (§0h).
- [ ] **Every variant class is a full literal in a `Record` map / object key.** `lineBeforeClass` / `lineAfterClass` are caller strings, so no interpolation occurs in this package (§0g).
- [ ] None of the five is generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe (below).
- [ ] `astro check` passes.

```astro
<Timeline direction="vertical" compact snapIcon class="lg:timeline-horizontal">
  <TimelineItem lineBefore={false} lineAfterClass="bg-primary">
    <TimelineStart box>1984</TimelineStart>
    <TimelineMiddle><svg /></TimelineMiddle>
    <TimelineEnd box>First Macintosh</TimelineEnd>
  </TimelineItem>
</Timeline>
<!-- each of these must be an error: -->
<Timeline direction="diagonal" />
<TimelineMiddle box>x</TimelineMiddle>
```

## 5. Storybook stories

Fourteen doc examples, and they pair up: six horizontal shapes, the same six vertical, plus responsive and snap-icon.

| Doc-page example | Story name |
|---|---|
| Timeline with text on both sides and icon | `BothSides` |
| Timeline with bottom side only | `BottomOnly` |
| Timeline with top side only | `TopOnly` |
| Timeline with different sides | `AlternatingSides` |
| Timeline with colorful lines | `ColorfulLines` |
| Timeline without icons | `WithoutIcons` |
| Vertical timeline with text on both sides and icon | `VerticalBothSides` |
| Vertical timeline with right side only | `VerticalRightOnly` |
| Vertical timeline with left side only | `VerticalLeftOnly` |
| Vertical timeline with different sides | `VerticalAlternatingSides` |
| Vertical timeline with colorful lines | `VerticalColorfulLines` |
| Vertical timeline without icons | `VerticalWithoutIcons` |
| Responsive: vertical by default, horizontal on large screen | `Responsive` |
| Timeline with icon snapped to the start | `SnapIconCompact` |

Plus `Playground` with `direction`, `compact`, `snapIcon` and `class` controls.

No separate variant-axis story is needed: `direction` is covered by the horizontal/vertical pairs, `compact` and `snapIcon` by `SnapIconCompact`, and `Playground` exposes all three together — which matters because they are compound, not independent (§0f).

Four story-writing notes:

- **This is a five-component composition, and `args.slots` is a flat HTML string.** A story cannot nest `TimelineItem` inside `Timeline` through `slots`. Use a wrapper `.astro` story component holding the real composed markup — the same route `text-input.md` §5 and `theme-controller.md` §5 take for their composed examples. Do not flatten to raw `<li><hr/><div class="timeline-start">` markup: that would test daisyUI's CSS while testing none of this plan's components.
- **Twelve of the fourteen examples contain inline `<svg>`.** Same sanitization risk as `text-input.md` §5. Write `WithoutIcons` first — it is the one horizontal example with no SVG at all, so it isolates layout from sanitization.
- **`ColorfulLines` is the only story that exercises `lineBeforeClass` / `lineAfterClass`**, and it must reproduce the doc's asymmetry faithfully (§0g): first item has no leading line and a `bg-primary` trailing one; the second has a `bg-primary` leading line and a plain trailing one. Normalising that to "all lines primary" would make the story prove nothing.
- **`Responsive` and `SnapIconCompact` are the only documentation of the responsive classes** (§0e). Both need a description naming the exact class string, since a Storybook canvas at one width shows only half the behaviour.

```ts
import Timeline from './Timeline.astro';

export default {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    compact: { control: 'boolean' },
    snapIcon: { control: 'boolean' },
    class: { control: 'text' },
  },
};

// Composed stories render a wrapper .astro component — args.slots cannot nest
// TimelineItem inside Timeline.
export const Playground = { args: {} };

export const Responsive = {
  args: { direction: 'vertical', class: 'lg:timeline-horizontal' },
};

// …one export per row of the table above.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled from the shipped CSS and the doc frontmatter — nine classes, fourteen examples. Nothing to re-derive.
- [ ] **Step 2:** No union goes in `variants.ts`; the two-value `direction` union is one-component-specific and stays local, the same carve-out `text-input.md` and `text-rotate.md` used.
- [ ] **Step 3:** Create the five files per section 4. **Probe the direct-child question first** (§2): render one `Timeline` with two `TimelineItem`s and read the built HTML — `<li>` must be a direct child of `<ul>`, and each `<hr>` must be the literal first/last child of its `<li>`. If anything is interposed, the grid and the connectors both fail and nothing else here is testable. Record the result in `aura.md` §3e.1.
- [ ] **Step 4:** Write `Timeline.stories.ts` plus the wrapper story components. Start with `WithoutIcons`.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Timeline`, verify:
  - `BothSides` shows a continuous line with no overhang past the first or last icon — the `lineBefore={false}` / `lineAfter={false}` check (§0a).
  - The exposed line ends are rounded (`--radius-selector`), proving the edge `:has()` rules matched.
  - `ColorfulLines` colours exactly the two segments the doc colours (§0g).
  - `VerticalBothSides` puts start left and end right; `AlternatingSides` alternates.
  - `Responsive` is vertical below `lg` and horizontal above — resize the canvas, do not trust one width.
  - `SnapIconCompact` snaps icons to the start edge, and folds to one side below `md`.
  - Print preview shows the connectors as borders, not blank gaps (§0a).
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class` on `Timeline`, and separately on `TimelineItem` and `TimelineStart` — three levels, because a spread that works on the container says nothing about the parts. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<(ul|li|div)[^>]*timeline[^>]*>' storybook-static/astro-prerendered-stories.json | head -20
```
- [ ] **Step 7:** Update `plans/README.md`'s Timeline row to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All nine daisyUI classes have a home: three on `Timeline`, one on `TimelineStart`/`TimelineEnd`, three as the part components themselves.
- [ ] `TimelineItem` places `<hr>`s as literal first/last children, and defaults both to present (§0a).
- [ ] `lineBefore={false}` / `lineAfter={false}` verified to remove the overhang at the strip's ends.
- [ ] `lineBeforeClass` / `lineAfterClass` reach the generated `<hr>`s, with the doc's asymmetric colouring reproduced (§0g).
- [ ] `box` exists on `TimelineStart`/`TimelineEnd` and **not** on `TimelineMiddle` (§0c).
- [ ] `direction` emits no class when undefined, and `'horizontal'` is retained in the union for the responsive pairing (§0d).
- [ ] Responsive switching documented as caller classes, with both doc class strings quoted in JSDoc and demonstrated in two stories (§0e).
- [ ] Direct-child structure confirmed at both levels and recorded in `aura.md` §3e.1 (§2).
- [ ] Each of the five components extends the right `HTMLAttributes` and merges `class` through `class:list`.
- [ ] `Playground` exposes `direction`, `compact`, `snapIcon` and `class` together (§0f).
- [ ] Fourteen doc-example stories, composed from the real sub-components rather than raw markup (§5).
- [ ] Every box in section 4's Astro idioms gate ticked.
