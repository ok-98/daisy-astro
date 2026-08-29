import Badge from './Badge.astro';
import Button from '../Button/Button.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;
// The soft/outline/dash tables on the doc page omit neutral — it gets its own
// example instead, because of the dark-text caveat (§3d).
const STYLED_COLORS = COLORS.filter((c) => c !== 'neutral');
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-2">',
  ...items,
  '</div>',
];

const badge = (props: Record<string, unknown>, label?: string): Item => ({
  component: Badge,
  props,
  ...(label === undefined ? {} : { slots: { default: label } }),
});

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    as: { control: 'text' },
    color: { control: 'select', options: [undefined, ...COLORS] },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft', 'ghost'] },
    size: { control: 'select', options: [undefined, ...SIZES] },
  },
};

export const Playground = {
  args: { color: 'primary', slots: { default: 'Badge' } },
};

// 1. Badge
export const Default = {
  args: { slots: { default: 'Badge' } },
};

// 2. Badge sizes — each size class sets both the height and the font size.
export const Sizes = {
  render: () =>
    row(
      badge({ size: 'xs' }, 'Xsmall'),
      badge({ size: 'sm' }, 'Small'),
      badge({ size: 'md' }, 'Medium'),
      badge({ size: 'lg' }, 'Large'),
      badge({ size: 'xl' }, 'Xlarge'),
    ),
};

// 3. Badge with colors
export const Colors = {
  render: () => row(...COLORS.map((color) => badge({ color }, cap(color)))),
};

// 4. Badge with soft style
export const SoftStyle = {
  render: () => row(...STYLED_COLORS.map((color) => badge({ variant: 'soft', color }, cap(color)))),
};

// 5. Badge with outline style
export const OutlineStyle = {
  render: () => row(...STYLED_COLORS.map((color) => badge({ variant: 'outline', color }, cap(color)))),
};

// 6. Badge with dash style
export const DashStyle = {
  render: () => row(...STYLED_COLORS.map((color) => badge({ variant: 'dash', color }, cap(color)))),
};

// 7. neutral badge with outline or dash style. daisyUI's own warning, kept
// with the example: "These badges use dark text, only use them on light
// backgrounds" — hence the bg-white wrapper, which is part of the example
// rather than story decoration (§3d).
export const NeutralOutlineAndDash = {
  render: () => [
    '<div class="bg-white p-6 flex flex-wrap items-center gap-2">',
    badge({ color: 'neutral', variant: 'outline' }, 'Outline'),
    badge({ color: 'neutral', variant: 'dash' }, 'Dash'),
    '</div>',
  ],
};

// 8. Badge ghost
export const Ghost = {
  args: { variant: 'ghost', slots: { default: 'ghost' } },
};

// Beyond the doc page: these two are identical on purpose. `badge-ghost` sets
// its own base-200 colours and is declared after every colour class, so the
// colour on the right-hand badge is silently dropped (§3b).
export const GhostIgnoresColor = {
  render: () =>
    row(
      badge({ variant: 'ghost' }, 'ghost'),
      badge({ variant: 'ghost', color: 'primary' }, 'ghost + color="primary"'),
    ),
};

// 9. Empty badge — a documented use, not an edge case: a coloured dot as a
// status marker. No slot content at all (§3c).
export const Empty = {
  render: () =>
    row(
      badge({ color: 'primary', size: 'lg' }),
      badge({ color: 'primary', size: 'md' }),
      badge({ color: 'primary', size: 'sm' }),
      badge({ color: 'primary', size: 'xs' }),
    ),
};

// Beyond the doc page: an empty badge conveys nothing to a screen reader. The
// component injects no name of its own — that would be content this library
// made up — so the caller supplies one (§3c).
export const EmptyAccessibleName = {
  render: () =>
    row(
      badge({ color: 'primary', size: 'lg' }),
      badge({ color: 'primary', size: 'lg', 'aria-label': '3 unread' }),
    ),
};

// 10. Badge with icon — markup copied from the doc page. `.badge` is
// inline-flex with a gap, so the icon and the word are just two things in the
// default slot; no icon prop (§2).
const ICONS = {
  info: '<svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></circle><path d="m12,17v-5.5c0-.276-.224-.5-.5-.5h-1.5" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></path><circle cx="12" cy="7.25" r="1.25" fill="currentColor" stroke-width="2"></circle></g></svg>',
  success: '<svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></circle><polyline points="7 13 10 16 17 8" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></polyline></g></svg>',
  warning: '<svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><g fill="currentColor"><path d="M7.638,3.495L2.213,12.891c-.605,1.048,.151,2.359,1.362,2.359H14.425c1.211,0,1.967-1.31,1.362-2.359L10.362,3.495c-.605-1.048-2.119-1.048-2.724,0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path><line x1="9" y1="6.5" x2="9" y2="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></line><path d="M9,13.569c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z" fill="currentColor" data-stroke="none" stroke="none"></path></g></svg>',
  error: '<svg class="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1.972" y="11" width="20.056" height="2" transform="translate(-4.971 12) rotate(-45)" fill="currentColor" stroke-width="0"></rect><path d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z" stroke-width="0" fill="currentColor"></path></g></svg>',
} as const;

export const WithIcon = {
  render: () =>
    row(
      ...(['info', 'success', 'warning', 'error'] as const).map((color) => ({
        component: Badge,
        props: { color },
        slots: { default: [ICONS[color], cap(color)] },
      })),
    ),
};

// 11. Badge in a text. This is the story the `span` default exists for: a
// `div` badge inside the `<p>` would close the paragraph early and drop out of
// the text flow (§3a). The surrounding headings are plain strings around the
// component, which is what a slot list is for.
export const InText = {
  render: () => [
    '<h1 class="text-xl font-semibold">Heading 1 ',
    badge({ size: 'xl' }, 'Badge'),
    '</h1><h2 class="text-lg font-semibold">Heading 2 ',
    badge({ size: 'lg' }, 'Badge'),
    '</h2><h3 class="text-base font-semibold">Heading 3 ',
    badge({ size: 'md' }, 'Badge'),
    '</h3><h4 class="text-sm font-semibold">Heading 4 ',
    badge({ size: 'sm' }, 'Badge'),
    '</h4><h5 class="text-xs font-semibold">Heading 5 ',
    badge({ size: 'xs' }, 'Badge'),
    '</h5><p class="text-xs">Paragraph ',
    badge({ size: 'xs' }, 'Badge'),
    '</p>',
  ],
};

// 12. Badge in a button — the real <Button>, not raw `btn` markup. The doc
// page writes the badge as a `div` here, and a `div` is valid inside a
// `<button>`, so this is the one example that keeps the page's tag.
export const InButton = {
  render: () =>
    row(
      {
        component: Button,
        slots: { default: ['Inbox ', badge({ as: 'div', size: 'sm' }, '+99')] },
      },
      {
        component: Button,
        slots: {
          default: ['Inbox ', badge({ as: 'div', size: 'sm', color: 'secondary' }, '+99')],
        },
      },
    ),
};

// Regression guard: native attributes survive, caller `class` merges, `as`
// changes the rendered tag.
export const Passthrough = {
  args: {
    as: 'div',
    id: 'badge-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};
