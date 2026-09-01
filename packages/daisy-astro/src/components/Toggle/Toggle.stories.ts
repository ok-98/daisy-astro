import Toggle from './Toggle.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';

// `Colors` and `Sizes` render every input **checked** on purpose: colour is
// gated on `:checked`, so unchecked they would be eight identical grey pills
// and would read as a broken prop (plan §0d).

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const row = (children: unknown[]) => ['<div class="flex gap-4 items-center">', ...children, '</div>'];

const ICON = {
  check:
    '<svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="4" fill="none" stroke="currentColor"><path d="M20 6 9 17l-5-5"></path></g></svg>',
  cross:
    '<svg aria-label="disabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

export default {
  title: 'Components/Toggle',
  component: Toggle,
  argTypes: {
    as: { control: 'inline-radio', options: ['input', 'label'] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    checked: { control: 'boolean' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { checked: true },
};

// 1. Toggle.
export const Default = {
  args: { checked: true },
};

// 2. With fieldset and label — composes the real `Fieldset`, `FieldsetLegend`
// and `Label`, with the toggle a sibling of its own label text.
export const WithFieldset = {
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
            slots: { default: [{ component: Toggle, props: { checked: true } }, ' Remember me'] },
          },
        ],
      },
    },
  ],
};

// 3. Sizes — five widths. **This story is the visible test that
// `type="checkbox"` is present**: the size classes select
// `.toggle-lg[type=checkbox]`, so without the attribute all five render
// identically (§0a).
export const Sizes = {
  render: () => row(SIZES.map((size) => ({ component: Toggle, props: { size, checked: true } }))),
};

// 4. Colours — all eight, all checked, because colour is `:checked`-gated
// (§0d). Toggle one off in the canvas and it returns to grey.
export const Colors = {
  render: () => row(COLORS.map((color) => ({ component: Toggle, props: { color, checked: true } }))),
};

// 5. Disabled — unchecked and checked.
export const Disabled = {
  render: () =>
    row([
      { component: Toggle, props: { disabled: true } },
      { component: Toggle, props: { disabled: true, checked: true } },
    ]),
};

// 6. Indeterminate — the knob centres rather than parking at either end. No
// prop and no component script: the state has no HTML attribute, so daisyUI's
// own example sets the DOM property, and this story does the same (§0e).
export const Indeterminate = {
  render: () => [
    { component: Toggle, props: { id: 'my-toggle' } },
    '<script>document.getElementById("my-toggle").indeterminate = true</script>',
  ],
};

// 7. Icons inside — the wrapper form, markup copied verbatim.
//
// **The icons are positional, and daisyUI's own labels read inverted.** The CSS
// is unambiguous: `.toggle > *:nth-child(3)` starts at `opacity: 0` and
// `.toggle:has(:checked) > *:nth-child(2)` hides child 2 — so the **first**
// icon, the one daisyUI marks `aria-label="enabled"`, is the one visible while
// the toggle is **off**, and the `aria-label="disabled"` cross shows when it is
// **on** (§0c).
//
// Reproduced as published rather than silently corrected. If you use this
// shape, put the icon for the *off* state first.
export const IconsInside = {
  render: () => [
    {
      component: Toggle,
      props: { as: 'label', class: 'text-base-content' },
      slots: { default: ['<input type="checkbox" />', ICON.check, ICON.cross] },
    },
  ],
};

// 8. Custom colours — caller classes only, overriding both states.
export const CustomColors = {
  args: {
    checked: true,
    class: 'border-indigo-600 bg-indigo-500 checked:bg-orange-400 checked:text-orange-800 checked:border-orange-500',
  },
};

// Regression guard: native attributes survive on the input form, and caller
// `class` merges after every variant class.
export const Passthrough = {
  args: {
    color: 'success',
    size: 'lg',
    id: 'toggle-1',
    name: 'notifications',
    value: '1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    checked: true,
  },
};
