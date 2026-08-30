import Step from './Step.astro';
import Steps from './Steps.astro';

// A `Step` is an <li> and is only meaningful inside `Steps`, so every story
// here nests it in one — daisyUI selects `.steps .step` (plan §3a).

const inSteps = (props: Record<string, unknown>, label: string) => [
  {
    component: Steps,
    slots: {
      default: [
        { component: Step, props, slots: { default: label } },
        { component: Step, slots: { default: 'next' } },
      ],
    },
  },
];

export default {
  title: 'Components/Steps/Step',
  component: Step,
  argTypes: {
    color: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'],
    },
  },
};

export const Playground = {
  render: () => inSteps({ color: 'primary' }, 'Register'),
};

// `data-content` is a plain attribute, not a prop — including the empty-string
// case, which gives a blank circle (§3c).
export const DataContent = {
  render: () => inSteps({ color: 'success', 'data-content': '✓' }, 'Done'),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inSteps(
      {
        color: 'accent',
        id: 'step-1',
        'data-test': 'yes',
        style: 'letter-spacing:2px',
        class: 'mine',
      },
      'Passthrough',
    ),
};
