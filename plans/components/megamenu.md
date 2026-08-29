# Megamenu Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/megamenu/
**Root element:** `div` (`Megamenu`); `MegamenuItem` renders a `button` + `div` **pair** (§0a)
**Target files:** `packages/daisy-astro/src/components/Megamenu/Megamenu.astro`, `MegamenuItem.astro` (only `Megamenu.astro` exists, as a dummy scaffold)
**Story files:** `Megamenu.stories.ts`, `MegamenuItem.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/megamenu.css` and the doc page source. §3f lists what is **unverified**.

---

## 0. Popover API plus CSS anchor positioning, with `:nth-of-type` wiring

daisyUI publishes the structure, as it does for Drawer:

```
<button class="btn sm:hidden" popovertarget="my-megamenu">Menu</button>
<div class="megamenu max-sm:megamenu-vertical" id="my-megamenu" popover>
  ├── <span class="megamenu-active"></span>   // the indicator that slides to the active item
  ├── <button popovertarget="first">1</button>
  ├── <div id="first" popover>
  ├── <button popovertarget="second">2</button>
  ├── <div id="second" popover>
  ╰── … max 10 popovers
```

The CSS **[all verified]**:

```css
.megamenu { display:flex; align-items:center; position:relative; overflow:visible;
            --mm-anchor: --mm1; --size: calc(var(--size-field,.25rem) * 10) }
.megamenu [popovertarget] {
  anchor-name: var(--mm-anchor); height:var(--size); padding-inline:var(--mm-p,1rem);
  &:after { content:""; rotate:-135deg; box-shadow:inset 2px 2px; … }   /* the chevron */
  &:first-of-type    { --mm-anchor: --mm1 }
  &:nth-of-type(2)   { --mm-anchor: --mm2 }
  …
  &:nth-of-type(10)  { --mm-anchor: --mm10 }
}
.megamenu:has([popovertarget]:hover) .megamenu-active,
.megamenu:has([popover]:popover-open) .megamenu-active {
  inset: anchor(var(--mm-anchor) top) anchor(var(--mm-anchor) end) … }
```

Three things follow, and they are the plan: the container **is itself a popover** (for the mobile button), each trigger gets a generated `anchor-name` from its `:nth-of-type` position, and the indicator is anchored to whichever trigger is hovered or open.

### 0a. Two files, and `MegamenuItem` renders a sibling pair

Every item is **two sibling elements** wired by a shared id: a `<button popovertarget="x">` and a `<div id="x" popover>`. Nothing wraps them — a wrapper would break the `:nth-of-type` chain (§3b).

An Astro component can render multiple root elements, so `MegamenuItem` emits both:

```astro
<MegamenuItem itemId="services">
  <Fragment slot="trigger">Services</Fragment>
  <ul class="menu">…</ul>
</MegamenuItem>
```

That halves the id bookkeeping — **one `itemId` instead of a matching `popovertarget`/`id` pair** — which is the same class of win `plans/components/drawer.md` §0a got from a required `toggleId`, and the same constraint drives it: Astro has no context API, so the id cannot be generated and shared.

`Megamenu` also renders the `<span class="megamenu-active">` itself: it is always empty, always first, and omitting it silently removes the indicator with everything else still working.

## 1. Variant audit

**10 classes: 1 component + 1 part + 2 modifier + 1 direction + 5 size**, matching the doc page's frontmatter. `grep -oE '\.megamenu[a-z0-9-]*' megamenu.css | sort -u` returns exactly those 10 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `megamenu` | — | — | Always applied. |
| Part | `megamenu-active` | — | — | Component-rendered (§0a). |
| Modifier | `megamenu-wide` `megamenu-full` | `width` | `'wide' \| 'full'` | Mutually exclusive → union. `wide` matches the container, `full` the page. |
| Direction | `megamenu-vertical` | `vertical` | `boolean` | **One class → boolean.** Its real use is the responsive class — §3c. |
| Size | `megamenu-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Sets `--size` and `--fontsize`. |

**No colour axis** — none exists **[verified]**.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Megamenu` | `default` | none — after the generated indicator | no | the `MegamenuItem`s |
| `MegamenuItem` | `trigger` | the `<button popovertarget>` | no | `Services`, `One` |
| `MegamenuItem` | `default` | the `<div popover>` | no | a `Menu`, a flex row with an image, anything |

**No `items` array prop**: the panels hold whole menus, images and nested submenus.

## 3. Six things the naive implementation gets wrong

### 3a. The container is a popover *and* a menu bar

`<div class="megamenu" id="my-megamenu" popover>` **[verified]** — the same element is the horizontal bar on desktop and a popover opened by a `sm:hidden` button on mobile.

So **`id` is a required prop**, for the same reason as Drawer's `toggleId`: the caller's own `<button popovertarget="…">` lives outside the component and must reference it. Not generated — an id the caller cannot see is useless.

The mobile trigger button is **not** part of this component. It sits outside, often in a Navbar's `navbar-end` **[verified in the navbar example]**, and the caller writes it. One JSDoc line with the snippet.

Because the container carries `popover`, it is `display: none` until opened **on browsers that support the Popover API** — but daisyUI overrides that for the desktop layout. If the whole megamenu is invisible, that is §3f.1, not the component.

### 3b. Trigger order drives the anchor names, so nothing may wrap an item

`--mm-anchor` is assigned by `:first-of-type` / `:nth-of-type(2…10)` on `[popovertarget]` **[verified]**, and the indicator reads `anchor(var(--mm-anchor) …)`.

`:nth-of-type` counts **among siblings of the same element type**, so the alternating `<button>`/`<div>` layout works: buttons are counted 1..n independently of the popovers between them. Wrap a pair in a `<div>` and every trigger becomes `:first-of-type` inside its own wrapper — all ten anchors collapse to `--mm1` and the indicator parks under the first item forever.

That is why `MegamenuItem` emits a bare sibling pair (§0a) and why §3f.2 is blocking.

**Cap: ten items.** There is no `:nth-of-type(11)` rule **[verified]**, and the doc page's structure diagram says "max 10 popovers". An eleventh trigger inherits `--mm-anchor: --mm1` from the base rule, so its indicator jumps to the first item — a wrong position rather than nothing. Same family of silent cap as `plans/components/fab.md` §3d and `plans/components/hover-gallery.md` §3b.

### 3c. `vertical` is really a responsive class

Every doc example writes `max-sm:megamenu-vertical` **[verified]** — the class exists to make the megamenu usable inside its own mobile popover, not as a standalone layout choice. daisyUI's own description says so: *"Hides horizontal megamenu so we can open a vertical megamenu in small screens."*

So the boolean prop exists for completeness, and the JSDoc points at `class="max-sm:megamenu-vertical"` as the form callers actually want — the same shape as `plans/components/footer.md` §3b and `plans/components/drawer.md` §3d.

### 3d. The chevron is an `::after`, removed with `after:content-none`

`.megamenu [popovertarget]::after` draws a rotated box-shadow arrow **[verified]**, and the doc page's "megamenu without arrows" example removes it with `class="after:content-none"` on the trigger **[verified]** — a Tailwind arbitrary variant, not a daisyUI modifier.

So **no `arrow` prop**: it would emit a Tailwind utility this library does not own, the same reasoning as `plans/components/loading.md` §3a's rejected `color`. `MegamenuItem` passes `class` to the trigger via `triggerClass` (§4) so the caller can reach it.

### 3e. Anchor positioning for the panels is inconsistent between the docs' two forms

The page's **rendered** examples put `[anchor-name:--megamenu-c]` on the container and `[position-anchor:--megamenu-c]` on each panel; its **copy-paste HTML omits both** **[verified]**.

That is the same rendered-vs-published discrepancy `plans/components/collapse.md` §3g.4 found with `autocomplete`, and here it matters more: without the anchor pair the panels fall back to default popover positioning, which is centred in the viewport rather than under the bar.

**Step 1 must settle which form actually works** and then either document the two arbitrary-variant classes as caller-supplied, or add a `panelAnchor` prop. Do not guess — the component looks fine either way until it is opened.

### 3f. Unverified assumptions

1. **Popover API and CSS anchor positioning support.** The entire component is `popover`, `popovertarget`, `anchor-name` and `anchor()` **[verified]** — the newest combination in the library after `plans/components/join.md` §3b's `@scope`. Without anchor positioning the indicator and the panels lose their placement; without the Popover API nothing opens at all. Check first.
2. **Do `MegamenuItem`s emit bare sibling pairs?** Blocking, per §3b. Confirm in the rendered HTML that `<button>`s are direct siblings inside `.megamenu` with no wrapper — this is the shared question from `plans/components/aura.md` §3e.1 in its most consequential form yet, since the failure is a silently mispositioned indicator.
3. **Multiple popovers on one Storybook docs page.** Ids are document-global and every story needs its own set — the same hazard as `plans/components/drawer.md` §5's `toggleId`, multiplied by ten per story.
4. **Cross-component composition** — every panel uses `menu`, `menu-horizontal`, `menu-title`, and the last example needs `navbar`. Raw markup in the stories until those plans land.

## 4. Component implementation

### `Megamenu.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type MegamenuWidth = 'wide' | 'full';

/**
 * A horizontal bar where each item opens a popover panel. Pure CSS on top of
 * the Popover API and anchor positioning — no script.
 *
 * `id` is **required**: the element is itself a popover, and the mobile
 * trigger button lives outside this component (plan §3a):
 *
 * ```astro
 * <button class="btn sm:hidden" popovertarget="main-menu">Menu</button>
 * <Megamenu id="main-menu" class="max-sm:megamenu-vertical">…</Megamenu>
 * ```
 *
 * At most **ten** items — an eleventh gets the first item's indicator
 * position (plan §3b).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Required — the popover target the mobile button references (plan §3a). */
  id: string;
  width?: MegamenuWidth;
  /** Prefer the responsive class `max-sm:megamenu-vertical` (plan §3c). */
  vertical?: boolean;
  size?: DaisySize;
}

// Full literal class names. NEVER `megamenu-${size}` (plans/README.md §1b).
const WIDTH: Record<MegamenuWidth, string> = {
  wide: 'megamenu-wide', full: 'megamenu-full',
};
const SIZE: Record<DaisySize, string> = {
  xs: 'megamenu-xs', sm: 'megamenu-sm', md: 'megamenu-md',
  lg: 'megamenu-lg', xl: 'megamenu-xl',
};

const { id, width, vertical = false, size, class: className, ...rest } = Astro.props;
---

<div
  id={id}
  popover
  class:list={[
    'megamenu',
    width && WIDTH[width],
    { 'megamenu-vertical': vertical },
    size && SIZE[size],
    className,
  ]}
  {...rest}
>
  <!-- Always present, always first, always empty: the sliding indicator. -->
  <span class="megamenu-active"></span>
  <slot />
</div>
```

### `MegamenuItem.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * One megamenu item: a trigger button and its popover panel, rendered as
 * **bare siblings**. They must not be wrapped — the indicator's anchor name
 * comes from the trigger's `:nth-of-type` position (plan §3b).
 *
 * `itemId` wires the pair; it must be unique in the document.
 *
 * Remove the chevron with `triggerClass="after:content-none"` (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Unique id linking the trigger to its panel (plan §0a). */
  itemId: string;
  /** Classes for the trigger `<button>`. */
  triggerClass?: string;
}

const { itemId, triggerClass, class: className, ...rest } = Astro.props;
---

<button popovertarget={itemId} class:list={[triggerClass]}>
  <slot name="trigger" />
</button>
<div id={itemId} popover class:list={[className]} {...rest}>
  <slot />
</div>
```

No `<script>` in either (§0).

### Astro idioms gate

- [ ] `Megamenu` renders the `megamenu-active` span first, and it is empty (§0a).
- [ ] `MegamenuItem` renders a **bare sibling pair** with no wrapper (§0a, §3b).
- [ ] `id` is required on `Megamenu`, `itemId` on `MegamenuItem` (§0a, §3a).
- [ ] The container carries `popover` (§3a).
- [ ] No `Astro.slots.has()` gating.
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the panel in `MegamenuItem` and the container in `Megamenu`.
- [ ] No `arrow` prop — `triggerClass="after:content-none"` instead (§3d).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] Probe (§5c):
  ```astro
  <Megamenu id="m1"><MegamenuItem itemId="a1"><Fragment slot="trigger">Services</Fragment>Panel</MegamenuItem></Megamenu>
  <Megamenu id="m2" width="full" size="lg" vertical class="max-sm:megamenu-vertical">ok</Megamenu>
  <Megamenu>must error — id is required (§3a)</Megamenu>
  <MegamenuItem>must error — itemId is required (§0a)</MegamenuItem>
  <Megamenu id="m3" color="primary">must error — no colour axis (§1)</Megamenu>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `Megamenu.stories.ts`: `ResponsiveWithVerticalMenus`, `WidePopovers`, `LotsOfLinks`, `InNavbar`, `WithoutArrows`, `Sizes` (five).

Plus `Playground` and `Passthrough`; `MegamenuItem.stories.ts` gets a `Playground` + `Passthrough`.

Two beyond the doc page:

- **`ElevenItems`** — eleven triggers, showing §3b's indicator jumping to the first item.
- **`WrappedItem`** — one item pair wrapped in a `<div>`, demonstrating the collapsed anchor chain (§3b). Written with raw markup, since `MegamenuItem` prevents it.

**Every story needs globally unique ids** — one for the container plus one per item (§3f.3). A comment says so, and the stories use a per-story prefix.

## 6. Steps

- [ ] **Step 1:** Settle §3e (which anchor form the panels need) and §3f.1 (Popover API + anchor positioning support). Both gate whether the component works at all; resolve before writing stories.
- [ ] **Step 2:** No new shared unions — `DaisySize` reused unchanged. `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Megamenu.astro` scaffold and create `MegamenuItem.astro` per §4, then walk the gate. Resolve §3f.2 here.
- [ ] **Step 4:** Replace `Megamenu.stories.ts` and create `MegamenuItem.stories.ts` per §5, with per-story id prefixes.
- [ ] **Step 5:** `pnpm storybook`, verify: hovering each trigger **slides the indicator** to it; clicking opens a panel positioned under the bar (§3e); `WidePopovers` matches the container width and `megamenu-full` the page; `Sizes` changes bar height and font; `WithoutArrows` has no chevrons; below `sm` the bar hides and the mobile button opens it vertically (§3c); `ElevenItems` mispositions the eleventh's indicator (§3b).
- [ ] **Step 6:** `Passthrough` forwarding, plus:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div id="[^"]*" popover class="megamenu[^"]*"[^>]*><span class="megamenu-active"></span><button' storybook-static/astro-prerendered-stories.json | head
  ```
  Confirms the indicator is first and the triggers are bare siblings (§3b, §3f.2).
- [ ] **Step 7:** Update the `Megamenu` row in `plans/README.md` to **Implemented**, noting `MegamenuItem` as part of it and the ten-item cap.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 10 daisyUI classes reachable; `megamenu-active` is component-rendered (§0a).
- [ ] `MegamenuItem` emits a bare sibling pair — confirmed in the build output (§3b, §3f.2).
- [ ] `id` and `itemId` are required, and the mobile trigger is documented as caller markup (§3a).
- [ ] The ten-item cap is in the JSDoc (§3b).
- [ ] §3e resolved and the panel anchoring documented or propped.
- [ ] No invented axis — no colour, no `arrow` prop (§3d), no `items` array (§2).
- [ ] Stories use globally unique ids (§3f.3).
- [ ] One story per doc-page example, plus `ElevenItems` and `WrappedItem`.
- [ ] Every box in §4's gate ticked.
