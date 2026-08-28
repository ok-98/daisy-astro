import Kbd from './Kbd.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/kbd/
export default {
  title: 'Components/Kbd',
  component: Kbd,
};

export const Default = {
  args: { slots: { default: 'Kbd' } },
};
