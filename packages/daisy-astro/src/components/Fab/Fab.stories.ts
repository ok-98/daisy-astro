import Fab from './Fab.astro';
import Button from '../Button/Button.astro';

// `.fab` is `position: fixed`, so every story adds `absolute z-1` inside a
// relative box — exactly what daisyUI's own rendered examples do, while its
// copy-paste HTML shows the bare class (plan §0).
//
// These are focus-driven: click or tab to the trigger to open. Nothing here
// runs JavaScript.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const TRIGGER = 'btn btn-lg btn-circle';

// One round action button.
const action = (label: string): Item => ({
  component: Button,
  props: { size: 'lg', shape: 'circle' },
  slots: { default: label },
});

// A labelled action: the label and the button share one wrapper div, which is
// the child daisyUI positions — an array API could not express this (§2).
const labelled = (label: string, letter: string): Item[] => [
  `<div>${label} `,
  action(letter),
  '</div>',
];

// The doc page's demo frame.
const framed = (props: Record<string, unknown>, children: Item[]): Item[] => [
  '<div class="relative h-64 w-full bg-base-200 rounded-box">',
  {
    component: Fab,
    props: { class: 'absolute z-1', triggerClass: `${TRIGGER} btn-primary`, ...props },
    slots: { trigger: 'F', default: children },
  },
  '</div>',
];

export default {
  title: 'Components/Fab',
  component: Fab,
  argTypes: {
    flower: { control: 'boolean' },
    triggerClass: { control: 'text' },
  },
};

export const Playground = {
  render: () => framed({}, [action('A'), action('B'), action('C')]),
};

// 1. FAB and speed dial, vertical.
export const SpeedDial = {
  render: () => framed({}, [action('A'), action('B'), action('C')]),
};

// 3. With labels — each action is a wrapper div holding text and a button, so
// the whole row is one child of the FAB.
export const WithLabels = {
  render: () =>
    framed({ triggerClass: `${TRIGGER} btn-success` }, [
      ...labelled('Label B', 'A'),
      ...labelled('Label C', 'B'),
      ...labelled('Label D', 'C'),
    ]),
};

// 5. With a `fab-close` control. It is a **visual placeholder**, not a real
// button — daisyUI's own comment says it must not be focusable, so that
// clicking it lets focus leave and the FAB closes (§3b, §3c).
export const WithClose = {
  render: () =>
    framed({ triggerClass: `${TRIGGER} btn-info` }, [
      '<div class="fab-close">Close <span class="btn btn-circle btn-lg btn-error">✕</span></div>',
      ...labelled('Label A', 'A'),
      ...labelled('Label B', 'B'),
      ...labelled('Label C', 'C'),
    ]),
};

// 6. With a `fab-main-action`. Use this **or** `fab-close`, never both —
// daisyUI's frontmatter is explicit, and both sit over the trigger, which is
// what makes it fade and rotate away when open (§3c).
export const WithMainAction = {
  render: () =>
    framed({}, [
      '<div class="fab-main-action">Main Action <button class="btn btn-circle btn-secondary btn-lg">M</button></div>',
      ...labelled('Label A', 'A'),
      ...labelled('Label B', 'B'),
      ...labelled('Label C', 'C'),
    ]),
};

// 7. A single FAB — the default slot is optional, and with no actions nothing
// depends on focus at all (§3e).
export const SingleFab = {
  render: () => framed({}, []),
};

// 8. Flower speed dial — a quarter-circle arrangement, positioned by CSS
// trigonometry rather than by any script.
export const Flower = {
  render: () =>
    framed({ flower: true, triggerClass: `${TRIGGER} btn-success` }, [
      '<button class="fab-main-action btn btn-circle btn-lg">M</button>',
      action('A'),
      action('B'),
      action('C'),
      action('D'),
    ]),
};

// 9. Flower without a main action button.
export const FlowerWithoutMainAction = {
  render: () =>
    framed({ flower: true }, [action('A'), action('B'), action('C'), action('D')]),
};

// Beyond the doc page: flower mode recomputes its arc for each child count up
// to six and hides anything past it, so the fifth action here vanishes with no
// error — daisyUI's documented ceiling is four (§3d).
export const FlowerOverflow = {
  render: () =>
    framed({ flower: true }, [
      '<button class="fab-main-action btn btn-circle btn-lg">M</button>',
      action('A'),
      action('B'),
      action('C'),
      action('D'),
      action('E'),
    ]),
};

// Regression guard: native attributes survive, caller `class` merges on the
// root, and `triggerClass` reaches the trigger — in that direction.
export const Passthrough = {
  render: () => [
    '<div class="relative h-64 w-full bg-base-200 rounded-box">',
    {
      component: Fab,
      props: {
        id: 'fab-1',
        'data-test': 'yes',
        style: 'letter-spacing:1px',
        class: 'absolute z-1 mine',
        triggerClass: `${TRIGGER} btn-primary trigger-marker`,
      },
      slots: { trigger: 'F', default: [action('A'), action('B')] },
    },
    '</div>',
  ],
};
