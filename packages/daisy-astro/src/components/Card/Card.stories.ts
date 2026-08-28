import Card from './Card.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/card/
export default {
  title: 'Components/Card',
  component: Card,
};

export const Default = {
  args: { slots: { default: 'Card' } },
};
