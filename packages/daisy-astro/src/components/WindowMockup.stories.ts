import WindowMockup from './WindowMockup.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/window-mockup/
export default {
  title: 'Components/WindowMockup',
  component: WindowMockup,
};

export const Default = {
  args: { slots: { default: 'WindowMockup' } },
};
