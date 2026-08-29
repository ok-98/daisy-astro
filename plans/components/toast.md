# Toast Component Plan

**daisyUI category:** Feedback
**daisyUI doc page:** https://daisyui.com/components/toast/
**Root element:** `div`
**Target file:** `packages/daisy-astro/src/components/Toast/Toast.astro`
**Story file:** `packages/daisy-astro/src/components/Toast/Toast.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- No shared variant union applies — Toast has no colour or size axis.
- One story file, `Playground` + one story per variant axis.
- `astro check` is the type gate, not `tsc` (§5b).

---

## 0. What the evidence actually says

Sources: `node_modules/.pnpm/daisyui@5.7.22/node_modules/daisyui/components/toast.css` (eleven declaration blocks in total) and the doc page. Both agree on **seven** classes:

```
.toast
.toast-start  .toast-center  .toast-end      (horizontal, default: end)
.toast-top    .toast-middle  .toast-bottom   (vertical,   default: bottom)
```

No colour, no size, no style. Toast is a positioner — the doc's own `desc` calls it *"a wrapper to stack elements"*, and all ten examples fill it with `Alert`s.

### 0a. `position: fixed` is the whole component, and it will escape the Storybook canvas

```css
.toast { position: fixed; inset-inline: auto 1rem; top: auto; bottom: 1rem;
         translate: var(--toast-x,0) var(--toast-y,0);
         display:flex; flex-direction:column; gap:.5rem;
         width: max-content; max-width: calc(100vw - 2rem);
         background-color: #0000 }
```

`position: fixed` anchors to the **viewport**, not to any parent. daisyUI's own doc page works around this for its live demos:

```html
<div class="w-full h-64 relative">
  <div class="toast absolute">…</div>     <!-- live demo -->
</div>
```

but the copyable code block beside it is just `<div class="$$toast">` — **no `absolute`, no wrapper**. The demo scaffolding is presentation-only and deliberately not part of the published markup.

Consequences:

1. **Do not bake `absolute` or a wrapper into the component.** The published markup is the contract; a fixed toast is what a real page wants.
2. **Every story must reproduce daisyUI's demo scaffolding**, or ten stories will stack ten toasts in the corner of the Storybook viewport, overlapping each other and outside their own canvases. Use a wrapper story component with `class="w-full h-64 relative"` and pass `class="absolute"` to `Toast` — exactly what the doc page does (§5).
3. `background-color: #0000` — the container is transparent by design. All visible styling comes from the children.

### 0b. Two independent placement axes, and the prop names already have a precedent

```css
.toast-start  { --toast-x:  0;    inset-inline: 1rem auto }
.toast-center { --toast-x: -50%;  inset-inline: 50% }
.toast-end    { --toast-x:  0;    inset-inline: auto 1rem }
.toast-bottom { --toast-y:  0;    top: auto; bottom: 1rem }
.toast-middle { --toast-y: -50%;  top: 50%;  bottom: auto }
.toast-top    { --toast-y:  0;    top: 1rem; bottom: auto }
```

Each class sets **only** its own axis's variable and inset, and `.toast`'s `translate: var(--toast-x,0) var(--toast-y,0)` combines them. `center` and `middle` are the `-50%` translate paired with a `50%` inset — the standard centring trick — which is why they cannot be expressed as a single combined enum without listing nine values.

`indicator.md` §1 hit exactly this shape (`indicator-start|center|end` + `indicator-top|middle|bottom`) and named the props **`align`** for the horizontal axis and **`position`** for the vertical one. **Use the same two names here.** Two components solving the identical problem with different prop names is the kind of inconsistency that costs more than either name choice.

Defaults come from `.toast` itself, not from a class: `inset-inline: auto 1rem` + `bottom: 1rem` is `toast-end toast-bottom`, which is why the frontmatter marks those two as `default: true`. So both props are optional and emit nothing when undefined — the *"toast-end (default) toast-bottom (default)"* example is a bare `class="toast"`.

### 0c. The entrance animation targets direct children only

```css
@media (prefers-reduced-motion: no-preference) {
  .toast > * { animation: .25s ease-out toast }
}
```

`.toast > *` — **direct children**. This is the shared slot-wrapping unknown (`aura.md` §3e.1) again, and here the failure is silent rather than structural: an interposed wrapper element would leave the toasts positioned and stacked correctly but with no entrance animation, which nobody would notice in a screenshot.

`timeline.md` §2 queued the same probe as decisive for a harder case; if it has been run by the time this plan starts, the answer carries over. If not, note that Toast's version of the check needs the animation observed, not the markup read.

Reduced motion removes the animation entirely, with no fallback — correct and intentional here (contrast `text-rotate.md` §0f, where the missing fallback loses functionality rather than decoration).

### 0d. Fifth utilities-layer component; no doc example uses the breakpoint copies

`toast.css` opens `@layer utilities{@layer daisyui.l1.l2.l3{.toast{…` and emits `.sm\:toast`, `.md\:toast-center`, `.lg\:toast-top`, … at all five breakpoints. Fifth after Table, Textarea, Text Input and Timeline (`text-rotate.md` §0g is the counter-example where the layer produced none).

Unlike Timeline (`timeline.md` §0e), **no doc example uses them here**, so this is capability without documentation. Standing rule applies unchanged — responsive placement is a caller class (`class="toast-bottom md:toast-middle"`) — and it gets one JSDoc line rather than a story, since there is no doc example to mirror (§8).

### 0e. Content is `Alert`s, and that is a composition point not a sub-component

All ten examples put one or two `<div class="alert alert-info">` inside. `.toast` styles its children only through the flex column and the entrance animation; there is no `toast-item` class.

Per the four part-treatments (`chat-bubble.md` §0a) this is the fourth one — **compose an existing component**. The stories import the real `Alert`; no `ToastItem` is created.

The `gap: .5rem` and `flex-direction: column` mean stacking order is document order, top to bottom, regardless of `position="top"` or `"bottom"`. Two of the examples show two alerts precisely to demonstrate that, so keep both in the stories rather than trimming to one.

### 0f. Accessibility: daisyUI ships no live region, and this plan does not add one

Nothing in `toast.css` or in any example sets `role`, `aria-live` or `aria-atomic`. A container that announces transient messages is the textbook case for `aria-live="polite"` / `role="status"`.

**Decision: document, do not hard-code.** Three reasons:

1. daisyUI describes Toast as a positioning wrapper, and the semantics usually belong on the message — the `Alert` component, or the element a framework injects — not on the fixed container that may sit empty for the page's whole life.
2. A hard-coded `aria-live` on a container rendered server-side with content already in it announces nothing anyway; live regions announce *changes* after the region exists.
3. `role` (`astro-jsx.d.ts:587`) and `aria-live` reach the element through `...rest`, so the caller pays one attribute.

What this plan owes in return is a loud JSDoc line recommending `aria-live="polite"` on the container when toasts are injected client-side, plus one story showing it. Recording the reasoning matters more than the default, because "the component silently has no accessibility story" is the failure mode being avoided.

### 0g. Scaffold check

```astro
<div class:list={['toast', className]} {...rest}><slot /></div>
```

Root, base class, merge and spread are all correct — the second clean scaffold in this batch after Table (`table.md` §0f). Only the two placement props are missing.

### 0h. Attribute collisions

- `align` — declared in `astro-jsx.d.ts` on `TableHTMLAttributes` (`:963`), `TdHTMLAttributes` (`:993`) and `ThHTMLAttributes` (`:1003`) only. `HTMLAttributes<'div'>` does not have it. Free — same clearance `indicator.md` established.
- `position` — not an HTML attribute anywhere. Free.
- No `color` or `size` prop, so `astro-jsx.d.ts:602` is not in play.

---

## 1. Variant audit

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| Horizontal | `toast-start` `toast-center` `toast-end` | `align` | `'start' \| 'center' \| 'end'` | `end` is the default and comes from `.toast` itself — emit nothing when undefined. Name matches `indicator.md` §1 (§0b). |
| Vertical | `toast-top` `toast-middle` `toast-bottom` | `position` | `'top' \| 'middle' \| 'bottom'` | `bottom` is the default, same treatment. |

Not built: responsive placement (§0d — caller classes), the entrance animation (§0c — free), a live region (§0f — caller attribute, documented).

## 2. Slots

Single default slot, no gating needed — the `<div class="toast">` is never optional and has no styling of its own to leave dangling (`background-color: #0000`).

Content is composed `Alert` components (§0e), not a sub-component and not named slots: the examples put one or two siblings in, and daisyUI gives them no per-child class.

**Direct-child dependency:** `.toast > *` drives the entrance animation (§0c). Verify slot content lands as a direct child, and verify it by *observing the animation*, not by reading markup — the failure here is a missing animation, not broken layout.

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {
  /** Horizontal placement. daisyUI's default is `end`, set on `.toast` itself,
   *  so leaving this undefined emits no class. */
  align?: 'start' | 'center' | 'end';
  /** Vertical placement. Default `bottom`, same treatment. */
  position?: 'top' | 'middle' | 'bottom';
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference in generic components
// (plans/README.md §5c). Harmless to keep the order everywhere.
interface Props extends HTMLAttributes<'div'> {
  align?: 'start' | 'center' | 'end';
  position?: 'top' | 'middle' | 'bottom';
}

// Full literal class names. NEVER `toast-${align}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b).
const ALIGN: Record<'start' | 'center' | 'end', string> = {
  start: 'toast-start',
  center: 'toast-center',
  end: 'toast-end',
};

const POSITION: Record<'top' | 'middle' | 'bottom', string> = {
  top: 'toast-top',
  middle: 'toast-middle',
  bottom: 'toast-bottom',
};

const { align, position, class: className, ...rest } = Astro.props;
---
{/* position: fixed — this anchors to the viewport, not to a parent. To contain
    it (a demo, a story, a card), the caller adds `absolute` and gives an
    ancestor `relative`, which is what daisyUI's doc demos do. Responsive
    placement is a caller class: class="toast-bottom md:toast-middle".
    Add aria-live="polite" when toasts are injected client-side. */}
<div
  class:list={[
    'toast',
    align && ALIGN[align],
    position && POSITION[position],
    className,
  ]}
  {...rest}
>
  <slot />
</div>
```

### Astro idioms gate

- [ ] Content arrives via the slot, not content props.
- [ ] Nothing optional to gate — the container is always rendered and is transparent.
- [ ] Root element is `<div>`, matching all ten examples.
- [ ] No `<script>` — placement and the entrance animation are pure CSS. Toast *dismissal* is application logic and out of scope, exactly as daisyUI leaves it.
- [ ] `...rest` spread onto the root, which is how `aria-live` and `role` reach it (§0f).
- [ ] Not polymorphic: every example is a `<div>`.
- [ ] `align` and `position` collide with nothing on `HTMLAttributes<'div'>` (§0h).
- [ ] **Every variant class is a full literal in a `Record` map.**
- [ ] Not generic, so §5c's ordering rule is advisory — keep it anyway.
- [ ] Prop typing verified with a throwaway probe: `<Toast align="center" position="middle" />` passes; `<Toast align="middle" />` and `<Toast position="center" />` must both error — the two unions share no members, and swapping them is the obvious mistake.
- [ ] `astro check` passes.

## 5. Storybook stories

| Doc-page example | Story name | Props |
|---|---|---|
| toast with alert inside | `Default` | none |
| toast-top toast-start | `TopStart` | `position="top" align="start"` |
| toast-top toast-center | `TopCenter` | `position="top" align="center"` |
| toast-top toast-end | `TopEnd` | `position="top" align="end"` |
| toast-start toast-middle | `MiddleStart` | `align="start" position="middle"` |
| toast-center toast-middle | `MiddleCenter` | `align="center" position="middle"` |
| toast-end toast-middle | `MiddleEnd` | `align="end" position="middle"` |
| toast-start toast-bottom (default) | `BottomStart` | `align="start"` |
| toast-center toast-bottom (default) | `BottomCenter` | `align="center"` |
| toast-end (default) toast-bottom (default) | `BottomEnd` | `align="end"` |

Plus `Playground` (both controls plus `class`), and `WithLiveRegion` — `aria-live="polite"` on the container, demonstrating §0f.

The doc page is effectively a 3×3 placement matrix plus the bare default, so these ten stories *are* the variant-axis coverage; no separate `Alignment` / `Positions` story is needed.

Three story-writing notes, the first of which is not optional:

- **Every story must be scaffolded like daisyUI's demos** (§0a): a wrapper with `class="w-full h-64 relative"` and `class="absolute"` passed to `Toast`. Without it, `position: fixed` pins all ten toasts to the same corner of the Storybook viewport, on top of each other, none of them inside its own canvas. This is a story-harness concern, not a component change — the component keeps emitting the published markup.
- **Compose the real `Alert`** (§0e), with `color="info"` and `color="success"` matching the doc. Keep **two** alerts in the nine placement stories, as the doc does — one alert cannot show the `gap: .5rem` column stacking.
- **Verify the entrance animation once, not ten times.** `Default` is enough; note in its description that `.toast > *` is direct-child-scoped (§0c) and that reduced motion removes it.

```ts
import Toast from './Toast.astro';

export default {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    align: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end'] },
    position: { control: 'inline-radio', options: [undefined, 'top', 'middle', 'bottom'] },
    class: { control: 'text' },
  },
};

// All stories render through a wrapper giving `relative` + a fixed height, and
// pass `absolute` — otherwise position:fixed escapes the canvas (§0a).
export const Playground = { args: { class: 'absolute' } };

export const TopCenter = {
  args: { position: 'top', align: 'center', class: 'absolute' },
};

// …one export per row of the table above.
```

## 6. Steps

- [ ] **Step 1:** Section 1 is already filled from the shipped CSS and the doc frontmatter — seven classes, ten examples. Nothing to re-derive.
- [ ] **Step 2:** No union goes in `variants.ts`. Both three-value unions are placement-specific; `indicator.md` declared its equivalents locally and this plan matches (§0b).
- [ ] **Step 3:** Add the two props to `Toast.astro` per section 4 — the rest of the scaffold is already correct (§0g). Run the probe, including the swapped-union negative cases.
- [ ] **Step 4:** Write `Toast.stories.ts` **plus the wrapper story component first** (§0a). Confirm one story is contained in its canvas before writing the other nine.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Toast`, verify:
  - All ten stories sit inside their own canvases (§0a).
  - The nine placement stories land in nine distinct spots — in particular `MiddleCenter` is centred on both axes, proving the `-50%` translate pair (§0b).
  - `Default`, `BottomEnd` and a bare `<Toast>` are visually identical, confirming `end`/`bottom` come from `.toast` and need no class.
  - Two alerts stack in document order with a `.5rem` gap in every placement, including `position="top"` (§0e).
  - `Default`'s alerts animate in over 250ms, and do not with OS reduced motion enabled (§0c).
- [ ] **Step 6:** Attribute forwarding story: `id`, `data-*`, `style`, `class`, plus `role` and `aria-live` — the two that carry §0f's recommendation. Headless check:

```bash
pnpm build-storybook
grep -rhoE '<div[^>]*"toast[^"]*"[^>]*>' storybook-static/astro-prerendered-stories.json | head
```
- [ ] **Step 7:** Update `plans/README.md`'s Toast row to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] Both placement axes have typed props, named `align` and `position` to match `indicator.md` (§0b).
- [ ] Neither prop emits a class when undefined, and the bare component renders end/bottom (§0b, §6 Step 5).
- [ ] `position: fixed` left intact; no `absolute` and no wrapper baked into the component (§0a).
- [ ] All stories scaffolded like daisyUI's demos and contained in their canvases (§0a, §5).
- [ ] Stories compose the real `Alert`, two of them, in the nine placement stories (§0e).
- [ ] Entrance animation confirmed on direct children and recorded in `aura.md` §3e.1 (§0c, §2).
- [ ] `aria-live` recommendation in the JSDoc with the reasoning for not defaulting it, plus a story (§0f).
- [ ] Responsive placement documented as a caller class in JSDoc; no story, because no doc example exists (§0d).
- [ ] `Props` extends `HTMLAttributes<'div'>`; `class` merges through `class:list`.
- [ ] `Playground` exposes `align`, `position` and `class`.
- [ ] Ten doc-example stories.
- [ ] Every box in section 4's Astro idioms gate ticked.
