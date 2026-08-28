import BrowserMockup from './BrowserMockup.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/browser-mockup/
export default {
  title: 'Components/BrowserMockup',
  component: BrowserMockup,
};

export const Default = {
  args: { slots: { default: 'BrowserMockup' } },
};
