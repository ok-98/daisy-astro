import Table from './Table.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/table/
export default {
  title: 'Components/Table',
  component: Table,
};

export const Default = {
  args: { slots: { default: 'Table' } },
};
