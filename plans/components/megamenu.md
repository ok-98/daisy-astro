# Megamenu Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/megamenu/
**Root element:** `div` (`Megamenu`); `MegamenuItem` renders a `button` + `div` **pair** (§0a)
**Target files:** `packages/daisy-astro/src/components/Megamenu/Megamenu.astro`, `MegamenuItem.astro` (only `Megamenu.astro` exists, as a dummy scaffold)
**Story files:** `Megamenu.stories.ts`, `MegamenuItem.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'div'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/megamenu.css` and the doc page source. §3f lists what is **unverified**.


> **Status:** **Implemented** (2026-09-02), the last scaffold in the library. `Megamenu.astro`, `MegamenuItem.astro` and 11 stories. **§3e is settled from daisyUI's own CSS** — no `panelAnchor` prop is needed, and the doc page's arbitrary-variant anchor pair is a redundant second copy of wiring daisyUI already ships (§3g). **§3f.2 is answered**: 13 of 13 bars render the empty indicator followed directly by a bare trigger, with the only wrapper in the library being the deliberate one in `WrappedItem`. §3f.4 is discharged — `Menu`, `MenuTitle`, `Navbar` and `Button` are all real here. One library-wide finding in §3h: **a hardcoded attribute plus `...rest` emits the attribute twice**. **§3f.1 is not settled and cannot be** without a browser — it is the whole of Step 5.
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

### 3g. §3e resolved: the panels are already anchored

**Read out of `daisyui@5.7.22/components/megamenu.css` on 2026-09-02**, which
settles the question §6 Step 1 called blocking.

```css
.megamenu [popover]   { position-area: block-end span-inline-end }   /* no position-anchor */
.megamenu-wide        { anchor-name: --megamenu }
.megamenu-wide [popover] { position-area: block-end; position-anchor: --megamenu;
                           width: anchor-size(inline) }
.megamenu-full        { anchor-name: --megamenu }
.megamenu-full [popover] { position-area: block-end; position-anchor: --megamenu; width: 100% }
```

Two mechanisms, and **neither needs anything from the caller**:

1. **Default panels have no `position-anchor` because they do not need one.** A
   popover opened through `popovertarget` gets its invoker as its *implicit
   anchor*, so `position-area: block-end span-inline-end` already places the
   panel under the button that opened it.
2. **`wide` and `full` are anchored to the bar by daisyUI itself**, through an
   `anchor-name` / `position-anchor` pair named `--megamenu`.

So the `[anchor-name:--megamenu-c]` and `[position-anchor:--megamenu-c]` classes
in the doc page's *rendered* examples are a **second copy of mechanism 2 under a
different name**, on the two examples that already have it. daisyUI's published
markup omits them, and this library follows the published markup: **no
`panelAnchor` prop, and no arbitrary variants in the stories.**

Worth keeping the shape of the mistake, because §3e was right to flag it: the
rendered-versus-published divergence is real (as `plans/components/collapse.md`
§3g.4 found for `autocomplete`), and the way to settle it was to read the CSS
rather than to copy either version.

### 3h. A hardcoded attribute plus `...rest` emits it twice

**Measured 2026-09-02**, with a throwaway story, because this component is the
first to hardcode an attribute that callers might reasonably want to set:

```
<Megamenu id="x" popover={false} />    → <div id="x" popover class="megamenu">
<Megamenu id="x" popover="manual" />   → <div id="x" popover class="megamenu" popover="manual">
                                                        ↑ twice, and the FIRST one wins
```

`false` is dropped, as Astro drops false booleans. **A string value is not**: it
arrives through `...rest` and is written a second time, and an HTML parser keeps
the first occurrence and ignores the duplicate. So the component's own value
wins and the caller's is silently discarded.

Library-wide, not local — every component that writes a literal attribute *and*
spreads `...rest` behaves this way. `Toggle`'s `type="checkbox"` is the other
live instance: `<Toggle type="radio">` renders `type="checkbox" … type="radio"`
and stays a checkbox.

**Deliberately not fixed.** In both cases the component's value is the correct
one — a megamenu that is not a popover does not work, and a Toggle that is not a
checkbox is not a Toggle — so the outcome is right and only the duplicate
attribute is untidy. Stripping the key out of `...rest` would cost an unused
binding in every such component to change nothing a user can see. Recorded in
`plans/README.md` §5e so the next component that hardcodes an attribute knows
what it is choosing.

### 3i. No `MegamenuItem.stories.ts`, against §5

The item is only meaningful inside a `.megamenu`: outside one its trigger is an
unstyled `<button>` and its panel is a closed popover, so a standalone story
would render a single bare button and nothing else — actively misleading rather
than merely thin. `Megamenu`'s `Passthrough` exercises both props instead, and
the output shows the split: `triggerClass` on the trigger, everything else on
the panel (§8). Same call as `plans/components/stat.md` §3g.2, `hero.md` and
`navbar.md` §3f.2.

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

- [x] **Step 1: §3e is settled** — from daisyUI's CSS rather than from either version of the doc page (§3g). **§3f.1 is not**, and cannot be here: whether this browser supports the Popover API and anchor positioning is a Step 5 question. What the build does prove is that all ten classes plus the `max-sm:` variant reach the CSS, `anchor-name` and `position-anchor` included (§8).
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged; `MegamenuWidth` is local. `variants.ts` untouched.
- [x] **Step 3: done, and §3f.2 is answered.** The scaffold is replaced and `MegamenuItem.astro` created. The probe errors on all four required lines — both missing ids and both bad unions — and the `color` line the plan asked for was dropped, since `plans/README.md` §5d records that it can never error.
- [x] **Step 4: done.** `Megamenu.stories.ts`, 11 stories — the 6 doc examples plus `Playground`, `Passthrough`, `ElevenItems` and `WrappedItem`. No `MegamenuItem.stories.ts` (§3i). Ids are prefixed per story and all 46 trigger/panel pairs are unique across the document (§8).
- [ ] **Step 5:** `pnpm storybook`. **Still open, and it carries more than any other component's**: nothing in a headless build shows a popover opening or an indicator moving, and §3f.1's support question is only answerable in a browser. Verify: hovering each trigger **slides the indicator** to it; a click opens the panel **under its own trigger** (§3g mechanism 1); `WidePopovers` matches the bar's width and `InNavbar`'s panels the page's (mechanism 2); `Sizes` changes bar height and font together; `WithoutArrows` has no chevrons; below `sm` the bar disappears and the Menu button opens it vertically (§3c); **`ElevenItems`' eleventh indicator lands on the first item** (§3b); and **`WrappedItem`'s second item does the same**, which is the failure `MegamenuItem` exists to prevent.
- [x] **Step 6: done — forwarding confirmed at both levels and across the split.** `Passthrough` renders `<div id="mm-pass" popover class="megamenu megamenu-wide megamenu-lg mine …" data-test="yes" style="letter-spacing:1px">` with `<button popovertarget="pass1" class="trigger-marker after:content-none">` and `<div id="pass1" popover class="panel-marker p-2" data-test="panel" …>`. Full output in §8.
- [x] **Step 7: done — the `Megamenu` row in `plans/README.md` says Implemented**, names `MegamenuItem` and records the ten-item cap. `plans/README.md` also gained §5e from §3h.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 10 daisyUI classes reachable; `megamenu-active` is component-rendered (§0a).
- [x] `MegamenuItem` emits a bare sibling pair — confirmed in the build output (§3b, §3f.2).
- [x] `id` and `itemId` are required, and the mobile trigger is documented as caller markup (§3a).
- [x] The ten-item cap is in the JSDoc (§3b).
- [x] §3e resolved and the panel anchoring documented or propped.
- [x] No invented axis — no colour, no `arrow` prop (§3d), no `items` array (§2).
- [x] Stories use globally unique ids (§3f.3).
- [x] One story per doc-page example, plus `ElevenItems` and `WrappedItem`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-09-02). `astro check`: 202 files, 0 errors, 0 warnings, 0 hints.

```
WithoutArrows → <div id="mm-e" popover class="megamenu w-full p-2 border border-base-300">
                  <span class="megamenu-active"></span>
                  <button popovertarget="e1" class="after:content-none">One</button>
                  <div id="e1" popover><div class="p-4">Content for the first item</div></div>
                  <button popovertarget="e2" …
Passthrough   → <div id="mm-pass" popover class="megamenu megamenu-wide megamenu-lg mine w-full
                  p-2 border border-base-300" data-test="yes" style="letter-spacing:1px">
                  <span class="megamenu-active"></span>
                  <button popovertarget="pass1" class="trigger-marker after:content-none">One</button>
                  <div id="pass1" popover class="panel-marker p-2" data-test="panel"
                    style="letter-spacing:1px">…
WrappedItem   → …<button popovertarget="w1">One — unwrapped</button><div id="w1" popover>…</div>
                  <div><button popovertarget="w2">Two — wrapped</button>…</div>
                       ↑ the only wrapper anywhere, and it is the point of the story
```

Counts across the 11 stories:

```
.megamenu bars 13  → empty indicator span first, then a bare <button popovertarget>  13 of 13
triggers 46 | panels 46 | duplicate ids 0 | popovertargets with no panel 0
wrapped pairs 1  — WrappedItem, written as raw markup on purpose
```

And in the built CSS:

```
all 10 classes present, plus the .max-sm\:megamenu-vertical variant (7 rules of its own)
:nth-of-type(10) is the last anchor rule — there is no rule for an eleventh
anchor-name 7 | position-anchor 6
```

What this settles:

- **§3f.2, the most consequential instance of the shared slot-wrapping question in the library.** Everywhere else a wrapper degrades a rule; here it silently re-points every indicator at the first item, because `:nth-of-type` counts within a parent. 13 of 13 bars are clean, and the one wrapper in the output is the story that exists to show the failure.
- **§0a's pair-in-one-component idea works**: 46 triggers and 46 panels, every `popovertarget` matched by an id, no duplicates across a document holding eleven stories — which is §3f.3's hazard, avoided by prefixing rather than by hoping.
- **§3b's cap is a fact about the CSS**, not a guess: the last anchor rule is `:nth-of-type(10)`, so the eleventh trigger keeps the base `--mm-anchor: --mm1`.
- **§3d's decision is visible**: `after:content-none` is a caller class on the trigger, reached through `triggerClass`, and it ships in the CSS as a Tailwind utility — nothing daisyUI would have given a modifier for.
- **§3e is answered by §3g** and the build agrees: `anchor-name` and `position-anchor` are in the output from daisyUI's own `megamenu-wide` / `megamenu-full` rules, and no story writes either.
- **§3f.4 is discharged**: `Menu`, `MenuTitle`, `Navbar`, `NavbarStart`/`Center`/`End` and `Button` are the real components. The nested submenu `<ul>`s stay raw because a submenu is a plain list inside an `<li>` — there is no component for it and daisyUI does not define one.

Not settled here, and unusually little of it is: **nothing in this output shows the component working.** Whether a panel opens, where it opens, whether the indicator slides, and whether this browser supports `anchor()` at all — all Step 5, all §3f.1.
