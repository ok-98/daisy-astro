import List from './List.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/list/
export default {
  title: 'Components/List',
  component: List,
};

export const Default = {
  args: { slots: { default: 'List' } },
};
