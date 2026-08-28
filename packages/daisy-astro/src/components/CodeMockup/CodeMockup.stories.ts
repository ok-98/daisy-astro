import CodeMockup from './CodeMockup.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/code-mockup/
export default {
  title: 'Components/CodeMockup',
  component: CodeMockup,
};

export const Default = {
  args: { slots: { default: 'CodeMockup' } },
};
