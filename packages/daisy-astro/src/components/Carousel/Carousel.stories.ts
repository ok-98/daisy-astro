import Carousel from './Carousel.astro';
import CarouselItem from './CarouselItem.astro';

// daisyUI's Carousel is a CSS scroll-snap container. The "interactive" stories
// below are anchor links, not JS — see plans/components/carousel.md §0.
// Story shape and the sweep pattern: plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const img = (n: string) => `https://img.daisyui.com/images/stock/${n}.webp`;

// The seven photos the snap and full-bleed examples use.
const PHOTOS = [
  'photo-1559703248-dcaaec9fab78',
  'photo-1565098772267-60af42b81ef2',
  'photo-1572635148818-ef6fd45eb394',
  'photo-1494253109108-2e30c049369b',
  'photo-1550258987-190a2d41a8ba',
  'photo-1559181567-c3190ca9959b',
  'photo-1601004890684-d8cbf643f5f2',
].map(img);

// The four the anchor-link examples use.
const SLIDES = [
  'photo-1625726411847-8cbb60cc71e6',
  'photo-1609621838510-5ad474b7d25d',
  'photo-1414694762283-acccc27bca85',
  'photo-1665553365602-b2fb8e5d1707',
].map(img);

const item = (
  src: string,
  { itemClass = '', imgClass = '', alt = 'Tailwind CSS component', ...props }: Record<string, string> = {},
): Item => ({
  component: CarouselItem,
  props: { ...(itemClass ? { class: itemClass } : {}), ...props },
  slots: { default: `<img src="${src}" ${imgClass ? `class="${imgClass}" ` : ''}alt="${alt}" />` },
});

const photos = (opts: Record<string, string> = {}) => PHOTOS.map((src) => item(src, opts));

export default {
  title: 'Components/Carousel',
  component: Carousel,
  argTypes: {
    snap: { control: 'radio', options: [undefined, 'start', 'center', 'end'] },
    direction: { control: 'radio', options: [undefined, 'horizontal', 'vertical'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'w-96 rounded-box', slots: { default: photos() } },
};

// 1. Snap to start — daisyUI's default, so no prop.
export const SnapStart = {
  args: { class: 'rounded-box', slots: { default: photos() } },
};

// 2. Snap to center
export const SnapCenter = {
  args: { snap: 'center', class: 'rounded-box', slots: { default: photos() } },
};

// 3. Snap to end
export const SnapEnd = {
  args: { snap: 'end', class: 'rounded-box', slots: { default: photos() } },
};

// 4. Carousel with full width items — one slide at a time. The container is
// narrow and the items fill it; items never shrink on their own (§3c).
export const FullWidthItems = {
  args: {
    class: 'w-64 rounded-box',
    slots: { default: photos({ itemClass: 'w-full', imgClass: 'w-full' }) },
  },
};

// 5. Vertical carousel — needs a **height** on the container and `h-full` on
// the items, which is the pairing that is easy to get half right (§3d).
export const Vertical = {
  args: {
    direction: 'vertical',
    class: 'h-96 rounded-box',
    slots: {
      default: PHOTOS.map((src) => item(src, { itemClass: 'h-full', alt: 'Free Tailwind CSS Slider' })),
    },
  },
};

// 6. Carousel with half width items — two slides at a time.
export const HalfWidthItems = {
  args: {
    class: 'w-96 rounded-box',
    slots: { default: photos({ itemClass: 'w-1/2' }) },
  },
};

// 7. Full-bleed carousel. Note where the spacing lives: `p-4 space-x-4` on the
// **container** and `rounded-box` on the images, never padding on the items —
// which is §3b's content-box hazard avoided by construction.
export const FullBleed = {
  args: {
    snap: 'center',
    class: 'max-w-md p-4 space-x-4 bg-neutral rounded-box',
    slots: { default: photos({ imgClass: 'rounded-box' }) },
  },
};

// 8. Carousel with indicator buttons — the `id` on each item is the entire
// API here, and it arrives through native attribute passthrough (§2).
export const WithIndicators = {
  render: () => [
    {
      component: Carousel,
      props: { class: 'w-full' },
      slots: {
        default: SLIDES.map((src, i) =>
          item(src, {
            id: `item${i + 1}`,
            itemClass: 'w-full',
            imgClass: 'w-full',
            alt: 'Tailwind CSS gallery',
          }),
        ),
      },
    },
    '<div class="flex justify-center w-full py-2 gap-2">' +
      SLIDES.map((_, i) => `<a href="#item${i + 1}" class="btn btn-xs">${i + 1}</a>`).join('') +
      '</div>',
  ],
};

// 9. Carousel with next/prev buttons — each item holds an image plus an
// absolutely-positioned control bar, which is exactly the markup an `items`
// array prop would have made impossible (§2).
const navBar = (prev: number, next: number) =>
  '<div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">' +
  `<a href="#slide${prev}" class="btn btn-circle">❮</a>` +
  `<a href="#slide${next}" class="btn btn-circle">❯</a>` +
  '</div>';

export const WithNextPrev = {
  args: {
    class: 'w-full',
    slots: {
      default: SLIDES.map((src, i) => ({
        component: CarouselItem,
        props: { id: `slide${i + 1}`, class: 'relative w-full' },
        slots: {
          default:
            `<img src="${src}" class="w-full" alt="Tailwind CSS slide example" />` +
            navBar(((i + 3) % 4) + 1, ((i + 1) % 4) + 1),
        },
      })),
    },
  },
};

// Beyond the doc page: §3e's remedy, copyable. The first carousel cannot be
// reached by keyboard in Chrome or Safari — no focusable content, no
// scrollbar. The second can, and announces itself.
export const KeyboardAccessible = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>bare — not keyboard-reachable:</div>',
    { component: Carousel, props: { class: 'w-96 rounded-box' }, slots: { default: photos() } },
    '<div>tabindex + label — tab to it, then use the arrow keys:</div>',
    {
      component: Carousel,
      props: { class: 'w-96 rounded-box', tabindex: '0', 'aria-label': 'Product photos' },
      slots: { default: photos() },
    },
    '</div>',
  ],
};

// Beyond the doc page: items are `content-box`, so padding adds to the width
// rather than fitting inside it. The padded item overflows its slot and pushes
// the snap alignment off (§3b).
export const PaddedItem = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>w-full p-4 — wider than the container:</div>',
    {
      component: Carousel,
      props: { class: 'w-64 rounded-box' },
      slots: { default: photos({ itemClass: 'w-full p-4', imgClass: 'w-full' }) },
    },
    '<div>w-full — correct:</div>',
    {
      component: Carousel,
      props: { class: 'w-64 rounded-box' },
      slots: { default: photos({ itemClass: 'w-full', imgClass: 'w-full' }) },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
// `class` is load-bearing here — the carousel has no width of its own (§3d).
export const Passthrough = {
  args: {
    id: 'carousel-1',
    'data-test': 'yes',
    style: 'outline:1px dashed',
    class: 'mine w-96 rounded-box',
    slots: { default: photos() },
  },
};
