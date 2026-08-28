import PhoneMockup from './PhoneMockup.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/phone-mockup/
export default {
  title: 'Components/PhoneMockup',
  component: PhoneMockup,
};

export const Default = {
  args: { slots: { default: 'PhoneMockup' } },
};
