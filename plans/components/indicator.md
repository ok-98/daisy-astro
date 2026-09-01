# Indicator Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/indicator/
**Root element:** `div` (`Indicator`), `span` (`IndicatorItem`)
**Target files:** `packages/daisy-astro/src/components/Indicator/Indicator.astro`, `IndicatorItem.astro` (only `Indicator.astro` exists, as a dummy scaffold)
**Story files:** `Indicator.stories.ts`, `IndicatorItem.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>` / `HTMLAttributes<'span'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **no shared unions** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/indicator.css` and the doc page source. §3e lists what is **unverified**.


> **Status:** **Implemented** (2026-09-01), first of Stage 5. `Indicator.astro`, `IndicatorItem.astro` and 22 stories. Two things §0–§3 did not cover turned up in the doc markup: **`indicator` is also a mixin**, applied to another component's root in two examples (§3f), and **this component composes by class rather than by nesting** for Badge and Status, which changes what "compose the real component" means (§3g). Implementing it also **cleared the library's last two `TODO(daisy-astro)` markers**. Step 5 (visual pass) is open.
---

## 0. Six placement classes, two axes, six custom properties

```css
.indicator { display:inline-flex; position:relative; width:max-content }
.indicator :where(.indicator-item) {
  position:absolute; z-index:1; white-space:nowrap;
  top:    var(--indicator-t, 0);    bottom: var(--indicator-b, auto);
  left:   var(--indicator-s, auto); right:  var(--indicator-e, 0);
  translate: var(--indicator-x, 50%) var(--indicator-y, -50%);
}
.indicator-start  { --indicator-s:0;   --indicator-e:auto; --indicator-x:-50% }
.indicator-center { --indicator-s:50%; --indicator-e:auto; --indicator-x:-50% }
.indicator-end    { --indicator-s:auto;--indicator-e:0;    --indicator-x:50%  }
.indicator-top    { --indicator-t:0;   --indicator-b:auto; --indicator-y:-50% }
.indicator-middle { --indicator-t:50%; --indicator-b:auto; --indicator-y:-50% }
.indicator-bottom { --indicator-t:auto;--indicator-b:0;    --indicator-y:50%  }
[dir=rtl] .indicator-start  { … mirrored … }
```

**[all verified]**. The horizontal and vertical classes set disjoint variables, so they compose freely — nine positions from six classes, which is exactly what the doc page's "multiple indicators" example shows. RTL is handled by mirrored rules on the three horizontal classes **[verified]**; no direction logic here.

## 1. Variant audit

**8 classes: 1 component + 1 part + 6 placement**, matching the doc page's frontmatter. `grep -oE '\.indicator[a-z0-9-]*' indicator.css | sort -u` returns exactly those 8 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `indicator` | — | — | `Indicator` | Always applied. |
| Part | `indicator-item` | — | — | `IndicatorItem` | Always applied. |
| Horizontal | `indicator-start` `indicator-center` `indicator-end` | `align` | `'start' \| 'center' \| 'end'` | **`IndicatorItem`** | `end` is the default. |
| Vertical | `indicator-top` `indicator-middle` `indicator-bottom` | `position` | `'top' \| 'middle' \| 'bottom'` | **`IndicatorItem`** | `top` is the default. |

**Two independent props, not one union** — §3b. **Both live on the item, not the container** — §3a. **No colour or size axis** exists **[verified]**; the badge/status styling on every example comes from those components.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]**, and the doc page has a dedicated responsive example — §3d.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Indicator` | `default` | none — direct children | no | one or more `IndicatorItem`s **plus the element being decorated** |
| `IndicatorItem` | `default` | none | yes (§3c) | `New`, `12`, `↖︎`, or nothing at all |

Plain default slots, no gating.

**No `item` named slot on `Indicator`.** The container holds *both* the indicators and the thing they decorate, in any order and any number — nine items in one example, zero structure imposed. A named slot would cap it at one.

**`indicator-item` is a positioning mixin**, and every doc example combines it with another component's class on the same element: `indicator-item badge badge-primary`, `indicator-item status status-success`. So `IndicatorItem` is a `<span>` the caller adds `class="badge badge-primary"` to — or wraps a `Button` in, as the "button as an indicator for a card" example does.

## 3. Five things the naive implementation gets wrong

### 3a. The placement classes go on the item, not the container

`.indicator-start` and friends set custom properties that `.indicator :where(.indicator-item)` reads **[verified]**. In every doc example they are written on the **item**: `class="indicator-item indicator-bottom badge"`.

Put them on the container and the variables cascade to *every* item inside, so a container with three indicators would stack all three in one corner — and with one item it would appear to work, which is the worst kind of wrong.

Fourth appearance of this shape after `plans/components/carousel.md` §3a, `plans/components/chat-bubble.md` §3c and `plans/components/dock.md` §3b. The settled rule applies: **the prop belongs on whichever component's root daisyUI writes the class on.**

`Indicator` therefore has **no props at all** beyond native passthrough.

### 3b. Placement is two axes, and both have defaults that are not `undefined`

`start`/`center`/`end` set only the horizontal variables; `top`/`middle`/`bottom` only the vertical **[verified]**. The `.indicator-item` rule falls back to `top: 0; right: 0` when neither is present, which is why daisyUI's frontmatter marks `indicator-end` and `indicator-top` as defaults.

So two independent props — `align` and `position` — not one nine-value union. A union would make the doc page's own "multiple indicators" grid unexpressible without nine literal combinations, the same reasoning as `plans/components/dropdown.md` §3c.

Naming: `align` for horizontal and `position` for vertical is a compromise — daisyUI groups all six under "placement" and gives no better words. `position` is **not** a native HTML attribute (it is CSS), so there is no collision. Stated in the JSDoc so the pairing is learnable.

### 3c. The item is often empty, and `white-space: nowrap` is why it stays a dot

Four doc examples have `<span class="indicator-item badge badge-secondary"></span>` with **no content** — an empty badge used as a status dot. So `IndicatorItem`'s slot is genuinely optional, with **no fallback content** and no gating: an empty item is a documented use, exactly like `plans/components/badge.md` §3c.

`white-space: nowrap` on the item **[verified]** keeps long text on one line rather than wrapping into the decorated element — which is what makes the "Only available for Pro users" centre example readable. A caller who wants wrapping overrides it; nothing to expose.

`z-index: 1` **[verified]** is low. An indicator on a card inside a modal is fine; one competing with a `.dropdown-content` (`z-index: 999`) is not. One JSDoc line.

### 3d. The container is `width: max-content`, and the responsive form is a caller class

`.indicator` is `display: inline-flex; width: max-content` **[verified]** — it shrinks to the decorated element, which is why it can be dropped around a button or an input with no layout change. It also means **`class="w-full"` on the container does nothing useful**; size the child instead. Same family as `plans/components/aura.md` §3c.

The doc page's responsive example is `indicator-start sm:indicator-middle md:indicator-bottom lg:indicator-center xl:indicator-end` on the item — five prefixed classes, no prop. The library's standing answer (`plans/components/card.md` §3e), and here it is the doc page's own final example, so it gets a story.

### 3f. `indicator` is a mixin too, not only a wrapper

**Found in the doc markup, 2026-09-01.** §2 describes `Indicator` purely as a
container holding both the indicators and the decorated element. Two of the
examples do something else — they put the class on the **root of the component
being decorated**:

```html
<div class="avatar indicator">…</div>
<button class="indicator tab tab-active">Notifications <span class="indicator-item badge">8</span></button>
```

That works because `.indicator` only sets `position: relative`,
`display: inline-flex` and `width: max-content` — nothing that conflicts with
`avatar` or `tab`. So `<Avatar class="indicator">` and `<Tab class="indicator">`
are both correct, and the `ForAvatar` and `ForTab` stories use them rather than
adding a wrapper the doc page does not have.

Recorded in `Indicator`'s JSDoc: it is a wrapper *or* a class you add to
something that is already a component.

### 3g. It composes by class, not by nesting — for Badge and Status

**Found while writing the stories, 2026-09-01**, and it is a correction to the
library's default instinct rather than to this plan.

`IndicatorItem` is a positioning mixin (§2 says so), and daisyUI writes the
partner's classes **on the same element**:

```html
<span class="indicator-item badge badge-secondary">New</span>
<span class="indicator-item status status-success"></span>
```

The first draft of the stories composed the real `Badge` and `Status`
components *inside* the item — following `plans/IMPLEMENTATION-ORDER.md` §5.2's
"compose the real component" rule — and produced

```html
<span class="indicator-item"><span class="status status-success"></span></span>
```

Two spans where daisyUI has one. Not broken, but not the documented markup, and
the outer span becomes an empty positioned box around a positioned dot.

**So the rule needs a qualifier**, worth carrying to any future mixin-shaped
component: *compose the real component where daisyUI nests one; pass the
partner's classes where daisyUI puts both on one element.* Here that means
`Badge` and `Status` arrive as `class="badge badge-secondary"` /
`class="status status-success"` on the item, while `Button`, `Card`,
`TextInput`, `Avatar` and `Tab` — which daisyUI genuinely nests or decorates —
are composed as components.

`plans/components/status.md`'s own `InIndicator` story now shows both shapes
side by side, since it is the one place the difference is visible.

### 3e. Unverified assumptions

1. **Do slot children land as direct children of `.indicator`?** Weaker than usual: the item rule is `.indicator :where(.indicator-item)` — a **descendant** selector **[verified]** — so a wrapper would not break positioning, and `position: relative` is on the container regardless. The decorated element is a plain flex child, so a wrapper would still lay out. Worth confirming, but this is the mildest instance of the shared question in `plans/components/aura.md` §3e.1.
2. **Cross-component composition** — every example pairs `indicator-item` with `badge`, `status`, `btn`, `card`, `input`, `avatar` or `tab`. Raw markup in stories until those plans land, noted in a comment.
3. **`:where()` specificity.** `.indicator :where(.indicator-item)` has the specificity of `.indicator` alone **[verified]**, so a caller's own utility on the item wins easily — good, and worth knowing when an override behaves *more* readily than expected.

## 4. Component implementation

### `Indicator.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Wraps an element so `IndicatorItem`s can be pinned to its corners.
 *
 * Put **both** the indicators and the decorated element in the slot, in any
 * order. Placement props live on the item, not here (plan §3a) — this
 * component has no props of its own.
 *
 * `width: max-content`, so it shrinks to the decorated element; size the
 * child, not this wrapper (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['indicator', className]} {...rest}>
  <slot />
</div>
```

### `IndicatorItem.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type IndicatorAlign = 'start' | 'center' | 'end';
type IndicatorPosition = 'top' | 'middle' | 'bottom';

/**
 * A positioning mixin — combine it with the component you actually want to
 * show: `class="badge badge-primary"`, `class="status status-success"`, or
 * wrap a `Button`.
 *
 * `align` (horizontal) and `position` (vertical) are independent and compose
 * to nine placements; the defaults are `end` and `top` (plan §3b). An empty
 * item is a documented use — it becomes a dot (plan §3c).
 */
interface Props extends HTMLAttributes<'span'> {
  /** Horizontal placement. Defaults to daisyUI's `end`. */
  align?: IndicatorAlign;
  /** Vertical placement. Defaults to daisyUI's `top`. */
  position?: IndicatorPosition;
}

// Full literal class names. NEVER `indicator-${align}` (plans/README.md §1b).
const ALIGN: Record<IndicatorAlign, string> = {
  start: 'indicator-start', center: 'indicator-center', end: 'indicator-end',
};
const POSITION: Record<IndicatorPosition, string> = {
  top: 'indicator-top', middle: 'indicator-middle', bottom: 'indicator-bottom',
};

const { align, position, class: className, ...rest } = Astro.props;
---

<span class:list={['indicator-item', align && ALIGN[align], position && POSITION[position], className]} {...rest}>
  <slot />
</span>
```

No `<script>` in either: pure CSS, RTL included (§0). Neither is polymorphic — daisyUI documents `indicator` on a `div` and `indicator-item` on a `span` (or a `div` when it wraps a button, which `class` and the caller's own element handle without an `as`).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `item` named slot (§2).
- [ ] `IndicatorItem`'s slot is optional with **no fallback content** and no gating (§3c).
- [ ] `align` and `position` are on `IndicatorItem`, **not** on `Indicator` (§3a).
- [ ] `Indicator` has no props beyond native passthrough (§3a).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root in both files.
- [ ] No `as` prop on either.
- [ ] No variant prop collides with a native attribute: `align` is not on `HTMLAttributes`; `position` is CSS, not an attribute.
- [ ] Every variant class is a literal in a `Record` map.
- [ ] Probe (§5c):
  ```astro
  <Indicator><IndicatorItem class="badge badge-primary">New</IndicatorItem><button class="btn">inbox</button></Indicator>
  <IndicatorItem align="center" position="middle" class="badge" />
  <Indicator align="start">must error — placement is an item prop (§3a)</Indicator>
  <IndicatorItem align="middle">must error — that's a vertical value (§3b)</IndicatorItem>
  <IndicatorItem color="primary">must error — no colour axis (§1)</IndicatorItem>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `Indicator.stories.ts`: `StatusIndicator`, `BadgeAsIndicator`, `ForButton`, `ForTab`, `ForAvatar`, `ForInput`, `ButtonForCard`, `CenterOfImage`, then the nine placement examples (`TopStart`, `TopCenter`, `TopEnd`, `MiddleStart`, `MiddleCenter`, `MiddleEnd`, `BottomStart`, `BottomCenter`, `BottomEnd`), `MultipleIndicators`, `Responsive`.

Plus `Playground` and `Passthrough`; `IndicatorItem.stories.ts` gets a `Playground` + `Passthrough`.

The nine placement stories are better as **one `Placements` story** rendering the 3×3 grid — which is what `MultipleIndicators` already is. Keep both: the doc page lists them separately, and `MultipleIndicators` is the at-a-glance version.

One story beyond the doc page:

- **`PlacementOnContainer`** — the placement classes wrongly applied to the container with two items, showing §3a's stacking. The type system prevents it via props, so this story uses raw `class` to demonstrate what the props protect against.

## 6. Steps

- [x] **Step 1: done.** §3e.1 is as mild as predicted — the item rule is a descendant selector, so nothing here depends on slot children being direct children. §3e.2 is fully discharged: every partner component now exists, so no story falls back to raw markup for one. §3e.3 (`:where()` specificity) needs no check beyond the CSS, which is quoted in §0.
- [x] **Step 2: skipped as planned.** Both unions local; `variants.ts` untouched.
- [x] **Step 3: done.** Gate walked. The probe errors on `<Indicator align="start">` — the §3a mistake, made unrepresentable — and on a vertical value passed to `align`. Its third line, `color="primary"`, cannot error: `color` is a native HTML attribute, the trap `plans/README.md` §5c records, and the third plan in this library to write it into a probe.
- [x] **Step 4: done.** `Indicator.stories.ts`, 22 stories — 19 doc-page examples plus `Playground`, `Passthrough` and `PlacementOnContainer`. **No `IndicatorItem.stories.ts`**: its props are exercised by all nine placement stories and its forwarding by `Indicator`'s nested `Passthrough`, the same call `plans/components/stat.md` §3g.2 made.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes and a resize.** Verify: each of the nine placements sits where its name says, half-overlapping the corner or edge; `MultipleIndicators` shows all nine at once without collision; **`Responsive` moves through five positions as the canvas is resized**; `ForButton` and `ForInput` leave the decorated element's size unchanged (§3d); **`PlacementOnContainer`'s right-hand box stacks both badges in one corner** (§3a); and an RTL canvas mirrors the horizontal placements with no code change.
- [x] **Step 6: done — forwarding confirmed at both levels.** `Passthrough` renders `<div class="indicator mine" id="indicator-1" data-test="yes" style="letter-spacing:1px">` around a marked item carrying both placement classes. Full output in §8.
- [x] **Step 7: done — the `Indicator` row in `plans/README.md` says Implemented** and names `IndicatorItem`. Implementing it also cleared the last two `TODO(daisy-astro)` markers in the library, in `Join` and `Status`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 8 daisyUI classes reachable; the six placement classes are `IndicatorItem` props (§3a).
- [x] `align` and `position` are independent and compose to nine placements (§3b).
- [x] `Indicator` has no variant props.
- [x] An empty `IndicatorItem` renders as a dot — no fallback content (§3c).
- [x] JSDoc states: `indicator-item` is a mixin to combine with Badge/Status (§2), the container is content-sized (§3d), `z-index: 1` is low (§3c), and the responsive form is a class (§3d).
- [x] One story per doc-page example, plus `PlacementOnContainer`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-01). `astro check`: 196 files, 0 errors, 0 warnings, 0 hints.

```
StatusIndicator → <div class="indicator"><span class="indicator-item status status-success"></span>
                    <div class="grid w-32 h-32 rounded bg-base-300 place-items-center">content</div></div>
                          ↑ one element, two component classes — §3g
ForTab          → <div class="tabs tabs-lift"><button class="tab">Messages</button>
                    <button class="tab tab-active indicator">Notifications
                      <span class="indicator-item badge">8</span></button>…
                             ↑ `indicator` on the Tab's own root — §3f
Passthrough     → <div class="indicator mine" id="indicator-1" data-test="yes" style="letter-spacing:1px">
                    <span class="indicator-item indicator-center indicator-bottom badge item-marker"
                      id="item-1" data-test="item">Passthrough</span>…
```

Counts across the 22 stories:

```
.indicator roots 21 | .indicator-item elements 33 | empty items 10
start 9 | center 9 | end 5 | top 3 | middle 8 | bottom 11
`indicator` applied to another component's root: 2 (Avatar, Tab)
all 8 classes have rules in the built stylesheet
```

What this settles:

- **§3b's two axes, demonstrated at full span**: the nine placement stories and `MultipleIndicators` between them emit every combination of the six classes. A single nine-value union could not have produced that grid without listing all nine literals.
- **§3c's empty item is the common case, not an edge case** — 10 of the 33 items have no content at all, which is why the slot has no fallback.
- **§3f**: two roots carry `indicator` alongside `avatar` or `tab`, matching the doc page rather than adding a wrapper it does not have.
- **§3g**: `indicator-item badge badge-secondary` and `indicator-item status status-success` are single elements, as published. The nested alternative renders and looks similar, which is exactly why it is worth a note rather than a silent choice.
- **The last raw-markup debt in the library is gone**: `Join`'s `NestedItems` and `Status`'s `InIndicator` both compose this component now, and `grep -rn 'TODO(daisy-astro)' packages/daisy-astro/src` returns nothing.

Not settled here: where any of the nine actually lands, the responsive ladder, and the RTL mirror. All Step 5.
