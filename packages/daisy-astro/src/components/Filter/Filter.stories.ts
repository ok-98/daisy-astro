import Filter from './Filter.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/filter/
export default {
  title: 'Components/Filter',
  component: Filter,
};

export const Default = {
  args: { slots: { default: 'Filter' } },
};
