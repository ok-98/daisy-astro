import Badge from './Badge.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/badge/
export default {
  title: 'Components/Badge',
  component: Badge,
};

export const Default = {
  args: { slots: { default: 'Badge' } },
};
