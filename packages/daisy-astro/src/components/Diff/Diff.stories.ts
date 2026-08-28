import Diff from './Diff.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/diff/
export default {
  title: 'Components/Diff',
  component: Diff,
};

export const Default = {
  args: { slots: { default: 'Diff' } },
};
