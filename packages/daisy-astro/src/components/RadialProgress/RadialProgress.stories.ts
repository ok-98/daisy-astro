import RadialProgress from './RadialProgress.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/radial-progress/
export default {
  title: 'Components/RadialProgress',
  component: RadialProgress,
};

export const Default = {
  args: { slots: { default: 'RadialProgress' } },
};
