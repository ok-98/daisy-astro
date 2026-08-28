import Collapse from './Collapse.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/collapse/
export default {
  title: 'Components/Collapse',
  component: Collapse,
};

export const Default = {
  args: { slots: { default: 'Collapse' } },
};
