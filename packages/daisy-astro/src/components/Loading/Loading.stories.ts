import Loading from './Loading.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/loading/
export default {
  title: 'Components/Loading',
  component: Loading,
};

export const Default = {
  args: { slots: { default: 'Loading' } },
};
