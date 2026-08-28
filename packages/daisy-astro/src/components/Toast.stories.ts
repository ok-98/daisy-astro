import Toast from './Toast.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/toast/
export default {
  title: 'Components/Toast',
  component: Toast,
};

export const Default = {
  args: { slots: { default: 'Toast' } },
};
