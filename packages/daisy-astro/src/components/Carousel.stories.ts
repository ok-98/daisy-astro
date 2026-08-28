import Carousel from './Carousel.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/carousel/
export default {
  title: 'Components/Carousel',
  component: Carousel,
};

export const Default = {
  args: { slots: { default: 'Carousel' } },
};
