import Select from './Select.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/select/
export default {
  title: 'Components/Select',
  component: Select,
};

export const Default = {
  args: { slots: { default: 'Select' } },
};
