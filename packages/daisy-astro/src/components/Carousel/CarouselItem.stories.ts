import CarouselItem from './CarouselItem.astro';
import Carousel from './Carousel.astro';

// A `CarouselItem` is only meaningful inside a `Carousel` — it is a flex child
// of a scroll-snap container — so both stories nest it in one.

const SRC = 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp';

const inCarousel = (props: Record<string, unknown>) => [
  {
    component: Carousel,
    props: { class: 'w-64 rounded-box' },
    slots: {
      default: [
        {
          component: CarouselItem,
          props,
          slots: { default: `<img src="${SRC}" class="w-full" alt="Tailwind CSS component" />` },
        },
        {
          component: CarouselItem,
          props: { class: 'w-full' },
          slots: { default: `<img src="${SRC}" class="w-full" alt="Tailwind CSS component" />` },
        },
      ],
    },
  },
];

export default {
  title: 'Components/Carousel/CarouselItem',
  component: CarouselItem,
  argTypes: { class: { control: 'text' } },
};

// No variant controls: this component has no variant props, because the snap
// modifiers belong to the parent (§3a).
export const Playground = {
  render: () => inCarousel({ class: 'w-full' }),
};

// Regression guard: native attributes survive and caller `class` merges. `id`
// is the one that matters — it is what anchor-link controls target (§2).
export const Passthrough = {
  render: () =>
    inCarousel({
      id: 'slide1',
      'data-test': 'yes',
      style: 'outline:1px dashed',
      class: 'mine w-full',
    }),
};
