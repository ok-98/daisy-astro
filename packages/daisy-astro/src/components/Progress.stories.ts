import Progress from './Progress.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/progress/
export default {
  title: 'Components/Progress',
  component: Progress,
};

export const Default = {
  args: { slots: { default: 'Progress' } },
};
