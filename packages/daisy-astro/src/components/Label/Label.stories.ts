import Label from './Label.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/label/
export default {
  title: 'Components/Label',
  component: Label,
};

export const Default = {
  args: { slots: { default: 'Label' } },
};
