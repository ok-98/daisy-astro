import Megamenu from './Megamenu.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/megamenu/
export default {
  title: 'Components/Megamenu',
  component: Megamenu,
};

export const Default = {
  args: { slots: { default: 'Megamenu' } },
};
