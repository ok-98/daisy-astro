import DockItem from './DockItem.astro';
import DockLabel from './DockLabel.astro';
import Dock from './Dock.astro';

// A DockItem has no class of its own — it is styled by `.dock > *` — so it is
// only meaningful inside a Dock (plan §3a). Both stories nest it in one, with
// `relative` so it does not pin to the canvas (plan §3d).

const ICON =
  '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle></g></svg>';

const inDock = (props: Record<string, unknown>) => [
  '<div class="bg-base-300 rounded-box w-full max-w-sm pt-32">',
  {
    component: Dock,
    props: { class: 'relative border border-base-300' },
    slots: {
      default: [
        {
          component: DockItem,
          props,
          slots: { default: [ICON, { component: DockLabel, slots: { default: 'Item' } }] },
        },
        {
          component: DockItem,
          slots: { default: [ICON, { component: DockLabel, slots: { default: 'Other' } }] },
        },
      ],
    },
  },
  '</div>',
];

export default {
  title: 'Components/Dock/DockItem',
  component: DockItem,
  argTypes: {
    as: { control: 'text' },
    active: { control: 'boolean' },
  },
};

export const Playground = {
  render: () => inDock({ active: true }),
};

// Regression guard: native attributes survive and caller `class` merges. Note
// what an inactive item with no class renders as — no `class` attribute at
// all, which is correct (§3a).
export const Passthrough = {
  render: () =>
    inDock({
      as: 'a',
      href: '#inbox',
      active: true,
      'aria-current': 'page',
      id: 'dock-item-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
