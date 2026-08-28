import Mask from './Mask.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/mask/
export default {
  title: 'Components/Mask',
  component: Mask,
};

export const Default = {
  args: { slots: { default: 'Mask' } },
};
