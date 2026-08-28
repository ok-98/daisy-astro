import Breadcrumbs from './Breadcrumbs.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/breadcrumbs/
export default {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
};

export const Default = {
  args: { slots: { default: 'Breadcrumbs' } },
};
