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

Single default slot. Icon-plus-label buttons are served by the caller passing both into the default slot (`<Button><Icon />Save</Button>`) — no named slots needed, and adding `icon`/`label` slots would be speculative structure daisyUI itself doesn't impose.

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

## 5. Storybook stories

```ts
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderAstroComponent } from '../../.storybook/astro-story';

const COMPONENT_PATH = '/src/components/Button.astro';

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const VARIANTS = ['outline', 'dash', 'soft', 'ghost', 'link'] as const;

function renderInto(props: Record<string, unknown>) {
  const container = document.createElement('div');
  container.style.display = 'contents';
  renderAstroComponent(COMPONENT_PATH, props).then((html) => {
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
  for (const props of items) wrapper.appendChild(renderInto(props));
  return wrapper;
}

const meta: Meta = {
  title: 'Components/Button',
  render: renderInto,
  argTypes: {
    as: { control: 'select', options: ['button', 'a', 'div'] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    variant: { control: 'select', options: [undefined, ...VARIANTS] },
    shape: { control: 'select', options: [undefined, 'square', 'circle'] },
    width: { control: 'select', options: [undefined, 'wide', 'block'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: { default: 'Button' },
};

export const Colors: Story = {
  render: () => row(COLORS.map((color) => ({ color, default: color }))),
};

export const Sizes: Story = {
  render: () => row(SIZES.map((size) => ({ size, default: size }))),
};

export const Variants: Story = {
  render: () => row(VARIANTS.map((variant) => ({ variant, default: variant }))),
};

export const Shapes: Story = {
  render: () => row([
    { shape: 'square', default: '□' },
    { shape: 'circle', default: '○' },
  ]),
};

export const States: Story = {
  render: () => row([
    { default: 'normal' },
    { active: true, default: 'active' },
    { disabled: true, default: 'disabled (button)' },
    { as: 'a', href: '#', disabled: true, default: 'disabled (link)' },
  ]),
};
```

**Note on slot content:** the stories above pass the button label as a `default` prop. The render bridge (`.storybook/astro-story.ts`) currently forwards props only — it does not pass slot content to `container.renderToString`. Step 4 below extends the bridge to accept slots; without that, every button renders empty. This is a genuine prerequisite, not an assumption: the current bridge signature is `renderAstroComponent(componentPath, props)`.

## 6. Steps

- [ ] **Step 1:** Extend the render bridge to support slots. In `packages/daisy-astro/.storybook/astro-story.ts`, accept an optional slots argument and send it to the endpoint; in `.storybook/main.ts`, parse a `slots` query param and pass it through to `container.renderToString(mod.default, { props, slots })`. The Container API already accepts `slots` — this is wiring, not new capability.

- [ ] **Step 2:** Decide the story-side convention for slot content and apply it consistently: extract `default` (and any named slots) out of the story args, pass the rest as props. Keep it in one helper in the stories file so it isn't repeated per story.

- [ ] **Step 3:** Replace `packages/daisy-astro/src/components/Button.astro` with the implementation in section 4.

- [ ] **Step 4:** Replace `packages/daisy-astro/src/components/Button.stories.ts` with the stories in section 5, adjusted for whatever slot convention Step 2 settled on.

- [ ] **Step 5:** Run `pnpm storybook` from `packages/daisy-astro/` and verify in the browser:
  - `Playground` renders with a visible label, and every control changes the markup.
  - `Colors` / `Sizes` / `Variants` / `Shapes` / `States` each show all values, visibly distinct.
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
- [ ] Six stories exist: `Playground`, `Colors`, `Sizes`, `Variants`, `Shapes`, `States`.

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
