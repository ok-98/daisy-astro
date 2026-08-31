import DockLabel from './DockLabel.astro';
import DockItem from './DockItem.astro';
import Dock from './Dock.astro';

// The label's font size comes from the parent Dock's `size`, so it has no size
// prop of its own (plan §3f) — and it only makes sense inside a dock item.

const ICON =
  '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle></g></svg>';

const inItem = (props: Record<string, unknown>, size?: string) => [
  '<div class="bg-base-300 rounded-box w-full max-w-sm pt-32">',
  {
    component: Dock,
    props: { class: 'relative border border-base-300', ...(size ? { size } : {}) },
    slots: {
      default: {
        component: DockItem,
        props: { active: true },
        slots: { default: [ICON, { component: DockLabel, props, slots: { default: 'Home' } }] },
      },
    },
  },
  '</div>',
];

export default {
  title: 'Components/Dock/DockLabel',
  component: DockLabel,
  argTypes: { class: { control: 'text' } },
};

// No size control: the size lives on the parent, and this story shows it —
// the same label under an `xl` dock.
export const Playground = {
  render: () => inItem({}, 'xl'),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inItem({
      id: 'dock-label-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
