import Divider from './Divider.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/divider/
export default {
  title: 'Components/Divider',
  component: Divider,
};

export const Default = {
  args: { slots: { default: 'Divider' } },
};
