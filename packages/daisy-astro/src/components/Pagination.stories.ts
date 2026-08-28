import Pagination from './Pagination.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/pagination/
export default {
  title: 'Components/Pagination',
  component: Pagination,
};

export const Default = {
  args: { slots: { default: 'Pagination' } },
};
