import Megamenu from './Megamenu.astro';
import MegamenuItem from './MegamenuItem.astro';
import Menu from '../Menu/Menu.astro';
import MenuTitle from '../Menu/MenuTitle.astro';
import Navbar from '../Navbar/Navbar.astro';
import NavbarStart from '../Navbar/NavbarStart.astro';
import NavbarCenter from '../Navbar/NavbarCenter.astro';
import NavbarEnd from '../Navbar/NavbarEnd.astro';
import Button from '../Button/Button.astro';

// **Every id here must be unique across the whole document**, not just within a
// story: Storybook's docs page renders all of them together, and a duplicate
// `popovertarget` would open some other story's panel. Hence one letter prefix
// per story (plan §3f.3).
//
// The mobile trigger button is caller markup on purpose — it lives outside the
// component and references its id (plan §3a). Each story that has one keeps
// daisyUI's `sm:hidden`, so it is invisible until the canvas is narrow.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// What daisyUI's own rendered demos put on the bar. `max-sm:megamenu-vertical`
// is the responsive form the `vertical` prop exists for (plan §3c).
const FRAME = 'max-sm:megamenu-vertical w-full p-2 border border-base-300';

const trigger = (id: string) => `<button class="btn sm:hidden" popovertarget="${id}">Menu</button>`;

const item = (
  itemId: string,
  label: string,
  panel: Item | Item[],
  props: Record<string, unknown> = {},
): Item => ({
  component: MegamenuItem,
  props: { itemId, ...props },
  slots: { trigger: label, default: panel },
});

const bar = (id: string, items: Item[], props: Record<string, unknown> = {}): Item => ({
  component: Megamenu,
  props: { id, class: FRAME, ...props },
  slots: { default: items },
});

const menu = (links: string[], props: Record<string, unknown> = {}): Item => ({
  component: Menu,
  props,
  slots: { default: links.map((l) => `<li><a>${l}</a></li>`) },
});

const PHOTO_A = 'https://img.daisyui.com/images/stock/photo-1559181567-c3190ca9959b.webp';
const PHOTO_B = 'https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp';

const ENTERPRISE = ['CRM software', 'Marketing management', 'Security', 'Consulting'];
const COMPANY = ['About us', 'Contact us', 'Privacy policy', 'Press kit'];

// A panel holding a two-column menu beside an image — the shape of daisyUI's
// two biggest examples. The nested `<ul>`s are raw because a submenu is a plain
// list inside an `<li>`, which `Menu` styles without being one itself.
const bigPanel = (photo: string, columns: Array<[string, string[]]>): Item[] => [
  '<div class="flex max-sm:flex-col items-start">',
  {
    component: Menu,
    props: { class: 'w-full md:menu-horizontal' },
    slots: {
      default: columns.map(
        ([head, links]) =>
          `<li><a>${head}</a><ul>${links.map((l) => `<li><a>${l}</a></li>`).join('')}</ul></li>`,
      ),
    },
  },
  `<img src="${photo}" class="md:max-w-sm max-md:w-auto" alt="Tailwind CSS megamenu" />`,
  '</div>',
];

export default {
  title: 'Components/Megamenu',
  component: Megamenu,
  argTypes: {
    id: { control: 'text' },
    width: { control: 'inline-radio', options: [undefined, 'wide', 'full'] },
    vertical: { control: 'boolean' },
    size: { control: 'inline-radio', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    id: 'mm-play',
    class: FRAME,
    slots: {
      default: [
        item('play1', 'One', '<div class="p-4">Content for the first item</div>'),
        item('play2', 'Two', '<div class="p-4">Content for the second item</div>'),
        item('play3', 'Three', '<div class="p-4">Content for the third item</div>'),
      ],
    },
  },
};

// 1. Responsive megamenu with small vertical menus — the default panel form.
// Each panel anchors itself to the button that opened it, with no anchor
// classes anywhere (plan §3e).
export const ResponsiveWithVerticalMenus = {
  render: () => [
    trigger('mm-a'),
    bar('mm-a', [
      item('a1', 'Services', menu(['Enterprise', 'CRM software', 'Security', 'Consulting'])),
      item('a2', 'AI', menu(['AI infrastructure', 'Image generation', 'MCP servers'])),
      item('a3', 'Cloud Solutions', menu(['Cloud computing', 'Storage solutions', 'Database services', 'CDN performance'])),
    ]),
  ],
};

// 2. Wide popovers — `width="wide"` makes each panel as wide as the bar. This
// is also the form that needs anchoring, and daisyUI's CSS does it itself:
// `.megamenu-wide` sets `anchor-name: --megamenu` here and `position-anchor` on
// the panels (plan §3e).
export const WidePopovers = {
  render: () => [
    trigger('mm-b'),
    bar(
      'mm-b',
      [
        item('b1', 'One', menu(['Enterprise', 'CRM software', 'Security', 'Consulting'], { direction: 'horizontal' })),
        item('b2', 'Two', menu(['AI infrastructure', 'Image generation', 'MCP servers'], { direction: 'horizontal' })),
        item('b3', 'Three', menu(['Cloud computing', 'Storage solutions', 'Database services'], { direction: 'horizontal' })),
      ],
      { width: 'wide' },
    ),
  ],
};

// 3. Menus with lots of links — panels wide enough to hold two menu columns and
// an image. daisyUI's *rendered* version of this example adds
// `[anchor-name:--megamenu-c]` and `[position-anchor:--megamenu-c]`; its
// published markup does not, and neither does this story, because
// `megamenu-wide` already carries the same wiring under a different name
// (plan §3e).
export const LotsOfLinks = {
  render: () => [
    trigger('mm-c'),
    bar(
      'mm-c',
      [
        item('c1', 'One', bigPanel(PHOTO_A, [['Enterprise', ENTERPRISE], ['Company', COMPANY]])),
        item('c2', 'Two', bigPanel(PHOTO_B, [['Enterprise', ENTERPRISE], ['Products', ['UI Kit', 'WordPress themes', 'Color picker app', 'Contact us']]])),
        item('c3', 'Three', [
          '<div class="flex max-sm:flex-col items-start">',
          {
            component: Menu,
            props: { class: 'w-full md:menu-horizontal' },
            slots: {
              default: [
                '<li><ul>',
                { component: MenuTitle, slots: { default: 'Solutions' } },
                '<li><a>Design</a></li><li><a>Development</a></li><li><a>Hosting</a></li>',
                '</ul></li>',
                '<li><ul>',
                { component: MenuTitle, slots: { default: 'Products' } },
                '<li><a>UI Kit</a></li><li><a>Cloud Platform</a></li>',
                '<li><ul><li><a>Auth management system</a></li><li><a>VScode theme</a></li></ul></li>',
                '</ul></li>',
                '<li><ul>',
                { component: MenuTitle, slots: { default: 'Company' } },
                ...COMPANY.map((l) => `<li><a>${l}</a></li>`),
                '</ul></li>',
              ],
            },
          },
          '</div>',
        ]),
      ],
      { width: 'wide' },
    ),
  ],
};

// 4. In a navbar — the megamenu sits in `NavbarCenter` and the mobile trigger
// in `NavbarEnd`, which is where a real page puts it (plan §3a). `width="full"`
// makes the panels span the page rather than the bar.
export const InNavbar = {
  render: () => [
    {
      component: Navbar,
      props: { class: 'bg-base-100 shadow-sm' },
      slots: {
        default: [
          { component: NavbarStart, slots: { default: { component: Button, props: { as: 'a', variant: 'ghost', class: 'text-xl' }, slots: { default: 'daisyUI' } } } },
          {
            component: NavbarCenter,
            slots: {
              default: bar(
                'mm-d',
                [
                  item('d1', 'One', bigPanel(PHOTO_A, [['Enterprise', ENTERPRISE], ['Company', COMPANY]])),
                  item('d2', 'Two', bigPanel(PHOTO_B, [['Enterprise', ENTERPRISE], ['Products', ['UI Kit', 'Color picker app']]])),
                  item('d3', 'Three', menu(['Design', 'Development', 'Hosting', 'Domain register'])),
                ],
                { width: 'full', class: 'max-sm:megamenu-vertical' },
              ),
            },
          },
          {
            component: NavbarEnd,
            slots: {
              default: [
                { component: Button, slots: { default: 'Login' } },
                trigger('mm-d'),
              ],
            },
          },
        ],
      },
    },
  ],
};

// 5. Without arrows — the chevron is an `::after` on the trigger, so it is
// removed with a Tailwind arbitrary variant rather than a daisyUI modifier.
// That is why there is no `arrow` prop and why `triggerClass` exists (§3d).
export const WithoutArrows = {
  render: () => [
    bar(
      'mm-e',
      [
        item('e1', 'One', '<div class="p-4">Content for the first item</div>', { triggerClass: 'after:content-none' }),
        item('e2', 'Two', '<div class="p-4">Content for the second item</div>', { triggerClass: 'after:content-none' }),
      ],
      { class: 'w-full p-2 border border-base-300' },
    ),
  ],
};

// 6. Sizes — `--size` and `--fontsize` per step, so the bar gets taller and the
// labels bigger together. `md` is daisyUI's default and looks identical to
// passing nothing.
export const Sizes = {
  render: () =>
    (['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size, i) =>
      bar(
        `mm-size-${size}`,
        [
          item(`s${i}1`, 'One', `<div class="p-4">Content for the first item</div>`),
          item(`s${i}2`, 'Two', `<div class="p-4">Content for the second item</div>`),
          item(`s${i}3`, 'Three', `<div class="p-4">Content for the third item</div>`),
        ],
        { size, class: 'w-full p-2 border border-base-300' },
      ),
    ),
};

// Beyond the doc page: **the ten-item cap.** daisyUI writes anchor rules for
// `:nth-of-type(1…10)` only, so the eleventh trigger keeps the base
// `--mm-anchor: --mm1` and its indicator lands on **One** instead of under it.
// Hover the last item to see it (plan §3b).
export const ElevenItems = {
  render: () => [
    bar(
      'mm-cap',
      Array.from({ length: 11 }, (_, i) =>
        item(`cap${i + 1}`, `${i + 1}`, `<div class="p-4">Item ${i + 1}${i === 10 ? ' — the eleventh' : ''}</div>`),
      ),
      { class: 'w-full p-2 border border-base-300' },
    ),
  ],
};

// Beyond the doc page: **why `MegamenuItem` renders a bare pair.** The second
// item here is wrapped in a `<div>`, which makes its trigger `:first-of-type`
// inside that wrapper — so it takes `--mm1` and its indicator sits under
// **One**. Written as raw markup, because the component makes this impossible
// (plan §3b).
export const WrappedItem = {
  render: () => [
    '<div class="megamenu w-full p-2 border border-base-300">',
    '<span class="megamenu-active"></span>',
    '<button popovertarget="w1">One — unwrapped</button>',
    '<div id="w1" popover><div class="p-4">Correct: the indicator follows this item.</div></div>',
    '<div>',
    '<button popovertarget="w2">Two — wrapped</button>',
    '<div id="w2" popover><div class="p-4">Wrong: :first-of-type inside the wrapper, so this reuses --mm1.</div></div>',
    '</div>',
    '</div>',
  ],
};

// Regression guard, at both levels: attributes survive on the bar and on the
// **panel**, `class` merges on both, and `triggerClass` reaches the trigger —
// which is the split `MegamenuItem` documents.
export const Passthrough = {
  render: () => [
    bar(
      'mm-pass',
      [
        item('pass1', 'One', '<div class="p-4">Panel</div>', {
          triggerClass: 'trigger-marker after:content-none',
          class: 'panel-marker p-2',
          'data-test': 'panel',
          style: 'letter-spacing:1px',
        }),
      ],
      {
        width: 'wide',
        size: 'lg',
        class: 'mine w-full p-2 border border-base-300',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
      },
    ),
  ],
};
