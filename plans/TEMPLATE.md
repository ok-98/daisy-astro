<!--
BASEPLATE TEMPLATE — copy this file to plans/components/<slug>.md and fill in
every <FILL: ...> marker against the real daisyUI doc page for this component
(daisyui.com/components/<slug>/). Do not guess variant classes from memory or
from another component's plan — read that component's actual doc page.

Once filled in, this file has no more <FILL> markers and no more placeholders:
every code block is copy-pasteable as-is (adjust only the <FILL> substitutions
already made).
-->

# <FILL: Component Name> Component Plan

**daisyUI category:** <FILL: e.g. Data Display>
**daisyUI doc page:** <FILL: https://daisyui.com/components/SLUG/>
**Root element:** <FILL: e.g. 'button', 'div', 'a'>
**Target file:** `packages/daisy-astro/src/components/<FILL: Name>.astro`
**Story file:** `packages/daisy-astro/src/components/<FILL: Name>.stories.ts`

**Global Constraints** (from `plans/README.md`, apply as-is, do not restate differently):
- Props extend `HTMLAttributes<'<FILL: root element>'>` from `astro/types`.
- Class merging uses `class:list` (bundled `clsx`), never manual string concatenation.
- Shared variant unions (`DaisyColor`, `DaisySize`, ...) come from `packages/daisy-astro/src/lib/variants.ts` — import, don't redeclare, when the component uses a standard axis.
- One story file, `Playground` + one story per variant axis.

---

## 1. Variant audit

Read `<FILL: doc URL>` and list every modifier class daisyUI documents for this component. One row per class. Do not include an axis this component doesn't actually support.

| Axis | daisyUI class | Prop name | Prop type | Notes |
|---|---|---|---|---|
| <FILL: e.g. Color> | <FILL: e.g. `badge-primary`> | <FILL: `color`> | <FILL: `DaisyColor`> | <FILL: shared union from variants.ts, or component-specific if daisyUI's set differs> |
| <FILL: e.g. Size> | <FILL: e.g. `badge-lg`> | <FILL: `size`> | <FILL: `DaisySize`> | |
| <FILL: e.g. Style> | <FILL: e.g. `badge-outline`> | <FILL: `outline`> | `boolean` | |

## 2. Slots

<FILL: "Single default slot." OR list named slots this component needs, e.g. Card: `default` (body), `figure`, `actions`.>

## 3. Props interface

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { <FILL: e.g. DaisyColor, DaisySize> } from '../lib/variants';

interface Props extends HTMLAttributes<'<FILL: root element>'> {
  <FILL: prop declarations from the table in section 1, one per row>
  <FILL: e.g. color?: DaisyColor;>
  <FILL: e.g. size?: DaisySize;>
  <FILL: e.g. outline?: boolean;>
}
---
```

## 4. Component implementation

```astro
---
import type { HTMLAttributes } from 'astro/types';
import type { <FILL> } from '../lib/variants';

interface Props extends HTMLAttributes<'<FILL: root element>'> {
  <FILL: same as section 3>
}

const { <FILL: destructure every prop from section 1>, class: className, ...rest } = Astro.props;
---
<<FILL: root element>
  class:list={[
    '<FILL: base daisyUI class, e.g. badge>',
    <FILL: color && `<FILL: class prefix>-${color}`>,
    <FILL: size && `<FILL: class prefix>-${size}`>,
    <FILL: { '<FILL: modifier class>': outline } for each boolean modifier>,
    className,
  ]}
  {...rest}
>
  <slot />
</<FILL: root element>>
```

If the component has named slots (section 2), render each with `<slot name="..." />` in the appropriate place instead of a single default `<slot />`.

## 5. Storybook stories

Reuses the Container-API render bridge already built in `packages/daisy-astro/.storybook/astro-story.ts` (see `plans/README.md` §4 and the working `Button.stories.ts` example). One `Playground` story with full controls, plus one story per variant axis from section 1.

```ts
import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderAstroComponent } from '../../.storybook/astro-story';

const COMPONENT_PATH = '/src/components/<FILL: Name>.astro';

function renderInto(props: Record<string, unknown>) {
  const container = document.createElement('div');
  renderAstroComponent(COMPONENT_PATH, props).then((html) => {
    container.innerHTML = html;
  });
  return container;
}

const meta: Meta = {
  title: 'Components/<FILL: Name>',
  render: renderInto,
  argTypes: {
    <FILL: one argType entry per prop from section 1, e.g.>
    <FILL: color: { control: 'select', options: ['primary', 'secondary', ...] },>
    <FILL: size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },>
    <FILL: outline: { control: 'boolean' },>
  },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: {
    <FILL: sensible default args>
  },
};

export const <FILL: AxisName e.g. Colors>: Story = {
  render: () => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.5rem';
    <FILL: for each value of the axis, e.g.>
    for (const color of [<FILL: 'primary', 'secondary', ...>] as const) {
      wrapper.appendChild(renderInto({ <FILL: color, and any other required default props> }));
    }
    return wrapper;
  },
};
```

Repeat the last `Story` block for every other variant axis (`Sizes`, `States`, ...) found in section 1.

## 6. Steps

- [ ] **Step 1:** Read `<FILL: doc URL>`, fill in section 1's variant audit table.
- [ ] **Step 2:** If any prop needs a union type not already in `packages/daisy-astro/src/lib/variants.ts`, add it there (shared, reusable) rather than declaring it locally — unless it's genuinely specific to this one component, in which case declare it in this component's own file.
- [ ] **Step 3:** Create `packages/daisy-astro/src/components/<FILL: Name>.astro` per section 4.
- [ ] **Step 4:** Create `packages/daisy-astro/src/components/<FILL: Name>.stories.ts` per section 5.
- [ ] **Step 5:** Run `pnpm storybook` (from `packages/daisy-astro/`), open `Components/<FILL: Name>`, verify:
  - `Playground` renders and every control actually changes the rendered markup.
  - Each variant-axis story shows all values of that axis, each visibly distinct (colors look different, sizes look different, etc.) — daisyUI's CSS must actually be loaded for this to be checkable; if it isn't wired up yet in `.storybook/preview.ts`, that's a separate prerequisite, not part of this component's plan.
- [ ] **Step 6:** Confirm non-variant HTML attributes forward correctly: pass an `id` (and, if the root element supports it, another native attribute like `disabled` or `href`) as a story arg not covered by `argTypes`, verify it lands in the rendered HTML from the render endpoint (`curl` the `__astro-render` output, or check the story's rendered DOM).
- [ ] **Step 7:** Update `plans/README.md`'s checklist row for this component to **Implemented**.
- [ ] **Step 8:** Commit.

## 7. Acceptance checklist

- [ ] Every daisyUI modifier class from the doc page has a corresponding typed prop (section 1 is complete, nothing skipped).
- [ ] `Props` extends `HTMLAttributes<'<FILL: root element>'>` — non-variant native attributes need no explicit prop declaration to work.
- [ ] `class` prop from a caller merges correctly (destructured, passed through `class:list`) — doesn't get silently dropped.
- [ ] `Playground` story exposes every prop as a control.
- [ ] One story per variant axis exists and renders all values of that axis.
- [ ] Slots (if any) documented and implemented as named slots, not crammed into the default slot.
