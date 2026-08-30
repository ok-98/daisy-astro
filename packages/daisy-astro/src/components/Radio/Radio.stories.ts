import Radio from './Radio.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.
//
// Every story scopes its `name` with its own prefix. Radios sharing a name are
// one group wherever they sit in the document, so unprefixed names would make
// stories on the same docs page fight each other — which is exactly the hazard
// daisyUI's own info box warns about (plan §3b).

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'info', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const radio = (props: Record<string, unknown>): Item => ({ component: Radio, props });

const row = (...items: Item[]): Item[] => ['<div class="flex flex-wrap items-center gap-4">', ...items, '</div>'];

// A checked/unchecked pair sharing one group name, as most doc examples show.
const pair = (name: string, props: Record<string, unknown> = {}): Item[] => [
  radio({ name, checked: true, ...props }),
  radio({ name, ...props }),
];

export default {
  title: 'Components/Radio',
  component: Radio,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  args: { name: 'play-1', color: 'primary', checked: true },
};

// 1. Radio
export const Default = {
  render: () => row(...pair('default-1')),
};

// 2. Radio sizes. The page's *rendered* example gives each radio its own name
// so all five show as checked; its copy-paste snippet reuses one name for all
// five, which would make them a single group where only one can be checked.
// Following the rendered markup, which is what the screenshot shows (§3b).
export const Sizes = {
  render: () =>
    row(...SIZES.map((size, i) => radio({ name: `sizes-${i}`, size, checked: true }))),
};

// 3–10. One story per colour example on the page.
export const Neutral = { render: () => row(...pair('neutral-1', { color: 'neutral' })) };
export const Primary = { render: () => row(...pair('primary-1', { color: 'primary' })) };
export const Secondary = { render: () => row(...pair('secondary-1', { color: 'secondary' })) };
export const Accent = { render: () => row(...pair('accent-1', { color: 'accent' })) };
export const Success = { render: () => row(...pair('success-1', { color: 'success' })) };
export const Warning = { render: () => row(...pair('warning-1', { color: 'warning' })) };
export const Info = { render: () => row(...pair('info-1', { color: 'info' })) };
export const Error = { render: () => row(...pair('error-1', { color: 'error' })) };

// 11. Disabled — styled from the native attribute, so there is no disabled
// class and nothing for the component to branch on (§1).
export const Disabled = {
  render: () => row(...pair('disabled-1', { disabled: true })),
};

// 12. Radio with custom colors — plain Tailwind with `checked:` variants,
// which is the escape hatch when the eight daisyUI colours are not enough.
export const CustomColors = {
  render: () =>
    row(
      radio({
        name: 'custom-1',
        checked: true,
        class: 'bg-red-100 border-red-300 checked:bg-red-200 checked:text-red-600 checked:border-red-600',
      }),
      radio({
        name: 'custom-2',
        checked: true,
        class: 'bg-blue-100 border-blue-300 checked:bg-blue-200 checked:text-blue-600 checked:border-blue-600',
      }),
    ),
};

// Beyond the doc page: all eight colours together, since the page shows them in
// eight separate sections. Each gets its own group name so each stays checked.
export const Colors = {
  render: () => row(...COLORS.map((color) => radio({ name: `colors-${color}`, color, checked: true }))),
};

// Beyond the doc page: daisyUI's info box made visible. All four radios share
// one name, so they are ONE group — choosing in the left pair clears the right
// pair, which is the bug a unique name per group prevents (§3b).
export const SharedNameCollision = {
  render: () => [
    '<div class="flex flex-col gap-2"><div>two "groups" sharing name="collide" — they are really one:</div>',
    ...row(
      radio({ name: 'collide', checked: true }),
      radio({ name: 'collide' }),
      '<span class="mx-4">|</span>',
      radio({ name: 'collide' }),
      radio({ name: 'collide' }),
    ),
    '<div>separate names — two independent groups:</div>',
    ...row(
      ...pair('separate-a'),
      '<span class="mx-4">|</span>',
      ...pair('separate-b'),
    ),
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and
// `type="radio"` is emitted rather than left to default to a text field.
export const Passthrough = {
  args: {
    name: 'pass-1',
    value: 'free',
    checked: true,
    color: 'accent',
    size: 'lg',
    id: 'radio-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'mine',
  },
};
