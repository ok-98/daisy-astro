import TextRotate from './TextRotate.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/text-rotate/
export default {
  title: 'Components/TextRotate',
  component: TextRotate,
};

export const Default = {
  args: { slots: { default: 'TextRotate' } },
};
