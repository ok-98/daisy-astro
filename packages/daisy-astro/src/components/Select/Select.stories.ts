import Select from './Select.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import FieldsetLegend from '../Fieldset/FieldsetLegend.astro';
import Label from '../Label/Label.astro';
import Join from '../Join/Join.astro';
import Button from '../Button/Button.astro';

// The placeholder is the first `<option disabled selected>`, not a prop — every
// doc example writes it that way (plan §2).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const options = (placeholder: string, values: string[]) => [
  `<option disabled selected>${placeholder}</option>`,
  ...values.map((v) => `<option>${v}</option>`),
];

const select = (props: Record<string, unknown>, placeholder: string, values: string[]): Item => ({
  component: Select,
  props,
  slots: { default: options(placeholder, values) },
});

const COLOR_VALUES = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;

const COLOR_CONTENT: Record<(typeof COLOR_VALUES)[number], [string, string[]]> = {
  primary: ['Pick a text editor', ['VScode', 'VScode fork', 'Another VScode fork']],
  secondary: ['Pick a language', ['Zig', 'Go', 'Rust']],
  accent: ['Color scheme', ['Light mode', 'Dark mode', 'System']],
  neutral: ['Server location', ['North America', 'EU west', 'South East Asia']],
  info: ['Pick a Framework', ['React', 'Vue', 'Angular']],
  success: ['Pick a Runtime', ['npm', 'Bun', 'yarn']],
  warning: ['Pick an OS', ['Windows', 'MacOS', 'Linux']],
  error: ['Pick an AI Model', ['GPT-4', 'Claude', 'Llama']],
};

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const SIZE_LABEL = { xs: 'Xsmall', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Xlarge' } as const;

const colorStory = (color: (typeof COLOR_VALUES)[number]) => ({
  render: () => [select({ color }, ...COLOR_CONTENT[color])],
});

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLOR_VALUES] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    ghost: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  args: { slots: { default: options('Pick a color', ['Crimson', 'Amber', 'Velvet']) } },
};

// 1. Select — the placeholder is the disabled first option.
export const Default = {
  args: { slots: { default: options('Pick a color', ['Crimson', 'Amber', 'Velvet']) } },
};

// 2. Ghost — no background until focused.
export const Ghost = {
  args: { ghost: true, slots: { default: options('Pick a font', ['Inter', 'Poppins', 'Raleway']) } },
};

// 3. With fieldset and labels — composes the real `Fieldset`, `FieldsetLegend`
// and `Label`, all three flat grid siblings.
export const WithFieldsetAndLabels = {
  render: () => [
    {
      component: Fieldset,
      props: { class: 'w-xs' },
      slots: {
        default: [
          { component: FieldsetLegend, slots: { default: 'Browsers' } },
          select({}, 'Pick a Browser', ['Chrome', 'FireFox', 'Safari']),
          { component: Label, props: { as: 'span' }, slots: { default: 'Optional' } },
        ],
      },
    },
  ],
};

// 4–11. One story per colour, as the doc page has them.
export const Primary = colorStory('primary');
export const Secondary = colorStory('secondary');
export const Accent = colorStory('accent');
export const Neutral = colorStory('neutral');
export const Info = colorStory('info');
export const Success = colorStory('success');
export const Warning = colorStory('warning');
export const Error = colorStory('error');

// 12. Sizes — five heights, unlike Textarea where only the font moves.
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-4 w-full items-center">',
    ...SIZES.map((size) =>
      select({ size }, SIZE_LABEL[size], [`${SIZE_LABEL[size]} Apple`, `${SIZE_LABEL[size]} Orange`, `${SIZE_LABEL[size]} Tomato`]),
    ),
    '</div>',
  ],
};

// 13. Disabled.
export const Disabled = {
  args: { disabled: true, slots: { default: "<option>You can't touch this</option>" } },
};

// 14. OS-native dropdown — `appearance-none` reads like a no-op, since daisyUI
// already sets it, but Tailwind re-declares the property at utility
// specificity and the two behave differently for the **open** list. A caller
// class, not a prop (§3b).
//
// If this looks identical to `Default` when opened, the browser does not
// distinguish the two — which is the answer to §3e.1, not a broken story.
export const NativeDropdownStyle = {
  render: () => [
    select({ class: 'appearance-none' }, 'Pick a color', ['Crimson', 'Amber', 'Velvet']),
  ],
};

// 15. Custom dropdown height — `::picker(select)` is the customisable-select
// pseudo-element, very new. Where it is unsupported this renders exactly like
// `Default`; that is expected rather than broken (§3b, §3e.1).
export const CustomDropdownHeight = {
  render: () => [
    select({ class: '[&::picker(select)]:max-h-26' }, 'Pick a color', ['Crimson', 'Amber', 'Velvet']),
  ],
};

// Beyond the doc page: all eight colours together, since the page shows them in
// eight separate sections. The **arrow stays `currentColor`** in every one —
// only the border changes (§3a).
export const Colors = {
  render: () => [
    '<div class="flex flex-col gap-4 w-xs">',
    ...COLOR_VALUES.map((color) => select({ color }, ...COLOR_CONTENT[color])),
    '</div>',
  ],
};

// Beyond the doc page: inside a `Join`. **Nothing is passed** — the corner
// radii read `--join-*` off the wrapper, which is daisyUI's protocol for every
// form control (§3d).
export const InJoin = {
  render: () => [
    {
      component: Join,
      slots: {
        default: [
          select({ class: 'join-item' }, 'Pick a color', ['Crimson', 'Amber', 'Velvet']),
          { component: Button, props: { class: 'join-item' }, slots: { default: 'Apply' } },
        ],
      },
    },
  ],
};

// Beyond the doc page: an option longer than the control. It truncates with an
// ellipsis rather than widening it — `text-overflow: ellipsis` with
// `white-space: nowrap` on a clamped width (§3d).
export const LongOption = {
  render: () => [
    select({}, 'Pick a colour with a very long descriptive name indeed', [
      'A shade of crimson so particular it needs a whole sentence to describe',
      'Amber',
    ]),
  ],
};

// Regression guard: native select attributes survive — `name` and `required`
// reach the element with no declared props — and caller `class` merges after
// every variant class.
export const Passthrough = {
  args: {
    color: 'info',
    size: 'lg',
    ghost: true,
    id: 'select-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    name: 'colour',
    required: true,
    slots: { default: options('Passthrough', ['Crimson', 'Amber']) },
  },
};
