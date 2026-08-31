# Menu Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/menu/
**Root element:** `ul` (`Menu`), `li` (`MenuTitle`)
**Target files:** `packages/daisy-astro/src/components/Menu/Menu.astro`, `MenuTitle.astro` (only `Menu.astro` exists, as a dummy scaffold)
**Story files:** `Menu.stories.ts`, `MenuTitle.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props extend `HTMLAttributes<'ul'>`; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** Planned. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/menu.css` and the doc page source. §3f lists what is **unverified**.


> **Status:** **Implemented** (2026-08-31). `Menu.astro` and `MenuTitle.astro`, with 20 stories. **§3f.2 is settled against the shipped CSS — `menu-disabled` belongs on the `<li>`, and the doc page is right where the frontmatter is wrong** (see §3b). §3f.1 is answered: 24 menus render `<li>` as a direct child (§8). Step 5 (visual pass) is open.
---

## 0. Sixteen classes, but only four belong on components

Menu is the widest class surface in the library so far, and almost all of it is applied by the caller to markup they already write:

| Class | Where it goes | Treatment |
|---|---|---|
| `menu` | the `<ul>` | `Menu` |
| `menu-title` | an `<li>` (or an `<h2>` inside one) | `MenuTitle` |
| `menu-horizontal` `menu-vertical` `menu-xs`…`menu-xl` `menu-paged` | the `<ul>` | `Menu` props |
| `menu-active` `menu-focus` `menu-disabled` | **the element inside an `<li>`** | caller classes (§2) |
| `menu-dropdown` `menu-dropdown-toggle` `menu-dropdown-show` | a JS-driven submenu | caller classes (§3d) |

The structural work — items, submenus, `<details>` — is all plain HTML that daisyUI styles by shape, not by class (§3a). So this is two files and five props.

## 1. Variant audit

**16 classes: 1 component + 3 part + 5 modifier + 5 size + 2 direction**, matching the doc page's frontmatter. `grep -oE '\.menu[a-z0-9-]*' menu.css | sort -u` returns exactly those 16 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `menu` | — | — | `Menu` | Always applied. |
| Part | `menu-title` | — | — | `MenuTitle` | Two usages — §3c. |
| Part | `menu-dropdown` `menu-dropdown-toggle` | — | — | — | Caller classes for the JS submenu — §3d. |
| Modifier | `menu-dropdown-show` | — | — | — | Caller class, toggled by the caller's JS — §3d. |
| Modifier | `menu-active` `menu-focus` `menu-disabled` | — | — | — | Caller classes on the item's inner element — §2, §3b. |
| Modifier | `menu-paged` | `paged` | `boolean` | `Menu` | Shows one level at a time, turning an open summary into a back button. |
| Size | `menu-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | `Menu` | Matches `DaisySize` exactly — import it. |
| Direction | `menu-horizontal` `menu-vertical` | `direction` | `'horizontal' \| 'vertical'` | `Menu` | Mutually exclusive → union. `vertical` is the default; the responsive form is a caller class — §3e. |

**No colour axis** — none exists **[verified]**. `--menu-active-fg` / `--menu-active-bg` default to the neutral pair **[verified]** and are overridable through `style`, which no prop exposes.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Menu` | `default` | none — `<li>` children | no | `<li><a>Item</a></li>`, nested `<ul>`, `<details>` |
| `MenuTitle` | `default` | none | no | `Title` |

Plain default slots, no gating.

**No `MenuItem` component.** An item is `<li><a>…</a></li>` with **no class at all** — daisyUI styles it structurally (§3a). Adding a component would mean two imports to write two tags, and it would have to re-expose `href`, `target` and the three state classes. Same "bare element" call as `plans/components/card.md` §0b's `<figure>` and `plans/components/code-mockup.md` §2's `<pre>`.

**No `items` array prop**: items hold icons, badges, tooltips and arbitrarily nested submenus.

## 3. Six things the naive implementation gets wrong

### 3a. Items are styled by *shape*, not by class — and the selector excludes four things

```css
.menu :where(li:not(.menu-title) > :not(ul, menu, details, .menu-title, .btn)),
.menu :where(li:not(.menu-title) > details > summary:not(.menu-title)) {
  display:grid; grid-auto-flow:column; align-items:center; gap:.5rem;
  padding-block:.375rem; padding-inline:.75rem; border-radius:var(--radius-field); … }
```

**[verified]**. The "item" is *whatever single element sits inside an `<li>`*, except a nested list, a `<details>`, a title, or a `.btn`.

Four consequences worth documenting, because none is guessable:

- **A `<button>`, `<a>`, `<span>` or `<div>` inside an `<li>` all become items.** The doc page's rendered examples use `<button>` while its copy-paste HTML uses `<a>` **[verified]** — the same substitution `plans/components/link.md` §3a found, for the same reason.
- **A `.btn` inside an `<li>` is deliberately exempt**, so a Button in a menu keeps its own styling rather than being flattened into a menu row.
- **Nested `<ul>` gets an indent and a hairline rule** from `.menu :where(li ul, li menu)` with a `::before` **[verified]** — no class needed, which is why the Submenu example is plain nesting.
- **`<details>`/`<summary>` is the collapsible form**, with the marker hidden and a chevron `::after` added, animated via `::details-content` and `interpolate-size: allow-keywords` **[verified]** — the same modern-CSS mechanism as `plans/components/collapse.md` §3b.

### 3b. The three state classes go on the inner element, not the `<li>` — except one

`menu-active` and `menu-focus` are written on the `<a>`/`<button>` **[verified in the CSS's `:not(.menu-active, :active, .btn).menu-focus` selector and the doc example `<a class="menu-active">`]**.

`menu-disabled` is written on the **`<li>`** in the doc example — `<li class="menu-disabled"><button disabled>` **[verified]** — while the frontmatter describes it as "for the element inside `<li>`". The CSS excludes `li:not(.menu-title, .disabled)` from hover styling, i.e. it keys off `.disabled`, not `.menu-disabled`.

**That inconsistency is real and unresolved**; §3f.2 makes checking it a Step 1 task. Until then the JSDoc reproduces the doc example verbatim rather than picking a side.

daisyUI's own info box on the page is worth quoting in the JSDoc: *"`menu-disabled` disables an item visually. To disable a `<button>` add a `disabled` attribute. To disable an `<a>`, remove the `href` and add `role="link" aria-disabled="true"`."* The visual class is not the accessible state — the same split `plans/components/button.md` §3b handles with branching, here left to the caller because the item is caller markup.

### 3c. `menu-title` has two shapes

The doc page shows both **[verified]**:

```html
<li class="menu-title">Title</li>                    <!-- a standalone label row -->
<li><h2 class="menu-title">Title</h2><ul>…</ul></li>  <!-- a heading for a nested group -->
```

The CSS treats `.menu-title` as an exclusion in every item selector **[verified]** — it is "the thing that is not an item" — so both work.

`MenuTitle` is therefore **polymorphic, defaulting to `'li'`**, with `as="h2"` for the group-heading form. Same mechanism and the same silent §5c trap as `plans/components/card.md` §3a's `CardTitle`; the probe in §4 is mandatory.

### 3d. The `menu-dropdown*` trio exists for JavaScript, and this library ships none

```css
.menu :where(li > .menu-dropdown:not(.menu-dropdown-show)) { display:none }
```

**[verified]** — a `<ul class="menu-dropdown">` is hidden until the caller's own JS adds `menu-dropdown-show`, and `.menu-dropdown-toggle` gets the same chevron as a `<summary>`.

This is daisyUI's escape hatch for frameworks that manage open state themselves. `plans/README.md` §6 rules out adding a script, and there is no state for a prop to express at render time, so all three stay **caller classes** — the same call as `plans/components/checkbox.md` §3c's `indeterminate`.

The `<details>` form (§3a) is the no-JS alternative and is what the JSDoc recommends.

### 3e. The responsive direction is the common case

Four of the doc examples use `lg:menu-horizontal` or `xl:menu-horizontal` **[verified]** — a menu that stacks on mobile and spreads on desktop. That is a caller class, the library's standing answer (`plans/components/card.md` §3e), and by now the third component where the prop is the *less* useful form (after `plans/components/footer.md` §3b and `plans/components/drawer.md` §3d).

Two related notes for the JSDoc:

- `.menu` is `width: fit-content` **[verified]**, so `w-56` appears in nearly every example. Without a width a menu shrinks to its longest item.
- The "menu without padding and border radius" example uses `[&_li>*]:rounded-none p-0` **[verified]** — an arbitrary variant reaching the items. Worth showing, since it is daisyUI's own answer to "how do I restyle the rows".

### 3f. Unverified assumptions

1. **Do slot children land as direct `<li>`s?** Blocking. Every item selector is `.menu :where(li > …)` — descendant from `.menu`, but **child** from the `<li>` **[verified]** — so a wrapper *inside* an `<li>` breaks the item styling, while a wrapper around the whole list would not. Nineteenth plan touching the shared question in `plans/components/aura.md` §3e.1.
2. **`menu-disabled` on the `<li>` vs the inner element** (§3b). Read the full CSS block for `.disabled` / `.menu-disabled` and settle it; the doc example and the frontmatter disagree.
3. **`interpolate-size` and `::details-content` support** — shared with `plans/components/collapse.md` §3g.2; without it submenus still open, just without animation.
4. **Slot sanitization vs inline `<svg>`** — the icon, file-tree and badge examples. Shared with `plans/components/alert.md` §3d.1.

## 4. Component implementation

### `Menu.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type MenuDirection = 'horizontal' | 'vertical';

/**
 * A list of links. Items are plain `<li><a>…</a></li>` — daisyUI styles them
 * by shape, with no class (plan §3a), so there is no item component.
 *
 * State classes go on the **inner** element: `class="menu-active"`,
 * `class="menu-focus"`. Disabling is separate from looking disabled — see
 * daisyUI's note reproduced below (plan §3b).
 *
 * Submenus are nested `<ul>`s, or `<details>`/`<summary>` to collapse them.
 * The `menu-dropdown*` classes exist for JS-driven open state and are yours to
 * toggle (plan §3d).
 *
 * `width: fit-content` — pass `class="w-56"`. For the usual responsive menu
 * use the class, not the prop: `class="lg:menu-horizontal"` (plan §3e).
 */
interface Props extends HTMLAttributes<'ul'> {
  size?: DaisySize;
  /** Unconditional direction; prefer the responsive class (plan §3e). */
  direction?: MenuDirection;
  /** One level at a time, with the open summary acting as a back button. */
  paged?: boolean;
}

// Full literal class names. NEVER `menu-${size}` (plans/README.md §1b).
const SIZE: Record<DaisySize, string> = {
  xs: 'menu-xs', sm: 'menu-sm', md: 'menu-md', lg: 'menu-lg', xl: 'menu-xl',
};
const DIRECTION: Record<MenuDirection, string> = {
  horizontal: 'menu-horizontal', vertical: 'menu-vertical',
};

const { size, direction, paged = false, class: className, ...rest } = Astro.props;
---

<ul
  class:list={[
    'menu',
    size && SIZE[size],
    direction && DIRECTION[direction],
    { 'menu-paged': paged },
    className,
  ]}
  {...rest}
>
  <slot />
</ul>
```

### `MenuTitle.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * A non-interactive label. Two shapes (plan §3c):
 * - `<li class="menu-title">` — a standalone row. This is the default.
 * - `<h2 class="menu-title">` inside an `<li>` that also holds a nested `<ul>`
 *   — a heading for a group. Use `as="h2"`.
 */
type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }>;

const { as: Tag = 'li', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['menu-title', className]} {...rest}>
  <slot />
</Tag>
```

No `<script>` in either: the `<details>` submenu, the chevrons and the paged behaviour are all CSS (§3a, §3d).

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `items` array prop (§2).
- [ ] **No `MenuItem` component** — items are bare `<li><a>` (§2, §3a).
- [ ] `menu-active` / `menu-focus` / `menu-disabled` / `menu-dropdown*` are documented as caller classes (§2, §3b, §3d).
- [ ] `<slot />` has no wrapper in `Menu`, and the JSDoc warns against wrapping inside an `<li>` (§3f.1).
- [ ] No `Astro.slots.has()` gating.
- [ ] `Menu`'s root is `<ul>` with no `as`; `MenuTitle` defaults to `li` via `Polymorphic` (§3c).
- [ ] No `<script>` added (§3d).
- [ ] `...rest` spread onto the root in both files.
- [ ] No variant prop collides with a native attribute: `direction` is absent from `HTMLAttributes` (`SVGAttributes` only) **[verified]**; `size` and `paged` are not attributes of `<ul>`.
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const` in `MenuTitle.astro`**, with `as Props<HTMLTag>` (§3c).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Menu class="w-56 bg-base-200 rounded-box"><li><a>Item 1</a></li></Menu>
  <Menu size="xs" direction="horizontal" paged class="lg:menu-horizontal">ok</Menu>
  <MenuTitle>Title</MenuTitle>
  <MenuTitle as="h2">Title</MenuTitle>
  <Menu color="primary">must error — no colour axis (§1)</Menu>
  <Menu active>must error — menu-active is a caller class on the item (§3b)</Menu>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Two files. Doc-page examples in page order (`plans/README.md` §8), all in `Menu.stories.ts`: `Default`, `Responsive`, `Paged`, `IconOnly`, `IconOnlyHorizontal`, `IconOnlyWithTooltip`, `IconOnlyHorizontalWithTooltip`, `Sizes` (five), `DisabledItems`, `WithIcons`, `WithIconsAndBadge`, `NoPaddingNoRadius`, `WithTitle`, `TitleAsParent`, `Submenu`, `CollapsibleSubmenu`, `CollapsibleWithClassNames`, `FileTree`, `ActiveItem`, `Horizontal`, `HorizontalSubmenu`, `MegaMenuWithSubmenu`, `CollapsibleWithSubmenuResponsive`.

Plus `Playground` and `Passthrough`; `MenuTitle.stories.ts` gets a `Playground` + `Passthrough`.

Two beyond the doc page:

- **`ButtonInItem`** — a `.btn` inside an `<li>` beside a plain item, showing §3a's deliberate `.btn` exemption.
- **`WrappedItem`** — an item wrapped in a `<div>` inside its `<li>`, losing the row styling (§3f.1). Raw markup, since there is no component to prevent it.

`CollapsibleWithClassNames` needs `menu-dropdown-show` toggled to be meaningful; the story renders both states side by side, exactly as the doc page does, rather than adding a script (§3d).

## 6. Steps

- [x] **Step 1: done, and §3f.2 is the substantive result.** `menu-disabled` belongs on the `<li>` — settled by resolving the nesting in the shipped CSS, and recorded in §3b along with two details it turned up: `[disabled]` on any descendant dims for free, and the `.disabled` in the hover selectors is a separate undocumented class rather than a typo. §3f.1 is answered in the build output. §3f.3 (`interpolate-size`) is runtime and moves to Step 5; §3f.4 is moot, since sanitization is off library-wide.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, no colour axis; `variants.ts` untouched.
- [x] **Step 3: done.** Two files per §4 — no `MenuItem`, because an item carries no class at all and a component would mean two imports to write two tags (§2). Gate walked; the probe errored on all three achievable intended lines.
- [x] **Step 4: done.** `Menu.stories.ts` (17) and `MenuTitle.stories.ts` (3), composing the real `Badge` and `Button`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: items are laid out as rows with icons and badges aligned by daisyUI's own grid; `Submenu` indents with a hairline rule and no class; **`CollapsibleSubmenu` animates open**, which is where `interpolate-size` support shows (§3f.3); `Paged` shows one level at a time with the summary acting as a back button; `DisabledItems` dims and is unclickable; `ActiveItem` highlights exactly one row; **`ButtonIsExempt` keeps its Button looking like a Button** rather than a flattened row (§3a); `Responsive` spreads above `lg` — resize rather than screenshot; and `NoPaddingNoRadius` squares off the rows.
- [x] **Step 6: done — forwarding confirmed and both structural rules asserted.** `Passthrough` renders `<ul class="menu menu-vertical menu-lg mine bg-base-200 w-56 rounded-box" id="menu-1" data-test="yes" style="letter-spacing:1px">`. Full output in §8.
- [x] **Step 7: done — the `Menu` row in `plans/README.md` says Implemented**, covering `MenuTitle`.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 16 daisyUI classes reachable: 5 as props, the rest documented as caller classes (§0).
- [x] No `MenuItem` component; items are bare `<li><a>` (§2, §3a).
- [x] `MenuTitle` defaults to `li` and accepts `as="h2"`; probe passes (§3c).
- [x] §3f.2 resolved and `menu-disabled`'s placement documented from evidence.
- [x] JSDoc reproduces daisyUI's disabled-vs-looks-disabled note (§3b), recommends `<details>` over the JS dropdown classes (§3d), and points at `class="lg:menu-horizontal"` and `w-56` (§3e).
- [x] No invented axis — no colour, no `active`/`disabled` props, no script (§3b, §3d).
- [x] One story per doc-page example, plus `ButtonInItem` and `WrappedItem`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31), SVG elided. `astro check`: 145 files, 0 errors, 0 warnings, 0 hints.

```
Default          → <ul class="menu bg-base-200 w-56 rounded-box"><li><button>Item 1</button></li>…
DisabledItems    → <li class="menu-disabled"><button disabled>disabled item</button></li>
                                ↑ the class on the li, the attribute on the button
ActiveItem       → <li><button class="menu-active">Item 2</button></li>
                                ↑ the opposite: this one goes on the inner element
TitleAsParent    → <li><h2 class="menu-title">Title</h2><ul><li><button>Item 1</button></li>…</ul></li>
CollapsibleSub…  → <li><details open><summary>Parent</summary><ul>…</ul></details></li>
ButtonIsExempt   → <li><button>a plain item</button></li>
                   <li><button class="btn btn-primary btn-sm">a real Button</button></li>
Passthrough      → <ul class="menu menu-vertical menu-lg mine bg-base-200 w-56 rounded-box" id="menu-1"
                     data-test="yes" style="letter-spacing:1px">…
```

What this settles:

- **§3f.1**: 24 menus render `<li>` as a direct child. The item selectors are descendant from `.menu` but **child** from the `<li>`, so this is the level that matters — a wrapper *inside* an item would have unstyled it.
- **§3b, in both directions**: 2 items carry `menu-disabled` on the `<li>` and **0** carry it on the inner element, while `menu-active` appears once on an inner element and never on an `<li>`. The two state classes genuinely go to different places, which is the kind of asymmetry that gets "corrected" by someone tidying up.
- **Both `menu-title` shapes render**: 2 as `<li>` and 2 as `<h2>`, from the same component through `as`.
- **Items carry no class at all** — every one is a bare `<button>` inside a bare `<li>`, which is the evidence for there being no `MenuItem` component (§2).
- All 16 classes have rules in the built stylesheet.

Not settled here: the submenu animation, the paged back-button behaviour, and the responsive spread. All Step 5.
