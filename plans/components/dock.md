# Dock Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/dock/
**Root element:** `div` (`Dock`), `button` by default and polymorphic (`DockItem`), `span` (`DockLabel`)
**Target files:** `packages/daisy-astro/src/components/Dock/Dock.astro`, `DockItem.astro`, `DockLabel.astro` (only `Dock.astro` exists, as a dummy scaffold)
**Story files:** `Dock.stories.ts` (+ short files per sub-component, §5)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Dock uses `DaisySize`, not `DaisyColor`** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `Dock.astro` plus the new `DockItem.astro` and `DockLabel.astro`, with 12 + 2 + 2 stories per §5. §3g.1 is answered in the build output — 16 docks render their items as direct children — and so is §3a's odd corollary: **23 inactive items render with no `class` attribute at all**, which is correct (§8). §3e's viewport meta tag is now in the package README. Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/dock.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/dock/+page.md` in `saadeghi/daisyui`). §3g lists what is **unverified**.

---

## 0. `position: fixed` is not a modifier — it is the component

```css
.dock { position:fixed; bottom:0; left:0; right:0; z-index:1; width:100%;
        height:calc(4rem + env(safe-area-inset-bottom));
        padding:.5rem; padding-bottom:env(safe-area-inset-bottom);
        display:flex; justify-content:space-around; align-items:center;
        background-color:var(--color-base-100);
        border-top:.5px solid color-mix(in oklab, var(--color-base-content) 5%, #0000) }
```

**[verified]**. There is no `dock-static` or `dock-relative` class — a Dock is always pinned to the bottom of the viewport.

That single fact drives two things this plan must get right:

- **Every doc demo adds `relative` to escape it.** The page's *rendered* examples are `<div class="dock relative border border-base-300">` inside a `pt-32` box; the copy-paste HTML omits `relative` because a real dock wants the fixed position. Storybook is in the demo situation, so **every story needs `class="relative"`** or all eight of them stack on top of each other at the bottom of the canvas iframe (§3d).
- **`viewport-fit=cover` is a document-level requirement**, not a component one (§3e).

### 0a. Three files

| File | Renders | Owns |
|---|---|---|
| `Dock.astro` | `div.dock` | `size` (§1) |
| `DockItem.astro` | `button` by default, polymorphic | `dock-active` (§3b) |
| `DockLabel.astro` | `span.dock-label` | nothing but the class |

`DockItem` earns a file even though the item has **no base class of its own** — it is styled by `.dock > *` (§3a) — because it owns `dock-active`, and because a nav dock wants `<a>` where an app dock wants `<button>` (§3b). `DockLabel` earns one on the same test as `CardBody` and `ChatHeader`: one real class, real rules, arbitrary content inside.

## 1. Variant audit

**8 classes: 1 component + 1 part + 1 modifier + 5 size**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.dock[a-z0-9-]*' dock.css | sort -u` returns exactly those 8 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `dock` | — | — | `Dock` | Always applied. |
| Part | `dock-label` | — | — | `DockLabel` | Always applied. |
| Modifier | `dock-active` | `active` | `boolean` | **`DockItem`** | Goes on the item, not the container — §3b. |
| Size | `dock-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | **`Dock`** | Matches `DaisySize` exactly — import it. Changes the dock's height, and reaches the label and the active indicator through descendant rules (`.dock-xs .dock-label`, `.dock-xs .dock-active:after`) **[verified]**, so the sub-components need no size prop. `md` is the default and still emittable. |

**No colour axis** — there is no `dock-primary` **[verified]**. The "Dock with custom colors" example uses `bg-neutral text-neutral-content`, plain Tailwind on the container. Do not import `DaisyColor`.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies ship too **[verified]** — caller-side responsive classes, the library's standing answer, see `plans/components/card.md` §3e.)

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Dock` | `default` | none — direct children of `.dock` | no | the `<button>` items |
| `DockItem` | `default` | none | no | an inline `<svg class="size-[1.2em]">`, optionally followed by a `DockLabel` |
| `DockLabel` | `default` | none | no | `Home`, `Inbox`, `Settings` |

Plain default slots throughout; no named slots, no `Astro.slots.has()` gating.

**No `label` prop on `DockItem`** and no `icon` prop: the item is a flex column with `gap: 1px` **[verified]** holding whatever the caller puts there, and the xs/sm doc examples deliberately have **icons only, no labels**. Content comes in through slots (`plans/README.md` §5).

**No `items` array prop on `Dock`.** Each item needs its own icon markup, its own `href` or handler, and its own active state — an array API would block all three.

## 3. Seven things the naive implementation gets wrong

### 3a. Items are styled by `.dock > *`, which excludes only three tag names

```css
.dock > :not(:where(script, style, template)) { cursor:pointer; display:flex; flex-direction:column;
  align-items:center; justify-content:center; flex-shrink:1; flex-basis:100%; max-width:8rem;
  height:100%; gap:1px; margin-bottom:.5rem; border-radius:var(--radius-box); position:relative; … }
```

**[verified]**. Three consequences:

1. **Any element works as an item** — `<button>`, `<a>`, `<div>`. daisyUI's examples use `<button>`; a navigation dock wants `<a>`. That is why `DockItem` is polymorphic (§3b).
2. **The item has no class of its own.** `DockItem` renders a bare `<button>` with `class:list={[{ 'dock-active': active }, className]}`, which for an inactive item with no caller class emits **no `class` attribute at all**. That is correct, and worth knowing before someone "fixes" it by inventing a `dock-item` class that does not exist.
3. **The `:not(:where(script, style, template))` guard means stray elements become items.** Anything else the component or the framework puts directly inside `.dock` gets `flex-basis: 100%` and becomes a full-width invisible cell. See §3g.1.

The item's own `:after` is the active indicator — a 1.5rem transparent pill at `bottom: .2rem` that `dock-active` widens to 2.5rem and fills with `currentColor` **[verified]**. So an inactive item already reserves the space; the indicator does not shift the layout when it appears.

### 3b. `active` belongs on the item, and the item wants to be an `<a>` sometimes

`dock-active` is written on the `<button>` in every doc example **[verified]**, and its rule is `.dock-active:after`. Put the prop on `Dock` and it emits `dock-active` on the container, where the only matching rule would be `.dock-active:after` on the container's own pseudo-element — so the wrong element grows a pill and no item is highlighted.

Third time this shape has come up: `plans/components/carousel.md` §3a (`snap` on the container, not the item) and `plans/components/chat-bubble.md` §3c (`color` on the bubble, not the chat). The rule those plans settled on applies unchanged: **the prop belongs on whichever component's root daisyUI writes the class on.**

`DockItem` is `Polymorphic<{ as: Tag }>` defaulting to `'button'` — `plans/components/button.md` §4's pattern, with the same silent §5c declaration-order trap (§3g.2). A dock is navigation, so `as="a"` with an `href` is at least as common as the default.

**Marking the current page:** `dock-active` is visual only. For a nav dock the item should also carry `aria-current="page"`, which passes through `...rest` and is not something this component invents. One JSDoc line, the same call `plans/components/breadcrumbs.md` §3b made for the last crumb.

### 3c. `disabled` needs no branching — daisyUI already handles both forms

```css
.dock > * { &[aria-disabled=true], &[disabled] { &, &:hover {
    pointer-events:none; color:color-mix(in oklab, var(--color-base-content) 10%, transparent); opacity:1 } } }
```

**[verified]** — both the native attribute and the ARIA form are styled. So a `<button disabled>` and an `<a aria-disabled="true">` both look and behave right with no prop, no branch and no ARIA patching from this library.

Worth stating because `plans/components/button.md` §3b had to branch exactly this, and the pattern gets copied by reflex — the same note `plans/components/checkbox.md` §3d makes.

### 3d. Every story needs `relative`, and so does anything embedding a dock in a page

Restating §0 as the practical rule: `.dock` is `position: fixed`, so in Storybook **eight fixed-position docks would render on top of one another** at the bottom of the canvas, one per story, with only the last one visible. The doc page solves it by adding `relative` to the demo markup.

So every story passes `class="relative"` (plus the page's `border border-base-300` and a `pt-32` wrapper), and `Dock`'s JSDoc says the class exists for demos, not for production. A real page wants the fixed position and wants **bottom padding on its own content** so the dock does not cover it — daisyUI provides no spacer, and that is worth the one line too.

`z-index: 1` **[verified]** is also low enough that a modal or drawer will sit above the dock, which is usually what you want and occasionally a surprise.

### 3e. iOS needs a viewport meta tag this component cannot emit

The doc page carries an explicit info box:

> `<meta name="viewport" content="viewport-fit=cover">` is required for responsiveness of the dock in iOS.

The CSS uses `env(safe-area-inset-bottom)` twice — once in the height and once as `padding-bottom` **[verified]** — and those environment variables resolve to `0` unless the page opts in with `viewport-fit=cover`. Without it, the dock sits under the iPhone home indicator.

**A component cannot add a `<meta>` to the document head**, so this belongs in the **package README's install steps**, next to the `@source` requirement from `plans/README.md` §1c. Both are "the library will look subtly broken until you add this line to your app" items, and they should be in the same place.

### 3f. Sizes reach the parts through descendant rules

`.dock-xs`, `-sm`, `-md`, `-lg`, `-xl` set the dock height, and each also carries `.dock-{size} .dock-label { font-size }` and (for xs/sm/lg/xl) `.dock-{size} .dock-active:after { bottom }` **[verified]** — nudging the indicator so it stays visually anchored as the bar's height changes.

So `size` lives on `Dock` alone; `DockItem` and `DockLabel` need no size prop and must not grow one. Same mechanism as `plans/components/card.md` §1's card sizes reaching `CardBody` and `CardTitle`.

Note that `md` sets exactly the same values as the unmodified `.dock` **[verified]** — it exists so the default is explicitly expressible, as in Badge and Button.

### 3g. Unverified assumptions

1. ~~**Does slot content land as direct children of `.dock`?**~~ **Answered 2026-08-31: yes.** `<div class="dock…"><button` or `><a` matches 16 times across the stories, with nothing injected between. This was the variant with the unusual twist — `.dock > :not(:where(script, style, template))` styles every other element type, so a wrapper would not have gone unstyled, it would have *become* a full-width dock item with every real item collapsed inside it. Consistent with the library-wide answer in `plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3.
2. **Generic prop inference on `DockItem`.** `Polymorphic` brings `plans/README.md` §5c's `type Props`-before-`const` failure, which is silent — renders fine, accepts nothing. The probe in §4 is mandatory.
3. **Sub-components as slot content.** Stories compose `Dock` > `DockItem` > `DockLabel`. Shared with `plans/components/card.md` §3f.4; raw HTML strings are the fallback.
4. **Slot sanitization vs inline `<svg>`.** Every item in every doc example is an inline SVG icon. Shared with `plans/components/alert.md` §3d.1 — and here a stripped icon leaves an item that is empty apart from its label, which still looks deliberate.

## 4. Component implementation

### `Dock.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * Bottom navigation bar. **`position: fixed` is built in** — there is no
 * static variant. Add `class="relative"` to demo one inside a box, and give
 * your page bottom padding so the dock doesn't cover its content (plan §3d).
 *
 * iOS needs `<meta name="viewport" content="viewport-fit=cover">` in the
 * document head for the safe-area padding to work (plan §3e).
 *
 * Children must be the items themselves — anything directly inside `.dock`
 * that isn't a script/style/template becomes an item (plan §3a).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Also sets the label size and nudges the active indicator (plan §3f). */
  size?: DaisySize;
}

// Full literal class names. NEVER `dock-${size}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b).
const SIZE: Record<DaisySize, string> = {
  xs: 'dock-xs',
  sm: 'dock-sm',
  md: 'dock-md',
  lg: 'dock-lg',
  xl: 'dock-xl',
};

const { size, class: className, ...rest } = Astro.props;
---

<div class:list={['dock', size && SIZE[size], className]} {...rest}>
  <slot />
</div>
```

### `DockItem.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST be declared before any `const`, or Astro stops inferring it and
// the component silently accepts no props (plans/README.md §5c).
type Props<Tag extends HTMLTag> = Polymorphic<{
  /** `button` by default; use `as="a"` with an `href` for a navigation dock. */
  as: Tag;
  /**
   * Highlights the item's indicator pill. Visual only — for a nav dock also
   * pass `aria-current="page"` (plan §3b).
   */
  active?: boolean;
}>;

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'button', active = false, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<!--
  No base class: the item is styled by `.dock > *`, so an inactive item with no
  caller class emits no `class` attribute at all — that is correct (plan §3a).
  `disabled` / `aria-disabled` are styled by daisyUI directly (plan §3c).
-->
<Tag class:list={[{ 'dock-active': active }, className]} {...rest}>
  <slot />
</Tag>
```

### `DockLabel.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/** Font size comes from the parent `Dock`'s `size` (plan §3f). */
interface Props extends HTMLAttributes<'span'> {}

const { class: className, ...rest } = Astro.props;
---

<span class:list={['dock-label', className]} {...rest}>
  <slot />
</span>
```

No `<script>` anywhere: Dock is pure CSS, and which item is active is the caller's routing concern, not a runtime behaviour this library owns.

`Dock` and `DockLabel` are not polymorphic — daisyUI documents both on one element.

### Astro idioms gate

- [ ] Content arrives via plain default slots in all three components — no `items`, `icon` or `label` props (§2).
- [ ] `<slot />` has **no wrapper element** in `Dock` — a wrapper would itself become a dock item (§3g.1).
- [ ] No `Astro.slots.has()` gating — nothing is optional (§2).
- [ ] `DockItem` renders **no base class**, only `dock-active` when `active` (§3a).
- [ ] `active` is a `DockItem` prop, **not** a `Dock` prop (§3b).
- [ ] `size` is a `Dock` prop; neither sub-component has one (§3f).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element in all three files — this is what carries `href`, `disabled`, `aria-disabled` and `aria-current` (§3b, §3c).
- [ ] `DockItem` uses `Polymorphic<{ as: Tag }>` defaulting to `button`; `Dock` and `DockLabel` have no `as`.
- [ ] No variant prop collides with a native attribute: `active` and `size` are not attributes of `div`/`button`.
- [ ] Every variant class is a full literal in a `Record` map or an object key — no `` `dock-${size}` `` anywhere.
- [ ] **`type Props` precedes every `const` in `DockItem.astro`**, with `as Props<HTMLTag>` on the destructure (§3g.2).
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Dock class="relative"><DockItem>ok</DockItem></Dock>
  <Dock size="xs" class="relative bg-neutral text-neutral-content">ok</Dock>
  <DockItem active aria-current="page">ok</DockItem>
  <DockItem as="a" href="/inbox">ok</DockItem>
  <DockItem disabled>ok</DockItem>
  <Dock active>must error — active is a DockItem prop (§3b)</Dock>
  <Dock color="primary">must error — no colour axis (§1)</Dock>
  <DockItem size="lg">must error — size is a Dock prop (§3f)</DockItem>
  <DockItem href="/nope">must error — href needs as="a"</DockItem>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

`Dock.stories.ts` carries the doc examples; `DockItem` and `DockLabel` get a `Playground` + `Passthrough` each.

**Every story passes `class="relative"` and renders inside the doc page's `bg-base-300 rounded-box w-full max-w-sm pt-32` wrapper** — without it the docks stack at the bottom of the canvas (§3d). A comment at the top of the file says so, because a story that drops it will look broken in a way that has nothing to do with the component.

Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props |
|---|---|---|
| Dock | `Default` | three items, second `active`, each icon + `DockLabel` |
| Dock Extra Small size | `ExtraSmall` | `size: 'xs'`, **icons only, no labels** |
| Dock Small size | `Small` | `size: 'sm'`, icons only |
| Dock Medium size | `Medium` | `size: 'md'`, icons + labels |
| Dock Large size | `Large` | `size: 'lg'`, icons + labels |
| Dock Extra Large size | `ExtraLarge` | `size: 'xl'`, icons + labels |
| Dock with custom colors | `CustomColors` | `class: 'relative bg-neutral text-neutral-content'` |

Plus `Playground` and `Passthrough`. The size axis is covered by five doc examples and the active modifier appears in every one, so no extra axis stories are needed.

Three stories beyond the doc page:

- **`AsLinks`** — items as `as="a"` with `href` and `aria-current="page"` on the active one, which is the shape a real navigation dock takes and which no doc example shows (§3b).
- **`DisabledItem`** — one `disabled` item, demonstrating §3c's no-branch-needed behaviour.
- **`Fixed`** — the only story **without** `relative`, in a tall scrolling wrapper, so the actual production behaviour is visible once. Its comment names §3d so nobody "fixes" it.

```ts
import Dock from './Dock.astro';

// `.dock` is `position: fixed` (plan §0). Every story here adds `relative` so
// they don't stack at the bottom of the canvas — except `Fixed`, which is the
// point. See plans/components/dock.md §3d.

const HOME = `<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><polyline points="1 11 12 2 23 11" fill="none" stroke="currentColor" stroke-width="2"></polyline><path d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7" fill="none" stroke="currentColor" stroke-width="2"></path></g></svg>`;

const item = (icon: string, label: string, active = false) =>
  `<button class="${active ? 'dock-active' : ''}">${icon}<span class="dock-label">${label}</span></button>`;

export default {
  title: 'Components/Dock',
  component: Dock,
  argTypes: {
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'relative border border-base-300',
    slots: { default: item(HOME, 'Home') + item(HOME, 'Inbox', true) + item(HOME, 'Settings') },
  },
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` is load-bearing here, since `relative` and the colour override both
// arrive that way (§3d).
export const Passthrough = {
  args: {
    id: 'dock-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine relative border border-base-300',
    slots: { default: item(HOME, 'Home', true) },
  },
};
```

Whether the stories can use `DockItem`/`DockLabel` as components rather than the `item()` helper depends on `plans/components/card.md` §3f.4 — resolve once, apply everywhere.

## 6. Steps

- [x] **Step 1: done — §3g.1 is answered.** Items are direct children of `.dock` in all 16 rendered docks. §3g.3 (sub-components as slot content) is settled library-wide, so the stories compose `DockItem`/`DockLabel` as real components rather than falling back to the `item()` string helper §5 sketched. §3g.4 is moot — sanitization is off, and the icons survive verbatim.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, no colour axis; `variants.ts` untouched.
- [x] **Step 3: done.** Scaffold replaced and both sub-components created per §4; gate walked. The probe errored on all four intended lines — including both misplacements this plan warns about: `<Dock active>` and `<DockItem size="lg">` are compile errors, so neither can be written through the API.
- [x] **Step 4: done.** `Dock.stories.ts` (12), `DockItem.stories.ts` (2), `DockLabel.stories.ts` (2). Every story frames its dock in the doc page's wrapper and passes `relative` — except `Fixed`, deliberately.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: stories render **inside their wrappers**, not stacked at the bottom of the canvas (§3d); `Default` shows three evenly spaced items with a wider filled pill under the second only (§3a); the five size stories differ in bar height **and** label size with the pill staying anchored (§3f); `ExtraSmall` / `Small` look right with no labels; `CustomColors` follows `currentColor`; `AsLinks` renders anchors with `aria-current="page"` on the active one (§3b); `DisabledItem` is dimmed and not clickable with no extra classes (§3c); and `Fixed` pins to the bottom of the canvas while its wrapper scrolls (§3d).
- [x] **Step 6: done — forwarding confirmed on all three, and both §3a checks pass.** `Passthrough` renders `<div class="dock mine relative border border-base-300" id="dock-1" data-test="yes" style="letter-spacing:2px">`, and `DockItem`'s renders `<a href="#inbox" aria-current="page" id="dock-item-1" … class="dock-active mine">`. Items are direct children 16 times; **23 inactive items emit no `class` attribute**; 15 carry `dock-active`. Full output in §8.
- [x] **Step 7: done — the `Dock` row in `plans/README.md` says Implemented**, covering `DockItem` and `DockLabel`. **The `viewport-fit=cover` requirement is now in the package README**, alongside the `@source` line from `plans/README.md` §1c — both are "the library looks subtly broken until you add this" items, so they live together.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 8 daisyUI classes from §1 are reachable: `dock` + 5 sizes on `Dock`, `dock-active` on `DockItem`, `dock-label` on `DockLabel`.
- [x] `active` is a `DockItem` prop and `size` is a `Dock` prop — neither is on the wrong component (§3b, §3f).
- [x] An inactive `DockItem` with no caller class emits **no `class` attribute** (§3a) — checked in the build output.
- [x] `DockItem` defaults to `button` and accepts `as="a"` with `href` narrowing (§3b).
- [x] `type Props` precedes every `const` in `DockItem.astro`, destructure annotated `as Props<HTMLTag>`, and the probe confirms props are accepted (§3g.2).
- [x] No invented axis — no `color` (§1), no `items`/`icon`/`label` props (§2), no `disabled` branching (§3c).
- [x] Slot content renders as **direct children** of `.dock` (§3g.1).
- [x] JSDoc states: the dock is `position: fixed` and needs `relative` for demos plus page padding in production (§3d), iOS needs the viewport meta (§3e), and `active` is visual so `aria-current` is the caller's (§3b).
- [x] The `viewport-fit=cover` requirement is in the package README (§3e).
- [x] `Playground` exposes every prop as a control; each sub-component has its own `Playground` and `Passthrough`.
- [x] One story per doc-page example, plus `AsLinks`, `DisabledItem` and `Fixed`.
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG icons elided. `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default      → <div class="bg-base-300 rounded-box w-full max-w-sm pt-32">
                 <div class="dock relative border border-base-300">
                   <button><svg…/><span class="dock-label">Home</span></button>
                   <button class="dock-active"><svg…/><span class="dock-label">Inbox</span></button>
                   <button><svg…/><span class="dock-label">Settings</span></button></div></div>
ExtraSmall   → <div class="dock dock-xs relative …"><button><svg…/></button>…     icons only, no labels
AsLinks      → <a href="#home">… <a href="#inbox" aria-current="page" class="dock-active">…
DisabledItem → …<button disabled><svg…/><span class="dock-label">Settings</span></button>
Fixed        → <div class="dock border border-base-300">…        no `relative` — the production shape
Passthrough  → <div class="dock mine relative border border-base-300" id="dock-1" data-test="yes"
                 style="letter-spacing:2px">…
Item/Pass…   → <a href="#inbox" aria-current="page" id="dock-item-1" data-test="yes"
                 style="letter-spacing:2px" class="dock-active mine">…
```

What this settles:

- **§3g.1**: items are direct children of `.dock` 16 times over. A wrapper here would have become a full-width item with every real item collapsed inside it — the most destructive variant of that shared question so far.
- **§3a's corollary, which looks like a bug until you check the CSS**: **23 inactive items render as bare `<button>` with no `class` attribute at all.** The item has no base class — it is styled entirely through the parent's child selector — so this is correct, and nobody should "fix" it by inventing a `dock-item` class that does not exist.
- **Neither misplacement is writable.** `<Dock active>` and `<DockItem size="lg">` are both compile errors, so §3b's and §3f's silent failures are unreachable through this API — the same guarantee Carousel got for `snap`.
- `disabled` needs no branch: it passes through and daisyUI styles it (§3c).
- All 8 classes have rules in the built stylesheet.

Not settled here: the pill indicator, the size ladder, and whether `Fixed` actually pins. Step 5.
