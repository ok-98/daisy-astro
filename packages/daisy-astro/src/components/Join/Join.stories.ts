import Join from './Join.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/join/
export default {
  title: 'Components/Join',
  component: Join,
};

export const Default = {
  args: { slots: { default: 'Join' } },
};
