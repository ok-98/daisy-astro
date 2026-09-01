import Checkbox from './Checkbox.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';

// No slots — `<input>` is void. The label is a sibling inside a `Label`
// (plan §2). Every story here is driven by `checked`, so `Playground`'s control
// is also the check that boolean attributes survive the story pipeline
// (plan §3f.1).

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const row = (children: unknown[]) => ['<div class="flex gap-4 items-center">', ...children, '</div>'];

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  args: { checked: true, color: 'primary' },
};

// 1. Checkbox. If this never ticks when clicked, it is a text input wearing
// checkbox styling — the scaffold's bug (§0).
export const Default = {
  args: { checked: true },
};

// 2. With fieldset and label — composes the real `Fieldset`, `FieldsetLegend`
// and `Label`. The checkbox is a **sibling** of the text, both inside the
// label (§2).
export const WithFieldsetAndLabel = {
  render: () => [
    {
      component: Fieldset,
      props: { class: 'p-4 bg-base-100 border border-base-300 rounded-box w-64' },
      slots: {
        default: [
          { component: FieldsetLegend, slots: { default: 'Login options' } },
          {
            component: Label,
            props: { as: 'label' },
            slots: { default: [{ component: Checkbox, props: { checked: true } }, ' Remember me'] },
          },
        ],
      },
    },
  ],
};

// 3. Sizes — five distinct boxes.
export const Sizes = {
  render: () => row(SIZES.map((size) => ({ component: Checkbox, props: { size, checked: true } }))),
};

// 4. Colours — all eight, each with a visible tick.
export const Colors = {
  render: () => row(COLORS.map((color) => ({ component: Checkbox, props: { color, checked: true } }))),
};

// 5. Disabled — unchecked and checked. No prop and no branching: daisyUI
// styles the native `:disabled` (§3d).
export const Disabled = {
  render: () =>
    row([
      { component: Checkbox, props: { disabled: true } },
      { component: Checkbox, props: { disabled: true, checked: true } },
    ]),
};

// 6. Indeterminate — **the state has no HTML attribute**, so it is set from a
// script exactly as daisyUI's own example does. That is also why there is no
// prop: it is runtime state, and a component script would run once and then
// fight whatever drives the form (§3c).
//
// If the script does not run in this canvas, the box shows unchecked rather
// than a dash — that is the story failing to demonstrate, not the component
// failing (§3f.2).
export const Indeterminate = {
  render: () => [
    { component: Checkbox, props: { id: 'my-checkbox' } },
    '<script>document.getElementById("my-checkbox").indeterminate = true</script>',
  ],
};

// 7. Custom colours — Tailwind `checked:` variants on top of the base class,
// which work because daisyUI's own colour classes are just setting
// `--input-color` (§3e).
export const CustomColors = {
  args: {
    checked: true,
    class: 'border-indigo-600 bg-indigo-500 checked:bg-orange-400 checked:text-orange-800 checked:border-orange-500',
  },
};

// Beyond the doc page: `aria-checked="true"` on an **unchecked** input beside a
// really-checked one. daisyUI gives `[aria-checked=true]` every rule `:checked`
// has, so the two should be indistinguishable — the accommodation for
// JS-driven state (§3e).
export const AriaChecked = {
  render: () => [
    '<div class="flex gap-4 items-center"><span class="text-xs opacity-60">aria-checked</span>',
    { component: Checkbox, props: { 'aria-checked': 'true' } },
    '<span class="text-xs opacity-60">really checked</span>',
    { component: Checkbox, props: { checked: true } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges. There
// is no `TypeIsSet` story — the type attribute is asserted in the build output
// instead, since a missing one is invisible in a screenshot (§5).
export const Passthrough = {
  args: {
    color: 'success',
    size: 'lg',
    id: 'cb-1',
    name: 'remember',
    value: '1',
    required: true,
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    checked: true,
  },
};
