import Hero from './Hero.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/hero/
export default {
  title: 'Components/Hero',
  component: Hero,
};

export const Default = {
  args: { slots: { default: 'Hero' } },
};
