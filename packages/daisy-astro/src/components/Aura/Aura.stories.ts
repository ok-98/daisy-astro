import Aura from './Aura.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/aura/
export default {
  title: 'Components/Aura',
  component: Aura,
};

export const Default = {
  args: { slots: { default: 'Aura' } },
};
