import Tab from './Tab.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/tab/
export default {
  title: 'Components/Tab',
  component: Tab,
};

export const Default = {
  args: { slots: { default: 'Tab' } },
};
