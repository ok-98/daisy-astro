import HoverGallery from './HoverGallery.astro';

// The FIRST child is the resting frame, not a hover target — so these stories
// duplicate the first image, which is the shape that gives N hover targets for
// N images (plan §3a). `MissingRestingFrame` shows the alternative failing.

const img = (n: string, alt: string) =>
  `<img src="https://img.daisyui.com/images/stock/${n}.webp" alt="${alt}" />`;

const PHOTOS: Array<[string, string]> = [
  ['photo-1559703248-dcaaec9fab78', 'Sunset'],
  ['photo-1565098772267-60af42b81ef2', 'Forest'],
  ['photo-1572635148818-ef6fd45eb394', 'Portrait'],
  ['photo-1494253109108-2e30c049369b', 'Street'],
];

const gallery = (photos = PHOTOS) => photos.map(([n, alt]) => img(n, alt)).join('');

// The resting frame duplicates the first photo.
const withResting = (photos = PHOTOS) => img(photos[0][0], photos[0][1]) + gallery(photos);

export default {
  title: 'Components/HoverGallery',
  component: HoverGallery,
  argTypes: {
    as: { control: 'inline-radio', options: ['div', 'figure'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'h-64 w-96', slots: { default: withResting() } },
};

// 1. Hover gallery — hover across it and the image under the pointer takes
// over. The root has no height of its own, so one is supplied (§3d).
export const Default = {
  args: { class: 'h-64 w-96', slots: { default: withResting() } },
};

// 2. As a figure — daisyUI writes a `:is(figure)` arm into its own selector,
// which is this library's signal for exposing the element choice. Note the
// caption is **outside** the gallery: anything inside would become a hover
// strip (§3c).
export const AsFigure = {
  render: () => [
    '<figure class="w-96">',
    { component: HoverGallery, props: { as: 'figure', class: 'h-64 w-96' }, slots: { default: withResting() } },
    '<figcaption class="text-sm mt-2">Four photographs, one frame</figcaption></figure>',
  ],
};

// Beyond the doc page: the most likely first-use mistake. Without a duplicated
// resting frame the first image is consumed as the at-rest state and is never
// reachable by hovering — so four images give three targets (§3a).
export const MissingRestingFrame = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no resting frame — the first photo is unreachable:</div>',
    { component: HoverGallery, props: { class: 'h-48 w-96' }, slots: { default: gallery() } },
    '<div>first photo duplicated — all four reachable:</div>',
    { component: HoverGallery, props: { class: 'h-48 w-96' }, slots: { default: withResting() } },
    '</div>',
  ],
};

// Beyond the doc page: the gallery caps at ten children with no error, so a
// resting frame plus nine images is the maximum. The eleventh is display:none
// (§3b).
export const Overflow = {
  render: () => {
    const many = Array.from({ length: 11 }).map((_, i) => PHOTOS[i % PHOTOS.length]);
    return [
      '<div class="flex flex-col gap-4"><div>eleven children — the eleventh is dropped silently:</div>',
      { component: HoverGallery, props: { class: 'h-48 w-96' }, slots: { default: gallery(many) } },
      '</div>',
    ];
  },
};

// Regression guard: native attributes survive, caller `class` merges, and `as`
// changes the tag. `class` is load-bearing — the gallery has no height of its
// own (§3d).
export const Passthrough = {
  args: {
    as: 'figure',
    id: 'gallery-1',
    'data-test': 'yes',
    style: 'outline:1px dashed',
    class: 'mine h-64 w-96',
    slots: { default: withResting() },
  },
};
