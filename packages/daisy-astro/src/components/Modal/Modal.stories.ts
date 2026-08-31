import Modal from './Modal.astro';
import ModalBox from './ModalBox.astro';
import ModalAction from './ModalAction.astro';
import Button from '../Button/Button.astro';

// All four daisyUI methods, from one component (plan §0). The trigger and the
// backdrop are caller markup in every case, because both differ per method.
//
// The dialog-method stories need a real `showModal()` call to open, so their
// trigger carries an inline handler exactly as the doc page's does. If clicking
// does nothing in the canvas, that is plans/README.md §7's script question, not
// the component.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const HEADING = '<h3 class="font-bold text-lg">Hello!</h3>';
const para = (text: string) => `<p class="py-4">${text}</p>`;

// daisyUI's close trick: submitting a `method="dialog"` form closes the dialog
// with no JavaScript (§3c).
const closeForm = (label = 'Close'): Item =>
  `<form method="dialog"><button class="btn">${label}</button></form>`;

const action = (...children: Item[]): Item => ({
  component: ModalAction,
  slots: { default: children },
});

const box = (...children: Item[]): Item => ({ component: ModalBox, slots: { default: children } });

const openButton = (id: string, label = 'open modal') =>
  `<button class="btn" onclick="${id}.showModal()">${label}</button>`;

export default {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {
    as: { control: 'inline-radio', options: ['dialog', 'div'] },
    open: { control: 'boolean' },
    position: { control: 'inline-radio', options: [undefined, 'top', 'middle', 'bottom'] },
    align: { control: 'inline-radio', options: [undefined, 'start', 'end'] },
  },
};

// Forced open with a `div` root, which is the honest way to show a modal in a
// static canvas — see `open`'s note about why that is not the same as a dialog
// being modal (§3b).
export const Playground = {
  args: {
    as: 'div',
    open: true,
    slots: {
      default: box(HEADING, para('Press ESC key or click the button below to close'), action(closeForm())),
    },
  },
};

// 1. Dialog modal.
export const DialogModal = {
  render: () => [
    openButton('my_modal_1'),
    {
      component: Modal,
      props: { id: 'my_modal_1' },
      slots: {
        default: box(HEADING, para('Press ESC key or click the button below to close'), action(closeForm())),
      },
    },
  ],
};

// 2. Dialog modal, closes when clicked outside — the backdrop is a sibling of
// the box, never a wrapper: it fills the same grid cell behind it (§3c).
export const DialogClickOutside = {
  render: () => [
    openButton('my_modal_2'),
    {
      component: Modal,
      props: { id: 'my_modal_2' },
      slots: {
        default: [
          box(HEADING, para('Press ESC key or click outside to close')),
          '<form method="dialog" class="modal-backdrop"><button>close</button></form>',
        ],
      },
    },
  ],
};

// 3. Dialog modal with a close button at the corner.
export const DialogCornerClose = {
  render: () => [
    openButton('my_modal_3'),
    {
      component: Modal,
      props: { id: 'my_modal_3' },
      slots: {
        default: box(
          '<form method="dialog"><button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>',
          HEADING,
          para('Press ESC key or click on ✕ button to close'),
        ),
      },
    },
  ],
};

// 4. Dialog modal with custom width — the width goes on the **box**, which is
// what owns it; the modal wrapper has none (§3e).
export const CustomWidth = {
  render: () => [
    openButton('my_modal_4'),
    {
      component: Modal,
      props: { id: 'my_modal_4' },
      slots: {
        default: {
          component: ModalBox,
          props: { class: 'w-11/12 max-w-5xl' },
          slots: {
            default: [HEADING, para('Click the button below to close'), action(closeForm())],
          },
        },
      },
    },
  ],
};

// 5. Responsive — bottom on small screens, middle above `sm`, as a caller
// class since daisyUI ships the prefixed variant itself (§3d).
export const Responsive = {
  render: () => [
    openButton('my_modal_5'),
    {
      component: Modal,
      props: { id: 'my_modal_5', position: 'bottom', class: 'sm:modal-middle' },
      slots: {
        default: box(HEADING, para('Press ESC key or click the button below to close'), action(closeForm())),
      },
    },
  ],
};

// 6. Popover modal — a `div` root plus the native `popover` attribute, opened
// by a button carrying `popovertarget`. The role default applies here, since a
// div has no dialog semantics of its own (§3a).
export const PopoverModal = {
  render: () => [
    '<button class="btn" popovertarget="my-modal-6">Open</button>',
    {
      component: Modal,
      props: { as: 'div', id: 'my-modal-6', popover: true },
      slots: {
        default: box(
          HEADING,
          para('Press ESC key or click the button below to close'),
          action('<button class="btn" popovertarget="my-modal-6" popovertargetaction="hide">close</button>'),
        ),
      },
    },
  ],
};

// 8. Modal using a checkbox — the legacy method. The toggle input is caller
// markup and must precede the modal, since daisyUI selects it as a sibling.
export const CheckboxModal = {
  render: () => [
    '<label for="my_modal_8" class="btn">open modal</label>',
    '<input type="checkbox" id="my_modal_8" class="modal-toggle" />',
    {
      component: Modal,
      props: { as: 'div' },
      slots: {
        default: box(
          '<h3 class="text-lg font-bold">Hello!</h3>',
          para('This modal works with a hidden checkbox!'),
          action('<label for="my_modal_8" class="btn">Close!</label>'),
        ),
      },
    },
  ],
};

// 10. Modal using an anchor link — the other legacy method, driven by the URL
// fragment.
export const AnchorModal = {
  render: () => [
    '<a href="#my_modal_10" class="btn">open modal</a>',
    {
      component: Modal,
      props: { as: 'div', id: 'my_modal_10' },
      slots: {
        default: box(
          '<h3 class="text-lg font-bold">Hello!</h3>',
          para('This modal works with anchor links'),
          action('<a href="#" class="btn">Yay!</a>'),
        ),
      },
    },
  ],
};

// Beyond the doc page: the two placement axes compose, which is why they are
// two props rather than one five-value union (§3d).
export const Placement = {
  render: () =>
    (['top', 'middle', 'bottom'] as const).flatMap((position) => [
      `<div class="mb-2">position="${position}" align="start"</div>`,
      {
        component: Modal,
        props: { as: 'div', open: true, position, align: 'start', class: 'relative h-40' },
        slots: { default: box(`<p>${position} / start</p>`) },
      },
    ]),
};

// Beyond the doc page: `open` forces visibility from CSS but does **not** make
// a dialog modal — no top layer, no focus trap, no inert background. Both of
// these look open; only the one opened with showModal() actually is (§3b).
export const OpenIsNotModal = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>open on a dialog root — visible, but not modal:</div>',
    {
      component: Modal,
      props: { open: true, class: 'relative h-40' },
      slots: { default: box('<p>class-forced open</p>') },
    },
    '<div>the same dialog opened properly:</div>',
    openButton('my_modal_open', 'showModal()'),
    {
      component: Modal,
      props: { id: 'my_modal_open' },
      slots: { default: box('<p>opened with showModal()</p>', action(closeForm())) },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, `as`
// changes the tag, and the role default applies only to the non-dialog roots.
export const Passthrough = {
  args: {
    as: 'div',
    open: true,
    position: 'top',
    align: 'end',
    id: 'modal-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    slots: {
      default: {
        component: ModalBox,
        props: { id: 'modal-box-1', 'data-test': 'box', class: 'box-marker' },
        slots: {
          default: [
            HEADING,
            para('Passthrough'),
            {
              component: ModalAction,
              props: { id: 'modal-action-1', 'data-test': 'action', class: 'action-marker' },
              slots: { default: { component: Button, slots: { default: 'Close' } } },
            },
          ],
        },
      },
    },
  },
};
