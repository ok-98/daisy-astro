import Dropdown from './Dropdown.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/dropdown/
export default {
  title: 'Components/Dropdown',
  component: Dropdown,
};

export const Default = {
  args: { slots: { default: 'Dropdown' } },
};
