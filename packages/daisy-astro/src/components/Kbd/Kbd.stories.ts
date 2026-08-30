import Kbd from './Kbd.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const key = (label: string, props: Record<string, unknown> = {}): Item => ({
  component: Kbd,
  props,
  slots: { default: label },
});

// The doc page's own keyboard rows.
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm/'];

export default {
  title: 'Components/Kbd',
  component: Kbd,
  argTypes: {
    size: { control: 'select', options: [undefined, ...SIZES] },
  },
};

export const Playground = {
  args: { size: 'md', slots: { default: 'K' } },
};

// 1. Kbd
export const Default = {
  args: { slots: { default: 'K' } },
};

// 2. Kbd sizes. These render as pills, not squares: `min-width` equals the
// height, so a word grows the width while the height stays put (§3b).
export const Sizes = {
  render: () => [
    '<div class="flex flex-wrap items-center gap-2">',
    key('Xsmall', { size: 'xs' }),
    key('Small', { size: 'sm' }),
    key('Medium', { size: 'md' }),
    key('Large', { size: 'lg' }),
    key('Xlarge', { size: 'xl' }),
    '</div>',
  ],
};

// 3. In text — `vertical-align: middle` is what keeps this on the baseline.
export const InText = {
  render: () => ['<span>Press ', key('F', { size: 'sm' }), ' to pay respects.</span>'],
};

// 4. Key combination — three separate <kbd> elements with plain text between
// them, which is daisyUI's markup and the HTML spec's guidance. There is no
// `keys` prop and no separator prop (§3a).
export const KeyCombination = {
  render: () => [
    '<div class="flex flex-wrap items-center gap-2">',
    key('ctrl'),
    '+',
    key('shift'),
    '+',
    key('del'),
    '</div>',
  ],
};

// 5. Function Keys
export const FunctionKeys = {
  render: () => [
    '<div class="flex flex-wrap items-center gap-2">',
    ...['⌘', '⌥', '⇧', '⌃'].map((k) => key(k)),
    '</div>',
  ],
};

// 6. A full keyboard — the rows line up with no width classes anywhere, which
// is §3b's square-by-default behaviour doing the work.
export const FullKeyboard = {
  render: () => [
    '<div class="overflow-x-auto">',
    ...ROWS.flatMap((rowKeys) => [
      '<div class="flex justify-center gap-1 w-full mb-1">',
      ...[...rowKeys].map((k) => key(k)),
      '</div>',
    ]),
    '</div>',
  ],
};

// 7. Arrow Keys. The left and right glyphs carry a variation selector
// (U+FE0E) to ask for the text presentation rather than emoji.
export const ArrowKeys = {
  render: () => [
    '<div class="flex justify-center w-full">',
    key('▲'),
    '</div><div class="flex justify-center gap-12 w-full">',
    key('◀︎'),
    key('▶︎'),
    '</div><div class="flex justify-center w-full">',
    key('▼'),
    '</div>',
  ],
};

// Beyond the doc page: the keycap illusion is a bottom border one pixel
// thicker than the other three, and daisyUI sets `box-shadow: none` to keep a
// theme's shadow out of the way. A caller's `shadow-md` flattens it rather
// than deepening it (§3c).
export const WithShadow = {
  render: () => [
    '<div class="flex flex-wrap items-center gap-4">',
    key('K'),
    key('K', { class: 'shadow-md' }),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    size: 'lg',
    id: 'kbd-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: '⌘' },
  },
};
