# Button Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/button/
**Root element:** `button` by default, polymorphic via `as` (`a`, `input`, `div` also documented by daisyUI)
**Target file:** `packages/daisy-astro/src/components/Button/Button.astro` (replaces the current 2-prop scaffold example)
**Story file:** `packages/daisy-astro/src/components/Button/Button.stories.ts` (replaces the current example)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props forward every native HTML attribute for the rendered element.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare.
- Stories run on `@storybook-astro/framework`: import the `.astro` file as `component`, pass slot content via `args.slots`.
- One story file: `Playground`, one story per daisyUI doc-page example, plus any variant axis the examples miss.

> **Status:** the component in §4 is **implemented** and the baseline stories in §5 are **verified** through a static Storybook build (output in §8a). Remaining work is the rest of the doc-example stories — see §6.

---

## 1. Variant audit

Full class list from the daisyUI doc page's class table, read 2026-08-24. 25 classes: 1 base + 8 color + 5 style + 2 behavior + 5 size + 4 modifier. All 25 are covered by a prop below.

| Axis | daisyUI classes | Prop | Prop type | Notes |
|---|---|---|---|---|
| Base | `btn` | — | — | Always applied. |
| Color | `btn-neutral` `btn-primary` `btn-secondary` `btn-accent` `btn-info` `btn-success` `btn-warning` `btn-error` | `color` | `DaisyColor` | The 8 values match `DaisyColor` in `variants.ts` exactly — import it, don't redeclare. |
| Style | `btn-outline` `btn-dash` `btn-soft` `btn-ghost` `btn-link` | `variant` | `'outline' \| 'dash' \| 'soft' \| 'ghost' \| 'link'` | **Must not be named `style`** — see section 3. Component-specific union, stays local. |
| Behavior | `btn-active` | `active` | `boolean` | |
| Behavior | `btn-disabled` | `disabled` | `boolean` | Special handling — see section 3. |
| Size | `btn-xs` `btn-sm` `btn-md` `btn-lg` `btn-xl` | `size` | `DaisySize` | Matches `DaisySize` exactly. `md` is daisyUI's default but is still emittable explicitly. |
| Modifier | `btn-wide` `btn-block` | `width` | `'wide' \| 'block'` | Grouped as a union rather than two booleans — they're mutually exclusive widths, and a union makes the invalid combination unrepresentable. |
| Modifier | `btn-square` `btn-circle` | `shape` | `'square' \| 'circle'` | Same reasoning — mutually exclusive shapes. |

## 2. Slots

Single default slot, no gating needed — the root element is the button itself, so there is no optional wrapper that could render empty.

Icon-plus-label buttons are served by the caller passing both into the default slot (`<Button><Icon />Save</Button>`). No `icon`/`label` slots and no `label` prop: daisyUI imposes no structure inside `btn`, so named slots here would be invented structure, and a content prop would break the "content comes in through slots" rule in `plans/README.md` §5.

## 3. Two decisions that the naive implementation gets wrong

Both of these were found by prototyping, not by reading. They are the reason this component is worth a written plan.

### 3a. The style-axis prop cannot be called `style`

The obvious name for the `btn-outline`/`btn-ghost`/... axis is `style`. It is a trap: `style` is a native HTML attribute, so naming the prop `style` destructures the caller's inline style out of `...rest` and feeds it to the class list. Verified output of the naive version:

```
props: {"style":"color:red"}
render: <button class="btn btn-color:red"></button>
```

The inline style is silently lost and a junk class is emitted — a direct violation of the "all other HTML props forwarded" requirement. Named `variant`, both work:

```
props: {"style":"color:red","variant":"ghost"}
render: <button style="color:red" class="btn btn-ghost"></button>
```

**Rule for other components:** before naming any variant prop, check it against the native attributes of the root element. `size`, `width`, `type`, `value`, `title`, `color` are all real HTML attributes on some elements. (`size` is kept here despite existing natively on `<input>` — it's the natural name, it doesn't collide on the default `button` root, and native `size` is meaningless on `input type="submit"`. Noted so the tradeoff is deliberate rather than accidental.)

### 3b. `disabled` must pick native attribute vs `btn-disabled` class by element

daisyUI documents two different disabled forms, and which one is correct depends on the element:

```html
<button class="btn" disabled>Disabled using attribute</button>
<button class="btn btn-disabled" tabindex="-1" role="button" aria-disabled="true">Disabled using class name</button>
```

`<button>` and `<input>` support the native `disabled` attribute, which blocks interaction and is announced by screen readers for free. `<a>` and `<div>` do not — for those, `btn-disabled` is *only a visual style*, and without `tabindex="-1"` / `role="button"` / `aria-disabled="true"` the element stays keyboard-focusable and is announced as an ordinary enabled link. That is a real accessibility defect, not a cosmetic one, so the component branches on the element rather than exposing the choice as a second prop the caller has to get right.

Verified both paths:

```
props: {"disabled":true}
render: <button disabled class="btn"></button>

props: {"as":"a","href":"/x","disabled":true}
render: <a tabindex="-1" role="button" aria-disabled="true" href="/x" class="btn btn-disabled"></a>
```

## 4. Component implementation

Three things here are load-bearing and each was found by a failing experiment, not by reading docs:

1. **`type Props` is declared before any `const`.** With a `const` above it, Astro stops inferring `Props` entirely — the component accepts no props and every call site fails with "not assignable to `IntrinsicAttributes`", while props inside the body degrade to `any`. Silent: it still renders. (`plans/README.md` §5c)
2. **`Astro.props as Props<HTMLTag>`** — inside a generic component `Astro.props` is otherwise untyped.
3. **Variant classes come from literal maps, never `` `btn-${color}` ``** — an interpolated class name gets no CSS from daisyUI. (§1b)

Uses `Polymorphic` from `astro/types` so `as` changes the rendered tag *and* the accepted attribute set.

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisyColor, DaisySize } from '../../lib/variants';

type ButtonVariant = 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
type ButtonShape = 'square' | 'circle';
type ButtonWidth = 'wide' | 'block';

// `Props` MUST be declared before any `const` in this frontmatter, or Astro
// stops inferring it and the component silently accepts no props at all.
type Props<Tag extends HTMLTag> = Polymorphic<{
  as: Tag;
  color?: DaisyColor;
  size?: DaisySize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  width?: ButtonWidth;
  active?: boolean;
  disabled?: boolean;
}>;

// Full class names written out as literals — never `btn-${color}`. Tailwind
// scans source text for candidates, so an interpolated class name is invisible
// to it and daisyUI emits no CSS for it.
const COLOR: Record<DaisyColor, string> = {
  neutral: 'btn-neutral',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  info: 'btn-info',
  success: 'btn-success',
  warning: 'btn-warning',
  error: 'btn-error',
};

const SIZE: Record<DaisySize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

const VARIANT: Record<ButtonVariant, string> = {
  outline: 'btn-outline',
  dash: 'btn-dash',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  link: 'btn-link',
};

const SHAPE: Record<ButtonShape, string> = {
  square: 'btn-square',
  circle: 'btn-circle',
};

const WIDTH: Record<ButtonWidth, string> = {
  wide: 'btn-wide',
  block: 'btn-block',
};

const {
  as: Tag = 'button',
  color,
  size,
  variant,
  shape,
  width,
  active,
  disabled,
  class: className,
  ...rest
} = Astro.props as Props<HTMLTag>;

// button/input support the native disabled attribute; a/div need the
// btn-disabled class plus explicit a11y attributes to be genuinely disabled.
const isNativeDisableable = Tag === 'button' || Tag === 'input';
const a11y =
  disabled && !isNativeDisableable
    ? ({ tabindex: '-1', role: 'button', 'aria-disabled': 'true' } as const)
    : ({} as const);
---

<Tag
  class:list={[
    'btn',
    color && COLOR[color],
    size && SIZE[size],
    variant && VARIANT[variant],
    shape && SHAPE[shape],
    width && WIDTH[width],
    { 'btn-active': active, 'btn-disabled': disabled && !isNativeDisableable },
    className,
  ]}
  disabled={isNativeDisableable && disabled ? true : undefined}
  {...a11y}
  {...rest}
>
  <slot />
</Tag>
```

Typing verified with a throwaway probe (`astro check`): `color="primary"`, `as="a" href="/ok"`, and arbitrary passthrough attributes all pass; `color="banana"` and a bare `href` without `as="a"` both error.

### Two things deliberately *not* done

**No responsive size API.** daisyUI's "Responsive button" example is `class="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"` — five breakpoint-prefixed size classes at once. A single `size` union cannot express that, and widening the prop into an object (`size={{ base: 'xs', md: 'lg' }}`) would be a bespoke mini-API reimplementing Tailwind's prefixes. The `class` passthrough already covers it, verified working:

```astro
<Button size="xs" class="sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Responsive</Button>
```

**No automatic `role="button"` on `as="a"`,** even though daisyUI's own "any HTML tags" example writes `<a role="button" class="btn">Link</a>`. That example's anchor has no `href` — it's a demo stub. Adding `role="button"` to a real navigating link would *worsen* accessibility: a screen reader would announce "button" while the element behaves as a link (Enter navigates, no Space activation, opens in new tab via modifier keys). Callers who genuinely want a button-behaving anchor can pass `role="button"` themselves; it forwards through `...rest`.

This is the one place where copying the doc example verbatim into the component would be wrong. The *story* still reproduces the example markup (see §5) — the difference is that the story is a demo and the component is a real API.

## 5. Storybook stories

Uses `@storybook-astro/framework` (`plans/README.md` §4) — the `.astro` file is imported directly as `component`, slot content rides in `args.slots`.

Stories reproduce the daisyUI doc page's examples (`plans/README.md` §8). The page has 18 example sections; the mapping below covers all of them, collapsing the ones that differ only by which style class is applied.

| # | Doc-page example | Story | Notes |
|---|---|---|---|
| 1 | Button | `Default` | Bare `btn`. |
| 2 | Button sizes | `Sizes` | All 5 sizes. |
| 3 | Responsive button | `Responsive` | Uses `class` passthrough, not a prop — see §4. |
| 4 | Buttons colors | `Colors` | All 8 colors. |
| 5 | Soft buttons | `Soft` | `variant="soft"` × default + 8 colors. |
| 6 | Outline buttons | `Outline` | `variant="outline"` × default + 8 colors. |
| 7 | Dash buttons | `Dash` | `variant="dash"` × default + 8 colors. |
| 8 | Neutral button with outline or dash style | *(folded into `Outline` / `Dash`)* | The page's note is a background-contrast caveat, not distinct markup. Repeat it as a story description rather than a separate story. |
| 9 | Active buttons | `Active` | `active` × default + 8 colors. |
| 10 | Buttons ghost and button link | `GhostAndLink` | |
| 11 | Wide button | `Wide` | |
| 12 | Buttons with any HTML tags | `AnyHtmlTag` | Exercises polymorphic `as` — `a`, `button`, and `input` of type button/submit/radio/checkbox/reset. |
| 13 | Disabled buttons | `Disabled` | Both forms; see §3b. |
| 14 | Square button and circle button | `Shapes` | |
| 15 | Button with Icon | `WithIcon` | Icon markup goes in the default slot. |
| 16 | Button block | `Block` | |
| 17 | Button with loading spinner | `WithLoadingSpinner` | `<span class="loading loading-spinner">` in the slot. Once the Loading component exists, compose it rather than hardcoding the class. |
| 18 | Login buttons | `LoginButtons` | See the note below before writing this one. |

**On example 18 (`LoginButtons`).** The page shows 18+ provider buttons, each with an inline brand SVG and hardcoded brand colors. Reproducing it means pasting ~18 SVG blobs into the story file for content that exercises no Button prop the other stories miss — it is a composition showcase, not variant coverage. Recommendation: implement it with **three** representative providers (GitHub, Google, Apple) and a comment pointing at the doc page for the rest. Decide before writing; don't half-do it.

**Two framework details that bite here.**

*Slot sanitization.* Slot HTML is sanitized by default, and several of these stories (`Shapes`, `WithIcon`, `LoginButtons`, `WithLoadingSpinner`) put SVG or `<span>` markup in the default slot. If icons come out missing, that is sanitization, not a component bug — widen the allowlist per the framework's Sanitization guide.

*Rendering one story with many variants.* The doc examples are mostly "all 8 colors in a row". The single-`component` story shape renders one instance per story, so a sweep needs either a decorator or a small wrapper. Check the framework's docs for the recommended composition before hand-rolling DOM helpers — the previous plan's `row()`/`renderInto()` helpers existed only because the old bridge had no `component` support, and should not be resurrected.

### Baseline story file

Start from this — the four stories below are **verified working** (prerendered output recorded in §8), then add the remaining doc examples from the table.

```ts
import Button from './Button.astro';

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    as: { control: 'select', options: ['button', 'a', 'div'] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft', 'ghost', 'link'] },
    shape: { control: 'select', options: [undefined, 'square', 'circle'] },
    width: { control: 'select', options: [undefined, 'wide', 'block'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};


// 1. Button
export const Default = {
  args: { slots: { default: 'Click me' } },
};

export const Variants = {
  args: {
    color: 'primary',
    size: 'lg',
    variant: 'outline',
    slots: { default: 'Primary large outline' },
  },
};

// 13. Disabled buttons — the <a> branch from §3b.
export const DisabledLink = {
  args: {
    as: 'a',
    href: '#',
    disabled: true,
    slots: { default: 'Disabled link' },
  },
};

// Regression guard for §3a and the class-merge rule.
export const Passthrough = {
  args: {
    id: 'go',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};

// 3. Responsive button — breakpoint prefixes ride the class passthrough, not a prop.
export const Responsive = {
  args: {
    size: 'xs',
    class: 'sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl',
    slots: { default: 'Responsive' },
  },
};
```

## 6. Steps

- [x] **Step 1: done — Storybook runs on `@storybook-astro/framework`.** The hand-rolled Container-API bridge was removed (`.storybook/astro-story.ts` deleted, `.storybook/main.ts` reduced to framework config). Stories now import the `.astro` file directly and pass `args.slots`.

- [x] **Step 2: done — `Button.astro` implemented** per section 4.

- [x] **Step 3: done — baseline stories written** (`Default`, `Variants`, `DisabledLink`, `Passthrough`) and verified through a static build; recorded output in §8.

- [ ] **Step 4:** Settle the `LoginButtons` scope question from section 5 (3 providers vs all 18) before writing the remaining stories, so it doesn't get half-built.

- [ ] **Step 5:** Add the remaining doc-example stories from the §5 table: `Sizes`, `Colors`, `Soft`, `Outline`, `Dash`, `Active`, `GhostAndLink`, `Wide`, `AnyHtmlTag`, `Disabled` (attribute form alongside the existing link form), `Shapes`, `WithIcon`, `Block`, `WithLoadingSpinner`, `LoginButtons`, plus `Playground`.

- [ ] **Step 6:** Run `pnpm storybook` and compare each story side by side with its section on https://daisyui.com/components/button/.
  - **Blocker to expect:** daisyUI's CSS is not loaded in Storybook yet, so buttons render with correct classes but no styling. Wiring Tailwind + daisyUI into `.storybook/preview.ts` is shared by all 68 components and belongs in its own plan. Until it lands, verify at the markup level (Step 7).
  - Watch for stripped SVG in `Shapes` / `WithIcon` / `LoginButtons` — that is slot sanitization, not a component bug (§5).

- [ ] **Step 7:** Verify markup headlessly:

```bash
pnpm build-storybook
grep -rhoE '<(button|a|input)[^>]*btn[^>]*>' storybook-static/astro-prerendered-stories.json
```

Compare against §8. Every doc-example story should appear with the classes its daisyUI counterpart uses.

- [ ] **Step 8:** Update the Button row in `plans/README.md` to **Implemented**.

- [ ] **Step 9:** Commit.

## 7. Acceptance checklist

- [ ] All 25 daisyUI button classes reachable via props (8 color, 5 style, 2 behavior, 5 size, 4 modifier, 1 base).
- [ ] Native attributes forward: `id`, `data-*`, `aria-*`, `style`, `type`, `href` (with `as="a"`) all land on the element.
- [ ] Caller `class` merges with generated classes instead of replacing or being dropped.
- [ ] `style` attribute survives — no `btn-color:red`-style junk class (regression test for 3a).
- [ ] `disabled` emits the native attribute on `button`/`input`, and `btn-disabled` + `tabindex="-1"` + `role="button"` + `aria-disabled="true"` on `a`/`div` (regression test for 3b).
- [ ] `as="a"` type-checks `href`; `as="button"` rejects it.
- [ ] Content enters via the default slot; no `label` content prop was added.
- [ ] A story exists for every one of the 18 daisyUI doc-page examples (per the §5 mapping, with 8 folded into `Outline`/`Dash`), each matching the page's markup.
- [ ] `Responsive` works through `class` passthrough — no responsive size prop was invented.
- [ ] `as="a"` does **not** silently gain `role="button"` (see §4); the `AnyHtmlTag` story passes it explicitly, mirroring the doc example.

## 8. Recorded output

### 8a. Through `@storybook-astro/framework` (2026-08-24)

`Button.astro` from §4 with the baseline stories from §5, extracted from `storybook-static/astro-prerendered-stories.json` after `pnpm build-storybook`:

```
Default      → <button class="btn">Click me</button>
Variants     → <button class="btn btn-primary btn-lg btn-outline">Primary large outline</button>
Passthrough  → <button id="go" data-test="yes" style="letter-spacing:2px" class="btn mine">Passthrough</button>
DisabledLink → <a tabindex="-1" role="button" aria-disabled="true" href="#" class="btn btn-disabled">Disabled link</a>
```

Confirms end to end: slot content renders, variant classes compose, caller `class` merges (`btn mine`), native `style` survives (§3a), and the `<a>` disabled a11y branch fires (§3b).

### 8b. Earlier prototype, via the since-removed bridge (2026-08-24)

Kept because it covers prop combinations the baseline stories don't yet, including the `as="input"` path:

```
{}                                                  → <button class="btn"></button>
{"color":"primary","size":"lg","variant":"outline"} → <button class="btn btn-primary btn-lg btn-outline"></button>
{"shape":"circle","width":"block","active":true}    → <button class="btn btn-circle btn-block btn-active"></button>
{"disabled":true}                                   → <button disabled class="btn"></button>
{"as":"a","href":"/x","disabled":true}              → <a tabindex="-1" role="button" aria-disabled="true" href="/x" class="btn btn-disabled"></a>
{"id":"go","data-test":"yes","aria-label":"Go","class":"mine"}
                                                    → <button id="go" data-test="yes" aria-label="Go" class="btn mine"></button>
{"style":"color:red","variant":"ghost"}             → <button style="color:red" class="btn btn-ghost"></button>
{"as":"input","type":"submit","size":"lg","value":"Go"}
                                                    → <input type="submit" value="Go" class="btn btn-lg"/>
```
