import Swap from './Swap.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/swap/
export default {
  title: 'Components/Swap',
  component: Swap,
};

export const Default = {
  args: { slots: { default: 'Swap' } },
};
