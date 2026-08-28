import Hover3dCard from './Hover3dCard.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/hover-3d-card/
export default {
  title: 'Components/Hover3dCard',
  component: Hover3dCard,
};

export const Default = {
  args: { slots: { default: 'Hover3dCard' } },
};
