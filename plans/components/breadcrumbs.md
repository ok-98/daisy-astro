# Breadcrumbs Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/breadcrumbs/
**Root element:** `nav` by default, polymorphic via `as` (daisyUI's own examples use `div`) — see §3b
**Target file:** `packages/daisy-astro/src/components/Breadcrumbs/Breadcrumbs.astro` (currently a dummy scaffold)
**Story file:** `packages/daisy-astro/src/components/Breadcrumbs/Breadcrumbs.stories.ts` (currently a dummy `Default` story)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props forward every native HTML attribute for the rendered element.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b). **Breadcrumbs has no variant classes at all**, so no map exists (§1).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Breadcrumbs uses none of them** (§1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** Planned. Nothing in §4 is implemented. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/breadcrumbs.css`), the doc page source (`packages/docs/src/routes/(routes)/components/breadcrumbs/+page.md` in `saadeghi/daisyui`), and `astro@7.2.4`'s `astro-jsx.d.ts`. §3f lists what is **unverified**.

---

## 0. One class, all structure

`grep -oE '\.breadcrumbs[a-z0-9-]*' breadcrumbs.css | sort -u` returns exactly **`.breadcrumbs`** — one class, no modifiers **[verified]**. Everything the component does comes from descendant rules on markup the caller supplies:

```css
.breadcrumbs { max-width:100%; padding-block:.5rem; overflow-x:auto }
.breadcrumbs > menu, .breadcrumbs > ul, .breadcrumbs > ol {
  display:flex; align-items:center; white-space:nowrap; min-height:min-content;
  & > li {
    display:flex; align-items:center;
    & > *   { cursor:pointer; display:flex; align-items:center; gap:.5rem;
              &:hover { @media (hover:hover) { text-decoration-line:underline } }
              &:focus-visible { outline:2px solid; outline-offset:2px } }
    & + :before { content:""; opacity:.4; width:.375rem; height:.375rem;
                  border-top:1px solid; border-right:1px solid; rotate:45deg;
                  margin-inline:.5rem .75rem }
  }
}
[dir=rtl] .breadcrumbs > … > li + :before { rotate:-135deg }
```

So there are no variant props to design. The whole plan is four structural decisions (§3a–§3d) plus the accessibility gap daisyUI leaves open (§3b).

## 1. Variant audit

| Axis | daisyUI class | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `breadcrumbs` | — | — | Always applied to the root. |

**That is the entire table.** No colour, no size, no style, no direction — none of it exists **[verified]**. The `text-sm` on every doc example is plain Tailwind on the root, and `max-w-xs` in the third example likewise. Do not import `DaisyColor` or `DaisySize`; do not invent a `size` prop from the fact that the examples all happen to use `text-sm`.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies of `.breadcrumbs` ship too **[verified]** — caller-side responsive classes, not props; same reasoning as `plans/components/alert.md` §3c.)

### 1a. Non-class props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `as` | `HTMLTag` | `'nav'` | Root element. daisyUI uses `div`; `nav` is the correct landmark — §3b. |
| `listAs` | `'ul' \| 'ol' \| 'menu'` | `'ul'` | Which list element to render. All three are named in daisyUI's own selector **[verified]** — §3c. |
| `aria-label` | inherited | `'Breadcrumb'` | Only meaningful with a `nav` root; overridable — §3b. |

## 2. Slots

Single default slot, holding the `<li>` items, rendered **inside the list element the component provides**.

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | the `<ul>`/`<ol>`/`<menu>` (§3a) | no | `<li><a>Home</a></li>` … `<li>Add Document</li>` |

No named slots, no `Astro.slots.has()` gating — the list is required, not an optional styled wrapper.

**No `items` array prop.** A `items={[{href, label}]}` API would be shorter at the call site but would take the `<a>` away from the caller — no `target`, no framework link component, no icon, no `aria-current`. Content comes in through slots (`plans/README.md` §5), and the doc page's icon example is exactly the case an array prop would block.

**No `BreadcrumbItem` sub-component.** daisyUI puts **no class on the `<li>` and none on the `<a>`** **[verified]** — a sub-component would render `<li><a>` with zero classes and zero logic, which is boilerplate wearing a component's clothes. Contrast `plans/components/accordion.md` §0, where the item owned every modifier and therefore earned its file. If `aria-current` handling later justifies one, that is a plan revision with a stated reason.

## 3. Six things the naive implementation gets wrong

### 3a. The list element is a required *direct* child — the component renders it

`.breadcrumbs > menu, > ul, > ol` is a child selector **[verified]**. Nothing inside the wrapper is laid out until a list matches it: no flex row, no separators, no gaps — the items stack as plain block content and the component looks entirely unstyled.

The choice is the same one Avatar faced (`plans/components/avatar.md` §3a): render the mandatory inner element, or make every call site repeat it. Same answer — **render it**. `<Breadcrumbs>` takes `<li>`s directly:

```astro
<Breadcrumbs>
  <li><a href="/">Home</a></li>
  <li><a href="/docs">Documents</a></li>
  <li>Add Document</li>
</Breadcrumbs>
```

**Unlike Avatar, no second class prop is needed.** In all three doc examples the caller's classes (`text-sm`, `max-w-xs`) go on the **root**, and the `<ul>` carries nothing at all **[verified]**. So `class` merging onto the root — the library convention — is exactly right here, and there is no `listClass`. Do not copy Avatar's two-class-prop shape reflexively; it existed because Avatar's styling surface *was* the inner div.

Because the component owns the list element, an extra wrapper introduced around slot content by the rendering framework would sit *inside* the `<ul>`, i.e. between the list and the `<li>`s. That breaks `& > li`. It is the same unknown as `plans/components/aura.md` §3e.1 — see §3f.1.

### 3b. daisyUI's markup has no accessibility semantics, and `div` is the wrong root

The doc page renders `<div class="breadcrumbs"><ul>…</ul></div>`. That is a styled list, not a breadcrumb trail: no landmark, no label, no indication of the current page. The established pattern is `<nav aria-label="Breadcrumb">` wrapping the list, with `aria-current="page"` on the final item.

`.breadcrumbs` is a **class-only selector with no element qualifier** **[verified]**, so the tag is free — a `nav` root renders identically.

**Decision: default `as="nav"` and default `aria-label="Breadcrumb"`, with `as="div"` available for anyone who wants daisyUI's literal markup.** This deviates from `plans/README.md` §6's "match the element daisyUI's own example uses", deliberately, on the precedent already set in `plans/components/button.md` §3b — where the plan added `tabindex`/`role`/`aria-disabled` that daisyUI's example lacks, because the gap was an accessibility defect rather than a style choice. A navigation component with no landmark is the same kind of gap.

`aria-label` is declared on `AriaAttributes` (`astro-jsx.d.ts:292`) and therefore arrives inside `...rest` **[verified]**, so it is destructured with a default rather than hardcoded next to the spread — exactly the mechanism `plans/components/alert.md` §3b established for `role`. Deterministic, and the override still works.

Two consequences to handle rather than hide:

- **`aria-current` stays the caller's job.** It belongs on the last item's element, which is slot content. Named in the component's JSDoc and shown in every story.
- **The stories are no longer a byte-for-byte diff against the doc page** (`plans/README.md` §8), since the root tag differs. Each story therefore reproduces the page's *inner* markup exactly, and the deviation is confined to the one attribute-level difference, noted in a comment at the top of the story file.

### 3c. All three list elements are supported, and `ol` is arguably the right one

daisyUI's selector names `menu`, `ul` **and** `ol` **[verified]**, which is `plans/README.md` §6's own signal for exposing the choice rather than hardcoding one. A breadcrumb trail is an ordered path, so `<ol>` is the more defensible markup, while daisyUI's examples all use `<ul>`.

`listAs` defaults to `'ul'` — matching the doc page, so the rendered inner markup stays identical to it — and the JSDoc names `'ol'` as the semantically stronger option. Defaulting to `ol` would silently change the markup of anyone following the daisyUI docs; offering it costs one dynamic tag and no class map (these are element names, not classes, so §1b does not apply).

`'menu'` is included because the CSS names it. It has no advantage here; it is listed, not recommended.

### 3d. The separator is not configurable, and it is generated by `li + *`

The chevron comes from `& + :before` nested under `& > li`, i.e. **`li + *::before`** — a rotated 6px square with two borders **[verified]**. Effects worth knowing:

- **Every item after the first gets one, and the first never does.** Correct by construction; no first/last logic is needed in the component.
- **It is unstyleable through daisyUI.** There is no `--breadcrumb-separator` variable and no modifier class. So there is **no `separator` prop** — the honest answer for a caller who wants `/` instead of a chevron is their own CSS override on `li + *::before`, not an API this component invents.
- **It targets any following element, not only `li`.** A stray non-`li` child in the list also gets a chevron. Nothing to guard against, but it explains a phantom separator if someone drops a `<script>` or a comment node in there.
- **RTL is handled** (`[dir=rtl] … { rotate:-135deg }` **[verified]**) — do not add direction logic.

### 3e. Every item gets `cursor:pointer`, including the non-link last one

`.breadcrumbs > ul > li > * { cursor:pointer }` applies to **every** child element, and the `:hover` underline likewise **[verified]**. daisyUI's own example wraps the final, non-navigable item in a plain `<span>`, which therefore still shows a pointer cursor and underlines on hover — it looks clickable and isn't.

Not a component bug and not something to patch in the wrapper: the fix is a caller class (`class="cursor-default no-underline hover:no-underline"`) on that one item. Worth a line in the JSDoc and a visible demonstration in the `CurrentPage` story, since "the last crumb looks like a link" is a real review comment waiting to happen.

Note also that bare text directly in an `<li>` — no wrapping element — receives none of these rules, since they all target `li > *`. daisyUI's first example uses exactly that for the last item (`<li>Add Document</li>`), which sidesteps the problem entirely. That is the shape the stories use.

### 3f. Unverified assumptions

1. **Does slot content land directly inside the list element?** Blocking, per §3a: an injected wrapper between `<ul>` and the `<li>`s breaks `& > li` and takes the separators and the flex row with it. Same question as `plans/components/aura.md` §3e.1 and `plans/components/alert.md` §3d.2 — whichever component is built first should record the answer in all three plans. Verify by grepping the rendered HTML for `<ul><li`, not by eye.
2. **Slot sanitization vs `<li>` and inline `<svg>`.** The icon example is inline SVG inside `<a>` inside `<li>`; the framework sanitizes slot HTML with conservative defaults (`plans/README.md` §4). Stripped `<li>`s would leave an empty list that renders as nothing at all — an unusually loud failure, at least.
3. **Keyboard access to the scroll region.** `.breadcrumbs` is `overflow-x:auto` with `white-space:nowrap` **[verified]**, so the third doc example is a horizontally scrollable region. A scrollable region with no focusable content inside is not keyboard-reachable, which is a real WCAG 2.1.1 issue — but in a breadcrumb the items are normally links, which makes it moot. Check the overflow story: if the crumbs are links, no action; note it in the JSDoc only if they aren't. Do not add a `tabindex` by default.

## 4. Component implementation

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

type BreadcrumbsList = 'ul' | 'ol' | 'menu';

// `Props` MUST be declared before any `const` in this frontmatter, or Astro
// stops inferring it and the component silently accepts no props at all
// (plans/README.md §5c).
type Props<Tag extends HTMLTag> = Polymorphic<{
  /**
   * Defaults to `nav`, which daisyUI's example doesn't use — a breadcrumb
   * trail is a navigation landmark (plan §3b). Pass `as="div"` for daisyUI's
   * literal markup.
   */
  as: Tag;
  /**
   * The list element. daisyUI styles `ul`, `ol` and `menu` identically;
   * `'ol'` is the semantically stronger choice for an ordered path (plan §3c).
   */
  listAs?: BreadcrumbsList;
}>;

// No variant class map: daisyUI defines exactly one class for this component
// (plan §1). `listAs` holds element names, not classes, so §1b does not apply.

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const {
  as: Tag = 'nav',
  listAs: List = 'ul',
  'aria-label': ariaLabel = 'Breadcrumb',
  class: className,
  ...rest
} = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['breadcrumbs', className]} aria-label={ariaLabel} {...rest}>
  <!--
    Required direct child — `.breadcrumbs > ul` is a child selector and nothing
    is laid out without it (plan §3a). The slot takes `<li>` items; put
    `aria-current="page"` on the last one yourself (plan §3b).
  -->
  <List>
    <slot />
  </List>
</Tag>
```

That is the whole component: one class, one required child, two element choices, one defaulted ARIA attribute.

No `<script>`: pure CSS, RTL included (§3d).

No `separator` prop (§3d), no `items` prop and no `BreadcrumbItem` (§2), no `listClass` (§3a).

### Astro idioms gate

- [ ] Content arrives via the default slot as `<li>` items — no `items` array prop (§2).
- [ ] The list element is rendered by the component, with the slot directly inside it (§3a).
- [ ] No `Astro.slots.has()` gating — the list is required, not optional.
- [ ] Root is `nav` by default via `Polymorphic<{ as: Tag }>`, with the deviation from daisyUI's `div` justified in §3b and stated in the JSDoc.
- [ ] `aria-label` destructured with a default, not hardcoded alongside the spread (§3b — the mechanism from `plans/components/alert.md` §3b).
- [ ] No `<script>` added — RTL and separators are pure CSS (§3d).
- [ ] `...rest` spread onto the root element.
- [ ] No variant prop collides with a native attribute: `listAs` is not an HTML attribute; `as` is Astro's own convention.
- [ ] No class interpolation anywhere — there are no variant classes to interpolate (§1).
- [ ] **`type Props` is declared before any `const`**, and the destructure is annotated `as Props<HTMLTag>` (§5c).
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c) — mandatory, since the generic-inference failure is silent:
  ```astro
  <Breadcrumbs><li>Home</li></Breadcrumbs>
  <Breadcrumbs as="div" listAs="ol" class="text-sm"><li>Home</li></Breadcrumbs>
  <Breadcrumbs aria-label="You are here" id="x" data-test="y"><li>Home</li></Breadcrumbs>
  <Breadcrumbs listAs="div">must error — not a list element</Breadcrumbs>
  <Breadcrumbs size="sm">must error — no size axis (§1)</Breadcrumbs>
  <Breadcrumbs separator="/">must error — separator is not configurable (§3d)</Breadcrumbs>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Breadcrumbs | `Default` | `class: 'text-sm'`, `<li><a>Home</a></li><li><a>Documents</a></li><li>Add Document</li>` |
| Breadcrumbs with icons | `WithIcons` | same, each `<a>` prefixed with the page's `<svg class="h-4 w-4 stroke-current">`; the last item is a `<span class="inline-flex items-center gap-2">` |
| Breadcrumbs with max-width | `MaxWidth` | `class: 'max-w-xs text-sm'`, five `<li>Long text N</li>` — scrolls horizontally |

Plus `Playground` and `Passthrough` (Step 6). There are no variant axes, so there are no axis stories — this is the shortest story file in the library so far, and that is correct rather than incomplete.

Three stories beyond the doc page, each pinning a §3 decision:

- **`CurrentPage`** — the last item as `<li><span aria-current="page" class="cursor-default">Add Document</span></li>` next to a bare `<li>Add Document</li>`, demonstrating both §3b's caller responsibility and §3e's pointer-cursor quirk.
- **`OrderedList`** — `listAs="ol"`, visually identical to `Default` on purpose, proving §3c's claim that the three list elements are styled the same.
- **`AsDiv`** — `as="div"`, reproducing daisyUI's literal markup for anyone comparing against the doc page (§3b).

```ts
import Breadcrumbs from './Breadcrumbs.astro';

// NOTE: these stories render a `nav` root, where the daisyUI doc page shows a
// `div` (plan §3b). The inner markup matches the page exactly; `AsDiv`
// reproduces the page's root too.

const ITEMS = `<li><a href="#">Home</a></li><li><a href="#">Documents</a></li><li>Add Document</li>`;

export default {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    as: { control: 'text' },
    listAs: { control: 'radio', options: ['ul', 'ol', 'menu'] },
    'aria-label': { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'text-sm', slots: { default: ITEMS } },
};

export const Default = {
  args: { class: 'text-sm', slots: { default: ITEMS } },
};

// Regression guard: native attributes survive, caller `class` merges, and the
// `aria-label` default is overridable (§3b).
export const Passthrough = {
  args: {
    id: 'crumbs-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-sm',
    'aria-label': 'You are here',
    slots: { default: ITEMS },
  },
};
```

## 6. Steps

- [ ] **Step 1:** Resolve §3f.1 first — whether slot content lands directly inside the list element. Blocking (§3a), and shared with `plans/components/aura.md` §3e.1 and `plans/components/alert.md` §3d.2; record the answer in all three.
- [ ] **Step 2:** No new shared unions, and no use of the existing ones — there are no variant axes (§1). `variants.ts` untouched. Skip.
- [ ] **Step 3:** Replace the `Breadcrumbs.astro` dummy scaffold per §4, then walk the Astro idioms gate. **Run the probe** — the generic-inference failure is silent.
- [ ] **Step 4:** Replace `Breadcrumbs.stories.ts` per §5.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Breadcrumbs`, verify:
  - `Playground` renders and every control changes the markup.
  - Items sit on **one horizontal row** with chevrons between them — if they stack vertically with no separators, the list is not a direct child (§3a) and nothing else in this list will be right.
  - The first item has **no** leading chevron and every later item has one (§3d).
  - `OrderedList` looks identical to `Default` (§3c).
  - `MaxWidth` scrolls horizontally instead of wrapping, and check §3f.3 while there.
  - `CurrentPage`: the marked item shows a default cursor and no hover underline, while a plain `<span>` item shows a pointer (§3e).
  - `WithIcons`: the SVGs are present (§3f.2), and icon-plus-text is spaced by the `gap:.5rem` from `li > *`.
  - Flip the Storybook canvas to RTL if the toolbar offers it: chevrons should point the other way with no code change (§3d).
- [ ] **Step 6:** Confirm forwarding via `Passthrough` — `id`, `data-*`, `style`, `class` all survive, and `aria-label` reads `You are here`, not `Breadcrumb`. Headless check:
  ```bash
  pnpm build-storybook
  grep -rhoE '<(nav|div)[^>]*class="[^"]*breadcrumbs[^"]*"[^>]*><[uo]l>' storybook-static/astro-prerendered-stories.json | head
  ```
  That pattern also answers §3f.1: the list must follow the root immediately, with no wrapper between them, and `<li>` must follow the list.
- [ ] **Step 7:** Update the `Breadcrumbs` row in `plans/README.md` to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] The single daisyUI class is applied to the root, and no others exist to expose (§1).
- [ ] No invented axis — no `size`, no `color`, no `separator` prop (§3d), no `items` prop (§2).
- [ ] The list element is always rendered, so `.breadcrumbs > ul` matches — verified in rendered HTML, not by eye (§3a, §3f.1).
- [ ] `class` merges onto the root, and there is deliberately no `listClass` (§3a).
- [ ] Root defaults to `nav` with `aria-label="Breadcrumb"`, both overridable, and the deviation from daisyUI's `div` is documented in the JSDoc (§3b).
- [ ] `listAs` renders `ul`/`ol`/`menu`, defaulting to `ul` (§3c).
- [ ] `aria-current` is documented as the caller's responsibility and shown in `CurrentPage` (§3b).
- [ ] `type Props` precedes every `const`, destructure annotated `as Props<HTMLTag>`, and the probe confirms props are actually accepted.
- [ ] `Playground` exposes every prop as a control.
- [ ] One story per doc-page example, reproducing that example's inner markup and copy exactly; `AsDiv` covers the root-tag difference.
- [ ] Every box in §4's Astro idioms gate ticked.
