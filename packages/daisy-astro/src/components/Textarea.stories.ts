import Textarea from './Textarea.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/textarea/
export default {
  title: 'Components/Textarea',
  component: Textarea,
};

export const Default = {
  args: { slots: { default: 'Textarea' } },
};
