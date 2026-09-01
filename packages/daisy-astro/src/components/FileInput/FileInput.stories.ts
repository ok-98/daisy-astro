import FileInput from './FileInput.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';
import Join from '../Join/Join.astro';
import Button from '../Button/Button.astro';

// No slots — `<input>` is void, and the "Choose file" button is a
// pseudo-element with browser-controlled text (plan §2, §3c).
//
// If the button looks like a plain OS control rather than a `btn`, that is
// `::file-selector-button` support in this browser, not the component (§3e.1).

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const column = (children: unknown[]) => ['<div class="flex flex-col gap-4 items-start">', ...children, '</div>'];

export default {
  title: 'Components/FileInput',
  component: FileInput,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    ghost: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  args: {},
};

// 1. File input.
export const Default = {
  args: {},
};

// 2. Ghost — no border until focus.
export const Ghost = {
  args: { ghost: true },
};

// 3. With fieldset and label — composes the real `Fieldset`, `FieldsetLegend`
// and `Label`, all flat grid siblings.
export const WithFieldsetAndLabel = {
  render: () => [
    {
      component: Fieldset,
      slots: {
        default: [
          { component: FieldsetLegend, slots: { default: 'Pick a file' } },
          { component: FileInput },
          { component: Label, props: { as: 'label' }, slots: { default: 'Max size 2MB' } },
        ],
      },
    },
  ],
};

// 4. Sizes — five heights, and the "Choose file" button scales with them
// because it takes its height from the control.
export const Sizes = {
  render: () => column(SIZES.map((size) => ({ component: FileInput, props: { size } }))),
};

// 5. Colours — all eight. Each sets `--input-color`, which drives the border;
// the button keeps its own `--btn-*` colours.
export const Colors = {
  render: () => column(COLORS.map((color) => ({ component: FileInput, props: { color } }))),
};

// 6. Disabled — native, styled directly by daisyUI, so no prop and no
// branching (§1).
export const Disabled = {
  args: { disabled: true, placeholder: "You can't touch this" },
};

// Beyond the doc page: inside a `Join`. **Nothing is passed** — the corner
// radii read `--join-*` off the wrapper, so a File Input composes with Join
// with no prop, unlike the accordion item which needed one (§3d).
export const InJoin = {
  render: () => [
    {
      component: Join,
      slots: {
        default: [
          { component: FileInput, props: { class: 'join-item' } },
          { component: Button, props: { class: 'join-item' }, slots: { default: 'Upload' } },
        ],
      },
    },
  ],
};

// Beyond the doc page: the two attributes callers actually reach for. Both are
// native and pass straight through with no declarations.
export const Multiple = {
  args: { multiple: true, accept: 'image/*' },
};

// Regression guard: native attributes survive and caller `class` merges. There
// is no `TypeIsSet` story — a missing `type` is invisible in a screenshot, so
// it is asserted in the build output instead (§5).
export const Passthrough = {
  args: {
    color: 'success',
    size: 'lg',
    ghost: true,
    id: 'file-1',
    name: 'files',
    accept: '.pdf,.txt',
    multiple: true,
    required: true,
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine w-full',
  },
};

// Beyond the doc page: the false case. `multiple` is not in Astro's
// boolean-attribute list, so `multiple={false}` would serialize as
// `multiple="false"` — which HTML treats as **enabled**, since any value of
// `multiple` turns multi-select on. The component normalises it away; this
// story is the guard, and its rendered markup must contain no `multiple` at
// all (plan §3f).
export const MultipleFalse = {
  render: () => [{ component: FileInput, props: { multiple: false } }],
};
