import Steps from './Steps.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/steps/
export default {
  title: 'Components/Steps',
  component: Steps,
};

export const Default = {
  args: { slots: { default: 'Steps' } },
};
