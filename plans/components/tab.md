# Tabs Component Plan

**daisyUI category:** Navigation
**daisyUI doc page:** https://daisyui.com/components/tab/
**Root element:** `div` (`Tabs`, `TabContent`); `Tab` is polymorphic — see §3a
**Target files:** `packages/daisy-astro/src/components/Tab/Tabs.astro`, `Tab.astro`, `TabContent.astro` (only `Tab.astro` exists, as a dummy scaffold) — see §0
**Story files:** `Tabs.stories.ts`, `Tab.stories.ts`, `TabContent.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is): props forward every native attribute for the rendered element; `class:list` for merging; variant classes are literals in a `Record` map (§1b); **uses `DaisySize`, not `DaisyColor`** (§1); stories on `@storybook-astro/framework`; `astro check` is the gate (§5b).

> **Status:** **Implemented** (2026-08-31). `Tabs.astro`, `Tab.astro` and `TabContent.astro`, with 18 + 2 + 2 stories per §5. §3f.1 is answered at both levels in the build output: 28 tabs render as direct children of `.tabs`, and 18 panels render as the immediate next sibling of their tab (§8). §0's description of the scaffold was wrong — see the correction there. Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against `daisyui@5.7.22`'s `components/tab.css` and the doc page source. §3f lists what is **unverified**.

---

## 0. `tabs` is the component; `tab` is a part

Same naming inversion as Stat (`plans/components/stat.md` §0): daisyUI's frontmatter lists **`tabs`** as the component and `tab` / `tab-content` as parts **[verified]**, while the doc page, the repo directory and the checklist all say "Tab".

~~The scaffold renders `<div class="tab">` — the part, not the container.~~ **Corrected 2026-08-31:** the scaffold actually rendered `<div class="tabs">` — the container, on a file named `Tab.astro`. So the mismatch was between the *filename* and its content, not a wrong class. The resolution is the same either way: `Tabs.astro` is new and holds the container, `Tab.astro` now holds the part it is named after, and `TabContent.astro` joins them.

Three files: `Tabs`, `Tab`, `TabContent`.

## 1. Variant audit

**15 classes: 1 component + 2 part + 3 style + 2 modifier + 2 placement + 5 size**, matching the doc page's frontmatter. `grep -oE '\.tabs?[a-z0-9-]*' tab.css | sort -u` returns exactly those 15 **[verified]**.

| Axis | daisyUI classes | Prop | Prop type | Component | Notes |
|---|---|---|---|---|---|
| Base | `tabs` | — | — | `Tabs` | Always applied. |
| Part | `tab` | — | — | `Tab` | Always applied. |
| Part | `tab-content` | — | — | `TabContent` | Must follow its tab — §3c. |
| Style | `tabs-box` `tabs-border` `tabs-lift` | `variant` | `'box' \| 'border' \| 'lift'` | `Tabs` | Mutually exclusive → union. **Must not be named `style`** (`plans/components/button.md` §3a). |
| Placement | `tabs-top` `tabs-bottom` | `placement` | `'top' \| 'bottom'` | `Tabs` | `top` is the default and still emittable. |
| Size | `tabs-xs` `-sm` `-md` `-lg` `-xl` | `size` | `DaisySize` | `Tabs` | Matches exactly — import it. |
| Modifier | `tab-active` `tab-disabled` | `active` / `disabled` | `boolean` | **`Tab`** | On the item, not the container — §3b. |

**No colour axis** — none exists **[verified]**. The "custom color" example uses `[--tab-bg:orange] [--tab-border-color:red] text-primary` **[verified]**, arbitrary values on the tab; §3e.

## 2. Slots

| Component | Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|---|
| `Tabs` | `default` | none — flex children | no | `Tab`s, optionally interleaved with `TabContent`s |
| `Tab` | `default` | none | **yes** | the label — **absent** in radio mode, where `aria-label` supplies it (§3a) |
| `TabContent` | `default` | none | no | the panel |

**No `tabs` array prop**: tabs vary between links, buttons, radios and labels-with-icons across the examples, and panels interleave with them.

## 3. Six things the naive implementation gets wrong

### 3a. A tab can be four different elements, and two of them get their label from `aria-label`

```css
.tab:is(.tabs > .tab) {
  &:is(input[type=radio]) { min-width:fit-content; &:after { content: attr(aria-label) } }
  &:is(label) { position:relative; & input { appearance:none; opacity:0; position:absolute; inset:0 } }
  &:checked, &:is(label:has(:checked)),
  &:is(.tab-active, [aria-selected=true], [aria-current=true], [aria-current=page]) { … } }
```

**[all verified]**. Four shapes, all documented on the page:

| Shape | Where the label comes from | Selection driven by |
|---|---|---|
| `<a>` / `<button role="tab">` | slot content | `tab-active` (caller-managed) |
| `<input type="radio" class="tab">` | **`aria-label`** via `::after` | `:checked` |
| `<label class="tab">` wrapping a radio | slot content | `label:has(:checked)` |
| any of the above | — | `[aria-selected]` / `[aria-current]` |

So `Tab` is `Polymorphic<{ as: Tag }>` defaulting to `'button'` — the doc page's *rendered* examples use `<button role="tab">` while its copy-paste HTML uses `<a>` **[verified]**, the same substitution `plans/components/link.md` §3a and `plans/components/menu.md` §3a found. `button` is the honest default for a control that does not navigate.

**The radio shape is the important one**: `content: attr(aria-label)` **[verified]** means an `<input class="tab">` with no `aria-label` renders a **blank tab**. Third component with this mechanism, after `plans/components/filter.md` §3c and `plans/components/rating.md` §3a — and the JSDoc says so, because `Tab`'s slot being optional is otherwise a trap.

`role="tab"` appears on every non-input example **[verified]**; it is **not** defaulted, because it is only correct inside a `role="tablist"` and the radio shapes must not have it. The JSDoc pairs `role="tablist"` on `Tabs` with `role="tab"` on each `Tab`, and the stories show it.

### 3b. `active` and `disabled` go on the tab; everything else on the container

`tab-active` and `tab-disabled` are written on the `<a>`/`<button>` **[verified]**; the style, placement and size classes on the `<div class="tabs">`.

Sixth appearance of this split after Carousel, Chat, Dock, Indicator and Steps — the settled rule applies: **the prop belongs on whichever root daisyUI writes the class on.**

Note `tab-active` is **visual only**. In the link/button shape the caller manages it; in radio shapes `:checked` does the work and `tab-active` is unnecessary. And for accessibility a tab list wants `aria-selected="true"` on the active tab — which the CSS also honours **[verified]** — so the JSDoc recommends both.

### 3c. `tab-content` must come **immediately after** its tab

daisyUI's frontmatter says it: *"Tab content that comes immediately after a tab."* The CSS is `&:checked … { & + .tab-content { display: block } }` **[verified]** — an **adjacent sibling** selector.

So the markup interleaves: tab, panel, tab, panel — not all tabs then all panels. Every content example does this **[verified]**, and getting it wrong leaves every panel hidden with no error.

That also means **panels only work with the radio shapes**, since `+ .tab-content` hangs off `:checked` or `label:has(:checked)` — a `<button role="tab">` has no checked state, so a button-driven tab set needs the caller's own show/hide. The doc page bears this out: every panel example uses radios **[verified]**. One JSDoc line, and it is the question this component attracts.

### 3d. Radio tabs need a unique `name` per group

Every radio example carries a distinct `name` and daisyUI comments each one — *"name of each tab group should be unique"* **[verified in all six]**.

Same hazard as `plans/components/radio.md` §3b and `plans/components/rating.md` §3f.3: two tab groups sharing a `name` become one, and selecting in one clears the other. Not a required prop (the button shape needs none), but the first JSDoc line for the radio shape, and every story uses a scoped name.

### 3e. Colour is two custom properties, not a class

`--tab-bg` and `--tab-border-color` are declared on `.tab` **[verified]**, and the "custom color" example overrides both with arbitrary Tailwind values plus a `text-*` for the foreground **[verified]**.

**No `color` prop** — it would emit utilities this library does not own, the same reasoning as `plans/components/loading.md` §3a and `plans/components/range.md` §1a. The JSDoc lists both properties with their defaults.

Note `--tab-radius-grad` and the `--tab-order` variable also exist **[verified]**; `--tab-order` is what lets `tabs-bottom` reorder without changing the DOM.

### 3f. Unverified assumptions

1. ~~**Do children land as direct children of `.tabs`?**~~ **Answered 2026-08-31: yes, at both levels.** `<div class="tabs…"><button|a|input|label` matches **28** times, and `class="tab"…><div class="tab-content` — the panel as the tab's immediate next sibling — matches **18** times. So the child selector that styles the tabs and the adjacent-sibling selector that reveals the panels both have the structure they need. This was the only plan where the shared question had *two* independent answers to check.
2. **`:has()` support** — the `label:has(:checked)` shape depends on it **[verified]**. Without it, label-wrapped tabs never show as selected. Check before judging `RadioLiftWithIcons`.
3. **Radio-group isolation across stories** (§3d) — seven radio examples on one docs page.
4. **Slot sanitization vs inline `<svg>`** — the icons example. Shared with `plans/components/alert.md` §3d.1.

## 4. Component implementation

### `Tabs.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

// Props first — a `const` above this breaks inference (plans/README.md §5c).
type TabsVariant = 'box' | 'border' | 'lift';
type TabsPlacement = 'top' | 'bottom';

/**
 * Container for `Tab`s. daisyUI calls **this** the component; `tab` is a part
 * (plan §0).
 *
 * For a tab list of links or buttons, add `role="tablist"` and give each `Tab`
 * `role="tab"` (plan §3a).
 *
 * For panels, interleave them — tab, content, tab, content — and use the radio
 * shape, since `+ .tab-content` hangs off `:checked` (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {
  /** Named `variant`, never `style` — `style` is a native attribute. */
  variant?: TabsVariant;
  placement?: TabsPlacement;
  size?: DaisySize;
}

// Full literal class names. NEVER `tabs-${variant}` (plans/README.md §1b).
const VARIANT: Record<TabsVariant, string> = {
  box: 'tabs-box', border: 'tabs-border', lift: 'tabs-lift',
};
const PLACEMENT: Record<TabsPlacement, string> = {
  top: 'tabs-top', bottom: 'tabs-bottom',
};
const SIZE: Record<DaisySize, string> = {
  xs: 'tabs-xs', sm: 'tabs-sm', md: 'tabs-md', lg: 'tabs-lg', xl: 'tabs-xl',
};

const { variant, placement, size, class: className, ...rest } = Astro.props;
---

<div
  class:list={[
    'tabs',
    variant && VARIANT[variant],
    placement && PLACEMENT[placement],
    size && SIZE[size],
    className,
  ]}
  {...rest}
>
  <slot />
</div>
```

### `Tab.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` MUST precede every `const` (plans/README.md §5c).
/**
 * One tab. Four shapes are supported (plan §3a):
 *
 * - `<button role="tab">` (default) or `as="a"` — label from the slot,
 *   selection managed by you via `active` plus `aria-selected`.
 * - `as="input"` with `type="radio"` — **the label comes from `aria-label`**,
 *   not the slot, and an input with no `aria-label` renders blank.
 * - `as="label"` wrapping a hidden radio — label from the slot, selection from
 *   `:checked`.
 *
 * Radio groups need a unique `name` (plan §3d).
 *
 * Recolour with `class="[--tab-bg:orange] [--tab-border-color:red] text-primary"`
 * — there is no colour prop (plan §3e).
 */
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  /** Visual only — also set `aria-selected="true"` for a real tab list (plan §3b). */
  active?: boolean;
  /** Visual only. For a `<button>`, add the native `disabled` too. */
  disabled?: boolean;
}>;

const { as: Tag = 'button', active = false, disabled = false, class: className, ...rest } =
  Astro.props as Props<HTMLTag>;
---

<Tag class:list={['tab', { 'tab-active': active, 'tab-disabled': disabled }, className]} {...rest}>
  <slot />
</Tag>
```

### `TabContent.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

/**
 * A panel. Must be the **immediate next sibling** of its `Tab`, and that tab
 * must be a radio shape — the selector is `:checked + .tab-content`
 * (plan §3c).
 */
interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<div class:list={['tab-content', className]} {...rest}>
  <slot />
</div>
```

No `<script>` anywhere: the radio shapes are the checkbox hack and the button shape is caller-managed.

### Astro idioms gate

- [ ] Content arrives via plain default slots — no `tabs` array prop (§2).
- [ ] `<slot />` has no wrapper in `Tabs` — `.tabs > .tab` is a child selector and `+ .tab-content` an adjacent one (§3f.1).
- [ ] No `Astro.slots.has()` gating; `Tab`'s slot is optional for the radio shape (§3a).
- [ ] `Tabs` root is `div` with no `as`; `Tab` is `Polymorphic` defaulting to `button` (§3a).
- [ ] `active` / `disabled` are `Tab` props; `variant` / `placement` / `size` are `Tabs` props (§3b).
- [ ] **No `role` defaults** — `role="tablist"` / `role="tab"` are documented, not emitted (§3a).
- [ ] No `<script>` added; **no colour prop** (§3e).
- [ ] `...rest` spread onto the root in all three.
- [ ] Style axis is named `variant`, not `style` (§1).
- [ ] Every variant class is a literal in a `Record` map or object key.
- [ ] **`type Props` precedes every `const` in `Tab.astro`**, with `as Props<HTMLTag>` (§3a).
- [ ] Probe (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Tabs role="tablist"><Tab role="tab" active>Tab 1</Tab></Tabs>
  <Tabs variant="lift" placement="bottom" size="lg">ok</Tabs>
  <Tab as="input" type="radio" name="t1" aria-label="Tab 1" />
  <Tab as="label"><input type="radio" name="t2" />Live</Tab>
  <Tabs active>must error — active is a Tab prop (§3b)</Tabs>
  <Tab color="primary">must error — colour is a custom property (§3e)</Tab>
  <Tabs style="lift">must error — the prop is `variant` (§1)</Tabs>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

Three files. Doc-page examples in page order (`plans/README.md` §8), all in `Tabs.stories.ts`: `Default`, `Border`, `Lift`, `Box`, `BoxWithRadio`, `Sizes` (five), `RadioBorderWithContent`, `RadioLiftWithContent`, `RadioLiftWithIcons`, `RadioLiftContentBottom`, `RadioBoxWithContent`, `HorizontalScroll`, `CustomColor`.

Plus `Playground` and `Passthrough`; `Tab` and `TabContent` get a `Playground` + `Passthrough` each.

Three beyond the doc page:

- **`RadioWithoutAriaLabel`** — a radio tab with no `aria-label`, rendering blank (§3a).
- **`PanelsAfterAllTabs`** — all tabs then all panels, so nothing shows (§3c). The mistake the interleaved markup exists to prevent.
- **`ButtonTabsWithPanels`** — button tabs plus `TabContent`s, which never appear (§3c).

**Every radio story uses a scoped `name`** (§3d, §3f.3), with a comment.

## 6. Steps

- [x] **Step 1: done — §3f.1 is answered at both levels** (see §3f.1 and §8). §3f.2 (`:has()` for the label shape) and §3f.3 (radio-group isolation) are runtime and move to Step 5, though every story already uses a scoped `name`. §3f.4 is moot — sanitization is off library-wide.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, no colour axis; `variants.ts` untouched.
- [x] **Step 3: done.** `Tabs.astro` created, `Tab.astro` rewritten as the part it is named after, `TabContent.astro` created — see §0 for what the scaffold actually contained. Gate walked; the probe errored on all four intended lines, including `<Tabs active>` and `<Tab size="lg">`, so §3b's misplacement is unrepresentable in both directions.
- [x] **Step 4: done.** `Tabs.stories.ts` (18), `Tab.stories.ts` (5), `TabContent.stories.ts` (2). Every radio story uses a story-scoped `name`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes, and the panel switching is the point.** Verify: the four style stories look distinct, with `lift` raising the active tab into the panel; `Sizes` shows five heights; every radio story **switches panels on click** (§3c); `Tab/AsLabel` selects through the label shape, which is where `:has()` support shows (§3f.2); `RadioLiftContentBottom` puts the tabs under the panel with no DOM reorder (§3e); `HorizontalScroll` scrolls with the panel sticky; `RadioWithoutAriaLabel`'s first group is blank (§3a); `PanelsAfterAllTabs` and `ButtonTabsWithPanels` show no panels at all (§3c).
- [x] **Step 6: done — forwarding confirmed on all three, and both adjacency rules asserted.** `Passthrough` renders `<div class="tabs tabs-lift tabs-top tabs-lg mine" role="tablist" id="tabs-1" data-test="yes" style="letter-spacing:2px">`. Full output in §8.
- [x] **Step 7: done — the `Tab` row in `plans/README.md` says Implemented**, naming all three components and the `tabs`-is-the-component inversion.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 15 daisyUI classes reachable across three components.
- [x] The scaffold's `tab`-as-container mistake is corrected (§0).
- [x] `Tab` defaults to `button` and supports the `a` / `input` / `label` shapes; probe passes (§3a).
- [x] `active`/`disabled` are `Tab` props; the rest are `Tabs` props (§3b).
- [x] Panels render as immediate siblings of their tab (§3c) — checked in the build output.
- [x] No invented axis — no colour prop (§3e), no `tabs` array (§2), no `role` defaults (§3a).
- [x] JSDoc states: the four shapes and where each gets its label (§3a), that `active` is visual and `aria-selected` is separate (§3b), that panels need the radio shape and immediate adjacency (§3c), the unique-`name` rule (§3d), and the two colour custom properties (§3e).
- [x] Radio stories use scoped `name` values (§3d).
- [x] One story per doc-page example, plus `RadioWithoutAriaLabel`, `PanelsAfterAllTabs` and `ButtonTabsWithPanels`.
- [x] Every box in §4's gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default        → <div class="tabs" role="tablist"><a role="tab" class="tab">Tab 1</a>
                   <a role="tab" class="tab tab-active">Tab 2</a><a role="tab" class="tab">Tab 3</a></div>
RadioBorder…   → <div class="tabs tabs-border">
                   <input type="radio" name="tabs-border-story" aria-label="Tab 1" class="tab"/>
                   <div class="tab-content border-base-300 bg-base-100 p-10">Tab content 1</div>
                   <input … aria-label="Tab 2" checked class="tab"/><div class="tab-content …">…
CustomColor    → <a role="tab" class="tab tab-active text-primary [--tab-bg:orange] [--tab-border-color:red]">Tab 2</a>
Tab/AsLabel    → <label class="tab"><input type="radio" name="tab-story-label" checked />Live</label>
RadioWithout…  → <input type="radio" name="tabs-noaria-story" checked class="tab"/>   ← no label to render
Passthrough    → <div class="tabs tabs-lift tabs-top tabs-lg mine" role="tablist" id="tabs-1"
                   data-test="yes" style="letter-spacing:2px">…
```

What this settles:

- **§3f.1, twice over.** 28 tabs are direct children of `.tabs`, and 18 panels are the immediate next sibling of their tab. Both selectors daisyUI depends on — the child combinator that styles tabs, the adjacent-sibling that reveals panels — have the structure they need.
- **All four tab shapes render**: anchor, button, `input[type=radio]` and `label`-wrapping-a-radio, each from the same component through `as`.
- **Neither misplacement is writable**: `<Tabs active>` and `<Tab size="lg">` are both compile errors, so §3b's split is enforced by the type system rather than by discipline.
- `role="tablist"` / `role="tab"` are passed by the stories, never emitted by the components — correct, since `role="tab"` would be wrong on the radio shapes (§3a).
- The two colour custom properties reach the built stylesheet as a real rule, so §3e's "document, don't wrap in a prop" decision costs nothing.
- All 15 classes have rules in the built stylesheet.

Not settled here: whether clicking a tab actually switches the panel. That, the label shape's `:has()` dependency, and the bottom placement's visual reorder are all Step 5.
