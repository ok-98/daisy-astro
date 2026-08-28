import Indicator from './Indicator.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/indicator/
export default {
  title: 'Components/Indicator',
  component: Indicator,
};

export const Default = {
  args: { slots: { default: 'Indicator' } },
};
