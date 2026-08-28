import Timeline from './Timeline.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/timeline/
export default {
  title: 'Components/Timeline',
  component: Timeline,
};

export const Default = {
  args: { slots: { default: 'Timeline' } },
};
