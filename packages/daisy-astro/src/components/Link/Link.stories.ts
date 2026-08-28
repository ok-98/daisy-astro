import Link from './Link.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/link/
export default {
  title: 'Components/Link',
  component: Link,
};

export const Default = {
  args: { slots: { default: 'Link' } },
};
