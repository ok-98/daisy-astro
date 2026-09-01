import Textarea from './Textarea.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';

// Five of the six doc examples pass **no slot at all** — the visible text is
// `placeholder`, and the slot is the field's initial value (plan §0g).
//
// `WithInitialValue` is the regression guard for the raw-text whitespace bug:
// its value must be exactly `Hello`, with nothing around it (plan §0a).

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SIZE_LABEL = { xs: 'Xsmall', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Xlarge' } as const;

export default {
  title: 'Components/Textarea',
  component: Textarea,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    ghost: { control: 'boolean' },
  },
};

export const Playground = {
  args: { placeholder: 'Bio' },
};

// 1. Textarea — empty, with the placeholder carrying the text. If the
// placeholder is not visible, the whitespace bug is back (§0a).
export const Default = {
  args: { placeholder: 'Bio' },
};

// 2. Ghost — borderless until focused.
export const Ghost = {
  args: { ghost: true, placeholder: 'Bio' },
};

// 3. With a fieldset and labels — height is a caller class, since size does not
// touch the box (§0c). Composes the real `Fieldset`, `FieldsetLegend` and
// `Label`.
export const WithFieldset = {
  render: () => [
    {
      component: Fieldset,
      props: { class: 'w-xs' },
      slots: {
        default: [
          { component: FieldsetLegend, slots: { default: 'Your bio' } },
          { component: Textarea, props: { class: 'h-24', placeholder: 'Bio' } },
          { component: Label, props: { as: 'div' }, slots: { default: 'Optional' } },
        ],
      },
    },
  ],
};

// 4. Colours — all eight.
export const Colors = {
  render: () => [
    '<div class="grid gap-4 w-xs">',
    ...COLORS.map((color) => ({
      component: Textarea,
      props: { color, placeholder: color[0].toUpperCase() + color.slice(1) },
    })),
    '</div>',
  ],
};

// 5. Sizes — all five. **The boxes are identical.** Size sets `--font-size-min`
// and nothing else, so the check is the computed `font-size` (.6875rem →
// 1.375rem) rather than the box (§0c) — and on a touch-pointer device a focused
// field reads 1rem whatever its size class, which is daisyUI's iOS zoom guard
// (§0d).
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-4 w-full items-center">',
    ...SIZES.map((size) => ({ component: Textarea, props: { size, placeholder: SIZE_LABEL[size] } })),
    '</div>',
  ],
};

// 6. Disabled.
export const Disabled = {
  args: { disabled: true, placeholder: 'Bio' },
};

// Beyond the doc page: the only story that passes a slot, and the guard for
// §0a. The rendered value must be exactly `Hello` — no leading newline, no
// indentation — and the placeholder must therefore stay hidden.
export const WithInitialValue = {
  args: { placeholder: 'Bio (should not show)', slots: { default: 'Hello' } },
};

// Regression guard: native textarea attributes survive — `rows`, `maxlength`
// and `required` are `TextareaHTMLAttributes` members, so they prove the right
// interface is inherited rather than just the base one.
export const Passthrough = {
  args: {
    color: 'success',
    size: 'lg',
    ghost: true,
    id: 'textarea-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine h-24',
    name: 'bio',
    rows: 4,
    maxlength: 200,
    required: true,
    placeholder: 'Passthrough',
  },
};

