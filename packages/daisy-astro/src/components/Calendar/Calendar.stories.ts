import Calendar from './Calendar.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/calendar/
export default {
  title: 'Components/Calendar',
  component: Calendar,
};

export const Default = {
  args: { slots: { default: 'Calendar' } },
};
