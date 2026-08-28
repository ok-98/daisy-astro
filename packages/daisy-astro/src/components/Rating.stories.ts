import Rating from './Rating.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/rating/
export default {
  title: 'Components/Rating',
  component: Rating,
};

export const Default = {
  args: { slots: { default: 'Rating' } },
};
