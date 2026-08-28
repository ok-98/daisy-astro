import HoverGallery from './HoverGallery.astro';

// Dummy story. One story per doc-page example + one per variant axis is still
// TODO — see plans/README.md §8: https://daisyui.com/components/hover-gallery/
export default {
  title: 'Components/HoverGallery',
  component: HoverGallery,
};

export const Default = {
  args: { slots: { default: 'HoverGallery' } },
};
