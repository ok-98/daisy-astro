import Avatar from './Avatar.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/avatar/
export default {
  title: 'Components/Avatar',
  component: Avatar,
};

export const Default = {
  args: { slots: { default: 'Avatar' } },
};
