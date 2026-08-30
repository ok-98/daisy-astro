import StepIcon from './StepIcon.astro';
import Step from './Step.astro';
import Steps from './Steps.astro';

// A `StepIcon` must be a direct child of a `Step`, which must be inside
// `Steps` — daisyUI selects it with a child combinator, and that same rule is
// what suppresses the step's number (plan §3c).

const inStep = (props: Record<string, unknown>, icon: string, label: string) => [
  {
    component: Steps,
    slots: {
      default: {
        component: Step,
        slots: { default: [{ component: StepIcon, props, slots: { default: icon } }, label] },
      },
    },
  },
];

export default {
  title: 'Components/Steps/StepIcon',
  component: StepIcon,
};

export const Playground = {
  render: () => inStep({}, '😍', 'Step 3'),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inStep(
      { id: 'icon-1', 'data-test': 'yes', style: 'letter-spacing:2px', class: 'mine' },
      '★',
      'Passthrough',
    ),
};
