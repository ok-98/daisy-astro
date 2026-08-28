import Tooltip from './Tooltip.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/tooltip/
export default {
  title: 'Components/Tooltip',
  component: Tooltip,
};

export const Default = {
  args: { slots: { default: 'Tooltip' } },
};
