import Fieldset from './Fieldset.astro';
import FieldsetLegend from './FieldsetLegend.astro';
import Label from '../Label/Label.astro';
import Join from '../Join/Join.astro';
import Button from '../Button/Button.astro';

// `.fieldset` is a single-column grid and its children are the rows, so
// everything here is a **flat sibling** — legend, label, input, helper text.
// `WrappedPair` shows what a convenience wrapper costs (plan §3c).
//
// The labels are the real `Label` component; the box classes are plain
// Tailwind, since daisyUI gives the fieldset no box of its own.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const BOX = 'w-xs bg-base-200 border border-base-300 p-4 rounded-box';

const legend = (text: string): Item => ({ component: FieldsetLegend, slots: { default: text } });

const label = (text: string, as = 'label'): Item => ({
  component: Label,
  props: { as },
  slots: { default: text },
});

// TODO(daisy-astro): compose <TextInput> here once it is implemented — see plans/components/fieldset.md §5
const input = (placeholder: string, type = 'text', cls = 'input') =>
  `<input type="${type}" class="${cls}" placeholder="${placeholder}" />`;

export default {
  title: 'Components/Fieldset',
  component: Fieldset,
  argTypes: { class: { control: 'text' }, disabled: { control: 'boolean' } },
};

export const Playground = {
  args: {
    class: BOX,
    slots: {
      default: [
        legend('Page title'),
        input('My awesome page'),
        label('You can edit page title later on from settings', 'p'),
      ],
    },
  },
};

// 1. Legend and label — no box at all, which is what a bare `Fieldset` is.
// The helper text is a `Label` rendered as a `<p>`, exactly as the doc page
// writes it.
export const Default = {
  args: {
    class: 'w-xs',
    slots: {
      default: [
        legend('Page title'),
        input('My awesome page'),
        label('You can edit page title later on from settings', 'p'),
      ],
    },
  },
};

// 2. With background and border — the same content, plus four caller classes.
export const WithBox = {
  args: {
    class: BOX,
    slots: {
      default: [
        legend('Page title'),
        input('My awesome page'),
        label('You can edit page title later on from settings', 'p'),
      ],
    },
  },
};

// 3. Multiple inputs — six flat children, one grid row each. That flatness is
// deliberate on the doc page and is what keeps the rhythm even (§3c).
export const MultipleInputs = {
  args: {
    class: BOX,
    slots: {
      default: [
        legend('Page details'),
        label('Title'),
        input('My awesome page'),
        label('Slug'),
        input('my-awesome-page'),
        label('Author'),
        input('Name'),
      ],
    },
  },
};

// 4. With a join — here the wrapper is the point rather than a mistake: a
// `Join` is one control, so it belongs in one grid row.
export const WithJoin = {
  args: {
    class: BOX,
    slots: {
      default: [
        legend('Settings'),
        {
          component: Join,
          slots: {
            default: [
              input('Product name', 'text', 'input join-item'),
              { component: Button, props: { class: 'join-item' }, slots: { default: 'save' } },
            ],
          },
        },
      ],
    },
  },
};

// 5. Login form.
export const LoginForm = {
  args: {
    class: BOX,
    slots: {
      default: [
        legend('Login'),
        label('Email'),
        input('Email', 'email'),
        label('Password'),
        input('Password', 'password'),
        { component: Button, props: { color: 'neutral', class: 'mt-4' }, slots: { default: 'Login' } },
      ],
    },
  },
};

// Beyond the doc page: `disabled` on the fieldset. Nothing is passed to the
// controls — the native element disables everything it contains, and greys it
// out, for free (§3a).
export const Disabled = {
  args: {
    disabled: true,
    class: BOX,
    slots: {
      default: [
        legend('Login (disabled)'),
        label('Email'),
        input('Email', 'email'),
        label('Password'),
        input('Password', 'password'),
        { component: Button, props: { color: 'neutral', class: 'mt-4' }, slots: { default: 'Login' } },
      ],
    },
  },
};

// Beyond the doc page: the wrapper trap. The left fieldset keeps its children
// flat; the right one wraps each label/input pair in a div, which makes the
// pair a single grid row and collapses the `.375rem` gap inside it (§3c).
export const WrappedPair = {
  render: () => [
    '<div class="flex gap-6 items-start">',
    {
      component: Fieldset,
      props: { class: BOX },
      slots: {
        default: [legend('Flat — correct'), label('Title'), input('My awesome page'), label('Slug'), input('my-awesome-page')],
      },
    },
    {
      component: Fieldset,
      props: { class: BOX },
      slots: {
        default: [
          legend('Wrapped — gap lost'),
          '<div>',
          label('Title'),
          input('My awesome page'),
          '</div><div>',
          label('Slug'),
          input('my-awesome-page'),
          '</div>',
        ],
      },
    },
    '</div>',
  ],
};

// Regression guard, at two levels: native attributes survive on the fieldset
// and on the legend, and `class` merges on both.
export const Passthrough = {
  args: {
    id: 'fieldset-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    form: 'some-form',
    class: `mine ${BOX}`,
    slots: {
      default: [
        {
          component: FieldsetLegend,
          props: { id: 'legend-1', 'data-test': 'legend', class: 'legend-marker' },
          slots: { default: 'Passthrough' },
        },
        input('My awesome page'),
      ],
    },
  },
};
