import Progress from './Progress.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
// The doc page shows every colour as a column of five bars at these values.
const VALUES = [0, 10, 40, 70, 100];

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const bar = (props: Record<string, unknown> = {}): Item => ({ component: Progress, props });

// One column of five bars, as the doc page presents each colour.
const column = (color?: (typeof COLORS)[number]): Item[] => [
  '<div class="flex flex-col gap-2">',
  ...VALUES.map((value) => bar({ ...(color ? { color } : {}), class: 'w-56', value, max: 100 })),
  '</div>',
];

export default {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    value: { control: { type: 'number', min: 0, max: 100 } },
    max: { control: 'number' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'w-56', value: 40, max: 100, 'aria-label': 'Upload' },
};

// 1–9. One story per doc-page example: the default plus one per colour.
export const Default = { render: () => column() };
export const Primary = { render: () => column('primary') };
export const Secondary = { render: () => column('secondary') };
export const Accent = { render: () => column('accent') };
export const Neutral = { render: () => column('neutral') };
export const Info = { render: () => column('info') };
export const Success = { render: () => column('success') };
export const Warning = { render: () => column('warning') };
export const Error = { render: () => column('error') };

// 10. Indeterminate — no `value` attribute at all, which is what the
// `:indeterminate` rules key on. Not a missing prop: a documented example
// (§3a). Under reduced motion the stripe goes static rather than slowing.
export const Indeterminate = {
  args: { class: 'w-56' },
};

// Beyond the doc page: the page shows one colour per section, so nothing there
// compares them. Note the track is a 20% tint of the same colour — one prop
// drives both, because the colour classes set `currentColor` (§3b).
export const Colors = {
  render: () => [
    '<div class="flex flex-col gap-2">',
    ...COLORS.map((color) => bar({ color, class: 'w-56', value: 70, max: 100 })),
    '</div>',
  ],
};

// Beyond the doc page: the difference §3a is about. These look nearly
// identical at rest and are not the same thing — the first is a determinate
// bar that happens to be empty, the second is "progress unknown", and
// assistive technology reports them differently.
export const ZeroVsIndeterminate = {
  render: () => [
    '<div class="flex flex-col gap-2"><div>value={0} — determinate, empty:</div>',
    bar({ class: 'w-56', value: 0, max: 100 }),
    '<div>no value attribute — indeterminate:</div>',
    bar({ class: 'w-56' }),
    '</div>',
  ],
};

// Beyond the doc page: there is no size axis, so thickness is a caller class
// on a fixed .5rem default (§3c).
export const Thickness = {
  render: () => [
    '<div class="flex flex-col gap-2">',
    bar({ color: 'primary', class: 'w-56', value: 70, max: 100 }),
    bar({ color: 'primary', class: 'w-56 h-4', value: 70, max: 100 }),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
// `value`/`max` are plain attributes here, never props (§2).
export const Passthrough = {
  args: {
    color: 'accent',
    value: 55,
    max: 100,
    id: 'progress-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'w-56 mine',
    'aria-label': 'Upload',
  },
};
