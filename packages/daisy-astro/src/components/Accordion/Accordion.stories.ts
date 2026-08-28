import Accordion from './Accordion.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/accordion/
export default {
  title: 'Components/Accordion',
  component: Accordion,
};

export const Default = {
  args: { slots: { default: 'Accordion' } },
};
