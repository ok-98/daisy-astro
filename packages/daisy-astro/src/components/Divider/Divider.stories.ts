import Divider from './Divider.astro';

// The empty-divider case depends on `.divider:not(:empty)`, so `NoText` must
// pass NO slot content at all — not an empty string, and not whitespace.
// See plans/components/divider.md §0 and §3a.

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'info', 'error'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const divider = (props: Record<string, unknown> = {}, label?: string): Item => ({
  component: Divider,
  props,
  ...(label === undefined ? {} : { slots: { default: label } }),
});

// The doc page's own content block, which is what makes a divider legible:
// alone it shows nothing about how it sits between elements.
const block = (extra = 'h-20') =>
  `<div class="grid ${extra} card bg-base-300 rounded-box place-items-center">content</div>`;

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    direction: { control: 'radio', options: [undefined, 'vertical', 'horizontal'] },
    placement: { control: 'radio', options: [undefined, 'start', 'end'] },
  },
};

export const Playground = {
  args: { slots: { default: 'OR' } },
};

// 1. Divider
export const Default = {
  render: () => [
    '<div class="flex flex-col w-full">',
    block(),
    divider({}, 'OR'),
    block(),
    '</div>',
  ],
};

// 2. Divider horizontal — a **vertical** bar. daisyUI names the class after
// the layout being divided, not the line (§3b). `align-self: stretch` is what
// makes it fill the row's height with no explicit height.
export const Horizontal = {
  render: () => [
    '<div class="flex w-full">',
    block('h-20 grow'),
    divider({ direction: 'horizontal' }, 'OR'),
    block('h-20 grow'),
    '</div>',
  ],
};

// 3. Divider with no text — the case this component's plan exists for. No
// slot content at all, so `.divider:not(:empty)` does not match, no gap is
// added, and the two halves meet as one continuous line (§0).
export const NoText = {
  render: () => [
    '<div class="flex flex-col w-full">',
    block(),
    divider(),
    block(),
    '</div>',
  ],
};

// 4. responsive (lg:divider-horizontal) — a caller class, not a prop: daisyUI
// ships breakpoint-prefixed copies, and a single `direction` union cannot
// express "horizontal above lg" (§1).
export const Responsive = {
  render: () => [
    '<div class="flex w-full flex-col lg:flex-row">',
    block('grow h-32'),
    divider({ class: 'lg:divider-horizontal' }, 'OR'),
    block('grow h-32'),
    '</div>',
  ],
};

// 5. Divider with colors — the lines change colour, the text does not (§3d).
export const Colors = {
  render: () => [
    '<div class="flex flex-col w-full">',
    divider({}, 'Default'),
    ...COLORS.map((color) => divider({ color }, cap(color))),
    '</div>',
  ],
};

// 6. Divider in different positions
export const Placements = {
  render: () => [
    '<div class="flex flex-col w-full">',
    divider({ placement: 'start' }, 'Start'),
    divider({}, 'Default'),
    divider({ placement: 'end' }, 'End'),
    '</div>',
  ],
};

// 7. Divider in different positions (horizontal)
export const PlacementsHorizontal = {
  render: () => [
    '<div class="flex w-full justify-center h-52">',
    divider({ direction: 'horizontal', placement: 'start' }, 'Start'),
    divider({ direction: 'horizontal' }, 'Default'),
    divider({ direction: 'horizontal', placement: 'end' }, 'End'),
    '</div>',
  ],
};

// Beyond the doc page: the story that catches the bug the plan exists for. The
// top divider must be one unbroken line; a 1rem notch in the middle of it means
// whitespace inside the element defeated `:empty` (§3a).
export const EmptyVsText = {
  render: () => [
    '<div class="flex flex-col w-full">',
    divider(),
    divider({}, 'with text'),
    '</div>',
  ],
};

// Beyond the doc page: `color` reaches the lines only. The second one adds
// `text-primary` for the text as well (§3d).
export const ColorIsLineOnly = {
  render: () => [
    '<div class="flex flex-col w-full">',
    divider({ color: 'primary' }, 'line only'),
    divider({ color: 'primary', class: 'text-primary' }, 'line and text'),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` is also how the responsive direction arrives (§1).
export const Passthrough = {
  args: {
    id: 'divider-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    role: 'separator',
    slots: { default: 'Passthrough' },
  },
};
