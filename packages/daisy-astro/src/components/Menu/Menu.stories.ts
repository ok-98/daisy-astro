import Menu from './Menu.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/menu/
export default {
  title: 'Components/Menu',
  component: Menu,
};

export const Default = {
  args: { slots: { default: 'Menu' } },
};
