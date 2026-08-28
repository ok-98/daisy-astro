# Drawer Component Plan

**daisyUI category:** Layout
**daisyUI doc page:** https://daisyui.com/components/drawer/
**Root element:** `div` (`Drawer`), `label` (`DrawerButton`)
**Target files:** `packages/daisy-astro/src/components/Drawer/Drawer.astro`, `DrawerButton.astro` (only `Drawer.astro` exists, as a dummy scaffold)
**Story files:** `Drawer.stories.ts`, `DrawerButton.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props extend `HTMLAttributes<'div'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Drawer uses none of them** (§1).
- Stories run on `@storybook-astro/framework`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/drawer.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/drawer/+page.md` in `saadeghi/daisyui`). §3h lists what is **unverified**.

---

## 0. A fixed structure held together by sibling selectors

daisyUI publishes the structure as part of the docs, which no other component in this library does:

```
.drawer                    // root
  ├── .drawer-toggle       // hidden checkbox
  ├── .drawer-content      // page content
  ╰── .drawer-side         // sidebar wrapper
       ├── .drawer-overlay // dark click-to-close layer
       ╰── …               // sidebar content
```

Every state rule is written with the **general sibling combinator** `~` **[all verified]**:

```css
:where(.drawer-toggle:checked ~ .drawer-side)      { visibility:visible; opacity:1; pointer-events:auto }
.drawer-toggle:focus-visible ~ .drawer-content label.drawer-button { outline:2px solid }
.drawer-end > .drawer-toggle ~ .drawer-content     { grid-column-start:1 }
.drawer-end > .drawer-toggle ~ .drawer-side        { grid-column-start:2; justify-items:end }
```

So the checkbox must be a **direct child of `.drawer`** *and* must come **before** both the content and the side in document order. Nothing else in this library has an ordering constraint; get it wrong and the drawer renders perfectly and never opens.

**That is the argument for named slots and a component-owned skeleton.** `Drawer` renders the root, the toggle, `.drawer-content`, `.drawer-side` and `.drawer-overlay`; the caller fills two slots. Same shape as `plans/components/diff.md` §0, one level bigger.

### 0a. Two files, and the id has to be a required prop

| File | Renders | Owns |
|---|---|---|
| `Drawer.astro` | the whole skeleton above | `end`, `open`, and the toggle's `id` |
| `DrawerButton.astro` | `label.drawer-button` | the `for` wiring and the focus ring (§3c) |

The toggle's `id` is not an implementation detail the component can hide: the overlay needs `for`, **and so does every open/close button the caller writes inside the content slot**. Astro has no context API, so the value cannot be pushed into slotted markup — the same constraint `plans/components/accordion.md` §0a hit with the shared radio `name`, and with the same answer:

**`toggleId` is a required prop on `Drawer` and repeats on every `DrawerButton`.** A generated id would be worse, not better — the caller could not reference it.

```astro
<Drawer toggleId="main-drawer">
  <Fragment slot="content">
    <DrawerButton toggleId="main-drawer" class="btn">Open drawer</DrawerButton>
  </Fragment>
  <Fragment slot="side">
    <ul class="menu bg-base-200 min-h-full w-80 p-4">…</ul>
  </Fragment>
</Drawer>
```

## 1. Variant audit

**8 classes + 2 Tailwind variants**, matching the doc page's `classnames` frontmatter exactly. `grep -oE '\.drawer[a-z0-9-]*' drawer.css | sort -u` returns the 8 classes **[verified]**; the two variants are not classes and do not appear there (§3e).

| Axis | daisyUI class | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `drawer` | — | — | `Drawer` | Always applied. |
| Part | `drawer-toggle` | — | — | `Drawer` | The hidden checkbox — component-rendered (§3a). |
| Part | `drawer-content` | — | — | `Drawer` | Wrapper for the `content` slot. |
| Part | `drawer-side` | — | — | `Drawer` | Wrapper for the `side` slot. |
| Part | `drawer-overlay` | — | — | `Drawer` | Rendered as a `<label>`, first child of `.drawer-side` (§3b). |
| Part | `drawer-button` | — | — | **`DrawerButton`** | Not decorative — it carries the focus ring (§3c). |
| Placement | `drawer-end` | `end` | `boolean` | `Drawer` | One class, so a boolean rather than a union — §3d. |
| Modifier | `drawer-open` | `open` | `boolean` | `Drawer` | Forces the sidebar to be a permanent column. Responsive form is a caller class — §3d. |

**No colour axis, no size axis** — none exists **[verified]**. Widths (`w-60 md:w-80`), backgrounds (`bg-base-200`) and heights all come from caller classes on the sidebar content.

### 1a. Non-class props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `toggleId` | `string` (**required**) | — | The checkbox's `id`; every `DrawerButton` and the overlay reference it — §0a. |
| `overlayLabel` | `string` | `'close sidebar'` | `aria-label` on the overlay, which is an empty `<label>` — §3b. |
| `contentClass` | `string` | — | Classes for `.drawer-content` — §3f. |
| `sideClass` | `string` | — | Classes for `.drawer-side` — §3f. |

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Drawer` | `content` | `div.drawer-content` | no | navbar + page content, and a `DrawerButton` |
| `Drawer` | `side` | `div.drawer-side`, **after** the overlay | no | `<ul class="menu bg-base-200 min-h-full w-80 p-4">` |
| `DrawerButton` | `default` | none | no | `Open drawer`, or a hamburger `<svg>` |

Two named slots on `Drawer`, no default slot — symmetric with `plans/components/diff.md` §2, and here it also keeps the caller from accidentally putting content where the ordering constraint (§0) would break.

No `overlay` slot: the overlay is an intentionally empty `<label>` whose whole job is to be clickable (§3b).

## 3. Eight things the naive implementation gets wrong

### 3a. The toggle must be hidden without `display: none`, and it must come first

```css
.drawer-toggle { appearance:none; opacity:0; width:0; height:0; position:fixed }
```

**[verified]** — deliberately *not* `display: none` and *not* `hidden`, because a `display: none` checkbox is not focusable and the whole keyboard path (§3c) dies with it. Any "cleanup" that swaps this for `hidden` or `sr-only` breaks it.

Its position in the DOM is load-bearing per §0. The component renders it first, so a caller cannot get this wrong — which is most of why the skeleton is component-owned.

Note the one place daisyUI *does* hide it: `.drawer-open > .drawer-toggle { display: none }` **[verified]**, because a permanently-open drawer has nothing to toggle.

`autocomplete="off"` appears on the toggle in the doc page's **rendered** examples but not in its copy-paste HTML — the same discrepancy `plans/components/collapse.md` §3g.4 found. It stops browsers restoring the open state on reload, which is what you want for a drawer. Emit it; record the decision in Step 3.

### 3b. The overlay is an empty `<label>`, and its `aria-label` is its only name

```html
<label for="my-drawer-1" aria-label="close sidebar" class="drawer-overlay"></label>
```

**[verified in all five examples]**. It has no content by design — it is a full-bleed click target (`place-self: stretch stretch; position: sticky; background-color: oklch(0% 0 0/.4)` **[verified]**) that unchecks the toggle.

Two things follow:

- **It must be the first child of `.drawer-side`.** `.drawer-side > :not(.drawer-overlay)` is what applies `translate: -100%` to the sidebar panel **[verified]**, so the overlay is excluded from the slide and everything else is included. The component renders it before the `side` slot.
- **`aria-label` is the only accessible name it can have**, since it is empty. Defaulted to daisyUI's own `"close sidebar"` and exposed as `overlayLabel` so it can be localised. Same handling as `plans/components/diff.md` §3e's `item1Label`.

When `drawer-open` is active, daisyUI neutralises the overlay rather than removing it: `cursor: default; background-color: #0000` **[verified]**. So no conditional rendering is needed.

### 3c. `drawer-button` is a focus-ring mechanism, not a style hook

```css
.drawer-toggle:focus-visible ~ .drawer-content label.drawer-button { outline: 2px solid; outline-offset: 2px }
```

**[verified]**. The checkbox is invisible (§3a) but focusable, so tabbing to it would otherwise show **nothing at all**. `drawer-button` is what transfers that focus ring onto the visible label.

Omitting the class therefore does not merely lose styling — it makes the drawer's only keyboard affordance invisible. That is the whole case for `DrawerButton.astro`: a one-class `<label for>` that nobody can forget, and that carries the required `toggleId` in its type.

Note the selector is scoped to `~ .drawer-content`, so a `drawer-button` placed inside `.drawer-side` gets no ring. Buttons that close the drawer from within the sidebar are ordinary labels; the JSDoc says so.

`DrawerButton` is **not polymorphic** — it must be a `<label>` for the checkbox hack, so there is no `as`.

### 3d. `end` is a boolean, `open` is not really "open"

**`drawer-end`** is the only placement class — there is no `drawer-start` **[verified]** — so it maps to a boolean, the same call `plans/components/card.md` §1 made for `card-side`. It flips the grid (`grid-auto-columns: auto max-content`) and the slide direction **[verified]**.

**`drawer-open`** is named misleadingly. It does not "open" a drawer that then closes — it converts the sidebar from a fixed overlay into a **permanent grid column**: `position: sticky`, `width: auto`, `display: block`, overlay made transparent and non-interactive, and the toggle `display: none` **[all verified]**.

Its real use is responsive, and both doc examples use it that way: `lg:drawer-open` gives a sidebar that is permanent on desktop and a toggleable overlay on mobile. That form is a **caller class**, not a prop — the library's standing answer for responsive axes (`plans/components/card.md` §3e):

```astro
<Drawer toggleId="x" class="lg:drawer-open">
```

The boolean `open` prop covers the unconditional case. Its JSDoc says "permanent sidebar", not "opens the drawer", because the second reading is what a caller will assume.

### 3e. `is-drawer-open:` and `is-drawer-close:` are Tailwind *variants*, not classes

New category — nothing else in this library has one. daisyUI registers two custom Tailwind variants **[listed in the doc page's `classnames.variant`]**, used as prefixes on ordinary utilities:

```html
<div class="is-drawer-close:w-14 is-drawer-open:w-64">
<span class="is-drawer-close:hidden">Homepage</span>
<button class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
```

They do not appear in `drawer.css`'s class list **[verified — the grep returns 8 classes, none of them these]** because they are generated by the plugin at build time, from whatever utilities the caller writes.

Consequences:

- **No props.** These are caller-side prefixes, exactly like `lg:` — a prop would have to interpolate `is-drawer-close:${utility}`, which is both banned by `plans/README.md` §1b and pointless.
- **They only exist if daisyUI's plugin is loaded** and Tailwind scans the source that uses them — so the `@source` requirement from `plans/README.md` §1c applies to caller code here, not just to this library's own files.
- They are what makes the icon-only collapsible sidebar example work, and that example is worth reproducing as a story precisely because nothing else exercises them.

### 3f. Both wrappers need class escape hatches

The doc examples put classes on parts the named slots hide:

| Part | Classes seen in the doc page |
|---|---|
| `.drawer-content` | `flex flex-col`, `flex flex-col items-center justify-center` |
| `.drawer-side` | `z-1002`, `max-lg:z-1002`, `max-lg:top-16 lg:h-80 is-drawer-close:overflow-visible` |

So `contentClass` and `sideClass`, the escape hatch established by `plans/components/avatar.md` §3a and `plans/components/collapse.md` §3d. `class` keeps merging onto the root, where `lg:drawer-open`, `h-56` and `rounded overflow-hidden` go.

Note the `z-1002` values: `.drawer-side` is `z-index: 10` **[verified]**, and the docs site raises it to sit above its own chrome. That is a docs-site concern, not a component default — but it is a hint that the stock `z-index: 10` will lose to anything higher on a real page.

### 3g. Opening a drawer touches the document root

```css
:where(:root:has(.drawer-toggle:checked))          { --page-scroll-lock: }
:root:has(.drawer-open > .drawer-toggle:checked)   { --page-scroll-lock: revert-layer }
```

**[verified]**, plus the doc page's info box about `scrollbar-gutter`:

> Opening a drawer adds a scrollbar-gutter to the page to avoid layout shift… On Firefox you need to detect the presence of vertical scrollbar and set `scrollbar-gutter: stable` or `unset` on `:root` yourself. If you don't want this feature, you can exclude `rootscrollgutter`.

Two things this component cannot do and must therefore document:

- **The scroll lock and gutter are `:root`-level.** A component cannot style `:root`; daisyUI's base layer does. Nothing to implement, but "opening the drawer shifts my layout on Firefox" needs to resolve to this paragraph rather than to a bug report.
- **It is opt-out-able** via daisyUI's `exclude` config. That is app configuration, so it belongs in the **package README** next to the `viewport-fit=cover` note from `plans/components/dock.md` §3e and the `@source` note from `plans/README.md` §1c. Three "your app must do this" items now share one home.

### 3h. Unverified assumptions

1. **Does slot content land as a direct child of `.drawer-side`?** Blocking. `.drawer-side > :not(.drawer-overlay)` is what slides the panel **[verified]**; an injected wrapper would take the `translate` itself and the real sidebar would sit inside it unmoved — so the drawer would fade in without sliding, or appear stuck. Ninth plan to hit this shared question; see `plans/components/aura.md` §3e.1 and the list it carries.
2. **Sibling order through the rendering pipeline.** §0's `~` selectors depend on the toggle preceding both wrappers in the *rendered* HTML. The component controls that, but it is worth one grep in Step 6 rather than an assumption — everything else about the drawer looks correct when it is wrong.
3. **`is-drawer-open:` / `is-drawer-close:` emission in Storybook.** These variants are generated by daisyUI's plugin from scanned source. `.storybook/preview.css` already has `@plugin "daisyui"` and `@source "../src"` (`plans/README.md` §2b), so a story file writing `is-drawer-close:w-14` should be picked up — but this is the first component to depend on a *variant* rather than a class, and the tree-shaking evidence in `plans/README.md` §1b was gathered for classes only. Check the built CSS.
4. **`allow-discrete` transitions and `:has()`.** The show/hide relies on `transition: … allow-discrete` on `visibility`/`opacity` and on `:root:has(…)` **[verified]**. Both are recent; in an older browser the drawer should still open, just without the transition. Confirm once so it is not mistaken for a component fault.

## 4. Component implementation

### `Drawer.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
/**
 * Grid layout with a show/hide sidebar. The skeleton — hidden checkbox,
 * content wrapper, side wrapper, overlay — is rendered here because daisyUI's
 * rules depend on their **order** as siblings (plan §0).
 *
 * `toggleId` is required and must be repeated on every `DrawerButton`: Astro
 * has no context API, so the id cannot be pushed into slotted markup
 * (plan §0a).
 *
 * For the common "permanent on desktop, overlay on mobile" layout use the
 * responsive class, not the prop: `class="lg:drawer-open"` (plan §3d).
 */
interface Props extends HTMLAttributes<'div'> {
  /** `id` of the hidden checkbox. Required — see plan §0a. */
  toggleId: string;
  /** Puts the sidebar on the trailing edge. */
  end?: boolean;
  /**
   * Makes the sidebar a **permanent column** rather than opening a drawer —
   * the toggle is hidden and the overlay goes inert (plan §3d).
   */
  open?: boolean;
  /** Accessible name for the empty overlay label (plan §3b). */
  overlayLabel?: string;
  /** Classes for `.drawer-content` (plan §3f). */
  contentClass?: string;
  /** Classes for `.drawer-side` (plan §3f). */
  sideClass?: string;
}

// Full literal class names. NEVER `drawer-${x}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b). Booleans as object keys are
// literals in source, so they are safe as written.

const {
  toggleId,
  end = false,
  open = false,
  overlayLabel = 'close sidebar',
  contentClass,
  sideClass,
  class: className,
  ...rest
} = Astro.props;
---

<div class:list={['drawer', { 'drawer-end': end, 'drawer-open': open }, className]} {...rest}>
  <!--
    MUST come before both wrappers: every state rule is a `~` sibling selector
    (plan §0). Hidden with 0×0 + opacity, never `display:none` — a
    display:none checkbox is not focusable and the keyboard path dies (§3a).
  -->
  <input id={toggleId} type="checkbox" class="drawer-toggle" autocomplete="off" />

  <div class:list={['drawer-content', contentClass]}>
    <slot name="content" />
  </div>

  <div class:list={['drawer-side', sideClass]}>
    <!-- Empty by design: a full-bleed click target. Must precede the panel,
         since `.drawer-side > :not(.drawer-overlay)` is what slides (§3b). -->
    <label for={toggleId} aria-label={overlayLabel} class="drawer-overlay"></label>
    <slot name="side" />
  </div>
</div>
```

### `DrawerButton.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * Toggles a `Drawer`. **Not just styling** — `drawer-button` is what makes the
 * hidden checkbox's focus ring visible, so a plain `<label>` leaves the drawer
 * with no visible keyboard focus (plan §3c).
 *
 * The ring only applies inside `.drawer-content`; a close button placed in the
 * sidebar is an ordinary `<label for>`.
 *
 * Combine with Button's classes as daisyUI does: `class="btn"`.
 */
interface Props extends HTMLAttributes<'label'> {
  /** Must match the `Drawer`'s `toggleId` (plan §0a). */
  toggleId: string;
}

const { toggleId, class: className, ...rest } = Astro.props;
---

<label for={toggleId} class:list={['drawer-button', className]} {...rest}>
  <slot />
</label>
```

No `<script>` in either file: the checkbox hack, the slide, the scroll lock and the focus ring are all CSS **[verified]** — `plans/README.md` §6.

Neither is polymorphic: `Drawer` is a `div`, and `DrawerButton` must be a `<label>` (§3c).

### Astro idioms gate

- [ ] Content arrives via the `content` / `side` named slots — no content props (§2).
- [ ] The toggle `<input>` is rendered **first**, as a direct child of `.drawer` (§0, §3a).
- [ ] The overlay `<label>` is rendered **before** the `side` slot (§3b).
- [ ] The toggle is hidden by daisyUI's own CSS — **no `hidden`, `sr-only` or `display:none` added** (§3a).
- [ ] No `Astro.slots.has()` gating — both slots are required (§2).
- [ ] `<slot name="side" />` has **no wrapper element** beyond `.drawer-side` (§3h.1).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element.
- [ ] `toggleId` is **required** on both components and reaches the input's `id` and both `for` attributes (§0a).
- [ ] `overlayLabel` defaults to `'close sidebar'` and reaches the overlay's `aria-label` (§3b).
- [ ] `contentClass` / `sideClass` reach their wrappers; `class` reaches the root (§3f).
- [ ] No `as` prop on either component (§3c).
- [ ] No variant prop collides with a native attribute: `open` is a `<details>` attribute, not a `<div>` one; `end`, `toggleId`, `overlayLabel` are not attributes.
- [ ] No class interpolation — the two modifiers are object keys, which are literals in source (§1b).
- [ ] Neither is generic, so §5c's declaration-order rule is advisory — order kept anyway.
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c):
  ```astro
  <Drawer toggleId="d1">ok</Drawer>
  <Drawer toggleId="d1" end open class="lg:drawer-open" contentClass="flex flex-col" sideClass="z-50">ok</Drawer>
  <DrawerButton toggleId="d1" class="btn">Open drawer</DrawerButton>
  <Drawer>must error — toggleId is required (§0a)</Drawer>
  <DrawerButton>must error — toggleId is required</DrawerButton>
  <Drawer toggleId="d1" color="primary">must error — no colour axis (§1)</Drawer>
  <Drawer toggleId="d1" placement="end">must error — the prop is `end` (§3d)</Drawer>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

`Drawer.stories.ts` carries the doc examples; `DrawerButton.stories.ts` gets a `Playground` + `Passthrough`.

**Every story reproduces the doc page's demo containment** — `class="h-56 rounded overflow-hidden"` on the root and a raised `z-index` via `sideClass` — because `.drawer-side` is `position: fixed; height: 100dvh; z-index: 10` **[verified]** and would otherwise cover the whole canvas. The doc page's copy-paste HTML omits these for the same reason `plans/components/dock.md` §3d omits `relative`: a real page wants the full-viewport behaviour. A comment at the top of the file says so.

Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props |
|---|---|---|
| Drawer sidebar | `Default` | `toggleId: 'my-drawer-1'`, a `DrawerButton class="btn"`, `menu` sidebar |
| Navbar menu for desktop + sidebar drawer for mobile | `NavbarAndDrawer` | toggle `class="lg:hidden"`, navbar in the content with a hamburger `DrawerButton` |
| Responsive: always visible on large screen | `ResponsiveOpen` | `class: 'lg:drawer-open'`, button `lg:hidden` — **no `open` prop** (§3d) |
| Responsive collapsible icon-only sidebar | `IconOnly` | `class: 'lg:drawer-open'`, `sideClass` and sidebar utilities using `is-drawer-open:` / `is-drawer-close:` (§3e) |
| Drawer sidebar that opens from right | `End` | `end: true` |

Plus `Playground` and `Passthrough`. Both modifiers are covered by doc examples, so no extra axis stories are needed.

Three stories beyond the doc page:

- **`AlwaysOpen`** — the boolean `open` prop with no responsive prefix, so §3d's "permanent column, not an opened drawer" reading is visible next to `ResponsiveOpen`.
- **`KeyboardFocus`** — a comment plus the `DrawerButton`; verified by tabbing, since §3c's focus ring is the one thing that cannot be seen in a screenshot.
- **`OverlayLabel`** — `overlayLabel="Sluit zijbalk"`, confirming the accessible name is reachable and localisable (§3b).

```ts
import Drawer from './Drawer.astro';

// `.drawer-side` is `position: fixed; height: 100dvh` — every story contains it
// with `h-56 rounded overflow-hidden` and a raised z-index, exactly as the doc
// page's demos do. See plans/components/drawer.md §5.

const MENU = `<ul class="menu bg-base-200 min-h-full w-60 md:w-80 p-4">
  <li><a>Sidebar Item 1</a></li>
  <li><a>Sidebar Item 2</a></li>
</ul>`;

export default {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    toggleId: { control: 'text' },
    end: { control: 'boolean' },
    open: { control: 'boolean' },
    overlayLabel: { control: 'text' },
    contentClass: { control: 'text' },
    sideClass: { control: 'text' },
  },
};

export const Playground = {
  args: {
    toggleId: 'my-drawer-1',
    class: 'h-56 rounded overflow-hidden',
    contentClass: 'flex flex-col items-center justify-center',
    sideClass: 'z-[1002]',
    slots: {
      content: `<label for="my-drawer-1" class="btn drawer-button">Open drawer</label>`,
      side: MENU,
    },
  },
};

// Regression guard: native attributes survive, `class` merges onto the root,
// and the two part-class props reach their wrappers (§3f).
export const Passthrough = {
  args: {
    toggleId: 'my-drawer-pt',
    id: 'drawer-1',
    'data-test': 'yes',
    class: 'mine h-56 rounded overflow-hidden',
    contentClass: 'content-marker',
    sideClass: 'side-marker z-[1002]',
    slots: {
      content: `<label for="my-drawer-pt" class="btn drawer-button">Open</label>`,
      side: MENU,
    },
  },
};
```

**Every story needs a distinct `toggleId`** — ids are document-global, and Storybook renders several stories into one docs page. A duplicate id silently wires one drawer's button to another's checkbox. Worth a comment in the file.

Whether the stories can use `DrawerButton` as a component rather than raw `<label>` markup depends on `plans/components/card.md` §3f.4 — resolve once, apply everywhere.

## 6. Steps

- [ ] **Step 1:** Resolve §3h.1 (direct child of `.drawer-side`) — blocking, and the shared question across nine plans now. Also settle §3h.3 (are the `is-drawer-*` variants emitted in the Storybook build?) before writing `IconOnly`, since that story is the only thing exercising them.
- [ ] **Step 2:** No new shared unions — no colour or size axis (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Drawer.astro` dummy scaffold and create `DrawerButton.astro` per §4, then walk the Astro idioms gate. Confirm the `autocomplete="off"` decision (§3a) and record it here.
- [ ] **Step 4:** Replace `Drawer.stories.ts` and create `DrawerButton.stories.ts` per §5, with a distinct `toggleId` per story.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Drawer`, verify:
  - `Default`: clicking the button **slides the sidebar in from the left** and dims the rest; clicking the dimmed area closes it. If it fades without sliding, read §3h.1 before anything else.
  - `End`: slides in from the right, and the content sits on the left (§3d).
  - `ResponsiveOpen`: sidebar is a permanent column above `lg`, a toggleable overlay below it, and the open button disappears above `lg`.
  - `AlwaysOpen`: permanent column at every width, with **no** toggle button rendered by daisyUI's `display:none` on the checkbox (§3d).
  - `IconOnly`: the sidebar is a 14-unit icon rail when closed and 64 when open, labels hidden, tooltips only when closed — the `is-drawer-*` variants (§3e). If nothing responds, it is §3h.3, not the component.
  - **`KeyboardFocus`: tab to the button and confirm a visible ring** (§3c). Then temporarily strip `drawer-button` from the label and confirm the ring disappears — that is the whole reason the component exists.
  - Stories do not bleed into each other — each has its own `toggleId` (§5).
- [ ] **Step 6:** Confirm forwarding via `Passthrough`, and assert the sibling order. Headless check:
  ```bash
  pnpm build-storybook
  grep -rhoE '<div class="drawer[^"]*"[^>]*><input[^>]*class="drawer-toggle"' storybook-static/astro-prerendered-stories.json | head
  grep -rhoE '<div class="drawer-side[^"]*"><label[^>]*class="drawer-overlay"></label><' storybook-static/astro-prerendered-stories.json | head
  ```
  The first proves the toggle is the first child (§0, §3h.2); the second proves the overlay precedes the sidebar panel with nothing between (§3b, §3h.1).
- [ ] **Step 7:** Update the `Drawer sidebar` row in `plans/README.md` to **Implemented**, noting `DrawerButton` as part of it. **Add the `scrollbar-gutter` / `rootscrollgutter` note to the package README** alongside `viewport-fit=cover` (`plans/components/dock.md` §3e) and `@source` (`plans/README.md` §1c) — §3g.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] All 8 daisyUI classes from §1 are reachable, and the two Tailwind variants are documented as caller-side prefixes with no prop (§3e).
- [ ] The rendered order is toggle → content → side, with the overlay first inside the side (§0, §3b) — checked in the build output, not by eye.
- [ ] `toggleId` is required on both components and wires the input, the overlay and every `DrawerButton` (§0a).
- [ ] The toggle keeps daisyUI's hiding — no `hidden`/`sr-only`/`display:none` added (§3a).
- [ ] Tabbing to a `DrawerButton` shows a visible focus ring (§3c).
- [ ] `end` and `open` are booleans; the responsive form is a caller class and there is no `placement` prop (§3d).
- [ ] `contentClass` / `sideClass` reach their wrappers, `class` reaches the root (§3f).
- [ ] `overlayLabel` defaults to `'close sidebar'` and is overridable (§3b).
- [ ] No invented axis — no colour, no size, no `is-drawer-*` props (§3e).
- [ ] JSDoc states: `toggleId` repeats by necessity (§0a), `open` means permanent column (§3d), `drawer-button` carries the focus ring (§3c), and the scroll gutter is a `:root` behaviour (§3g).
- [ ] The `scrollbar-gutter` note is in the package README (§3g).
- [ ] Each story uses a distinct `toggleId` and contains the fixed-position sidebar (§5).
- [ ] One story per doc-page example, plus `AlwaysOpen`, `KeyboardFocus` and `OverlayLabel`.
- [ ] Every box in §4's Astro idioms gate ticked.
