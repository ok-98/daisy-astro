import Skeleton from './Skeleton.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/skeleton/
export default {
  title: 'Components/Skeleton',
  component: Skeleton,
};

export const Default = {
  args: { slots: { default: 'Skeleton' } },
};
