import Fieldset from './Fieldset.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/fieldset/
export default {
  title: 'Components/Fieldset',
  component: Fieldset,
};

export const Default = {
  args: { slots: { default: 'Fieldset' } },
};
