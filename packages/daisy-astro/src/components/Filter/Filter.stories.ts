import Filter from './Filter.astro';
import Button from '../Button/Button.astro';

// Options compose the real Button with as="input" — daisyUI's own markup is
// `input.btn`, so this is composition rather than a coincidence (plan §0).
//
// `autocomplete="off"` matches daisyUI's rendered examples (its copy-paste HTML
// omits it): it stops the browser restoring a stale filter selection on reload,
// the same discrepancy Collapse and Drawer record.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// One option. The aria-label IS the visible text — an input has no children, so
// daisyUI draws the label through a pseudo-element (§3c).
const option = (name: string, label: string, type: 'radio' | 'checkbox' = 'radio'): Item => ({
  component: Button,
  props: { as: 'input', type, name, autocomplete: 'off', 'aria-label': label },
});

// The form root's reset: a native reset input, which needs `value` because
// daisyUI draws no × for it (§3b).
const resetInput = (): Item => ({
  component: Button,
  props: { as: 'input', type: 'reset', shape: 'square', value: '×' },
});

// The div root's reset: a radio in the same group carrying `filter-reset`,
// which draws its own × from CSS and needs no value (§3b).
const resetRadio = (name: string): Item => ({
  component: Button,
  props: {
    as: 'input',
    type: 'radio',
    name,
    autocomplete: 'off',
    'aria-label': 'All',
    class: 'filter-reset',
  },
});

const FRAMEWORKS = ['Svelte', 'Vue', 'React'];

export default {
  title: 'Components/Filter',
  component: Filter,
  argTypes: { as: { control: 'inline-radio', options: ['form', 'div'] } },
};

export const Playground = {
  args: {
    slots: { default: [resetInput(), ...FRAMEWORKS.map((f) => option('frameworks-play', f))] },
  },
};

// 1. Filter using an HTML form, radio buttons and a reset button — the default
// root, with real browser reset behaviour.
export const WithForm = {
  args: {
    slots: { default: [resetInput(), ...FRAMEWORKS.map((f) => option('frameworks-1', f))] },
  },
};

// 2. Filter without an HTML form — the fallback root, where the reset is a
// radio in the same group. Being part of the group is what unsets the others
// when it is chosen (§3a).
export const WithoutForm = {
  args: {
    as: 'div',
    slots: {
      default: [
        resetRadio('metaframeworks-2'),
        ...['Sveltekit', 'Nuxt', 'Next.js'].map((f) => option('metaframeworks-2', f)),
      ],
    },
  },
};

// 3. Filter using checkboxes — the same container, no prop. Checking a checkbox
// does **not** collapse the others, because the collapse selector excludes
// them, which is what lets one component serve single- and multi-select (§3d).
export const WithCheckboxes = {
  args: {
    slots: {
      default: [
        ...FRAMEWORKS.map((f) => option('frameworks-3', f, 'checkbox')),
        resetInput(),
      ],
    },
  },
};

// Beyond the doc page: the label is the content. An option without an
// `aria-label` renders as an empty zero-width pill — no text, no error — since
// an input has no children and daisyUI draws the label from that attribute
// (§3c).
export const MissingAriaLabel = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no aria-labels — three empty pills:</div>',
    {
      component: Filter,
      props: { as: 'div' },
      slots: {
        default: FRAMEWORKS.map(() => ({
          component: Button,
          props: { as: 'input', type: 'radio', name: 'frameworks-noaria', autocomplete: 'off' },
        })),
      },
    },
    '<div>labelled:</div>',
    {
      component: Filter,
      props: { as: 'div' },
      slots: { default: FRAMEWORKS.map((f) => option('frameworks-witharia', f)) },
    },
    '</div>',
  ],
};

// Beyond the doc page: the two reset controls are not interchangeable, and
// swapping them fails quietly — a `value` on a filter-reset radio does nothing,
// and a reset input without one is labelled "Reset" by the browser (§3b).
export const ResetMismatch = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>reset input with no value — the browser labels it "Reset":</div>',
    {
      component: Filter,
      slots: {
        default: [
          { component: Button, props: { as: 'input', type: 'reset', shape: 'square' } },
          ...FRAMEWORKS.map((f) => option('frameworks-mismatch', f)),
        ],
      },
    },
    '<div>with value="×" — correct:</div>',
    {
      component: Filter,
      slots: { default: [resetInput(), ...FRAMEWORKS.map((f) => option('frameworks-correct', f))] },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and `as`
// changes the tag.
export const Passthrough = {
  args: {
    as: 'div',
    id: 'filter-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    slots: {
      default: [
        resetRadio('frameworks-pass'),
        ...FRAMEWORKS.map((f) => option('frameworks-pass', f)),
      ],
    },
  },
};
