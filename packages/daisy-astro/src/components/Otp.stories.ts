import Otp from './Otp.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/otp/
export default {
  title: 'Components/Otp',
  component: Otp,
};

export const Default = {
  args: { slots: { default: 'Otp' } },
};
