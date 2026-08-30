import Mask from './Mask.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const SHAPES = [
  'squircle',
  'heart',
  'hexagon',
  'hexagon-2',
  'decagon',
  'pentagon',
  'diamond',
  'square',
  'circle',
  'star',
  'star-2',
  'triangle',
  'triangle-2',
  'triangle-3',
  'triangle-4',
] as const;

// The photo every example on the doc page uses.
const SRC = 'https://img.daisyui.com/images/stock/photo-1567653418876-5bb0e566e1c2.webp';

// daisyUI's own alt text: "Squircle CSS mask", "Hexagon-2 CSS mask", …
const label = (shape: string) => shape.replace(/(^|-)([a-z])/, (_, sep, c) => sep + c.toUpperCase());
const alt = (shape: string) => `${label(shape)} CSS mask`;

const shot = (shape: (typeof SHAPES)[number], extra: Record<string, unknown> = {}) => ({
  component: Mask,
  props: { shape, src: SRC, alt: alt(shape), class: 'w-40 h-40', ...extra },
});

export default {
  title: 'Components/Mask',
  component: Mask,
  argTypes: {
    as: { control: 'text' },
    shape: { control: 'select', options: SHAPES },
    half: { control: 'select', options: [undefined, '1', '2'] },
  },
};

export const Playground = {
  args: { shape: 'squircle', src: SRC, alt: alt('squircle'), class: 'w-40 h-40' },
};

// 1–15. One story per doc-page example, same markup as the page: the mask goes
// on the <img> itself, sized square (§3a, §3d).
export const Squircle = { args: shot('squircle').props };
export const Heart = { args: shot('heart').props };
export const Hexagon = { args: shot('hexagon').props };
export const Hexagon2 = { args: shot('hexagon-2').props };
export const Decagon = { args: shot('decagon').props };
export const Pentagon = { args: shot('pentagon').props };
export const Diamond = { args: shot('diamond').props };
export const Square = { args: shot('square').props };
export const Circle = { args: shot('circle').props };
export const Star = { args: shot('star').props };
export const Star2 = { args: shot('star-2').props };
export const Triangle = { args: shot('triangle').props };
export const Triangle2 = { args: shot('triangle-2').props };
export const Triangle3 = { args: shot('triangle-3').props };
export const Triangle4 = { args: shot('triangle-4').props };

// Beyond the doc page: the page shows the shapes one at a time, but choosing
// between them is the actual use case.
export const AllShapes = {
  render: () => [
    '<div class="flex flex-wrap items-center gap-2">',
    ...SHAPES.map((shape) => shot(shape, { class: 'w-24 h-24' })),
    '</div>',
  ],
};

// Beyond the doc page: `mask-half-1`/`-2` zoom the mask to 200% and anchor it
// to one edge — they do not clip. The element must be halved too, which is why
// these are `w-20 h-40` against the full shape's `w-40 h-40` (§3c).
export const Halves = {
  render: () => [
    '<div class="flex items-center gap-2">',
    shot('star'),
    shot('star', { half: '1', class: 'w-20 h-40' }),
    shot('star', { half: '2', class: 'w-20 h-40' }),
    '</div>',
  ],
};

// Beyond the doc page: the other correct shape, from the Avatar doc page — the
// mask on a wrapper div, with the image filling it (§3a). This is the form the
// Avatar component's WithMask story uses.
export const AsWrapper = {
  args: {
    as: 'div',
    shape: 'heart',
    class: 'w-24',
    slots: { default: `<img src="${SRC}" alt="Heart CSS mask" />` },
  },
};

// Beyond the doc page: `mask-size: contain` centres the shape rather than
// stretching it, so a wide box letterboxes — empty space either side of a
// full-height heart, not a wide heart (§3d).
export const NonSquare = {
  args: { shape: 'heart', src: SRC, alt: alt('heart'), class: 'w-64 h-24' },
};

// Regression guard: native attributes survive and caller `class` merges with
// the mask classes rather than replacing them.
export const Passthrough = {
  args: {
    shape: 'circle',
    src: SRC,
    alt: alt('circle'),
    id: 'mask-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'w-40 h-40 mine',
  },
};
