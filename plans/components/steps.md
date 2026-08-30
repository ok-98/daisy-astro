# Steps Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/steps/
**Root element:** `ul` (`Steps`), `li` (`Step`), `span` (`StepIcon`)
**Target files:** `packages/daisy-astro/src/components/Steps/Steps.astro`, `Step.astro`, `StepIcon.astro` (only `Steps.astro` exists, as a dummy scaffold)
**Story files:** `Steps.stories.ts`, `Step.stories.ts`, `StepIcon.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'ul'>` / `HTMLAttributes<'li'>` / `HTMLAttributes<'span'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisyColor`, not `DaisySize`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-30). `Steps.astro`, `Step.astro` and `StepIcon.astro`, with 13 + 3 + 2 stories per §5. §3e.1 is answered in the build output at both levels: 19 lists render `<li class="step">` as a direct child, and 6 steps render `<span class="step-icon">` as a direct child (§8). Step 5 (visual pass) is open, and it carries §3e.2 and §3e.3. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/steps.css` and the doc page source. §3e lists what is **unverified**.

---

## 0. A CSS counter, and colour that lives on the item

```css
.steps { counter-reset: step; display:inline-grid; grid-auto-flow:column;
         grid-auto-columns:1fr; overflow:auto hidden }
.steps .step { display:grid; grid-template-rows:40px 1fr; place-items:center;
               min-width:4rem; text-align:center;
               --step-bg:var(--color-base-300); --step-fg:var(--color-base-content);
  &:before { content:""; width:100%; height:.5rem; margin-inline-start:-100%;
             background-color:var(--step-bg); grid-row-start:1; grid-column-start:1 }
  &:first-child:before { content:none }
  & > .step-icon, &:not(:has(.step-icon)):after {
      content: counter(step); counter-increment: step;
      width:2rem; height:2rem; border-radius:9999px;
      background-color:var(--step-bg); color:var(--step-fg); z-index:1 }
  &[data-content]:after { content: attr(data-content) } }

.steps .step-primary + .step-primary:before,
.steps .step-primary:after,
.steps .step-primary > .step-icon { --step-bg:var(--color-primary); --step-fg:var(--color-primary-content) }
```

**[all verified]**. The number is a **CSS counter**, the connecting bar is each step's `::before` pulled back by `margin-inline-start: -100%`, and the colour classes set two custom properties on three different selectors at once.

That last selector is the interesting one: `.step-primary + .step-primary:before` **[verified]** — the **bar** is only coloured when *both* the step and the one before it carry the same colour class. §3b.

## 1. Variant audit

**13 classes: 1 component + 2 part + 8 colour + 2 direction**, matching the doc page's frontmatter. `grep -oE '\.steps?[a-z0-9-]*' steps.css | sort -u` returns exactly those 13 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `steps` | — | — | `Steps` | Always applied. |
| Part | `step` | — | — | `Step` | Always applied. |
| Part | `step-icon` | — | — | `StepIcon` | Replaces the counter — §3c. |
| Colour | `step-neutral` `-primary` `-secondary` `-accent` `-info` `-success` `-warning` `-error` | `color` | `DaisyColor` | **`Step`** | Matches exactly — import it. On the item, not the container — §3a. |
| Direction | `steps-vertical` `steps-horizontal` | `direction` | `'vertical' \| 'horizontal'` | `Steps` | Mutually exclusive → union. `horizontal` is the default and still emittable. Responsive form is a caller class — §3d. |

**No size axis** — none exists **[verified]**. The step circle is a fixed 2 rem and the row 40 px.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Steps` | `default` | none — `<li>` children | no | the `Step`s |
| `Step` | `default` | none | no | the label, optionally preceded by a `StepIcon` |
| `StepIcon` | `default` | none | no | `😕`, or any icon |

Plain default slots, no gating.

**No `steps` array prop on `Steps`**: each step carries its own colour, an optional `data-content`, and optionally a `StepIcon` with arbitrary markup.

**`data-content` is a plain attribute**, passed through `...rest` on `Step` — not a prop. It overrides the counter with a literal string (§3c), and declaring it would shadow the native `data-*` passthrough for no gain.

## 3. Five things the naive implementation gets wrong

### 3a. `color` goes on the step, not the container

Every colour class is written on the `<li>` **[verified]**, and its rules set `--step-bg` / `--step-fg` scoped to that item.

Put the prop on `Steps` and it emits `step-primary` on the `<ul>`, where `.steps .step-primary` never matches — the class does nothing at all and every step stays grey.

Fifth appearance of this shape after Carousel, Chat, Dock and Indicator; the settled rule applies unchanged: **the prop belongs on whichever root daisyUI writes the class on.**

So `Steps` has one prop (`direction`) and `Step` has one (`color`).

### 3b. The connecting bar needs the colour on **two consecutive** steps

```css
.steps .step-primary + .step-primary:before { --step-bg: var(--color-primary) }
```

**[verified]** — the adjacent-sibling selector means a step's incoming bar is coloured only when the **previous** step shares its colour class.

Consequences, both non-obvious:

- **The first coloured step in a run has a grey bar behind it**, which is exactly what makes a progress trail read correctly: two `step-primary`s give one coloured circle, one coloured bar and one more coloured circle.
- **Mixing colours breaks the trail on purpose.** The doc page's "custom colors" example ends three `step-info`s with a `step-error` **[verified]**, and the bar into the error step stays grey — deliberate, and the reason there is no `progress` prop that colours everything up to N.

`ColorRun` (§5) shows both halves so this is observed rather than described.

### 3c. The number is a counter, and there are two ways to replace it

`content: counter(step); counter-increment: step` on `::after` **[verified]**. Two overrides, both documented:

- **`data-content="✓"`** on the step → `&[data-content]:after { content: attr(data-content) }` **[verified]**. Note the doc page includes `data-content=""` for an intentionally blank circle **[verified]** — an empty string is meaningful, so a `content` prop that dropped empty values would be wrong.
- **A `StepIcon` child** → the selector is `& > .step-icon, &:not(:has(.step-icon)):after` **[verified]**, so the presence of a `.step-icon` **suppresses** the `::after` entirely and the icon takes its place.

Two things follow for the JSDoc: the counter **still increments** for steps that override it (the `counter-increment` is on the shared rule **[verified]**), so numbering stays consistent; and `StepIcon` must be a **direct child** of the step (§3e.1), because `> .step-icon` is a child selector.

### 3d. `steps` scrolls, and the doc page wraps it by hand

`.steps` is `inline-grid` with `grid-auto-columns: 1fr` and `overflow: auto hidden` **[verified]** — every step is an equal-width column, and a long list scrolls horizontally.

But the page's "scrollable wrapper" example still wraps it in `<div class="overflow-x-auto">` **[verified]**, because `inline-grid` sizes to content and the scroll needs a constrained parent. So the wrapper is caller markup, not a prop — one JSDoc line and a story.

`min-width: 4rem` per step **[verified]** is what stops long labels from squeezing the circles.

The responsive example is `steps-vertical lg:steps-horizontal` **[verified]** — a caller class, the library's standing answer (`plans/components/card.md` §3e), and the fifth component where the prop is the less useful form.

### 3e. Unverified assumptions

1. **Do children land as direct children?** Blocking at two levels: `.steps .step` is a descendant selector and would survive a wrapper, but `.step > .step-icon` and the `+` sibling selector in §3b **both** require the real structure — a wrapper around each step breaks the bar colouring, and one around the icon breaks the icon. Twenty-seventh plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **`counter(step)` across stories.** `counter-reset: step` is on `.steps` **[verified]**, so each list restarts — but confirm that several `Steps` on one docs page do not share a counter, which would number the second list from where the first ended.
3. **`:has()` support** — `&:not(:has(.step-icon)):after` **[verified]**. Without it a step with an icon shows **both** the icon and the counter. Check before judging `WithStepIcon`; `IconAndCounter` is the story that shows it plainly.
4. **`data-content=""` serialises as a bare attribute.** Found 2026-08-30. Astro renders an empty-string attribute as `data-content` rather than `data-content=""`, so the doc page's blank-circle step is **not** a byte-for-byte match. The behaviour is unchanged — a bare attribute is an empty value in HTML, `[data-content]` still matches, and `attr(data-content)` still yields an empty string, which is the blank circle. Recorded because a grep for `data-content=""` in the build output finds nothing and looks like the attribute was dropped. Confirm the blank circle at Step 5 rather than trusting the reasoning.

## 4. Component implementation

### `Steps.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type StepsDirection = 'vertical' | 'horizontal';

/**
 * A numbered progress trail. Steps are numbered by a CSS counter, so nothing
 * needs an index (plan §3c).
 *
 * Colour goes on each `Step`, not here (plan §3a). For the usual responsive
 * trail use the class: `class="steps-vertical lg:steps-horizontal"` (plan §3d).
 *
 * Long trails scroll — wrap in `<div class="overflow-x-auto">` to constrain
 * them, as the doc page does (plan §3d).
 */
interface Props extends HTMLAttributes<'ul'> {
  direction?: StepsDirection;
}

// Full literal class names. NEVER `steps-${direction}` (plans/README.md §1b).
const DIRECTION: Record<StepsDirection, string> = {
  vertical: 'steps-vertical', horizontal: 'steps-horizontal',
};

const { direction, class: className, ...rest } = Astro.props;
---

<ul class:list={['steps', direction && DIRECTION[direction], className]} {...rest}>
  <slot />
</ul>
```

### `Step.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisyColor } from '../../lib/variants';

/**
 * One node. `color` tints this step's circle **and** the bar leading into it —
 * but only when the previous step carries the same colour, which is what makes
 * a progress run read correctly (plan §3b).
 *
 * Replace the number with `data-content="✓"` (an empty string gives a blank
 * circle) or by nesting a `StepIcon` (plan §3c). The counter keeps
 * incrementing either way.
 */
interface Props extends HTMLAttributes<'li'> {
  color?: DaisyColor;
}

// Full literal class names. NEVER `step-${color}` (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'step-primary', secondary: 'step-secondary', accent: 'step-accent',
  neutral: 'step-neutral', info: 'step-info', success: 'step-success',
  warning: 'step-warning', error: 'step-error',
};

const { color, class: className, ...rest } = Astro.props;
---

<li class:list={['step', color && COLOR[color], className]} {...rest}>
  <slot />
</li>
```

### `StepIcon.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/** Replaces the step's number. Must be a **direct child** of its `Step`
 *  (plan §3c, §3e.1). */
interface Props extends HTMLAttributes<'span'> {}

const { class: className, ...rest } = Astro.props;
---

<span class:list={['step-icon', className]} {...rest}>
  <slot />
</span>
```

No `<script>` anywhere: pure CSS. None is polymorphic — daisyUI documents `steps` on `<ul>` and `step` on `<li>`, which is also the right semantics for an ordered list of stages.

### Astro idioms gate

- [ ] Content arrives via plain default slots in all three — no `steps` array prop (§2).
- [ ] `<slot />` has no wrapper in `Steps` or `Step` — the `+` sibling and `> .step-icon` selectors both depend on it (§3e.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] Roots are `ul` / `li` / `span`; no `as` prop.
- [ ] `color` is a `Step` prop, `direction` a `Steps` prop (§3a).
- [ ] **No `data-content` prop** — it passes through `...rest` (§2).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in all three.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only) **[verified]**; `color` shadows only the obsolete non-standard attribute (`astro-jsx.d.ts:602`) **[verified]**.
- [ ] Every variant class is a literal in a `Record` map.
- [ ] Probe (§5c):
  ```astro
  <Steps><Step color="primary">Register</Step><Step>Purchase</Step></Steps>
  <Steps direction="vertical" class="lg:steps-horizontal">ok</Steps>
  <Step data-content="✓" color="success">Done</Step>
  <Step><StepIcon>😍</StepIcon>Step 3</Step>
  <Steps color="primary">must error — colour is a Step prop (§3a)</Steps>
  <Step size="lg">must error — no size axis (§1)</Step>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Three files. Doc-page examples in page order (`plans/README.md` §8), all in `Steps.stories.ts`: `Horizontal`, `Vertical`, `Responsive`, `WithStepIcon`, `WithDataContent` (seven steps including the empty one), `CustomColors`, `ScrollableWrapper`.

Plus `Playground` and `Passthrough`; `Step` and `StepIcon` get a `Playground` + `Passthrough` each.

Three beyond the doc page:

- **`ColorRun`** — two `step-primary`s followed by two plain ones, annotated to show that the bar between the two primaries is coloured and the one after is not (§3b).
- **`ColorOnContainer`** — the colour class wrongly on the `<ul>` via raw `class`, doing nothing (§3a). The props prevent it, so this is raw markup.
- **`IconAndCounter`** — a `StepIcon` in a step, confirming the counter is suppressed rather than doubled (§3c, §3e.3).

Two `Steps` lists on one page in `Playground`, to settle §3e.2.

## 6. Steps

- [x] **Step 1: done — §3e.1 is answered at both levels.** `<ul class="steps…"><li class="step` matches 19 times and `<li class="step…"><span class="step-icon` 6 times across the stories, so the adjacent-sibling rule in §3b and the child combinator in §3c both have the structure they need. §3e.2 (counter isolation) and §3e.3 (`:has()`) are runtime and move to Step 5 — `Playground` renders two trails for the first and `IconAndCounter` covers the second.
- [x] **Step 2: skipped as planned.** `DaisyColor` reused unchanged; `variants.ts` untouched.
- [x] **Step 3: done.** `Steps.astro` replaced and `Step.astro` / `StepIcon.astro` created per §4; gate walked.

  One §4 probe line was unachievable: `<Steps color="primary">` does **not** error, because `color` is a native attribute on every element and no component can reject it (`plans/components/avatar.md` §3e.3). The mistake it was meant to catch is real but type-invisible, so `ColorOnContainer` demonstrates it in a story instead. The other three lines errored as intended.
- [x] **Step 4: done.** `Steps.stories.ts` (13), `Step.stories.ts` (3) and `StepIcon.stories.ts` (2). The sub-component stories nest their subject inside a real `Steps`, since `.steps .step` is a descendant selector and neither part means anything alone.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Horizontal` numbers 1–4 automatically with a bar between each and **no** bar before the first; `ColorRun` colours the bar only between the two same-coloured steps (§3b); `WithDataContent` shows the symbols and a **blank** circle for step 6 (§3c, §3e.4); `WithStepIcon` and `IconAndCounter` show the emoji with **no** number beside it (§3e.3); `Vertical` stacks; `Responsive` flips at `lg`; `ScrollableWrapper` scrolls inside its wrapper (§3d); and `Playground`'s two trails both start at 1 (§3e.2).
- [x] **Step 6: done — forwarding confirmed on all three, and §3e.1 settled.** `Passthrough` renders `<ul class="steps steps-vertical mine" id="steps-1" data-test="yes" style="letter-spacing:2px">`, and `StepIcon`'s renders `<span class="step-icon mine" id="icon-1" …>` inside a real step. Full output in §8.
- [x] **Step 7: done — the `Steps` row in `plans/README.md` says Implemented**, covering `Step` and `StepIcon` in the same row.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 13 daisyUI classes reachable across three components.
- [x] `color` is a `Step` prop and `direction` a `Steps` prop (§3a). Note the misplacement is not type-catchable — `color` on `Steps` is accepted as a native attribute and silently does nothing, which `ColorOnContainer` shows.
- [x] Children render as direct children at both levels (§3e.1) — checked in the build output.
- [x] No invented axis — no size, no `steps` array, no `data-content` prop, no `progress` prop (§1, §2, §3b).
- [x] JSDoc states: numbering is a CSS counter (§3c), the bar needs two consecutive same-coloured steps (§3b), the two ways to replace the number including the empty-string case (§3c), and the scroll wrapper (§3d).
- [x] One story per doc-page example, plus `ColorRun`, `ColorOnContainer` and `IconAndCounter`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Horizontal      → <ul class="steps"><li class="step step-primary">Register</li>
                  <li class="step step-primary">Choose plan</li><li class="step">Purchase</li>…
Vertical        → <ul class="steps steps-vertical">…
Responsive      → <ul class="steps steps-vertical lg:steps-horizontal">…
WithStepIcon    → <li class="step step-neutral"><span class="step-icon">😕</span>Step 1</li>…
WithDataContent → … data-content="?" … "!" … "✓" … "✕" … "★" … <li class="step step-neutral" data-content>Step 6</li> … "●"
CustomColors    → three step-info then <li class="step step-error" data-content="?">Sit on toilet</li>
ScrollableWrap… → <div class="overflow-x-auto"><ul class="steps">… 24 steps …</ul></div>
IconAndCounter  → <li class="step">numbered</li><li class="step"><span class="step-icon">★</span>icon, no number</li>…
Passthrough     → <ul class="steps steps-vertical mine" id="steps-1" data-test="yes" style="letter-spacing:2px">…
StepIcon/Pass…  → <ul class="steps"><li class="step"><span class="step-icon mine" id="icon-1" data-test="yes"
                    style="letter-spacing:2px">★</span>Passthrough</li></ul>
```

What this settles:

- **§3e.1, at both levels.** `.steps > li.step` adjacency matches 19 times and `.step > .step-icon` 6 times. Nothing is injected between a list and its items or between a step and its icon, so §3b's adjacent-sibling bar rule and §3c's icon-suppression rule both have the structure they depend on.
- `color` lands on the `li` and `direction` on the `ul`, which is where daisyUI writes them (§3a).
- `data-content` passes through as a plain attribute including the empty case — serialised bare, see §3e.4.
- All 13 classes have rules in the built stylesheet.

Not settled here: the counter, the bars, the icon suppression and the scroll are all runtime. Step 5, and §3e.2/§3e.3 with it.
