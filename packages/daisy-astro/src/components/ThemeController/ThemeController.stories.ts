import ThemeController from './ThemeController.astro';
import Swap from '../Swap/Swap.astro';
import SwapOn from '../Swap/SwapOn.astro';
import SwapOff from '../Swap/SwapOff.astro';
import Toggle from '../Toggle/Toggle.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import Join from '../Join/Join.astro';
import Dropdown from '../Dropdown/Dropdown.astro';

// **These stories only work because the preview builds the themes they name.**
// `.storybook/preview.css` enables light, dark, synthwave, retro, cyberpunk,
// valentine and aqua; daisyUI 5 emits a theme's CSS only when it is listed, and
// a controller naming an unbuilt theme matches no selector and does nothing at
// all (plan §0a). `UnbuiltTheme` is that failure on purpose.
//
// Storybook renders each story in an iframe, so `:root` is the iframe's own
// `<html>` and a controller themes its own canvas rather than the manager.
//
// Radio stories use a distinct `name` each, as the doc page does: one shared
// name across the canvas would silently couple the groups.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const ctl = (props: Record<string, unknown>): Item => ({ component: ThemeController, props });

// daisyUI's rendered demos all carry `autocomplete="off"` while its copyable
// markup omits it: it stops the browser restoring a stale tick on reload, which
// would otherwise fight persisted-theme logic (plan §0g). It is caller markup
// here for the same reason it is in the Swap stories.
const OFF = { autocomplete: 'off' } as const;

const title = (theme: string) => theme[0].toUpperCase() + theme.slice(1);

const ICON = {
  sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-10 w-10 fill-current"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-10 w-10 fill-current"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>',
  sunSmall:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>',
  moonSmall:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>',
  sunStroke:
    '<svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>',
  moonStroke:
    '<svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>',
  caret:
    '<svg width="12px" height="12px" class="inline-block h-2 w-2 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>',
} as const;

// The five options every radio example on the doc page offers. The first is
// `"default"`, which names no theme on purpose: nothing matches, so the page
// falls back to its own default and the group has a reset (plan §0d).
const THEMES = ['default', 'retro', 'cyberpunk', 'valentine', 'aqua'] as const;

const row = (children: Item[]): Item[] => [
  '<label class="flex gap-2 cursor-pointer items-center">',
  ...children,
  '</label>',
];

export default {
  title: 'Components/ThemeController',
  component: ThemeController,
  argTypes: {
    theme: { control: 'text' },
    type: { control: 'inline-radio', options: ['checkbox', 'radio'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { theme: 'synthwave', class: 'toggle', autocomplete: 'off' },
};

// 1. Using a toggle — the appearance is Toggle's class on this same input,
// merged through `class`. There is no `appearance` prop, because every one of
// those classes belongs to a component with its own colour and size axes
// (plan §0c).
export const AsToggle = {
  args: { theme: 'synthwave', class: 'toggle', autocomplete: 'off' },
};

// 2. Using a checkbox — the same input, a different borrowed appearance.
export const AsCheckbox = {
  args: { theme: 'synthwave', class: 'checkbox', autocomplete: 'off' },
};

// 3. Using a swap — the input is **bare** and visually hidden, and the wrapper
// is the real `Swap`. This is the case that makes the component necessary: with
// no class of its own to carry, a prop on Toggle could not express it.
export const InsideSwap = {
  render: () => [
    {
      component: Swap,
      props: { effect: 'rotate' },
      slots: {
        default: [
          ctl({ theme: 'synthwave', ...OFF }),
          { component: SwapOff, slots: { default: ICON.sun } },
          { component: SwapOn, slots: { default: ICON.moon } },
        ],
      },
    },
  ],
};

// 4. Toggle with text — the wrapper is a plain label the caller owns, since
// `<input>` is void and this component has no slot to put the words in (§2).
export const ToggleWithText = {
  render: () => [
    '<label class="flex cursor-pointer gap-2">',
    '<span>Default</span>',
    ctl({ theme: 'synthwave', class: 'toggle', ...OFF }),
    '<span>Synthwave</span>',
    '</label>',
  ],
};

// 5. Toggle with icons — same wrapper, icons instead of words.
export const ToggleWithIcons = {
  render: () => [
    '<label class="flex cursor-pointer gap-2">',
    ICON.sunSmall,
    ctl({ theme: 'synthwave', class: 'toggle', ...OFF }),
    ICON.moonSmall,
    '</label>',
  ],
};

// 6. Toggle with icons inside — the second bare-input case: `Toggle as="label"`
// is the wrapper and addresses its two icons **by position**, so the input must
// come first and the icons must be flat siblings.
export const ToggleWithIconsInside = {
  render: () => [
    {
      component: Toggle,
      props: { as: 'label', class: 'text-base-content' },
      slots: { default: [ctl({ theme: 'synthwave', ...OFF }), ICON.sunStroke, ICON.moonStroke] },
    },
  ],
};

// 7. Toggle with custom colors — the doc page's Tailwind utilities, verbatim.
// They land on the same element as the daisyUI classes, which is the whole
// reason `class` merges rather than replacing.
export const ToggleCustomColors = {
  args: {
    theme: 'synthwave',
    autocomplete: 'off',
    class:
      'toggle bg-blue-600 text-blue-200 border-blue-700 checked:bg-yellow-100 checked:text-yellow-600 checked:border-yellow-400',
  },
};

// 8. Using a radio input — five controllers sharing one `name`, wrapped in the
// real `Fieldset`. The first is the reset (§0d).
export const AsRadioGroup = {
  render: () =>
    [
      {
        component: Fieldset,
        slots: {
          default: THEMES.flatMap((theme) =>
            row([
              ctl({ theme, type: 'radio', name: 'theme-radios', class: 'radio radio-sm', ...OFF }),
              title(theme),
            ]),
          ),
        },
      },
    ] as Item[],
};

// The reset, on its own and named: `theme="default"` matches no selector on
// purpose. Checking it un-checks every other controller in the group, no
// `:root:has(…)` rule applies, and the canvas returns to its default theme —
// which only works for radios, since unchecking is what a radio group does
// (§0d). "Fixing" the value to a real theme name breaks the reset.
export const ResetToDefault = {
  render: () => [
    {
      component: Fieldset,
      slots: {
        default: [
          ...row([
            ctl({ theme: 'default', type: 'radio', name: 'theme-reset', class: 'radio radio-sm', ...OFF }),
            'Default — matches nothing, resets the page',
          ]),
          ...row([
            ctl({ theme: 'synthwave', type: 'radio', name: 'theme-reset', class: 'radio radio-sm', ...OFF }),
            'Synthwave',
          ]),
        ],
      },
    },
  ],
};

// 9. Using a radio button — `Join` squares the shared corners with no prop, and
// `aria-label` **is** the visible label: an `<input type="radio">` styled as a
// button has no text node to hold one (§0i).
export const AsRadioButtons = {
  render: () =>
    [
      {
        component: Join,
        props: { direction: 'vertical' },
        slots: {
          default: THEMES.map((theme) =>
            ctl({
              theme,
              type: 'radio',
              name: 'theme-buttons',
              class: 'btn join-item',
              'aria-label': title(theme),
              ...OFF,
            }),
          ),
        },
      },
    ] as Item[],
};

// 10. Using a dropdown — the panel is a **bare** `<ul>` rather than the `Menu`
// component: daisyUI's own markup here carries only `dropdown-content`, and the
// menu class would add padding this example does not have.
export const InDropdown = {
  render: () =>
    [
      {
        component: Dropdown,
        props: { triggerClass: 'btn m-1', class: 'mb-72' },
        slots: {
          trigger: ['Theme', ICON.caret],
          default: [
            '<ul tabindex="-1" class="dropdown-content z-1 p-2 shadow-2xl bg-base-300 rounded-box w-52">',
            ...THEMES.flatMap((theme) => [
              '<li>',
              ctl({
                theme,
                type: 'radio',
                name: 'theme-dropdown',
                class: 'w-full btn btn-sm btn-block btn-ghost justify-start',
                'aria-label': title(theme),
                ...OFF,
              }),
              '</li>',
            ]),
            '</ul>',
          ],
        },
      },
    ] as Item[],
};

// Beyond the doc page: **the documented failure.** `cupcake` is a real daisyUI
// theme and is *not* in this preview's list, so no selector for it was ever
// built. The toggle ticks and nothing happens — no error, no warning, nowhere
// to look (§0a). Compare with the first row, which is the same markup naming a
// theme that was built.
export const UnbuiltTheme = {
  render: () => [
    '<div class="flex flex-col gap-3">',
    '<label class="flex cursor-pointer gap-2"><span>synthwave — built, works</span>',
    ctl({ theme: 'synthwave', class: 'toggle', ...OFF }),
    '</label>',
    '<label class="flex cursor-pointer gap-2"><span>cupcake — not built, does nothing</span>',
    ctl({ theme: 'cupcake', class: 'toggle', ...OFF }),
    '</label>',
    '</div>',
  ],
};

// Regression guard: native attributes survive, `class` merges rather than
// replacing, and the four attributes this component deliberately does **not**
// declare as props — `name`, `checked`, `autocomplete`, `aria-label` — all
// reach the element through the spread.
export const Passthrough = {
  render: () => [
    ctl({
      theme: 'synthwave',
      type: 'radio',
      id: 'tc-1',
      'data-test': 'yes',
      style: 'letter-spacing:1px',
      class: 'mine btn join-item',
      name: 'theme-pass',
      checked: true,
      autocomplete: 'off',
      'aria-label': 'Synthwave',
    }),
  ],
};
