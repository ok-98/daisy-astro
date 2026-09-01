import Drawer from './Drawer.astro';
import DrawerButton from './DrawerButton.astro';
import Menu from '../Menu/Menu.astro';

// `.drawer-side` is `position: fixed; height: 100dvh; z-index: 10`, so every
// story contains it the way daisyUI's own demos do — `h-56 rounded
// overflow-hidden` on the root and a raised z-index through `sideClass`.
// The component keeps emitting the published markup, which has neither
// (plan §5).
//
// **Every story uses a distinct `toggleId`.** Ids are document-global and
// Storybook renders several stories into one docs page, so a duplicate would
// silently wire one drawer's button to another's checkbox (plan §0a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const FRAME = 'h-56 rounded overflow-hidden';
const CENTER = 'flex flex-col items-center justify-center';

const menu = (cls = 'p-4 w-60 md:w-80 min-h-full bg-base-200'): Item => ({
  component: Menu,
  props: { class: cls },
  slots: {
    default: ['<li><button>Sidebar Item 1</button></li>', '<li><button>Sidebar Item 2</button></li>'],
  },
});

const openButton = (toggleId: string, cls = 'btn'): Item => ({
  component: DrawerButton,
  props: { toggleId, class: cls },
  slots: { default: 'Open drawer' },
});

const drawer = (props: Record<string, unknown>, content: Item | Item[], side: Item | Item[] = menu()): Item => ({
  component: Drawer,
  props: { class: FRAME, sideClass: 'z-1002', ...props },
  slots: { content, side },
});

const HAMBURGER =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';

const ICON = {
  panel:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>',
  home:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor" class="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>',
};

export default {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    toggleId: { control: 'text' },
    end: { control: 'boolean' },
    open: { control: 'boolean' },
    overlayLabel: { control: 'text' },
    contentClass: { control: 'text' },
    sideClass: { control: 'text' },
    toggleClass: { control: 'text' },
  },
};

export const Playground = {
  args: {
    toggleId: 'drawer-playground',
    class: FRAME,
    contentClass: CENTER,
    sideClass: 'z-1002',
    slots: { content: openButton('drawer-playground'), side: menu() },
  },
};

// 1. Drawer sidebar — click the button to slide the sidebar in, click the
// dimmed overlay to close it. No script anywhere.
export const Default = {
  render: () => [drawer({ toggleId: 'my-drawer-1', contentClass: CENTER }, openButton('my-drawer-1'))],
};

// 2. Navbar for desktop, drawer for mobile. The toggle itself carries
// `lg:hidden` here — a class on the input, which is why `toggleClass` exists
// (§3i).
export const NavbarAndDrawer = {
  render: () => [
    drawer({ toggleId: 'my-drawer-2', contentClass: 'flex flex-col', toggleClass: 'lg:hidden' }, [
      '<div class="w-full navbar bg-base-300"><div class="flex-none lg:hidden">',
      {
        component: DrawerButton,
        props: { toggleId: 'my-drawer-2', class: 'btn btn-square btn-ghost', 'aria-label': 'open sidebar' },
        slots: { default: HAMBURGER },
      },
      '</div><div class="flex-1 px-2 mx-2">Navbar Title</div><div class="flex-none hidden lg:block">',
      {
        component: Menu,
        props: { direction: 'horizontal' },
        slots: {
          default: ['<li><button>Navbar Item 1</button></li>', '<li><button>Navbar Item 2</button></li>'],
        },
      },
      '</div></div><div class="flex justify-center items-center grow">Content</div>',
    ]),
  ],
};

// 3. Responsive — a permanent column above `lg`, a toggleable overlay below.
// **`lg:drawer-open` is a caller class, not the `open` prop**: the prop's
// unconditional form is `AlwaysOpen` below, and it is a different thing (§3d).
export const ResponsiveOpen = {
  render: () => [
    drawer(
      {
        toggleId: 'my-drawer-3',
        class: `lg:drawer-open ${FRAME}`,
        contentClass: CENTER,
        sideClass: 'max-lg:z-1002',
      },
      openButton('my-drawer-3', 'btn lg:hidden'),
    ),
  ],
};

// 4. Responsive collapsible icon-only sidebar — the only example that uses
// daisyUI's two Tailwind **variants**, `is-drawer-open:` and `is-drawer-close:`.
// They are caller-side prefixes on ordinary utilities, generated by the plugin
// from scanned source, so there is no prop for them (§3e).
//
// The toggle carries `inline` here, which matters: `lg:drawer-open` sets
// `display: none` on it, and this example still needs it interactive so the
// rail can collapse at desktop width too (§3i).
export const IconOnly = {
  render: () => [
    drawer(
      {
        toggleId: 'my-drawer-4',
        class: 'lg:drawer-open h-80 rounded overflow-hidden',
        toggleClass: 'inline',
        sideClass: 'max-lg:top-16 lg:h-80 is-drawer-close:overflow-visible max-lg:z-1002',
      },
      [
        '<nav class="navbar w-full bg-base-300">',
        {
          component: DrawerButton,
          props: { toggleId: 'my-drawer-4', class: 'btn btn-square btn-ghost', 'aria-label': 'open sidebar' },
          slots: { default: ICON.panel },
        },
        '<div class="px-4">Navbar Title</div></nav><div class="p-4">Page Content</div>',
      ],
      [
        '<div class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">',
        {
          component: Menu,
          props: { class: 'w-full grow' },
          slots: {
            default: [
              `<li><button class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">${ICON.home}<span class="is-drawer-close:hidden">Homepage</span></button></li>`,
              `<li><button class="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">${ICON.settings}<span class="is-drawer-close:hidden">Settings</span></button></li>`,
            ],
          },
        },
        '</div>',
      ],
    ),
  ],
};

// 5. Opens from the right — `end` flips both the grid and the slide direction.
export const End = {
  render: () => [drawer({ toggleId: 'my-drawer-5', end: true, contentClass: CENTER }, openButton('my-drawer-5'))],
};

// Beyond the doc page: the `open` prop with no breakpoint. A **permanent
// column**, not a drawer that has been opened — daisyUI hides the toggle
// entirely, so there is nothing to click and the button below does nothing
// (§3d).
export const AlwaysOpen = {
  render: () => [
    drawer({ toggleId: 'my-drawer-always', open: true, contentClass: CENTER }, openButton('my-drawer-always')),
  ],
};

// Beyond the doc page: the focus ring, which is the one thing here that cannot
// be seen in a screenshot. **Tab into this story.** The checkbox is invisible
// but focusable, and daisyUI transfers its ring onto `label.drawer-button` —
// strip that class and the drawer has no visible keyboard affordance at all
// (§3c). The second button below is a plain label, for the comparison.
export const KeyboardFocus = {
  render: () => [
    drawer({ toggleId: 'my-drawer-kb', contentClass: `${CENTER} gap-2` }, [
      openButton('my-drawer-kb'),
      '<label for="my-drawer-kb" class="btn btn-outline">Plain label — no ring</label>',
    ]),
  ],
};

// Beyond the doc page: the overlay is an empty `<label>`, so its `aria-label`
// is the only accessible name it can have — and therefore has to be
// localisable (§3b).
export const OverlayLabel = {
  render: () => [
    drawer(
      { toggleId: 'my-drawer-label', overlayLabel: 'sluit zijbalk', contentClass: CENTER },
      openButton('my-drawer-label'),
    ),
  ],
};

// Regression guard: native attributes survive, `class` merges onto the root,
// and all three part-class props reach their own elements (§3f, §3i).
export const Passthrough = {
  args: {
    toggleId: 'my-drawer-pt',
    id: 'drawer-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: `mine ${FRAME}`,
    contentClass: 'content-marker',
    sideClass: 'side-marker z-1002',
    toggleClass: 'toggle-marker',
    slots: {
      content: {
        component: DrawerButton,
        props: { toggleId: 'my-drawer-pt', class: 'btn button-marker', id: 'drawer-button-1', 'data-test': 'button' },
        slots: { default: 'Open' },
      },
      side: menu(),
    },
  },
};
