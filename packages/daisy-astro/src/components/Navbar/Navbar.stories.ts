import Navbar from './Navbar.astro';
import NavbarStart from './NavbarStart.astro';
import NavbarCenter from './NavbarCenter.astro';
import NavbarEnd from './NavbarEnd.astro';
import Button from '../Button/Button.astro';
import Menu from '../Menu/Menu.astro';
import Dropdown from '../Dropdown/Dropdown.astro';
import Indicator from '../Indicator/Indicator.astro';
import IndicatorItem from '../Indicator/IndicatorItem.astro';
import Badge from '../Badge/Badge.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';
import CardActions from '../Card/CardActions.astro';
import TextInput from '../TextInput/TextInput.astro';

// The bar has no background of its own, so every story adds one — that is
// daisyUI's own markup, not scaffolding for the canvas (plan §3d).
//
// Stories whose dropdowns open below the bar keep the doc page's own bottom
// margins (`mb-32`…`mb-48`): the panels are absolutely positioned and would
// otherwise fall outside the canvas.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const BAR = 'bg-base-100 shadow-sm';

const ICON = {
  more: '<svg aria-label="More" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>',
  menu: '<svg aria-label="Menu" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>',
  hamburger:
    '<svg aria-label="Menu" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>',
  hamburgerShort:
    '<svg aria-label="Menu" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>',
  search:
    '<svg aria-label="Search" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
  bell: '<svg aria-label="Notifications" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>',
  cart: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
} as const;

const PHOTO = 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp';

// daisyUI puts `avatar` on the dropdown's own trigger element rather than
// nesting one, so it is a class here and not the `Avatar` component — the same
// call `plans/components/indicator.md` made when daisyUI merged two components
// onto one element.
const AVATAR_TRIGGER = 'btn btn-ghost btn-circle avatar';
const AVATAR_IMG = `<div class="w-10 rounded-full"><img alt="Tailwind CSS Navbar component" src="${PHOTO}" /></div>`;

const logo = (label = 'daisyUI'): Item => ({
  component: Button,
  props: { variant: 'ghost', class: 'text-xl' },
  slots: { default: label },
});

const iconButton = (icon: string, props: Record<string, unknown> = {}): Item => ({
  component: Button,
  props: { variant: 'ghost', shape: 'square', ...props },
  slots: { default: icon },
});

// The account menu that three doc examples share.
const accountMenu = (): Item => ({
  component: Menu,
  props: { size: 'sm', tabindex: '-1', class: 'dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow' },
  slots: {
    default: [
      '<li>',
      { component: Button, props: { as: 'a', variant: 'ghost', class: 'justify-between' }, slots: { default: ['Profile', { component: Badge, slots: { default: 'New' } }] } },
      '</li>',
      '<li><a>Settings</a></li>',
      '<li><a>Logout</a></li>',
    ],
  },
});

const accountDropdown = (): Item => ({
  component: Dropdown,
  props: { align: 'end', triggerClass: AVATAR_TRIGGER },
  slots: { trigger: AVATAR_IMG, default: accountMenu() },
});

export default {
  title: 'Components/Navbar',
  component: Navbar,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: BAR,
    slots: {
      default: [
        { component: NavbarStart, slots: { default: logo() } },
        { component: NavbarEnd, slots: { default: { component: Button, slots: { default: 'Login' } } } },
      ],
    },
  },
};

// 1. Title only — one child, no regions at all. Also the bar at its barest:
// the only reason it is visible is the background this story adds (§3d).
export const TitleOnly = {
  render: () => [{ component: Navbar, props: { class: BAR }, slots: { default: logo() } }],
};

// 2. Title and icon — the **other** layout: `flex-1` grows, `flex-none` does
// not, which is not the same as two 50% halves (§3b). No part component is
// involved, and that is daisyUI's own markup.
export const TitleAndIcon = {
  render: () => [
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex-none">',
          iconButton(ICON.more),
          '</div>',
        ],
      },
    },
  ],
};

// 3. Icons at start and end — `flex-none`, `flex-1`, `flex-none`: the title
// takes the space the two icons leave.
export const IconsAtStartAndEnd = {
  render: () => [
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          '<div class="flex-none">',
          iconButton(ICON.menu),
          '</div>',
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex-none">',
          iconButton(ICON.more),
          '</div>',
        ],
      },
    },
  ],
};

// 4. Menu with a submenu — a horizontal `Menu` in the fixed region. The nested
// `<details>` is daisyUI's own disclosure submenu, which `Menu` styles without
// any prop of its own.
export const WithMenuAndSubmenu = {
  render: () => [
    {
      component: Navbar,
      props: { class: `${BAR} mb-32` },
      slots: {
        default: [
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex-none">',
          {
            component: Menu,
            props: { direction: 'horizontal', class: 'px-1' },
            slots: {
              default: [
                '<li><a>Link</a></li>',
                '<li><details><summary>Parent</summary>',
                '<ul class="bg-base-100 rounded-t-none p-2"><li><a>Link 1</a></li><li><a>Link 2</a></li></ul>',
                '</details></li>',
              ],
            },
          },
          '</div>',
        ],
      },
    },
  ],
};

// 5. Search input and dropdown — the region here is a plain `flex gap-2`,
// neither a part class nor `flex-1`. Three idioms in one component, which is
// the point of §3b.
export const WithSearchAndDropdown = {
  render: () => [
    {
      component: Navbar,
      props: { class: `${BAR} mb-32` },
      slots: {
        default: [
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex gap-2">',
          { component: TextInput, props: { type: 'text', placeholder: 'Search', class: 'w-24 md:w-auto' } },
          accountDropdown(),
          '</div>',
        ],
      },
    },
  ],
};

// 6. Icon, indicator and dropdown — two dropdowns side by side, one opening a
// `Card` instead of a menu. `IndicatorItem` carries the badge classes rather
// than nesting a `Badge`: daisyUI puts `badge badge-sm indicator-item` on one
// element, and nesting would produce two.
export const WithIconIndicatorAndDropdown = {
  render: () => [
    {
      component: Navbar,
      props: { class: `${BAR} mb-40` },
      slots: {
        default: [
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex-none">',
          {
            component: Dropdown,
            props: { align: 'end', triggerClass: 'btn btn-ghost btn-circle' },
            slots: {
              trigger: {
                component: Indicator,
                slots: {
                  default: [
                    ICON.cart,
                    { component: IndicatorItem, props: { class: 'badge badge-sm' }, slots: { default: '8' } },
                  ],
                },
              },
              default: {
                component: Card,
                props: { size: 'sm', tabindex: '0', class: 'dropdown-content bg-base-100 z-1 mt-3 w-52 shadow' },
                slots: {
                  default: {
                    component: CardBody,
                    slots: {
                      default: [
                        '<span class="text-lg font-bold">8 Items</span>',
                        '<span class="text-info">Subtotal: $999</span>',
                        {
                          component: CardActions,
                          slots: {
                            default: {
                              component: Button,
                              props: { color: 'primary', width: 'block' },
                              slots: { default: 'View cart' },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          accountDropdown(),
          '</div>',
        ],
      },
    },
  ],
};

// 7. Centre logo — the only doc example that uses all three part components,
// and it pairs the centre with **icon-only** sides on purpose: the centre does
// not shrink, so wide halves push it off rather than squeezing it (§3a).
export const CenterLogo = {
  render: () => [
    {
      component: Navbar,
      props: { class: `${BAR} mb-40` },
      slots: {
        default: [
          {
            component: NavbarStart,
            slots: {
              default: {
                component: Dropdown,
                props: { triggerClass: 'btn btn-ghost btn-circle' },
                slots: {
                  trigger: ICON.hamburger,
                  default: {
                    component: Menu,
                    props: {
                      size: 'sm',
                      tabindex: '-1',
                      class: 'dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow',
                    },
                    slots: { default: ['<li><a>Homepage</a></li>', '<li><a>Portfolio</a></li>', '<li><a>About</a></li>'] },
                  },
                },
              },
            },
          },
          { component: NavbarCenter, slots: { default: logo() } },
          {
            component: NavbarEnd,
            slots: {
              default: [
                iconButton(ICON.search, { shape: 'circle' }),
                {
                  component: Button,
                  props: { variant: 'ghost', shape: 'circle' },
                  slots: {
                    default: {
                      component: Indicator,
                      slots: {
                        default: [
                          ICON.bell,
                          {
                            component: IndicatorItem,
                            props: { class: 'badge badge-xs badge-primary' },
                            slots: { default: '' },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
};

// 8. Responsive — a hamburger dropdown below `lg`, a centre menu above it. The
// switch is two caller classes, `lg:hidden` and `hidden lg:flex`; daisyUI has
// no prop for it and neither does this component.
export const ResponsiveDropdownMenu = {
  render: () => [
    {
      component: Navbar,
      props: { class: `${BAR} mb-48` },
      slots: {
        default: [
          {
            component: NavbarStart,
            slots: {
              default: [
                {
                  component: Dropdown,
                  props: { triggerClass: 'btn btn-ghost lg:hidden' },
                  slots: {
                    trigger: ICON.hamburgerShort,
                    default: {
                      component: Menu,
                      props: {
                        size: 'sm',
                        tabindex: '-1',
                        class: 'dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow',
                      },
                      slots: {
                        default: [
                          '<li><a>Item 1</a></li>',
                          '<li><a>Parent</a><ul class="p-2"><li><a>Submenu 1</a></li><li><a>Submenu 2</a></li></ul></li>',
                          '<li><a>Item 3</a></li>',
                        ],
                      },
                    },
                  },
                },
                logo(),
              ],
            },
          },
          {
            component: NavbarCenter,
            props: { class: 'hidden lg:flex' },
            slots: {
              default: {
                component: Menu,
                props: { direction: 'horizontal', class: 'px-1' },
                slots: {
                  default: [
                    '<li><a>Item 1</a></li>',
                    '<li><details><summary>Parent</summary>',
                    '<ul class="bg-base-100 z-1 w-40 p-2"><li><a>Submenu 1</a></li><li><a>Submenu 2</a></li></ul>',
                    '</details></li>',
                    '<li><a>Item 3</a></li>',
                  ],
                },
              },
            },
          },
          { component: NavbarEnd, slots: { default: { component: Button, slots: { default: 'Button' } } } },
        ],
      },
    },
  ],
};

// 9. Responsive collapse — the bar becomes a `collapse` **only below `lg`**,
// which is `max-lg:collapse` on a wrapper the caller owns. Deliberately not the
// `Collapse` component: its root class is unconditional, its title is a slot
// rather than a class you add to something else, and this example's toggle is
// an outside `<label>` with a full-screen backdrop. The navbar inside it is the
// real component, carrying `collapse-title` as a caller class.
export const ResponsiveCollapse = {
  render: () => [
    '<div class="max-lg:collapse bg-base-200 lg:mb-48 w-full rounded-md shadow-sm">',
    '<input id="navbar-collapse-toggle" class="peer hidden" type="checkbox" autocomplete="off" />',
    '<label for="navbar-collapse-toggle" class="fixed inset-0 hidden max-lg:peer-checked:block"></label>',
    {
      component: Navbar,
      props: { class: 'collapse-title' },
      slots: {
        default: [
          {
            component: NavbarStart,
            slots: {
              default: [
                `<label for="navbar-collapse-toggle" class="btn btn-ghost lg:hidden">${ICON.hamburgerShort}</label>`,
                logo(),
              ],
            },
          },
          {
            component: NavbarCenter,
            props: { class: 'hidden lg:flex' },
            slots: {
              default: {
                component: Menu,
                props: { direction: 'horizontal', class: 'px-1' },
                slots: {
                  default: [
                    '<li><a>Item 1</a></li>',
                    '<li><details><summary>Parent</summary>',
                    '<ul class="bg-base-100 z-1 w-40 p-2"><li><a>Submenu 1</a></li><li><a>Submenu 2</a></li></ul>',
                    '</details></li>',
                    '<li><a>Item 3</a></li>',
                  ],
                },
              },
            },
          },
          {
            component: NavbarEnd,
            slots: {
              default: { component: TextInput, props: { type: 'text', placeholder: 'Search', class: 'w-64 lg:w-auto' } },
            },
          },
        ],
      },
    },
    '<div class="collapse-content z-1 lg:hidden">',
    {
      component: Menu,
      slots: {
        default: [
          '<li><a>Item 1</a></li>',
          '<li><a>Parent</a><ul><li><a>Submenu 1</a></li><li><a>Submenu 2</a></li></ul></li>',
          '<li><a>Item 3</a></li>',
        ],
      },
    },
    '</div></div>',
  ],
};

// 10. Colours — plain Tailwind on the bar, which is why there is no `color`
// prop (§3d). Note that `bg-base-300` needs no text colour to go with it.
export const Colors = {
  render: () =>
    ['bg-neutral text-neutral-content', 'bg-base-300', 'bg-primary text-primary-content'].map(
      (cls): Item => ({ component: Navbar, props: { class: cls }, slots: { default: logo() } }),
    ),
};

// Beyond the doc page: **the two idioms, same content, one above the other.**
// The top bar splits at 50/50 whatever the content is; the bottom one gives the
// title everything the buttons do not need. Neither is more correct — they
// answer different questions, and the names do not say so (§3b).
export const FiftyFiftyVsFlex = {
  render: () => [
    '<div class="flex flex-col gap-4">',
    '<div class="text-xs opacity-60">NavbarStart / NavbarEnd — two exact halves</div>',
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          { component: NavbarStart, slots: { default: logo() } },
          {
            component: NavbarEnd,
            slots: { default: [iconButton(ICON.search, { shape: 'circle' }), iconButton(ICON.more, { shape: 'circle' })] },
          },
        ],
      },
    },
    '<div class="text-xs opacity-60">flex-1 / flex-none — the title takes what is left</div>',
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          '<div class="flex-1">',
          logo(),
          '</div>',
          '<div class="flex-none">',
          iconButton(ICON.search, { shape: 'circle' }),
          iconButton(ICON.more, { shape: 'circle' }),
          '</div>',
        ],
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: **the centre is not centred by distributing space.** The
// second bar's start half outgrows its 50%, and because the centre is
// `flex-shrink: 0` the centre moves rather than shrinking (§3a). This is the
// failure the centre-logo example avoids by using icon-only sides.
export const LongLogoPushesCenter = {
  render: () => [
    '<div class="flex flex-col gap-4">',
    '<div class="text-xs opacity-60">short start — centre is centred</div>',
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          { component: NavbarStart, slots: { default: logo() } },
          { component: NavbarCenter, slots: { default: logo('CENTRE') } },
          { component: NavbarEnd, slots: { default: iconButton(ICON.more, { shape: 'circle' }) } },
        ],
      },
    },
    '<div class="text-xs opacity-60">long start — centre is pushed, not squeezed</div>',
    {
      component: Navbar,
      props: { class: BAR },
      slots: {
        default: [
          {
            component: NavbarStart,
            slots: { default: logo('A very long product name indeed') },
          },
          { component: NavbarCenter, slots: { default: logo('CENTRE') } },
          { component: NavbarEnd, slots: { default: iconButton(ICON.more, { shape: 'circle' }) } },
        ],
      },
    },
    '</div>',
  ],
};

// Regression guard, at both levels: native attributes survive on the bar and on
// each part, and `class` merges rather than replacing.
export const Passthrough = {
  render: () => [
    {
      component: Navbar,
      props: { id: 'nav-1', 'data-test': 'yes', style: 'letter-spacing:1px', class: `mine ${BAR}` },
      slots: {
        default: [
          { component: NavbarStart, props: { id: 'start-1', 'data-test': 'start', class: 'start-marker' }, slots: { default: 'Start' } },
          { component: NavbarCenter, props: { id: 'center-1', 'data-test': 'center', class: 'center-marker' }, slots: { default: 'Center' } },
          { component: NavbarEnd, props: { id: 'end-1', 'data-test': 'end', class: 'end-marker' }, slots: { default: 'End' } },
        ],
      },
    },
  ],
};
