import Range from './Range.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'info', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// Every example on the doc page is 0–100 with the thumb at 40.
const slider = (props: Record<string, unknown> = {}): Item => ({
  component: Range,
  props: { min: '0', max: '100', value: '40', ...props },
});

const column = (...items: Item[]): Item[] => ['<div class="flex flex-col gap-4 w-full max-w-xs">', ...items, '</div>'];

export default {
  title: 'Components/Range',
  component: Range,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    vertical: { control: 'boolean' },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
};

export const Playground = {
  args: { min: '0', max: '100', value: '40', class: 'w-full max-w-xs' },
};

// 1. Range
export const Default = {
  args: { min: '0', max: '100', value: '40' },
};

// 2. With steps and measure — the ticks are sibling markup below the input,
// hand-aligned with `px-2.5 justify-between`. daisyUI has no tick class, so
// there is no `ticks` prop (§2).
const tickRow = (cells: string[]) =>
  `<div class="flex justify-between px-2.5 mt-2 text-xs">${cells.map((c) => `<span>${c}</span>`).join('')}</div>`;

export const WithStepsAndMeasure = {
  render: () => [
    '<div class="w-full max-w-xs">',
    slider({ value: '25', step: '25' }),
    tickRow(['|', '|', '|', '|', '|']),
    tickRow(['1', '2', '3', '4', '5']),
    '</div>',
  ],
};

// 3–10. One story per colour example on the page.
export const Neutral = { args: { min: '0', max: '100', value: '40', color: 'neutral' } };
export const Primary = { args: { min: '0', max: '100', value: '40', color: 'primary' } };
export const Secondary = { args: { min: '0', max: '100', value: '40', color: 'secondary' } };
export const Accent = { args: { min: '0', max: '100', value: '40', color: 'accent' } };
export const Success = { args: { min: '0', max: '100', value: '40', color: 'success' } };
export const Warning = { args: { min: '0', max: '100', value: '40', color: 'warning' } };
export const Info = { args: { min: '0', max: '100', value: '40', color: 'info' } };
export const Error = { args: { min: '0', max: '100', value: '40', color: 'error' } };

// 11. Sizes — the page steps the value up with the size, so the thumbs are
// easy to compare.
export const Sizes = {
  render: () =>
    column(...SIZES.map((size, i) => slider({ size, value: String(30 + i * 10) }))),
};

// 12. Range with custom color and no fill. Four separate seams in one example:
// `text-blue-300` drives the fill through currentColor, and the three
// arbitrary-value classes set custom properties that have no class equivalents
// — which is why none of them is a prop (§1a, §3b).
export const CustomColorNoFill = {
  args: {
    min: '0',
    max: '100',
    value: '40',
    class: 'text-blue-300 [--range-bg:orange] [--range-thumb:blue] [--range-fill:0]',
  },
};

// 13. Vertical — daisyUI's only direction class. Note the doc page shows it
// with no height class; `.range` sets a thumb-sized height of its own, so what
// this actually renders as is a Step 5 question (§3c).
export const Vertical = {
  args: { min: '0', max: '100', value: '40', vertical: true },
};

// Beyond the doc page: all eight colours together, since the page shows them
// in eight separate sections.
export const Colors = {
  render: () => column(...COLORS.map((color) => slider({ color }))),
};

// Beyond the doc page: the page has no disabled example, and it is the first
// thing a form author checks. Styled from the native attribute, so there is no
// disabled class and nothing for the component to branch on.
export const Disabled = {
  render: () => column(slider({ color: 'primary' }), slider({ color: 'primary', disabled: true })),
};

// Regression guard: native attributes survive, caller `class` merges, and
// `type="range"` is emitted rather than left to default to a text field.
export const Passthrough = {
  args: {
    min: '0',
    max: '100',
    value: '55',
    step: '5',
    color: 'accent',
    size: 'lg',
    name: 'volume',
    id: 'range-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'mine w-full max-w-xs',
  },
};
