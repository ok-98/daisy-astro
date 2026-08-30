import RadialProgress from './RadialProgress.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const ring = (props: Record<string, unknown>, label?: string): Item => ({
  component: RadialProgress,
  props,
  ...(label === undefined ? {} : { slots: { default: label } }),
});

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-4">',
  ...items,
  '</div>',
];

export default {
  title: 'Components/RadialProgress',
  component: RadialProgress,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'text' },
    thickness: { control: 'text' },
  },
};

// The `value` control is a slider on purpose: dragging it shows the tween,
// which comes from a transition on the registered `--radialprogress` property.
export const Playground = {
  args: { value: 70, slots: { default: '70%' } },
};

// 1. Radial progress
export const Default = {
  args: { value: 70, slots: { default: '70%' } },
};

// 2. Different values — 0 is a complete, correct-looking empty ring, which is
// exactly why `value` is required rather than defaulted (§3b).
export const DifferentValues = {
  render: () => row(...[0, 20, 60, 80, 100].map((v) => ring({ value: v }, `${v}%`))),
};

// 3. Custom color — the ring is `currentColor`, so a text utility recolours it
// and there is no colour prop (§3c).
export const CustomColor = {
  args: { value: 70, class: 'text-primary', slots: { default: '70%' } },
};

// 4. With background color and border — three independent utilities, which is
// why one `color` prop could not express this. The border **grows** the
// element rather than eating into the ring, because the component is
// `content-box` (§3d).
export const WithBackgroundAndBorder = {
  args: {
    value: 70,
    class: 'bg-primary text-primary-content border-4 border-primary',
    slots: { default: '70%' },
  },
};

// 5. Custom size and custom thickness — same diameter, hairline vs fat ring.
// `thickness` is 10% of `size` unless set, so the doc example sets both.
export const CustomSizeAndThickness = {
  render: () =>
    row(
      ring({ value: 70, size: '12rem', thickness: '2px' }, '70%'),
      ring({ value: 70, size: '12rem', thickness: '2rem' }, '70%'),
    ),
};

// Beyond the doc page: the slot is optional. Every doc example labels the ring,
// but a bare one is valid — and a hardcoded "70%" fallback would be wrong the
// moment a caller wants "7/10" or an icon (§2).
export const NoLabel = {
  args: { value: 70, class: 'text-primary', 'aria-label': 'Upload progress' },
};

// Beyond the doc page: daisyUI does not clamp. Above 100 the arc saturates but
// the leading dot keeps rotating past the top, which reads as a bug rather
// than as saturation (§3b).
export const OutOfRange = {
  render: () => row(ring({ value: 100 }, '100%'), ring({ value: 130 }, '130%')),
};

// Beyond the doc page: the one thing invisible in the canvas. `role` and
// `aria-valuenow` are emitted by the component and `aria-valuenow` is derived
// from `value`, so the two cannot drift — inspect these in devtools (§3a).
export const AccessibleName = {
  render: () => row(ring({ value: 25 }, '25%'), ring({ value: 25, 'aria-label': 'Upload' }, '25%')),
};

// Regression guard: a caller's own `style` must survive alongside the three
// custom properties, and `class` must merge.
export const Passthrough = {
  args: {
    value: 55,
    size: '8rem',
    thickness: '1rem',
    id: 'radial-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'text-accent mine',
    slots: { default: '55%' },
  },
};
