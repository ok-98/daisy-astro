import Menu from './Menu.astro';
import MenuTitle from './MenuTitle.astro';
import Badge from '../Badge/Badge.astro';
import Button from '../Button/Button.astro';

// Items are plain `<li>` with a bare element inside — daisyUI styles them by
// shape, with no class at all, which is why there is no MenuItem component
// (plan §3a). The state classes are caller classes for the same reason.

const FRAME = 'bg-base-200 w-56 rounded-box';

const item = (label: string, attrs = '') => `<li><button${attrs}>${label}</button></li>`;

const items = (...labels: string[]) => labels.map((l) => item(l)).join('');

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-5 w-5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>';

export default {
  title: 'Components/Menu',
  component: Menu,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    paged: { control: 'boolean' },
  },
};

export const Playground = {
  args: { class: FRAME, slots: { default: items('Item 1', 'Item 2', 'Item 3') } },
};

// 1. Menu
export const Default = {
  args: { class: FRAME, slots: { default: items('Item 1', 'Item 2', 'Item 3') } },
};

// 2. Responsive — vertical on small screens, horizontal above `lg`. A caller
// class, and the genuinely common case (§3e).
export const Responsive = {
  args: {
    class: 'bg-base-200 rounded-box lg:menu-horizontal',
    slots: { default: items('Item 1', 'Item 2', 'Item 3') },
  },
};

// 8. Menu sizes.
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-4">',
    ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => ({
      component: Menu,
      props: { size, class: FRAME },
      slots: { default: items(`${size} item 1`, `${size} item 2`) },
    })),
    '</div>',
  ],
};

// 9. Menu with disabled items. `menu-disabled` goes on the **`<li>`** — settled
// against the shipped CSS, where the rule is nested under `.menu :where(li)`,
// so the doc example is right and the frontmatter's "the element inside li" is
// wrong (§3b). The `disabled` attribute on the button is what actually disables
// it; the class only dims it.
export const DisabledItems = {
  args: {
    class: FRAME,
    slots: {
      default:
        item('Enabled item') +
        '<li class="menu-disabled"><button disabled>disabled item</button></li>' +
        '<li class="menu-disabled"><button disabled>disabled item</button></li>',
    },
  },
};

// 10. Menu with icons — the icon and the label are two children of one item,
// laid out by daisyUI's own grid.
export const WithIcons = {
  args: {
    class: FRAME,
    slots: {
      default:
        `<li><button>${ICON}Home</button></li>` +
        `<li><button>${ICON}Details</button></li>` +
        `<li><button>${ICON}Stats</button></li>`,
    },
  },
};

// 11. Menu with icons and a badge — the Badge composes as a real component
// inside the item.
export const WithIconsAndBadge = {
  render: () => [
    {
      component: Menu,
      props: { class: FRAME },
      slots: {
        default: [
          `<li><button>${ICON}Inbox`,
          { component: Badge, props: { color: 'primary', size: 'sm' }, slots: { default: '99+' } },
          '</button></li>',
          `<li><button>${ICON}Updates`,
          { component: Badge, props: { color: 'secondary', size: 'sm' }, slots: { default: 'NEW' } },
          '</button></li>',
        ],
      },
    },
  ],
};

// 12. Menu without padding and border radius — daisyUI's own answer to
// restyling the rows, an arbitrary variant reaching the items (§3e).
export const NoPaddingNoRadius = {
  args: {
    class: 'bg-base-200 w-56 [&_li>*]:rounded-none p-0',
    slots: { default: items('Item 1', 'Item 2', 'Item 3') },
  },
};

// 13. Menu with title — the standalone label row.
export const WithTitle = {
  render: () => [
    {
      component: Menu,
      props: { class: FRAME },
      slots: {
        default: [
          { component: MenuTitle, slots: { default: 'Title' } },
          items('Item 1', 'Item 2', 'Item 3'),
        ],
      },
    },
  ],
};

// 14. Menu with title as a parent — the same class as an `h2` heading over a
// nested list, which is daisyUI's second shape for it (§3c).
export const TitleAsParent = {
  render: () => [
    {
      component: Menu,
      props: { class: FRAME },
      slots: {
        default: [
          '<li>',
          { component: MenuTitle, props: { as: 'h2' }, slots: { default: 'Title' } },
          `<ul>${items('Item 1', 'Item 2', 'Item 3')}</ul></li>`,
        ],
      },
    },
  ],
};

// 15. Submenu — plain nesting. The indent and hairline come from daisyUI's own
// descendant rule, with no class involved (§3a).
export const Submenu = {
  args: {
    class: FRAME,
    slots: {
      default:
        item('Item 1') +
        `<li><button>Parent</button><ul>${items('Submenu 1', 'Submenu 2')}` +
        `<li><button>Parent</button><ul>${items('Submenu 1', 'Submenu 2')}</ul></li></ul></li>` +
        item('Item 3'),
    },
  },
};

// 16. Collapsible submenu — the `<details>` form, which is the no-JS
// alternative to the `menu-dropdown` trio and the one to reach for (§3d).
export const CollapsibleSubmenu = {
  args: {
    class: FRAME,
    slots: {
      default:
        item('Item 1') +
        `<li><details open><summary>Parent</summary><ul>${items('Submenu 1', 'Submenu 2')}` +
        `<li><details open><summary>Parent</summary><ul>${items('Submenu 1', 'Submenu 2')}</ul></details></li>` +
        '</ul></details></li>' +
        item('Item 3'),
    },
  },
};

// 19. Menu with active item — `menu-active` goes on the inner element, not the
// list item, which is the opposite of `menu-disabled` (§3b).
export const ActiveItem = {
  args: {
    class: FRAME,
    slots: {
      default:
        item('Item 1') +
        '<li><button class="menu-active">Item 2</button></li>' +
        item('Item 3'),
    },
  },
};

// 20. Horizontal menu.
export const Horizontal = {
  args: {
    direction: 'horizontal',
    class: 'bg-base-200 rounded-box',
    slots: { default: items('Item 1', 'Item 2', 'Item 3') },
  },
};

// 3. Paged menu with nested submenus — shows one level at a time and turns an
// open summary into a back button.
export const Paged = {
  args: {
    paged: true,
    class: FRAME,
    slots: {
      default:
        item('Item 1') +
        `<li><details><summary>Parent</summary><ul>${items('Submenu 1', 'Submenu 2')}</ul></details></li>` +
        item('Item 3'),
    },
  },
};

// Beyond the doc page: a `.btn` inside an item is deliberately exempt from
// daisyUI's item styling, so a Button in a menu keeps its own look instead of
// being flattened into a row (§3a).
export const ButtonIsExempt = {
  render: () => [
    {
      component: Menu,
      props: { class: FRAME },
      slots: {
        default: [
          item('a plain item'),
          '<li>',
          { component: Button, props: { color: 'primary', size: 'sm' }, slots: { default: 'a real Button' } },
          '</li>',
        ],
      },
    },
  ],
};

// Regression guard: native attributes survive and caller `class` merges —
// load-bearing here, since the width and background both arrive that way (§3e).
export const Passthrough = {
  args: {
    direction: 'vertical',
    size: 'lg',
    id: 'menu-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: `mine ${FRAME}`,
    slots: { default: items('Item 1', 'Item 2') },
  },
};
