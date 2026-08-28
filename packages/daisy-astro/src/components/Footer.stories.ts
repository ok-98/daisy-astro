import Footer from './Footer.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/footer/
export default {
  title: 'Components/Footer',
  component: Footer,
};

export const Default = {
  args: { slots: { default: 'Footer' } },
};
