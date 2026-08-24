# Button Component Plan

**daisyUI category:** Actions
**daisyUI doc page:** https://daisyui.com/components/button/
**Root element:** `button` by default, polymorphic via `as` (`a`, `input`, `div` also documented by daisyUI)
**Target file:** `packages/daisy-astro/src/components/Button.astro` (replaces the current 2-prop scaffold example)
**Story file:** `packages/daisy-astro/src/components/Button.stories.ts` (replaces the current example)

**Global Constraints** (from `plans/README.md`, apply as-is):
- Props forward every native HTML attribute for the rendered element.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Shared variant unions come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare.
- One story file, `Playground` + one story per variant axis.

> **Status:** the code in sections 4 and 5 was prototyped and verified against the live render endpoint before this plan was written (see section 8 for the recorded output). It is not speculative — it renders correctly today.

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

Uses `Polymorphic` from `astro/types` (built in, no new dependency) so `as` changes the rendered tag *and* the accepted attribute set — `href` type-checks when `as="a"`, not when `as="button"`.

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';
import type { DaisyColor, DaisySize } from '../lib/variants';

type Props<Tag extends HTMLTag = 'button'> = Polymorphic<{
  as?: Tag;
  color?: DaisyColor;
  size?: DaisySize;
  variant?: 'outline' | 'dash' | 'soft' | 'ghost' | 'link';
  shape?: 'square' | 'circle';
  width?: 'wide' | 'block';
  active?: boolean;
  disabled?: boolean;
}>;

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
} = Astro.props;

// button/input support the native disabled attribute; a/div need the
// btn-disabled class plus explicit a11y attributes to be genuinely disabled.
const isNativeDisableable = Tag === 'button' || Tag === 'input';
const a11y =
  disabled && !isNativeDisableable
    ? { tabindex: '-1', role: 'button', 'aria-disabled': 'true' }
    : {};
---

<Tag
  class:list={[
    'btn',
    color && `btn-${color}`,
    size && `btn-${size}`,
    variant && `btn-${variant}`,
    shape && `btn-${shape}`,
    width && `btn-${width}`,
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

### Two things deliberately *not* done

**No responsive size API.** daisyUI's "Responsive button" example is `class="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"` — five breakpoint-prefixed size classes at once. A single `size` union cannot express that, and widening the prop into an object (`size={{ base: 'xs', md: 'lg' }}`) would be a bespoke mini-API reimplementing Tailwind's prefixes. The `class` passthrough already covers it, verified working:

```astro
<Button size="xs" class="sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">Responsive</Button>
```

**No automatic `role="button"` on `as="a"`,** even though daisyUI's own "any HTML tags" example writes `<a role="button" class="btn">Link</a>`. That example's anchor has no `href` — it's a demo stub. Adding `role="button"` to a real navigating link would *worsen* accessibility: a screen reader would announce "button" while the element behaves as a link (Enter navigates, no Space activation, opens in new tab via modifier keys). Callers who genuinely want a button-behaving anchor can pass `role="button"` themselves; it forwards through `...rest`.

This is the one place where copying the doc example verbatim into the component would be wrong. The *story* still reproduces the example markup (see §5) — the difference is that the story is a demo and the component is a real API.

## 5. Storybook stories

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
| 17 | Button with loading spinner | `WithLoadingSpinner` | `<span class="loading loading-spinner">` in the slot. Once the Loading component exists, this story should compose it rather than hardcoding the class — leave a comment saying so. |
| 18 | Login buttons | `LoginButtons` | See the note below before writing this one. |

**On example 18 (`LoginButtons`).** The page shows 18+ provider buttons, each with an inline brand SVG and hardcoded brand colors. Reproducing it means pasting ~18 SVG blobs into the story file for content that exercises no Button prop the other stories miss — it is a composition showcase, not variant coverage. Recommendation: implement it with **three** representative providers (GitHub, Google, Apple) and a comment pointing at the doc page for the rest. If you want the full set, it is mechanical copying, just bulky. Decide before writing; don't half-do it.

**Slot convention.** Story args carry slot content under `slot:<name>` keys and everything else as props, split by a helper (`plans/README.md` §5, `plans/TEMPLATE.md` §5). The bridge signature is `renderAstroComponent(path, props, slots)`.

```ts
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderAstroComponent } from '../../.storybook/astro-story';

const COMPONENT_PATH = '/src/components/Button.astro';

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

function split(args: Record<string, unknown>) {
  const props: Record<string, unknown> = {};
  const slots: Record<string, string> = {};
  for (const [key, value] of Object.entries(args)) {
    if (key.startsWith('slot:')) slots[key.slice(5)] = String(value);
    else props[key] = value;
  }
  return { props, slots };
}

function renderInto(args: Record<string, unknown>) {
  const container = document.createElement('div');
  container.style.display = 'contents';
  const { props, slots } = split(args);
  renderAstroComponent(COMPONENT_PATH, props, slots).then((html) => {
    container.innerHTML = html;
  });
  return container;
}

function row(items: Record<string, unknown>[]) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexWrap = 'wrap';
  wrapper.style.gap = '0.5rem';
  wrapper.style.alignItems = 'center';
  for (const args of items) wrapper.appendChild(renderInto(args));
  return wrapper;
}

/** default + all 8 colors, with one style axis pinned — the shape examples 5/6/7/9 share. */
function colorSweep(extra: Record<string, unknown>, label: string) {
  return row([
    { ...extra, 'slot:default': label },
    ...COLORS.map((color) => ({ ...extra, color, 'slot:default': color })),
  ]);
}

const meta: Meta = {
  title: 'Components/Button',
  render: renderInto,
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

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: { 'slot:default': 'Button' },
};

// 1. Button
export const Default: Story = {
  args: { 'slot:default': 'Button' },
};

// 2. Button sizes
export const Sizes: Story = {
  render: () => row(SIZES.map((size) => ({ size, 'slot:default': `btn-${size}` }))),
};

// 3. Responsive button — breakpoint prefixes ride the class passthrough, not a prop.
export const Responsive: Story = {
  args: {
    size: 'xs',
    class: 'sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl',
    'slot:default': 'Responsive',
  },
};

// 4. Buttons colors
export const Colors: Story = {
  render: () => row(COLORS.map((color) => ({ color, 'slot:default': color }))),
};

// 5. Soft buttons
export const Soft: Story = {
  render: () => colorSweep({ variant: 'soft' }, 'Soft'),
};

// 6. Outline buttons (+ 8: neutral outline needs a light background)
export const Outline: Story = {
  render: () => colorSweep({ variant: 'outline' }, 'Outline'),
};

// 7. Dash buttons (+ 8: same neutral caveat)
export const Dash: Story = {
  render: () => colorSweep({ variant: 'dash' }, 'Dash'),
};

// 9. Active buttons
export const Active: Story = {
  render: () => colorSweep({ active: true }, 'Active'),
};

// 10. Buttons ghost and button link
export const GhostAndLink: Story = {
  render: () => row([
    { variant: 'ghost', 'slot:default': 'Ghost' },
    { variant: 'link', 'slot:default': 'Link' },
  ]),
};

// 11. Wide button
export const Wide: Story = {
  args: { width: 'wide', 'slot:default': 'Wide' },
};

// 12. Buttons with any HTML tags
export const AnyHtmlTag: Story = {
  render: () => row([
    { as: 'a', role: 'button', 'slot:default': 'Link' },
    { as: 'button', type: 'submit', 'slot:default': 'Button' },
    { as: 'input', type: 'button', value: 'Input' },
    { as: 'input', type: 'submit', value: 'Submit' },
    { as: 'input', type: 'radio', 'aria-label': 'Radio' },
    { as: 'input', type: 'checkbox', 'aria-label': 'Checkbox' },
    { as: 'input', type: 'reset', value: 'Reset' },
  ]),
};

// 13. Disabled buttons — both forms daisyUI documents (see §3b).
export const Disabled: Story = {
  render: () => row([
    { disabled: true, 'slot:default': 'Disabled using attribute' },
    { as: 'a', href: '#', disabled: true, 'slot:default': 'Disabled using class name' },
  ]),
};

// 14. Square button and circle button
export const Shapes: Story = {
  render: () => row([
    { shape: 'square', 'slot:default': '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" fill="none"/></svg>' },
    { shape: 'circle', 'slot:default': '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" fill="none"/></svg>' },
  ]),
};

// 15. Button with Icon — icon before and after the label.
export const WithIcon: Story = {
  render: () => {
    const icon = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6"/></svg>';
    return row([
      { 'slot:default': `${icon} Icon first` },
      { 'slot:default': `Icon last ${icon}` },
    ]);
  },
};

// 16. Button block
export const Block: Story = {
  args: { width: 'block', 'slot:default': 'Block' },
};

// 17. Button with loading spinner
// TODO: once the Loading component exists, compose it here instead of hardcoding
// the `loading loading-spinner` classes.
export const WithLoadingSpinner: Story = {
  render: () => row([
    { shape: 'square', 'slot:default': '<span class="loading loading-spinner"></span>' },
    { 'slot:default': '<span class="loading loading-spinner"></span> loading' },
  ]),
};

// 18. Login buttons — 3 of the doc page's 18+ providers; see the note in the plan.
// Full provider list and brand SVGs: https://daisyui.com/components/button/
export const LoginButtons: Story = {
  render: () => {
    const providers = [
      { label: 'Login with GitHub', color: 'neutral' as const },
      { label: 'Login with Google', variant: 'outline' as const },
      { label: 'Login with Apple', color: 'neutral' as const },
    ];
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '0.5rem';
    wrapper.style.maxWidth = '20rem';
    for (const { label, ...props } of providers) {
      wrapper.appendChild(renderInto({ ...props, width: 'block', 'slot:default': label }));
    }
    return wrapper;
  },
};
```
## 6. Steps

- [x] **Step 1: done — render bridge supports slots.** `.storybook/astro-story.ts` now takes `(path, props, slots)` and `.storybook/main.ts` parses a `slots` query param into `container.renderToString(mod.default, { props, slots })`. Verified: with no slots the component's fallback content renders and `Astro.slots.has()` wrappers are omitted; with slots supplied, named content lands in the right wrappers.

- [ ] **Step 2:** Settle the `LoginButtons` scope question from section 5 (3 providers vs all 18) before writing stories, so the story doesn't get half-built.

- [ ] **Step 3:** Replace `packages/daisy-astro/src/components/Button.astro` with the implementation in section 4, then walk the "Astro idioms gate" in `plans/TEMPLATE.md` §4 against it.

- [ ] **Step 4:** Replace `packages/daisy-astro/src/components/Button.stories.ts` with the stories in section 5.

- [ ] **Step 5:** Run `pnpm storybook` from `packages/daisy-astro/` and verify in the browser:
  - `Playground` renders with a visible label, and every control changes the markup.
  - All 18 doc-example stories render; compare each side by side with its section on https://daisyui.com/components/button/ and confirm the markup matches.
  - **Blocker to expect:** daisyUI's CSS is not currently loaded in Storybook, so buttons will render with correct classes but no styling. Wiring Tailwind + daisyUI into `.storybook/preview.ts` is a prerequisite shared by all 68 components and belongs in its own plan, not this one. Until it lands, verify at the markup level (Step 6) rather than visually.

- [ ] **Step 6:** Verify class output and attribute passthrough directly against the render endpoint. With the dev server running:

```bash
P='%2Fsrc%2Fcomponents%2FButton.astro'
q() { node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"; }
curl -s "http://localhost:6006/__astro-render?component=$P&props=$(q '{"color":"primary","size":"lg","variant":"outline"}')"
curl -s "http://localhost:6006/__astro-render?component=$P&props=$(q '{"disabled":true}')"
curl -s "http://localhost:6006/__astro-render?component=$P&props=$(q '{"as":"a","href":"/x","disabled":true}')"
curl -s "http://localhost:6006/__astro-render?component=$P&props=$(q '{"style":"color:red","id":"go","data-test":"yes"}')"
```

Expected output is recorded in section 8. Note the pre-encoded `$P`: under Git Bash, an unencoded leading `/src/...` gets rewritten to `C:/Program Files/Git/src/...` by MSYS path conversion and the request fails.

- [ ] **Step 7:** Update the Button row in `plans/README.md` from "Implemented (example)" to **Implemented**.

- [ ] **Step 8:** Commit.

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

## 8. Recorded prototype output

Verified against the live `__astro-render` endpoint on 2026-08-24 with the exact code in section 4:

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
