import Alert from './Alert.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/alert/
export default {
  title: 'Components/Alert',
  component: Alert,
};

export const Default = {
  args: { slots: { default: 'Alert' } },
};
