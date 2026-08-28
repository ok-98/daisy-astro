import Status from './Status.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/status/
export default {
  title: 'Components/Status',
  component: Status,
};

export const Default = {
  args: { slots: { default: 'Status' } },
};
