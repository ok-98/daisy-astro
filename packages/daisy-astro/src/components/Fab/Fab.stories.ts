import Fab from './Fab.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/fab/
export default {
  title: 'Components/Fab',
  component: Fab,
};

export const Default = {
  args: { slots: { default: 'Fab' } },
};
