import Drawer from './Drawer.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/drawer/
export default {
  title: 'Components/Drawer',
  component: Drawer,
};

export const Default = {
  args: { slots: { default: 'Drawer' } },
};
