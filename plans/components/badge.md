# Badge Component Plan

**daisyUI category:** Data Display
**daisyUI doc page:** https://daisyui.com/components/badge/
**Root element:** `span` by default, polymorphic via `as` (`div` also used throughout the doc page) — see §3a
**Target file:** `packages/daisy-astro/src/components/Badge/Badge.astro` (currently a dummy scaffold — no props, no variants)
**Story file:** `packages/daisy-astro/src/components/Badge/Badge.stories.ts` (currently a dummy `Default` story)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props forward every native HTML attribute for the rendered element.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Variant classes are full literals in a `Record` map — never interpolated (§1b).
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare. **Badge uses both `DaisyColor` and `DaisySize`, unchanged** (see §1).
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- `astro check` is the type gate, not `tsc` (§5b).

> **Status:** **Implemented** (2026-08-30). `Badge.astro` and 16 stories are in the repo per §4/§5; markup, type probe and CSS coverage verified (§8). §3b's *mechanism* was corrected against the built stylesheet; its conclusion stands. Step 5 (visual pass) is open, and with it §3d's uncoloured-outline question. Facts marked **[verified]** were checked on 2026-08-29 against the shipped CSS of `daisyui@5.7.22` (`node_modules/daisyui/components/badge.css`) and the doc page source (`packages/docs/src/routes/(routes)/components/badge/+page.md` in `saadeghi/daisyui`). §3e lists what is **unverified**.

---

## 0. This is Button's shape, minus the behaviour

Badge has the same three axes as Button — colour, style, size — with the same shared unions and the same `style`-is-a-native-attribute trap. **`plans/components/button.md` is the reference for all of that; this plan does not restate it.** Read §3a and §4 of that file before implementing.

What is genuinely different, and what this plan is actually about:

- the root element defaults to `span`, not `div`, and that matters (§3a);
- `ghost` is in the style axis but does not compose with colour, unlike the other three (§3b);
- an empty badge is a documented, supported use (§3c);
- `outline`/`dash` with no colour is underspecified in the CSS (§3d).

## 1. Variant audit

Every class in `badge.css`, cross-checked against the doc page's `classnames` frontmatter. **18 classes: 1 base + 8 colour + 4 style + 5 size.** `grep -oE '\.badge[a-z0-9-]*' badge.css | sort -u` returns exactly those 18 **[verified]**. All are covered below. (`sm:`/`md:`/`lg:`/`xl:`/`2xl:` prefixed copies also ship **[verified]** — caller-side responsive classes, not props; same reasoning as `plans/components/alert.md` §3c.)

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `badge` | — | — | Always applied. |
| Colour | `badge-neutral` `badge-primary` `badge-secondary` `badge-accent` `badge-info` `badge-success` `badge-warning` `badge-error` | `color` | `DaisyColor` | The 8 values match `DaisyColor` exactly — import it. Each sets `--badge-color` and `--badge-fg` **[verified]**. |
| Style | `badge-outline` `badge-dash` `badge-soft` `badge-ghost` | `variant` | `'outline' \| 'dash' \| 'soft' \| 'ghost'` | **Must not be named `style`** (`plans/components/button.md` §3a). Mutually exclusive → union. `ghost` behaves differently from the other three — §3b. |
| Size | `badge-xs` `badge-sm` `badge-md` `badge-lg` `badge-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly — import it. Each sets `--size` and `font-size` **[verified]**; `md` is the default and is still emittable explicitly. |

Note for the running tally across plans: Badge's colour set matches `DaisyColor` **exactly**, where Alert's was a strict subset (`plans/components/alert.md` §3a). Neither is the norm — check each component's own CSS.

## 2. Slots

Single default slot, no wrapper element, no gating.

| Slot | Wrapper element | Optional? | Source in daisyUI example |
|---|---|---|---|
| `default` | none — the badge is the root | **yes** — an empty badge is documented (§3c) | `Badge`, `+99`, or an `<svg class="size-[1em]">` plus a word |

No `icon` prop and no `label` prop: `.badge` is `display:inline-flex` with `gap:.5rem` **[verified]** and imposes no inner classes, so an icon badge is just two things in the default slot — the same reasoning as `plans/components/button.md` §2.

**No fallback content.** `<slot />` stays bare: `<slot>Badge</slot>` would make the documented empty-badge case impossible to express (§3c).

## 3. Five things the naive implementation gets wrong

### 3a. The default root must be `span`, not `div`

The doc page uses both: `<span class="badge">` for the first example and for "Badge in a text", `<div class="badge">` for the size/colour tables and for "Badge in a button". `.badge` is `display:inline-flex` **[verified]**, so either renders identically.

They are not interchangeable in one case that the doc page explicitly demonstrates. The "Badge in a text" example puts a badge inside `<h1>`…`<h5>` and `<p>`. `<div>` is not permitted inside `<p>`: the HTML parser closes the paragraph before the div, which splits the paragraph into two and drops the badge out of the text flow. `<span>` is phrasing content and nests correctly everywhere the doc page uses a badge, including inside `<button>`.

So: **default `as="span"`**, with `Polymorphic<{ as: Tag }>` exposing `div`/`a`/anything else, per `plans/README.md` §6. The existing scaffold already picked `span` — keep it, and keep it deliberately rather than by accident.

This makes Badge a generic component, which drags in two rules from `plans/README.md` §5c that are silent when broken: `type Props` must precede every `const` in the frontmatter, and the destructure needs `as Props<HTMLTag>`. `plans/components/button.md` §4 has the worked version — copy its shape.

### 3b. `ghost` ignores `color`, the other three styles don't

The style classes split into two mechanisms **[verified]**:

```css
.badge-outline { color: var(--badge-color); --badge-bg:#0000; border-color: currentColor }
.badge-dash    { color: var(--badge-color); --badge-bg:#0000; border-style: dashed; border-color: currentColor }
.badge-soft    { color: var(--badge-color, var(--color-base-content)); background-color: color-mix(… var(--badge-color) 8% …) }
.badge-ghost   { border-color: var(--color-base-200); background-color: var(--color-base-200); color: var(--color-base-content) }
```

`outline`, `dash` and `soft` read `--badge-color`, so they compose with the colour prop — which is exactly what the doc page's soft/outline/dash tables show, seven colours each. `ghost` sets literal base colours and never touches `--badge-color`, so **`<Badge variant="ghost" color="primary">` renders identically to `<Badge variant="ghost">`** and the colour is silently dropped.

**Why it is dropped — corrected 2026-08-30, verified in the built stylesheet.** This plan previously said ghost wins on *source order*, being declared after the colour classes. That reasoning is wrong, and in the actual build the order is the other way round (`.badge-ghost` at byte 26845, `.badge-primary` at 34939). Order is irrelevant here because the two rules never compete for a declaration:

```css
.badge         { background-color: var(--badge-bg); --badge-bg: var(--badge-color, var(--color-base-100)); color: var(--badge-fg) }
.badge-primary { --badge-color: var(--color-primary); --badge-fg: var(--color-primary-content) }   /* variables only */
.badge-ghost   { background-color: var(--color-base-200); color: var(--color-base-content); border-color: var(--color-base-200) }
```

A colour class sets **only two custom properties**; it never declares `background-color` or `color` itself. `.badge-ghost` declares both **literally**, so it overrides the base rule's `var()`-driven values no matter where either sits, and the `--badge-color` the colour class set goes unread. The consequence is the same, but the mechanism matters: it means no reordering, no `@layer` change and no class-order trick can make ghost honour a colour — which is worth knowing before someone tries.

Not modelled in the type system — making `ghost` exclude `color` would need a discriminated union that complicates every ordinary call for one combination. Instead it goes in `variant`'s JSDoc and gets a story, the same treatment as `plans/components/aura.md` §3a's fixed-palette variants.

### 3c. The empty badge is a feature, not an edge case

"Empty badge" is its own doc-page example: `<div class="badge badge-primary badge-lg"></div>` at four sizes — a coloured dot used as a status marker. `.badge` is `width:fit-content` with `padding-inline: calc(var(--size)/2 - var(--border))` **[verified]**, so with no content it collapses to a small pill rather than to nothing.

Consequences for the implementation:

- no fallback slot content (§2);
- no `Astro.slots.has()` gating and no "empty" guard — rendering an empty badge is correct behaviour, not a mistake to defend against;
- the accessibility caveat is the caller's: a bare coloured dot conveys nothing to a screen reader. Same call as `plans/components/avatar.md` §3c — document it on the component, show `aria-label` in the story, don't inject anything.

### 3d. `outline` and `dash` with no colour are underspecified

`.badge-outline` and `.badge-dash` set `color: var(--badge-color)` with **no fallback** **[verified]** — unlike `.badge-soft`, which falls back to `var(--color-base-content)`. With no colour prop, `--badge-color` is unset, so per the CSS custom-property rules that declaration is invalid at computed-value time and `color` falls back to its inherited value; `border-color: currentColor` then follows it.

Practically that should mean an uncoloured outline badge takes the surrounding text colour — usable, but not something daisyUI ever demonstrates: every outline and dash example on the page pairs the style with a colour. Confirm the actual rendering in Step 5 rather than trusting the reasoning, and if it comes out invisible or wrong, say so in `variant`'s JSDoc. Do not "fix" it by defaulting `color` when `variant` is `outline`/`dash` — that invents behaviour daisyUI doesn't have.

Related, and straight from the doc page: the "neutral badge with outline or dash style" example carries the warning *"These badges use dark text, only use them on light backgrounds"*. Reproduce that example **with its light-background wrapper and the warning as a story comment** — it is a real usage constraint, and a `badge-neutral badge-outline` dropped on a dark theme is invisible.

### 3e. Unverified assumptions

1. ~~**Slot sanitization vs inline `<svg>`.**~~ **Answered: SVG survives**, verified in `WithIcon`'s rendered HTML rather than by eye. Sanitization is off library-wide (`plans/IMPLEMENTATION-ORDER.md` §2, Tier 0.3); the framework's default allowlist had no `svg` at all.
2. ~~**Generic prop inference.**~~ **Checked with the §4 probe:** props are genuinely accepted and narrowed — `color="banana"`, `variant="link"` and a bare `href` each errored, the four valid lines did not. The `type Props`-before-`const` failure is not present.

## 4. Component implementation

Follows `plans/components/button.md` §4 exactly, minus the behaviour axes and the `disabled` branching (a badge is not interactive, so §3b of that plan does not apply here).

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

type BadgeVariant = 'outline' | 'dash' | 'soft' | 'ghost';

// `Props` MUST be declared before any `const` in this frontmatter, or Astro
// stops inferring it and the component silently accepts no props at all
// (plans/README.md §5c).
// The `= 'span'` default is load-bearing — without it `<Badge title="t">`
// fails to type-check whenever `as` is omitted (plans/README.md §5c,
// added 2026-08-30).
type Props<Tag extends HTMLTag = 'span'> = Polymorphic<{
  /** Defaults to `span` — a `div` badge is invalid inside `<p>` (plan §3a). */
  as: Tag;
  color?: DaisyColor;
  /**
   * Named `variant`, never `style` — `style` is a native attribute
   * (plans/components/button.md §3a).
   *
   * `outline`, `dash` and `soft` combine with `color`. **`ghost` does not** —
   * it sets its own base colours and silently ignores `color` (plan §3b).
   */
  variant?: BadgeVariant;
  size?: DaisySize;
}>;

// Full literal class names. NEVER `badge-${color}` — an interpolated class
// gets no CSS from daisyUI (plans/README.md §1b).
const COLOR: Record<DaisyColor, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  neutral: 'badge-neutral',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

const VARIANT: Record<BadgeVariant, string> = {
  outline: 'badge-outline',
  dash: 'badge-dash',
  soft: 'badge-soft',
  ghost: 'badge-ghost',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'badge-xs',
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
  xl: 'badge-xl',
};

// `Astro.props` is untyped inside a generic component (plans/README.md §5c).
const { as: Tag = 'span', color, variant, size, class: className, ...rest } = Astro.props as Props<HTMLTag>;
---

<Tag
  class:list={['badge', color && COLOR[color], variant && VARIANT[variant], size && SIZE[size], className]}
  {...rest}
>
  <slot />
</Tag>
```

`<slot />` stays bare — no fallback content, so the documented empty badge stays expressible (§3c).

No `<script>`: pure CSS, non-interactive.

### Astro idioms gate

- [ ] Content arrives via the default slot — no `icon`/`label` props (§2).
- [ ] `<slot />` has no fallback content (§3c).
- [ ] No `Astro.slots.has()` gating — an empty badge is valid (§3c).
- [ ] Default root is `span`, and `as` is `Polymorphic<{ as: Tag }>` rather than a hand-rolled generic (§3a).
- [ ] No `<script>` added.
- [ ] `...rest` spread onto the root element.
- [ ] No variant prop collides with a native attribute: the style axis is named `variant` not `style`; `size` is absent from base `HTMLAttributes`; `color` shadows only the obsolete non-standard `color` attribute (`astro-jsx.d.ts:602`) **[verified]**, the same tradeoff Button already accepted.
- [ ] Every variant class is a full literal in a `Record` map — no `` `badge-${color}` `` anywhere.
- [ ] **`type Props` is declared before any `const`**, and the destructure is annotated `as Props<HTMLTag>` (§5c, §3e.2).
- [ ] Prop typing verified with a throwaway probe using the component correctly *and* incorrectly (§5c) — mandatory here, since the generic failure is silent:
  ```astro
  <Badge>ok</Badge>
  <Badge color="primary" variant="soft" size="lg">ok</Badge>
  <Badge as="div" id="x" data-test="y">ok</Badge>
  <Badge as="a" href="/ok">ok</Badge>
  <Badge color="banana">must error — not a DaisyColor</Badge>
  <Badge variant="link">must error — not a badge style</Badge>
  <Badge href="/nope">must error — href needs as="a"</Badge>
  ```
- [ ] `astro check` passes.

## 5. Storybook stories

One file. Doc-page examples in page order (`plans/README.md` §8):

| Doc-page example | Story | Props / slots |
|---|---|---|
| Badge | `Default` | no props, `Badge` |
| Badge sizes | `Sizes` | five badges, `xs`…`xl`, labels `Xsmall`…`Xlarge` |
| Badge with colors | `Colors` | eight badges, one per `DaisyColor`, labelled |
| Badge with soft style | `SoftStyle` | `variant: 'soft'` × seven colours (the page omits `neutral` here) |
| Badge with outline style | `OutlineStyle` | `variant: 'outline'` × the same seven |
| Badge with dash style | `DashStyle` | `variant: 'dash'` × the same seven |
| neutral badge with outline or dash | `NeutralOutlineAndDash` | `color: 'neutral'` with `outline` and `dash`, **inside the page's `bg-white p-6` wrapper**, and the page's dark-text warning as a comment (§3d) |
| Badge ghost | `Ghost` | `variant: 'ghost'`, `ghost` |
| Empty badge | `Empty` | four badges, `color: 'primary'`, `lg`/`md`/`sm`/`xs`, **no slot content** (§3c) |
| Badge with icon | `WithIcon` | four badges, `info`/`success`/`warning`/`error`, each an inline `<svg class="size-[1em]">` plus a word — markup copied from the page |
| Badge in a text | `InText` | badges inside `<h1>`…`<h5>` and `<p>`, sizes matched to the heading level |
| Badge in a button | `InButton` | two `<button class="btn">Inbox <Badge size="sm" …>+99</Badge></button>` |

Plus `Playground` and `Passthrough` (Step 6). The colour, style and size axes are each fully covered by a doc example, so no extra axis stories are needed.

Two stories beyond the doc page, each pinning a §3 hazard:

- **`GhostIgnoresColor`** — `variant="ghost"` with and without `color="primary"`, side by side, identical on purpose (§3b).
- **`EmptyAccessibleName`** — an empty badge bare, and one with `aria-label="3 unread"` (§3c).

`InText` and `InButton` need the badge nested inside other markup, which the `slots` mechanism cannot express from the badge's own args. Compose them the way the framework's docs recommend (a decorator, or a wrapping story whose default slot contains the surrounding markup) — check that before inventing a helper. `InText` is also the story that demonstrates why the root is a `span` (§3a): if a `div` badge sneaks into the `<p>` case, the paragraph visibly splits.

```ts
import Badge from './Badge.astro';

export default {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    as: { control: 'text' },
    color: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
    },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft', 'ghost'] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export const Playground = {
  args: { color: 'primary', slots: { default: 'Badge' } },
};

export const Default = {
  args: { slots: { default: 'Badge' } },
};

// Documented use, not an edge case (§3c) — no slot content at all.
export const Empty = {
  args: { color: 'primary', size: 'lg' },
};

// Regression guard: native attributes survive, caller `class` merges,
// and `as` changes the tag.
export const Passthrough = {
  args: {
    as: 'div',
    id: 'badge-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};
```

The axis stories render many badges at once; compose multiples the way the framework's docs recommend before inventing a helper.

## 6. Steps

- [x] **Step 1: done.** §1 and §2 were already filled from the doc page and the shipped CSS. §3e.1 (SVG survival) is answered — see §3e.
- [x] **Step 2: skipped as planned.** `color` and `size` reuse `DaisyColor`/`DaisySize` unchanged, `BadgeVariant` stays local. `variants.ts` untouched.
- [x] **Step 3: done.** `Badge.astro` replaces the dummy scaffold per §4; the Astro idioms gate is ticked there and the probe ran (§3e.2). One deviation from §4's listing: §3c's note about the bare `<slot />` lives in the frontmatter, because an HTML comment in the template ships into every rendered badge (found while building Avatar).
- [x] **Step 4: done.** `Badge.stories.ts`, 16 stories per §5. `InButton` composes the **real `<Button>`** rather than raw `btn` markup — Button is Implemented, so §5.2's fallback does not apply.
- [ ] **Step 5:** `pnpm storybook` from `packages/daisy-astro/`, open `Components/Badge`. **Still open — needs human eyes.** Checks unchanged, and two of them are the point:
  - `GhostIgnoresColor`: the two badges must be **identical** (§3b). If the coloured one differs, re-read §3b's corrected mechanism before touching the component.
  - **An `outline` badge with no `color`** — add it temporarily to `Playground` — and record what it actually does (§3d). The CSS says it inherits the surrounding text colour; nothing here has confirmed that.
  - `Sizes` shows five distinct heights *and* font sizes; `Colors` shows eight readable fills; `Empty` renders four visible pills; `NeutralOutlineAndDash` is legible on its white wrapper and noted for the theme background; `InText` keeps the badge inline without splitting the paragraph.
- [x] **Step 6: done — forwarding confirmed.** `Passthrough` renders `<div id="badge-1" data-test="yes" style="letter-spacing:2px" class="badge mine">Passthrough</div>`: `as` changed the tag, native attributes survived, caller `class` merged. Full output in §8.
- [x] **Step 7: done — the `Badge` row in `plans/README.md` says Implemented.**
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [x] All 18 daisyUI classes from §1 are reachable: `badge` always, 8 colours via `color`, 4 styles via `variant`, 5 sizes via `size`.
- [x] `color` uses `DaisyColor` and `size` uses `DaisySize`, both imported, neither redeclared.
- [x] Default root is `span`; `as` renders other tags and narrows the accepted attributes with it (`href` needs `as="a"`).
- [x] `type Props` precedes every `const`, destructure annotated `as Props<HTMLTag>`, and the probe confirms props are actually accepted (§3e.2).
- [x] `class` from a caller merges through `class:list`.
- [x] An empty badge renders (§3c) — no fallback slot content, no emptiness guard.
- [x] `variant`'s JSDoc states that `ghost` ignores `color` (§3b), and `GhostIgnoresColor` demonstrates it.
- [ ] §3d's uncoloured-outline behaviour observed and recorded in the JSDoc. **Open:** the JSDoc states what the CSS implies (inherits the surrounding text colour) and says daisyUI never demonstrates it; the observation itself needs the visual pass.
- [x] `Playground` exposes every prop as a control.
- [x] One story per doc-page example, reproducing that example's markup, copy and — for the neutral outline/dash case — its light-background wrapper and warning.
- [x] Every box in §4's Astro idioms gate ticked.

## 8a. Amendment, 2026-08-30 — default type parameter

Same fix as `plans/components/button.md` §8d: `type Props<Tag extends HTMLTag = 'span'>`. Without the default, omitting `as` left `Tag` unresolved and native `span` attributes were rejected. See `plans/README.md` §5c.

## 8. Recorded output

From `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook` (2026-08-30). `astro check`: 144 files, 0 errors. Sweeps abridged.

```
Default        → <span class="badge">Badge</span>
Sizes          → …<span class="badge badge-xs">Xsmall</span>…<span class="badge badge-xl">Xlarge</span>
Colors         → …<span class="badge badge-primary">Primary</span>… ×8
SoftStyle      → …<span class="badge badge-primary badge-soft">Primary</span>… ×7 (no neutral, as the page has it)
OutlineStyle   → …<span class="badge badge-primary badge-outline">Primary</span>… ×7
DashStyle      → …<span class="badge badge-primary badge-dash">Primary</span>… ×7
Neutral…Dash   → <div class="bg-white p-6 …"><span class="badge badge-neutral badge-outline">Outline</span><span class="badge badge-neutral badge-dash">Dash</span></div>
Ghost          → <span class="badge badge-ghost">ghost</span>
GhostIgnores…  → <span class="badge badge-ghost">ghost</span><span class="badge badge-primary badge-ghost">ghost + color="primary"</span>
Empty          → <span class="badge badge-primary badge-lg"></span> ×4 sizes, no content
Empty…Name     → <span class="badge badge-primary badge-lg"></span><span aria-label="3 unread" class="badge badge-primary badge-lg"></span>
WithIcon       → <span class="badge badge-info"><svg class="size-[1em]" …>…</svg>Info</span> ×4
InText         → <h1 class="text-xl font-semibold">Heading 1 <span class="badge badge-xl">Badge</span></h1> …
                 <p class="text-xs">Paragraph <span class="badge badge-xs">Badge</span></p>
InButton       → <button class="btn">Inbox <div class="badge badge-sm">+99</div></button> ×2
Passthrough    → <div id="badge-1" data-test="yes" style="letter-spacing:2px" class="badge mine">Passthrough</div>
```

What this settles:

- The `span` default holds all the way into `<p>`: `InText`'s paragraph keeps the badge inline, which is the whole reason for §3a.
- An empty badge really does render as an element with no content — no fallback text crept in (§3c).
- Inline SVG reaches the DOM (§3e.1), so the icon example is a real icon example.
- Class order in the markup differs harmlessly from the doc page (`badge badge-primary badge-soft` vs `badge badge-soft badge-primary`) — the class list is built axis by axis, and CSS resolves by stylesheet order, not attribute order.
- Every class the stories emit has a rule in the built stylesheet.

Not settled here: everything visual — §3b's "identical" claim, §3d's uncoloured outline, and legibility of the neutral pair. All are Step 5.
