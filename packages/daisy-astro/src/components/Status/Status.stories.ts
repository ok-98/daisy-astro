import Status from './Status.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const dot = (props: Record<string, unknown> = {}): Item => ({ component: Status, props });

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-2">',
  ...items,
  '</div>',
];

export default {
  title: 'Components/Status',
  component: Status,
  argTypes: {
    as: { control: 'text' },
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
  },
};

export const Playground = {
  args: { color: 'success', size: 'md', 'aria-label': 'Online' },
};

// 1. Status — the only doc example without an aria-label, and the only one on
// a <span>.
export const Default = {
  args: {},
};

// 2. Status sizes. The ladder is uneven: 2px, 4px, 8px, 12px, 16px — xs is a
// quarter of md, not one step below it, and is nearly invisible (§3c).
export const Sizes = {
  render: () => row(...SIZES.map((size) => dot({ as: 'div', size, 'aria-label': 'status' }))),
};

// 3. Status with colors. The doc page's own labels: the four brand colours are
// all "status", while the semantic four name the state they mean (§3a).
export const Colors = {
  render: () =>
    row(
      ...COLORS.map((color) =>
        dot({
          as: 'div',
          color,
          'aria-label': ['info', 'success', 'warning', 'error'].includes(color) ? color : 'status',
        }),
      ),
    ),
};

// 4. Status with ping animation — two dots stacked in a one-cell grid: the
// ping expands and fades while the static one stays put (§3d).
export const WithPingAnimation = {
  render: () => [
    '<div class="inline-grid *:[grid-area:1/1]">',
    dot({ as: 'div', color: 'error', class: 'animate-ping' }),
    dot({ as: 'div', color: 'error' }),
    '</div> Server is down',
  ],
};

// 5. Status with bounce animation
export const WithBounceAnimation = {
  render: () => [
    dot({ as: 'div', color: 'info', class: 'animate-bounce' }),
    ' Unread messages',
  ],
};

// Beyond the doc page: animating the only dot leaves nothing behind once it
// fades — which is why the example above stacks two. Compare this with
// WithPingAnimation (§3d).
export const SinglePing = {
  render: () => [dot({ as: 'div', color: 'error', class: 'animate-ping' }), ' Server is down'],
};

// Beyond the doc page: an empty inline element announces nothing, and this
// component defaults no ARIA. Three treatments, in devtools order — bare (says
// nothing), labelled (the state is the information), hidden (the dot merely
// decorates text that already says it) (§3a).
export const WithAccessibleName = {
  render: () =>
    row(
      dot({ color: 'success' }),
      dot({ color: 'success', 'aria-label': 'Online' }),
      dot({ color: 'success', 'aria-hidden': 'true' }),
      '<span>Online</span>',
    ),
};

// Beyond the doc page: the most common real use is a Status pinned to a corner
// by Indicator, which is also Indicator's own doc example.
// TODO(daisy-astro): compose <Indicator>/<IndicatorItem> here once implemented — see plans/components/status.md §5
export const InIndicator = {
  render: () => [
    '<div class="indicator">',
    '<span class="indicator-item">',
    dot({ color: 'success', 'aria-label': 'Online' }),
    '</span>',
    '<div class="bg-base-300 grid h-16 w-16 place-items-center">box</div>',
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, `as`
// changes the tag — and the element stays empty (§2).
export const Passthrough = {
  args: {
    as: 'div',
    color: 'warning',
    size: 'lg',
    id: 'status-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'mine',
    'aria-label': 'Degraded',
  },
};
