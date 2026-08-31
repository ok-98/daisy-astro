import MenuTitle from './MenuTitle.astro';
import Menu from './Menu.astro';

// A title is only meaningful inside a menu — daisyUI treats the class as "the
// thing that is not an item", so it is defined by its exclusion from the item
// selectors (plan §3c).

const items = '<li><button>Item 1</button></li><li><button>Item 2</button></li>';

const inMenu = (props: Record<string, unknown>, wrap = false) => [
  {
    component: Menu,
    props: { class: 'bg-base-200 w-56 rounded-box' },
    slots: {
      default: wrap
        ? ['<li>', { component: MenuTitle, props, slots: { default: 'Title' } }, `<ul>${items}</ul></li>`]
        : [{ component: MenuTitle, props, slots: { default: 'Title' } }, items],
    },
  },
];

export default {
  title: 'Components/Menu/MenuTitle',
  component: MenuTitle,
  argTypes: { as: { control: 'inline-radio', options: ['li', 'h2'] } },
};

// The standalone label row — daisyUI's first shape.
export const Playground = {
  render: () => inMenu({}),
};

// The second shape: an `h2` heading over a nested list, inside its own item.
export const AsGroupHeading = {
  render: () => inMenu({ as: 'h2' }, true),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inMenu({
      id: 'menu-title-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
