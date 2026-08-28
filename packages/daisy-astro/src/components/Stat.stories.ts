import Stat from './Stat.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/stat/
export default {
  title: 'Components/Stat',
  component: Stat,
};

export const Default = {
  args: { slots: { default: 'Stat' } },
};
