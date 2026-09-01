import Dropdown from './Dropdown.astro';
import Menu from '../Menu/Menu.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';
import CardTitle from '../Card/CardTitle.astro';

// The panel carries `dropdown-content` on its **own** element and is a direct
// sibling of the trigger — this component does not wrap it, because two of
// daisyUI's rules are sibling selectors between the two (plan §2, §3f.1).
//
// Every story keeps the doc page's spacing (`mb-32`, `mt-32`, `my-16`): the
// panel is absolutely positioned and would otherwise be clipped by the canvas.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const PANEL_CLASS = 'dropdown-content z-1 bg-base-100 rounded-box w-52 p-2 shadow-sm';

// `tabindex="-1"` is on the panel in every doc example — it keeps the panel
// inside the trigger's `:focus-within` scope without adding a tab stop, and it
// is caller markup because the value varies (a card panel uses `0`).
const panel = (): Item => ({
  component: Menu,
  props: { tabindex: '-1', class: PANEL_CLASS },
  slots: { default: ['<li><button>Item 1</button></li>', '<li><button>Item 2</button></li>'] },
});

const dropdown = (props: Record<string, unknown>, label: string, content: Item | Item[] = panel()): Item => ({
  component: Dropdown,
  props: { triggerClass: 'm-1 btn', ...props },
  slots: { trigger: label, default: content },
});

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  argTypes: {
    method: { control: 'inline-radio', options: ['focus', 'details'] },
    from: { control: 'select', options: [undefined, 'top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: [undefined, 'start', 'center', 'end'] },
    hover: { control: 'boolean' },
    force: { control: 'select', options: [undefined, 'open', 'close'] },
    triggerClass: { control: 'text' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'mb-32',
    triggerClass: 'm-1 btn',
    slots: { trigger: 'Click to open', default: panel() },
  },
};

// 1. Using details and summary — native disclosure, and daisyUI hides the
// marker itself.
export const DetailsMethod = {
  render: () => [dropdown({ method: 'details', class: 'mb-32' }, 'open or close')],
};

// 2. Popover API and anchor positioning — **raw markup, and deliberately so**.
// This method has no wrapper at all: the trigger and the panel are siblings
// wired by three matching identifiers, `popovertarget` to `id` and
// `anchor-name` to `position-anchor`. There is nothing for a component to
// wrap, so it stays composition (§3b).
//
// It is also the method to reach for when a dropdown would be clipped — see
// `ClippedByOverflow`.
export const PopoverMethod = {
  render: () => [
    `<div class="mb-32">
      <button class="btn" popovertarget="popover-1" style="anchor-name:--anchor-1">Button</button>
      <ul class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" popover id="popover-1" style="position-anchor:--anchor-1">
        <li><button>Item 1</button></li>
        <li><button>Item 2</button></li>
      </ul>
    </div>`,
  ],
};

// 3. CSS focus — the default method. The trigger is a `div` with `role` and
// `tabindex`, not a `<button>`: Safari will not focus a button on click, so a
// button trigger would never open (§3a).
export const FocusMethod = {
  render: () => [
    '<div><div class="text-sm mb-4 text-center">Click outside to close</div>',
    dropdown({ class: 'mb-32' }, 'Click to open'),
    '</div>',
  ],
};

// 4–6. Alignment on the default side.
export const AlignStart = {
  render: () => [dropdown({ align: 'start', class: 'mb-32' }, 'Click ⬇️')],
};

export const AlignEnd = {
  render: () => [dropdown({ align: 'end', class: 'mb-32' }, 'Click ⬇️')],
};

export const AlignCenter = {
  render: () => [dropdown({ align: 'center', class: 'mb-32' }, 'Click ⬇️')],
};

// 7–9. From the top.
export const FromTop = {
  render: () => [dropdown({ from: 'top', class: 'mt-32' }, 'Click ⬆️')],
};

export const TopCenter = {
  render: () => [dropdown({ from: 'top', align: 'center', class: 'mt-32' }, 'Click ⬆️')],
};

export const TopEnd = {
  render: () => [dropdown({ from: 'top', align: 'end', class: 'mt-32' }, 'Click ⬆️')],
};

// 10–12. From the bottom, which is the default and still emittable.
export const FromBottom = {
  render: () => [dropdown({ from: 'bottom', class: 'mb-32' }, 'Click ⬇️')],
};

export const BottomCenter = {
  render: () => [dropdown({ from: 'bottom', align: 'center', class: 'mb-32' }, 'Click ⬇️')],
};

export const BottomEnd = {
  render: () => [dropdown({ from: 'bottom', align: 'end', class: 'mb-32' }, 'Click ⬇️')],
};

// 13–15. From the left — here `align` is **vertical** (§3c).
export const FromLeft = {
  render: () => [dropdown({ from: 'left', class: 'mb-16' }, 'Click ⬅️')],
};

export const LeftCenter = {
  render: () => [dropdown({ from: 'left', align: 'center', class: 'my-16' }, 'Click ⬅️')],
};

export const LeftEnd = {
  render: () => [dropdown({ from: 'left', align: 'end', class: 'mt-16' }, 'Click ⬅️')],
};

// 16–18. From the right.
export const FromRight = {
  render: () => [dropdown({ from: 'right', class: 'mb-16' }, 'Click ➡️')],
};

export const RightCenter = {
  render: () => [dropdown({ from: 'right', align: 'center', class: 'my-16' }, 'Click ➡️')],
};

export const RightEnd = {
  render: () => [dropdown({ from: 'right', align: 'end', class: 'mt-16' }, 'Click ➡️')],
};

// 19. On hover — additive: click and focus still work (§3e).
export const OnHover = {
  render: () => [dropdown({ hover: true, class: 'mb-32' }, 'Hover')],
};

// 20. Force open.
export const ForceOpen = {
  render: () => [dropdown({ force: 'open', class: 'mb-32' }, 'Button')],
};

// 21. Force close — will not open by any means.
export const ForceClose = {
  render: () => [dropdown({ force: 'close', class: 'mb-32' }, 'Button')],
};

// 22. A Card as the panel — any element can be the dropdown content, and this
// one takes `tabindex="0"` rather than `-1`, which is why the tabindex is the
// caller's to write.
export const CardAsDropdown = {
  render: () => [
    dropdown({ class: 'mb-32' }, 'Click', {
      component: Card,
      props: { tabindex: '0', size: 'sm', class: 'w-64 shadow-md dropdown-content z-1 bg-base-100' },
      slots: {
        default: {
          component: CardBody,
          slots: { default: '<p>This is a card. You can use any element as a dropdown.</p>' },
        },
      },
    }),
  ],
};

// 23. In a navbar — the panel opens from the trailing edge so it stays on
// screen.
export const InNavbar = {
  render: () => [
    '<div class="navbar mb-40 bg-base-200 w-full"><div class="ps-4"><button class="text-lg font-bold">daisyUI</button></div>',
    '<div class="flex justify-end grow px-2"><div class="flex items-stretch"><button class="btn btn-ghost rounded-field">Button</button>',
    dropdown({ align: 'end', triggerClass: 'btn btn-ghost rounded-field' }, 'Dropdown', {
      component: Menu,
      props: { tabindex: '-1', class: 'dropdown-content z-1 bg-base-200 rounded-box w-52 p-2 shadow-sm mt-4' },
      slots: { default: ['<li><button>Item 1</button></li>', '<li><button>Item 2</button></li>'] },
    }),
    '</div></div></div>',
  ],
};

// 24. Helper dropdown — a tiny circular trigger next to running text.
export const HelperDropdown = {
  render: () => [
    '<div class="mb-28 mt-6 flex gap-1 items-center">A normal text and a helper dropdown',
    dropdown(
      { align: 'end', triggerClass: 'btn btn-circle btn-ghost btn-xs text-info' },
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      {
        component: Card,
        props: { tabindex: '0', size: 'sm', class: 'shadow-sm dropdown-content z-1 bg-base-100 rounded-box w-64' },
        slots: {
          default: {
            component: CardBody,
            slots: {
              default: [
                { component: CardTitle, slots: { default: 'You needed more info?' } },
                '<p>Here is a description!</p>',
              ],
            },
          },
        },
      },
    ),
    '</div>',
  ],
};

// Beyond the doc page: the failure `z-index` cannot fix. The left dropdown is
// inside an `overflow-hidden` box, so its panel is **clipped**, `z-index: 999`
// and all. The right one is the popover method, which renders in the top layer
// and escapes (§3d).
export const ClippedByOverflow = {
  render: () => [
    '<div class="flex gap-8 items-start mb-32">',
    '<div class="overflow-hidden rounded-box border border-base-300 p-4 h-24 w-64"><div class="text-xs opacity-60 mb-2">inside overflow-hidden — clipped</div>',
    dropdown({ force: 'open' }, 'Open'),
    '</div>',
    `<div class="overflow-hidden rounded-box border border-base-300 p-4 h-24 w-64"><div class="text-xs opacity-60 mb-2">popover — escapes</div>
      <button class="btn" popovertarget="popover-clip" style="anchor-name:--anchor-clip">Open</button>
      <ul class="dropdown menu w-52 rounded-box bg-base-100 shadow-sm" popover id="popover-clip" style="position-anchor:--anchor-clip">
        <li><button>Item 1</button></li>
        <li><button>Item 2</button></li>
      </ul></div>`,
    '</div>',
  ],
};

// Beyond the doc page: `force="close"` together with `hover`. Every show rule
// is guarded with `:not(.dropdown-close)`, so this one refuses to open even
// under the mouse — close beats hover and beats `force="open"` (§3e).
export const ForceCloseBeatsOpen = {
  render: () => [
    '<div class="flex gap-8 mb-32">',
    dropdown({ hover: true }, 'hover — opens'),
    dropdown({ hover: true, force: 'close' }, 'hover + close — will not'),
    '</div>',
  ],
};

// Regression guard: native attributes survive, `class` merges after every
// modifier, and `triggerClass` reaches the trigger rather than the root.
export const Passthrough = {
  args: {
    from: 'top',
    align: 'end',
    hover: true,
    force: 'open',
    id: 'dropdown-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine mt-32',
    triggerClass: 'm-1 btn trigger-marker',
    slots: { trigger: 'Passthrough', default: panel() },
  },
};
