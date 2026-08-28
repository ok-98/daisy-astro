import Countdown from './Countdown.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/countdown/
export default {
  title: 'Components/Countdown',
  component: Countdown,
};

export const Default = {
  args: { slots: { default: 'Countdown' } },
};
