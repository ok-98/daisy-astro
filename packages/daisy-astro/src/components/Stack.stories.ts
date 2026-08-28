import Stack from './Stack.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/stack/
export default {
  title: 'Components/Stack',
  component: Stack,
};

export const Default = {
  args: { slots: { default: 'Stack' } },
};
