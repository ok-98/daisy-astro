import Dock from './Dock.astro';
import DockItem from './DockItem.astro';
import DockLabel from './DockLabel.astro';

// `.dock` is `position: fixed` (plan §0). Every story here passes
// `class="relative"` and renders inside the doc page's wrapper — without it the
// docks all stack at the bottom of the canvas, one per story, with only the
// last visible. `Fixed` is the deliberate exception. See dock.md §3d.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// The doc page's three icons, verbatim.
const ICON = {
  home: '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><polyline points="1 11 12 2 23 11" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"></polyline><path d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></path><line x1="12" y1="22" x2="12" y2="18" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></line></g></svg>',
  inbox: '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><polyline points="3 14 9 14 9 17 15 17 15 14 21 14" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"></polyline><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></rect></g></svg>',
  settings: '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></circle><path d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></path></g></svg>',
} as const;

const ITEMS: Array<[keyof typeof ICON, string]> = [
  ['home', 'Home'],
  ['inbox', 'Inbox'],
  ['settings', 'Settings'],
];

// One item; `labelled: false` reproduces the xs/sm examples, which are icons
// only rather than labels-missing.
const item = (
  icon: keyof typeof ICON,
  label: string,
  { active = false, labelled = true, ...props }: Record<string, unknown> = {},
): Item => ({
  component: DockItem,
  props: { ...(active ? { active: true } : {}), ...props },
  slots: {
    default: labelled
      ? [ICON[icon], { component: DockLabel, slots: { default: label } }]
      : ICON[icon],
  },
});

const trio = (opts: Record<string, unknown> = {}) =>
  ITEMS.map(([icon, label], i) => item(icon, label, { active: i === 1, ...opts }));

// The doc page's demo wrapper.
const framed = (props: Record<string, unknown>, items: Item[] = trio()): Item[] => [
  '<div class="bg-base-300 rounded-box w-full max-w-sm pt-32">',
  { component: Dock, props: { class: 'relative border border-base-300', ...props }, slots: { default: items } },
  '</div>',
];

export default {
  title: 'Components/Dock',
  component: Dock,
  argTypes: {
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'relative border border-base-300', slots: { default: trio() } },
};

// 1. Dock
export const Default = { render: () => framed({}) };

// 2–3. Extra small and small — icons only, which is how the page shows them.
export const ExtraSmall = { render: () => framed({ size: 'xs' }, trio({ labelled: false })) };
export const Small = { render: () => framed({ size: 'sm' }, trio({ labelled: false })) };

// 4–6. Medium, large, extra large — icons plus labels.
export const Medium = { render: () => framed({ size: 'md' }) };
export const Large = { render: () => framed({ size: 'lg' }) };
export const ExtraLarge = { render: () => framed({ size: 'xl' }) };

// 7. Dock with custom colors — plain Tailwind on the container, since there is
// no colour axis; the icons and labels follow `currentColor`.
export const CustomColors = {
  render: () => framed({ class: 'relative bg-neutral text-neutral-content' }),
};

// Beyond the doc page: the shape a real navigation dock takes, which no doc
// example shows. `dock-active` is visual only, so the current item also
// carries `aria-current="page"` — that is the caller's job, not the
// component's (§3b).
export const AsLinks = {
  render: () =>
    framed(
      {},
      ITEMS.map(([icon, label], i) =>
        item(icon, label, {
          as: 'a',
          href: `#${label.toLowerCase()}`,
          active: i === 1,
          ...(i === 1 ? { 'aria-current': 'page' } : {}),
        }),
      ),
    ),
};

// Beyond the doc page: daisyUI styles both `disabled` and `aria-disabled`
// directly, so this needs no prop, no branch and no ARIA patching from the
// library — unlike Button, where the same situation did (§3c).
export const DisabledItem = {
  render: () =>
    framed(
      {},
      [
        item('home', 'Home'),
        item('inbox', 'Inbox', { active: true }),
        item('settings', 'Settings', { disabled: true }),
      ],
    ),
};

// Beyond the doc page, and the only story **without** `relative`: this is the
// production behaviour. The dock pins to the bottom of the canvas while the
// wrapper scrolls past it. Do not "fix" this one by adding `relative` (§3d).
export const Fixed = {
  render: () => [
    '<div class="h-96 overflow-y-auto bg-base-300 rounded-box w-full max-w-sm"><div class="h-[40rem] p-4">scroll me — the dock stays pinned to the bottom of the canvas</div>',
    { component: Dock, props: { class: 'border border-base-300' }, slots: { default: trio() } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges —
// load-bearing here, since `relative` and the colour override both arrive that
// way (§3d).
export const Passthrough = {
  args: {
    id: 'dock-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine relative border border-base-300',
    slots: { default: trio() },
  },
};
