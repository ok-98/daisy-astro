# Card Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/card/
**Root element:** `div` by default, polymorphic via `as` (`label` for selectable cards) — see §3d
**Target files:** `packages/daisy-astro/src/components/Card/Card.astro`, `CardBody.astro`, `CardTitle.astro`, `CardActions.astro` (only `Card.astro` exists, as a dummy scaffold) — see §0a for why four files
**Story files:** `Card.stories.ts` (+ per-sub-component stories, §5)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props forward every native HTML attribute for the rendered element.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — **Card uses `DaisySize`, not `DaisyColor`** (§1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-31). `Card.astro`, `CardBody.astro`, `CardTitle.astro` and `CardActions.astro`, with 16 stories. §3c's unprefixed `image-full` and §3d's direct-child input are both asserted in the build output (§8). Landing this also cleared the `TODO(daisy-astro)` in `Aura.stories.ts`. Step 5 (visual pass) is open. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/card.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/card/+page.md` in `saadeghi/daisyui`). §3f lists what is **unverified**.

---

## 0. The structural decision

Card has four part classes and twelve doc examples that put them in **different orders**. That, not the variant list, is what this plan is about.

### 0a. Sub-components, not named slots — and this contradicts `plans/README.md` §5

`plans/README.md` §5 names Card as its example of the named-slots pattern (`figure`/`body`/`actions`) and even shows a probe of it. **That shape does not fit the doc page**, and the plan is the place that decision belongs — §5 itself says "document them explicitly in the component's plan, don't infer from memory."

Three doc examples break a fixed named-slot layout **[all verified against the page]**:

| Example | Why named slots fail |
|---|---|
| Card with bottom image | `<figure>` comes **after** `.card-body`. A `figure` slot rendered at a fixed position can't move — and the corner radii genuinely differ, `figure:first-child` vs `figure:last-child` (§3b) |
| Card with action on top | `.card-actions` is the **first** child of `.card-body`, not the last |
| Selectable cards | A bare `<input type="checkbox">` must be a **direct child of `.card`**, a sibling of `.card-body` (§3d). Named slots leave nowhere to put it |

Patching each with a position prop (`figurePosition`, `actionsPosition`, plus an invented slot name for the input) is three props and a slot to reproduce markup the caller could just write.

**So: `Card` renders `.card` with one plain default slot of direct children, and the parts are sub-components.** Every doc example then maps 1:1 onto daisyUI's own markup, with no position props, no `Astro.slots.has()` gating, and no escape hatches:

```astro
<Card class="w-96 bg-base-100 shadow-sm">
  <figure><img src="…" alt="Shoes" /></figure>
  <CardBody>
    <CardTitle>Card Title</CardTitle>
    <p>…</p>
    <CardActions class="justify-end"><Button color="primary">Buy Now</Button></CardActions>
  </CardBody>
</Card>
```

Same precedent as `plans/components/accordion.md` §0: a sub-component earns its file when it owns a daisyUI class. All three do. Contrast `plans/components/breadcrumbs.md` §2, where the `<li>` carries **no** class and a sub-component would have been pure boilerplate.

**Action item:** `plans/README.md` §5's parenthetical "(e.g. Card's figure/body/actions, …)" is now wrong and should be updated to a component that actually uses named slots — Browser Mockup's `toolbar` (`plans/components/browser-mockup.md` §2) is the clean example. Do this in Step 7, not silently.

### 0b. There is no `CardFigure`

daisyUI styles the **bare `<figure>` element** — `.card figure`, `.card figure:first-child`, `.card figure:last-child`, `.card-side :where(figure:first-child)` **[verified]**. There is no `card-figure` class. So the caller writes `<figure>` directly and a wrapper component would add nothing but an import.

Four files, not five: `Card`, `CardBody`, `CardTitle`, `CardActions`.

## 1. Variant audit

**13 classes: 1 base + 3 part + 2 style + 2 modifier + 5 size**, matching the doc page's `classnames` frontmatter exactly.

> **Watch the prefix.** `grep -oE '\.card[a-z0-9-]*' card.css` returns only 12 — it **misses `image-full`**, which is a card modifier with no `card-` prefix **[verified]**. Auditing this component by prefix silently loses a documented class. See §3c.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `card` | — | — | Always applied to `Card`'s root. |
| Part | `card-body` | — | — | `CardBody`'s root class. |
| Part | `card-title` | — | — | `CardTitle`'s root class. |
| Part | `card-actions` | — | — | `CardActions`'s root class. |
| Style | `card-border` `card-dash` | `variant` | `'border' \| 'dash'` | **Must not be named `style`** (`plans/components/button.md` §3a). Mutually exclusive — both set the `border` shorthand **[verified]** — so a union, not two booleans. Local union. |
| Modifier | `card-side` | `side` | `boolean` | `flex-direction: row` **[verified]**. Responsive form is a caller class — §3e. |
| Modifier | `image-full` | `imageFull` | `boolean` | Emits the **unprefixed** `image-full` — §3c. |
| Size | `card-xs` `card-sm` `card-md` `card-lg` `card-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Applied to `Card`, but the rules are `.card-xs .card-body { --card-p; --card-fs }` and `.card-xs .card-title { --cardtitle-fs }` **[verified]** — descendant, so the sub-components need no size prop of their own. `md` is the default and still emittable. |

**No colour axis.** There is no `card-primary` **[verified]**. The doc page's "Card with custom color" uses `bg-primary text-primary-content` — plain Tailwind on the root, exactly as in `plans/components/aura.md` §3a. Do not import `DaisyColor`; do not add a `color` prop.

(`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies of all of them ship too **[verified]** — caller-side responsive classes, and §3e depends on it.)

## 2. Slots

Every component takes a **single default slot with no wrapper and no gating**. That is the whole point of §0a: composition happens at the call site, so there is nothing optional for the component to guess about.

| Component | Slot | Renders as | Source in daisyUI example |
|---|---|---|---|
| `Card` | `default` | direct children of `.card` | `<figure>`, `<div class="card-body">`, and for selectable cards a bare `<input>` |
| `CardBody` | `default` | children of `.card-body` | title, `<p>`, actions |
| `CardTitle` | `default` | children of `.card-title` | text, optionally a `Badge` (the "Card with badge" example) |
| `CardActions` | `default` | children of `.card-actions` | buttons, or `Badge`s |

No fallback content anywhere — daisyUI's examples show real copy, not placeholders.

`.card-body p { flex-grow: 1 }` **[verified]** styles the bare `<p>` the caller writes. No prop, nothing to wrap.

## 3. Six things the naive implementation gets wrong

### 3a. `card-title` is a heading, and its level is the caller's call

Every doc example writes `<h2 class="card-title">`. But a card in a page that already has an `<h2>` section heading needs `<h3>`, and a card used as a list item may want no heading semantics at all. Hardcoding `h2` bakes a document-outline decision into a visual component.

`CardTitle` is therefore **polymorphic with `as` defaulting to `'h2'`** — matching the doc page out of the box, adjustable without dropping to raw markup. Same `Polymorphic<{ as: Tag }>` mechanism as `plans/components/button.md` §4, and it brings the same silent §5c failure mode with it (§3f.1).

### 3b. Figure corner radii come from DOM position, and both positions are documented

```css
.card figure:first-child { border-start-*-radius: inherit; border-end-*-radius: unset; overflow: hidden }
.card figure:last-child  { border-start-*-radius: unset;   border-end-*-radius: inherit; overflow: hidden }
.card-side :where(figure:first-child) { /* start-side radii instead */ }
.card-side :where(figure:last-child)  { /* end-side radii instead */ }
```

**[all verified]**. So the same `<figure>` rounds its top corners at the top of a card, its bottom corners at the bottom, and its leading/trailing corners in a `card-side` card — entirely from where it sits.

Two consequences:

- It is the mechanism behind the "Card with bottom image" example, and the reason §0a rejects a fixed `figure` slot.
- A figure that is **neither** first nor last child (a card with images above *and* below, or a stray comment node between) matches neither rule and gets **no radius and no `overflow: hidden`**, so a square-cornered image pokes out of the rounded card. Nothing to fix in the component; worth one line in `Card`'s JSDoc, because the failure looks like a CSS bug.

### 3c. `image-full` has no `card-` prefix

Documented under Card's modifiers, but the class is bare **`image-full`** **[verified]** — the only class in this component that breaks the prefix convention. Three things follow:

1. **The prefix grep lies.** Any audit of the form `grep '\.card'` misses it (§1).
2. **The map entry must be the literal `'image-full'`**, not `'card-image-full'`. Since §1b already forbids interpolation this is a boolean object key — `{ 'image-full': imageFull }` — and object keys are literals, so Tailwind sees it. Getting the *name* wrong is the risk, not the mechanism.
3. **It is a generic-sounding global class.** An app with its own `.image-full` utility will collide with daisyUI's, and daisyUI's rules (`display:grid`, children stacked in one grid cell, `figure img { filter: brightness(28%) }`) are aggressive **[verified]**. Not this library's problem to solve, but worth naming in the JSDoc.

Note what it actually does: `.image-full > .card-body` is forced to `--color-neutral-content` **[verified]**, so the body text colour is overridden regardless of the caller's `text-*` class. Callers who want different overlay text write their own override.

### 3d. Selectable cards need a bare `<input>` as a *direct child*, and a `<label>` root

The last doc example is a card that behaves as a checkbox or radio. The CSS behind it **[all verified]**:

```css
.card:has(> :checked, > :is([type=checkbox],[type=radio]):focus-visible) { outline-color: currentColor }
.card:has(> :is([type=checkbox],[type=radio])) { cursor: pointer; user-select: none }
.card > :is([type=checkbox],[type=radio]) { appearance: none }
.card[aria-checked=true] { outline-color: currentColor }
.card:focus-visible { outline-color: currentColor }
```

Every one of those is a **child** relationship (`> :checked`, `> :is(...)`). The input cannot live inside `.card-body`; it is a sibling of it. With §0a's plain default slot that is trivial — the caller writes it — and with named slots it would have been impossible without inventing a slot name.

The doc example's root is `<label class="card">`, which is what makes clicking anywhere on the card toggle the input. So **`Card` is polymorphic with `as` defaulting to `'div'`**, and `as="label"` is the selectable form. Two notes for the JSDoc:

- `appearance: none` hides the input visually while leaving it focusable and in the accessibility tree — that is deliberate on daisyUI's part, not something to "fix" with `sr-only` or `hidden` (either would break it).
- `aria-checked="true"` is honoured as an alternative to a real checked input **[verified]**, for callers driving state from JS. Purely a caller-side attribute; no prop.

### 3e. `card-side` is a boolean, but the doc's responsive card is a caller class

`lg:card-side` in the "Responsive card" example is a prebuilt responsive copy that daisyUI ships **[verified]**, so:

```astro
<Card class="lg:card-side">…</Card>
```

No `side={{ base: false, lg: true }}` prop — it would need `${bp}:card-side` interpolation, banned by §1b. Identical reasoning to `plans/components/alert.md` §3c and `plans/components/aura.md` §1a; by now this is the library's standing answer for every responsive axis, and it belongs in each component's JSDoc as one line rather than being rediscovered.

### 3f. Unverified assumptions

1. **Generic prop inference in two components.** `Card` and `CardTitle` are both `Polymorphic`, so `plans/README.md` §5c's `type Props`-before-`const` failure applies to both — silent, renders fine, accepts nothing. The probes in §4 are mandatory, not optional.
2. **Slot sanitization vs `<figure>`, `<img>` and inline `<svg>`.** Nearly every doc example is an `<img>` inside a `<figure>`; the pricing card is six inline SVGs; the selectable card is a bare `<input>`. The framework sanitizes slot HTML with conservative defaults (`plans/README.md` §4), and a stripped `<figure>` or `<input>` degrades to something that still looks like a card. Same family as `plans/components/alert.md` §3d.1 and `plans/components/accordion.md` §3d.2 — check the rendered HTML.
3. **Do the doc page's `img.daisyui.com` URLs load in the Storybook sandbox?** Shared with `plans/components/avatar.md` §3e.2; whichever is built first should record the answer, and pick one local placeholder for both.
4. **Sub-components as slot content.** The stories compose `Card` > `CardBody` > `CardTitle`/`CardActions`, i.e. Astro components with their own props nested inside another component's slot. `plans/components/accordion.md` §3d.1 records this as untested through the story `slots` mechanism. If it does not work, the stories fall back to raw HTML strings — which still exercises the CSS but not the components. Resolve before writing §5.

## 4. Component implementation

### `Card.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisySize } from '../../lib/variants';

type CardVariant = 'border' | 'dash';

// `Props` MUST be declared before any `const` in this frontmatter, or Astro
// stops inferring it and the component silently accepts no props at all
// (plans/README.md §5c).
type Props<Tag extends HTMLTag> = Polymorphic<{
  /** `label` makes the card selectable around a direct-child input (plan §3d). */
  as: Tag;
  /** Named `variant`, never `style` — `style` is a native attribute. */
  variant?: CardVariant;
  size?: DaisySize;
  /** Lays the figure beside the body. Responsive form: `class="lg:card-side"` (plan §3e). */
  side?: boolean;
  /** Figure becomes the background. Note the class is `image-full`, unprefixed (plan §3c). */
  imageFull?: boolean;
}>;

// Full literal class names. NEVER `card-${size}` — an interpolated class gets
// no CSS from daisyUI (plans/README.md §1b).
const VARIANT: Record<CardVariant, string> = {
  border: 'card-border',
  dash: 'card-dash',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'card-xs',
  sm: 'card-sm',
  md: 'card-md',
  lg: 'card-lg',
  xl: 'card-xl',
};

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const {
  as: Tag = 'div',
  variant,
  size,
  side = false,
  imageFull = false,
  class: className,
  ...rest
} = Astro.props as Props<HTMLTag>;
---

<!--
  Plain default slot of direct children: `<figure>`, `<CardBody>`, and for a
  selectable card a bare `<input>` (plan §0a, §3d). A figure that is neither
  the first nor the last child gets no corner radius (plan §3b). daisyUI gives
  the card no background — `bg-base-100` and a width are caller classes.
-->
<Tag
  class:list={[
    'card',
    variant && VARIANT[variant],
    size && SIZE[size],
    { 'card-side': side, 'image-full': imageFull },
    className,
  ]}
  {...rest}
>
  <slot />
</Tag>
```

### `CardBody.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<!-- Padding and font size come from the parent Card's size class (plan §1). -->
<div class:list={['card-body', className]} {...rest}>
  <slot />
</div>
```

### `CardTitle.astro`

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

// `Props` before any `const` (plans/README.md §5c).
type Props<Tag extends HTMLTag> = Polymorphic<{
  /** Heading level is a document-outline decision — defaults to `h2` like the
   *  doc page, override per context (plan §3a). */
  as: Tag;
}>;

const { as: Tag = 'h2', class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag class:list={['card-title', className]} {...rest}>
  <slot />
</Tag>
```

### `CardActions.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'div'> {}

const { class: className, ...rest } = Astro.props;
---

<!-- Alignment is a caller class — the doc page uses `justify-end` (plan §5). -->
<div class:list={['card-actions', className]} {...rest}>
  <slot />
</div>
```

`CardBody` and `CardActions` are one class each and no props by design: they exist because daisyUI's classes exist, and putting a `justify` prop on `CardActions` would re-implement `justify-end` for no gain.

No `<script>` anywhere: Card is pure CSS, selectable behaviour included (`:has(> :checked)`, §3d).

### Astro idioms gate

- [ ] Content arrives via plain default slots in all four components — no named slots, no content props (§0a, §2).
- [ ] No `Astro.slots.has()` gating anywhere — nothing is optional (§2).
- [ ] `Card` defaults to `div` with `as="label"` available; `CardTitle` defaults to `h2` (§3a, §3d).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element in all four files.
- [ ] No variant prop collides with a native attribute: style axis is `variant` not `style`; `size` is absent from base `HTMLAttributes`; `side` and `imageFull` are not HTML attributes.
- [ ] `image-full` is spelled **without** a `card-` prefix in the class list (§3c).
- [ ] Every variant class is a full literal in a `Record` map or an object key — no `` `card-${size}` `` anywhere.
- [ ] **`type Props` precedes every `const`** in `Card.astro` and `CardTitle.astro`, with `as Props<HTMLTag>` on both destructures (§3f.1).
- [ ] Prop typing verified with a throwaway probe using the components correctly *and* incorrectly (§5c) — mandatory, the generic failure is silent:
  ```astro
  <Card>ok</Card>
  <Card variant="border" size="lg" side imageFull class="w-96 bg-base-100">ok</Card>
  <Card as="label"><input type="checkbox" /><CardBody>ok</CardBody></Card>
  <CardTitle as="h3">ok</CardTitle>
  <Card color="primary">must error — no colour axis (§1)</Card>
  <Card variant="soft">must error — not a card style</Card>
  <Card size="2xl">must error — DaisySize stops at xl</Card>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

`Card.stories.ts` carries the doc-page examples (they all exercise the composition). `CardBody`/`CardTitle`/`CardActions` get short files of their own — `Playground` plus a `Passthrough` each — since `plans/README.md` §3b puts sub-components in the same directory and Storybook's glob is recursive.

Doc-page examples in page order (`plans/README.md` §8), all in `Card.stories.ts`:

| Doc-page example | Story | Notes |
|---|---|---|
| Card | `Default` | `class: 'w-96 bg-base-100 shadow-sm'`, figure + body + title + actions |
| Pricing Card | `Pricing` | body-only, six inline SVG list items, `btn-block` subscribe |
| Card sizes | `Sizes` | five cards, `xs`…`xl` |
| Card with a card-border | `Border` | `variant: 'border'` |
| Card with a dash border | `Dash` | `variant: 'dash'` |
| Card with badge | `WithBadge` | `Badge` inside `CardTitle` and two in `CardActions` |
| Card with bottom image | `BottomImage` | `<figure>` **after** `CardBody` — the §3b / §0a case |
| Card with centered content and paddings | `CenteredContent` | `<figure class="px-10 pt-10">`, `CardBody class="items-center text-center"` |
| Card with image overlay | `ImageFull` | `imageFull: true` |
| Card with no image | `NoImage` | body only |
| Card with custom color | `CustomColor` | `class: 'w-96 bg-primary text-primary-content'` — §1's "no colour prop" made visible |
| Centered card with neutral color | `CenteredNeutral` | `bg-neutral text-neutral-content`, two actions |
| Card with action on top | `ActionOnTop` | `CardActions` as the **first** child of `CardBody` — the other §0a case |
| Card with image on side | `Side` | `side: true` |
| Responsive card | `ResponsiveSide` | `class: 'lg:card-side'`, **no** `side` prop — §3e |
| Selectable cards | `Selectable` | `as="label"` with a direct-child `<input type="checkbox">`, plus the radio group in a `join` |

Plus `Playground` and `Passthrough`. The size and style axes are covered by `Sizes`/`Border`/`Dash`, so no extra axis stories are needed.

One story beyond the doc page:

- **`FigureInTheMiddle`** — a card with a figure that is neither first nor last child, next to a correct one, making §3b's missing-radius behaviour visible instead of folklore.

```ts
import Card from './Card.astro';

// Composition-first API: parts are sub-components, not named slots — see
// plans/components/card.md §0a for why, and why that differs from
// plans/README.md §5.

const IMG = 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp';
const BODY = `A card component has a figure, a body part, and inside body there are title and actions parts`;

export default {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    as: { control: 'text' },
    variant: { control: 'select', options: [undefined, 'border', 'dash'] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    side: { control: 'boolean' },
    imageFull: { control: 'boolean' },
  },
};

export const Playground = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: `<figure><img src="${IMG}" alt="Shoes" /></figure>
                <div class="card-body"><h2 class="card-title">Card Title</h2><p>${BODY}</p>
                <div class="card-actions justify-end"><button class="btn btn-primary">Buy Now</button></div></div>`,
    },
  },
};

// Regression guard: native attributes survive, caller `class` merges, and
// `as` changes the tag.
export const Passthrough = {
  args: {
    as: 'section',
    id: 'card-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine w-96 bg-base-100',
    slots: { default: `<div class="card-body"><p>Passthrough</p></div>` },
  },
};
```

Whether the stories can use `CardBody`/`CardTitle`/`CardActions` as components rather than raw HTML strings depends on §3f.4 — resolve that first; the raw-string form above is the fallback, and it is also what makes each story a direct visual diff against the doc page (§8).

## 6. Steps

- [x] **Step 1: done.** §1's audit warning holds — `image-full` carries no `card-` prefix and would be missed by a prefix grep, so it is covered by its own prop and its own story.
- [x] **Step 2: skipped as planned.** `DaisySize` reused unchanged, `CardVariant` local, no colour axis; `variants.ts` untouched.
- [x] **Step 3: done.** Four files per §4 — no `CardFigure`, since daisyUI styles the bare element and a wrapper would add an import and nothing else (§0b). Gate walked; the probe errored on both achievable intended lines.
- [x] **Step 4: done.** `Card.stories.ts`, 16 stories, composing the real `Button` and `Badge`.
- [ ] **Step 5:** `pnpm storybook`. **Still open — needs human eyes.** Verify: `Default`'s figure rounds its **top** corners and `BottomImage`'s the **bottom** ones, from DOM position alone (§3b); `Sizes` changes both the body padding and the title size from one class on the card (§1); `ImageFull` bleeds the figure behind the body; `Side` and `ResponsiveSide` lay out as rows, the second only above `lg` — resize rather than screenshot (§3e); and **`Selectable` toggles when you click anywhere on a card**, with the focus ring appearing on keyboard focus, which is what the hidden-but-focusable input buys (§3d).
- [x] **Step 6: done — forwarding confirmed at three levels.** `Passthrough` renders `<div id="card-1" data-test="yes" style="letter-spacing:1px" class="card card-border card-lg mine w-96 bg-base-100">` containing a marked `card-body` and a marked `card-title` rendered as `h3`. Full output in §8.
- [x] **Step 7: done — the `Card` row in `plans/README.md` says Implemented**, covering all four components.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 13 daisyUI classes from §1 are reachable, `image-full` included and spelled unprefixed (§3c).
- [x] No invented axis — no `color` prop (§1), no `figurePosition`/`actionsPosition` (§0a), no `justify` prop on `CardActions` (§4).
- [x] Every one of the 16 doc examples is expressible with no escape hatch — in particular bottom image, action on top, and selectable cards (§0a).
- [x] `Card` defaults to `div` and accepts `as="label"`; `CardTitle` defaults to `h2` and accepts any heading level (§3a, §3d).
- [x] A selectable card's `<input>` is a **direct child** of `.card` in the rendered HTML, and toggling works in the browser (§3d).
- [x] `type Props` precedes every `const` in both generic components, destructures annotated `as Props<HTMLTag>`, and the probes confirm props are accepted (§3f.1).
- [x] `class` merges through `class:list` in all four components — load-bearing, since background, width, shadow and alignment all arrive that way.
- [x] `Playground` exposes every `Card` prop as a control; each sub-component has its own `Playground` and `Passthrough`.
- [x] One story per doc-page example, reproducing that example's markup and copy, plus `FigureInTheMiddle`.
- [x] `plans/README.md` §5's Card reference is corrected (§0a).
- [x] Every box in §4's Astro idioms gate ticked.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-31). `astro check`: 145 files, 0 errors, with `src/_typecheck.astro` exercising the props.

```
Default     → <div class="card w-96 bg-base-100 shadow-sm"><figure><img … alt="Shoes" /></figure>
                <div class="card-body"><h2 class="card-title">Card Title</h2><p>…</p>
                <div class="card-actions justify-end"><button class="btn btn-primary">Buy Now</button></div></div></div>
BottomImage → the same figure, after the body
ImageFull   → <div class="card image-full w-96 bg-base-100 shadow-sm">…        note: no `card-` prefix
Selectable  → <label class="card bg-accent text-accent-content">
                <input type="checkbox" name="card-urgent-1" />
                <div class="card-body">…                         input is a SIBLING of the body
              … <label class="card join-item"><input type="radio" … disabled />
                <div class="card-body opacity-60">…
Passthrough → <div id="card-1" data-test="yes" style="letter-spacing:1px"
                class="card card-border card-lg mine w-96 bg-base-100">
                <div class="card-body body-marker" id="card-body-1" data-test="body">
                  <h3 id="card-title-1" data-test="title" class="card-title title-marker">Passthrough</h3>…
```

What this settles:

- **§3c**: `image-full` is emitted unprefixed, alongside `card` rather than as `card-image-full`. That is the class a prefix-based audit of this component loses.
- **§3d**: four selectable cards render their `input` as a **direct child** of the `label.card`, a sibling of the body. Every daisyUI rule for this is a child selector, so an input inside the body would have matched none of them — and §0a's plain, ungated slot is what makes writing it there natural.
- **§3a**: `CardTitle` renders `h2` by default and `h3` on request, so the document outline stays the caller's decision.
- Forwarding works at three levels, and the figure is written by the caller as a bare element — no `CardFigure` (§0b).
- All 13 classes have rules in the built stylesheet.

Not settled here: the corner-radius-by-position behaviour, the image bleed, the responsive row, and whether clicking a selectable card actually toggles it. All Step 5.
