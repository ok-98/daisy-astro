import Swap from './Swap.astro';
import SwapOn from './SwapOn.astro';
import SwapOff from './SwapOff.astro';
import SwapIndeterminate from './SwapIndeterminate.astro';

// The checkbox is caller markup and must come FIRST — every state selector is a
// general-sibling combinator (plan §3d). `autocomplete="off"` matches daisyUI's
// rendered examples: it stops the browser restoring a stale toggle on reload.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const CHECKBOX = '<input type="checkbox" autocomplete="off" />';

// daisyUI puts the state class on the <svg> itself in its icon examples. These
// stories wrap the icon in the component instead: the grid child is then the
// div, which works identically and keeps the story composed rather than raw.
const ICON = {
  volumeOn: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="fill-current"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg>',
  volumeOff: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" class="fill-current"><path d="M3,9H7L12,4V20L7,15H3V9M16.59,12L14,9.41L15.41,8L18,10.59L20.59,8L22,9.41L19.41,12L22,14.59L20.59,16L18,13.41L15.41,16L14,14.59L16.59,12Z" /></svg>',
  sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-10 w-10 fill-current"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-10 w-10 fill-current"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>',
  hamburger: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" class="fill-current"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" /></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512" class="fill-current"><polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" /></svg>',
} as const;

const on = (content: string): Item => ({ component: SwapOn, slots: { default: content } });
const off = (content: string): Item => ({ component: SwapOff, slots: { default: content } });

export default {
  title: 'Components/Swap',
  component: Swap,
  argTypes: {
    as: { control: 'inline-radio', options: ['label', 'div'] },
    active: { control: 'boolean' },
    effect: { control: 'inline-radio', options: [undefined, 'rotate', 'flip'] },
  },
};

export const Playground = {
  args: { slots: { default: [CHECKBOX, on('ON'), off('OFF')] } },
};

// 1. Swap text
export const SwapText = {
  args: { slots: { default: [CHECKBOX, on('ON'), off('OFF')] } },
};

// 2. Swap volume icons
export const VolumeIcons = {
  args: { slots: { default: [CHECKBOX, on(ICON.volumeOn), off(ICON.volumeOff)] } },
};

// 3. Swap icons with rotate effect
export const RotateEffect = {
  args: { effect: 'rotate', slots: { default: [CHECKBOX, on(ICON.sun), off(ICON.moon)] } },
};

// 4. Hamburger button — the swap classes compose onto a button's, which is why
// there is no `Button` here: daisyUI puts both class sets on one label.
export const HamburgerButton = {
  args: {
    effect: 'rotate',
    class: 'btn btn-circle',
    slots: { default: [CHECKBOX, off(ICON.hamburger), on(ICON.close)] },
  },
};

// 5. Swap icons with flip effect
export const FlipEffect = {
  args: { effect: 'flip', class: 'text-9xl', slots: { default: [CHECKBOX, on('😈'), off('😇')] } },
};

// 6. Activate using class name instead of checkbox — no input at all; the
// caller toggles `active` from their own code.
export const ActivateWithClass = {
  render: () => [
    '<div class="flex items-center gap-6">',
    { component: Swap, props: { class: 'text-6xl' }, slots: { default: [on('🥳'), off('🥶')] } },
    { component: Swap, props: { active: true, class: 'text-6xl' }, slots: { default: [on('🥳'), off('🥶')] } },
    '</div>',
  ],
};

// Beyond the doc page: the third state exists in daisyUI's CSS but has no doc
// example, because `indeterminate` is a DOM property with no HTML attribute.
// It is reachable only from the caller's own code, which is what the script
// below does — if the digits never change, the framework did not run it
// (plans/README.md §7), not the component.
export const Indeterminate = {
  render: () => [
    {
      component: Swap,
      props: { class: 'text-4xl' },
      slots: {
        default: [
          '<input type="checkbox" id="swap-indet" autocomplete="off" />',
          on('ON'),
          off('OFF'),
          { component: SwapIndeterminate, slots: { default: '—' } },
        ],
      },
    },
    `<script>
      (() => {
        const el = document.getElementById('swap-indet');
        if (el) el.indeterminate = true;
      })();
    </script>`,
  ],
};

// Beyond the doc page: the "on" child is hidden by default and revealed by the
// driver, so a swap holding only that child renders empty until toggled. Legal,
// and it looks broken (§3b).
export const OnlyOnChild = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>only a SwapOn — empty until toggled:</div>',
    { component: Swap, props: { class: 'text-4xl' }, slots: { default: [CHECKBOX, on('ON')] } },
    '<div>a pair — as intended:</div>',
    { component: Swap, props: { class: 'text-4xl' }, slots: { default: [CHECKBOX, on('ON'), off('OFF')] } },
    '</div>',
  ],
};

// Beyond the doc page: the two drivers must not be combined. `swap-active`'s
// rule is unconditional, so it overrides the checkbox and the left-hand control
// stops responding to clicks entirely (§3a).
export const ActiveAndCheckbox = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>active + checkbox — clicking does nothing:</div>',
    {
      component: Swap,
      props: { active: true, class: 'text-4xl' },
      slots: { default: [CHECKBOX, on('ON'), off('OFF')] },
    },
    '<div>checkbox alone — works:</div>',
    { component: Swap, props: { class: 'text-4xl' }, slots: { default: [CHECKBOX, on('ON'), off('OFF')] } },
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and `as`
// changes the tag.
export const Passthrough = {
  args: {
    as: 'div',
    active: true,
    effect: 'flip',
    id: 'swap-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-4xl',
    slots: { default: [on('ON'), off('OFF')] },
  },
};
