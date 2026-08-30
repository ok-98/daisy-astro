import Loading from './Loading.astro';
import Button from '../Button/Button.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const VARIANTS = ['spinner', 'dots', 'ring', 'ball', 'bars', 'infinity'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const TEXT_COLORS = [
  'text-primary',
  'text-secondary',
  'text-accent',
  'text-neutral',
  'text-info',
  'text-success',
  'text-warning',
  'text-error',
] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const spin = (props: Record<string, unknown> = {}): Item => ({ component: Loading, props });

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-4">',
  ...items,
  '</div>',
];

// Every doc example is one variant across all five sizes.
const sizeRow = (variant: (typeof VARIANTS)[number]) =>
  row(...SIZES.map((size) => spin({ variant, size })));

export default {
  title: 'Components/Loading',
  component: Loading,
  argTypes: {
    variant: { control: 'select', options: [undefined, ...VARIANTS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
  },
};

export const Playground = {
  args: { variant: 'spinner', size: 'md', 'aria-label': 'Loading' },
};

// 1–6. One story per doc-page example.
export const Spinner = { render: () => sizeRow('spinner') };
export const Dots = { render: () => sizeRow('dots') };
export const Ring = { render: () => sizeRow('ring') };
export const Ball = { render: () => sizeRow('ball') };
export const Bars = { render: () => sizeRow('bars') };
export const Infinity = { render: () => sizeRow('infinity') };

// 7. Loading with colors — Tailwind text utilities, not daisyUI classes: the
// graphic is a mask over a `currentColor` block, so the text colour is the
// colour. This is why there is no `color` prop (§3a).
export const Colors = {
  render: () => row(...TEXT_COLORS.map((c) => spin({ variant: 'spinner', class: c }))),
};

// Beyond the doc page: these two are identical on purpose. The base class
// already carries the spinner mask, so an omitted variant is a spinner rather
// than nothing (§3b).
export const DefaultIsSpinner = {
  render: () => row(spin(), spin({ variant: 'spinner' })),
};

// Beyond the doc page: the most common real use, and the page has no example
// of it. No colour class anywhere — the spinner inherits the button's
// foreground through `currentColor` (§3a).
export const InButton = {
  render: () =>
    row(
      {
        component: Button,
        props: { color: 'primary' },
        slots: { default: [spin({ variant: 'spinner' }), 'Loading'] },
      },
      {
        component: Button,
        props: { color: 'primary', shape: 'square' },
        slots: { default: spin({ variant: 'spinner' }) },
      },
    ),
};

// Beyond the doc page: an empty, pointer-events-none span announces nothing.
// Bare is right inside a button whose text already says "Saving…"; labelled is
// right when the spinner is the only signal (§3d).
export const WithAccessibleName = {
  render: () => row(spin({ variant: 'bars' }), spin({ variant: 'bars', 'aria-label': 'Loading' })),
};

// Regression guard: native attributes survive, caller `class` merges, and the
// element stays empty (§2).
export const Passthrough = {
  args: {
    variant: 'ring',
    size: 'lg',
    id: 'loading-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'text-primary mine',
    'aria-label': 'Loading',
  },
};
