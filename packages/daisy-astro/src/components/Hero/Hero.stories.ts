import Hero from './Hero.astro';
import HeroContent from './HeroContent.astro';
import HeroOverlay from './HeroOverlay.astro';
import Button from '../Button/Button.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';
import Fieldset from '../Fieldset/Fieldset.astro';
import Label from '../Label/Label.astro';
import TextInput from '../TextInput/TextInput.astro';
import Link from '../Link/Link.astro';

// Every story uses `min-h-[30rem]` rather than the doc page's `min-h-screen`,
// exactly as daisyUI's own rendered demos do — a viewport-height hero in the
// canvas hides everything else (plan §5).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const FRAME = 'min-h-[30rem] rounded bg-base-200';
const BLURB =
  'Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.';
const PHOTO = 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp';
const BACKDROP = 'https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp';

const cta = (label = 'Get Started'): Item => ({
  component: Button,
  props: { color: 'primary' },
  slots: { default: label },
});

const copy = (heading: string, headingClass = 'text-5xl font-bold', blurbClass = 'py-6'): Item[] => [
  `<h3 class="${headingClass}">${heading}</h3><p class="${blurbClass}">${BLURB}</p>`,
];

const hero = (children: Item[], props: Record<string, unknown> = {}): Item => ({
  component: Hero,
  props: { class: FRAME, ...props },
  slots: { default: children },
});

const content = (children: Item[], cls = ''): Item => ({
  component: HeroContent,
  props: cls ? { class: cls } : {},
  slots: { default: children },
});

export default {
  title: 'Components/Hero',
  component: Hero,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: FRAME,
    slots: {
      default: content([`<div class="max-w-md">`, ...copy('Hello there'), cta(), '</div>'], 'text-center'),
    },
  },
};

// 1. Centred hero — `place-items: center` on the grid does the centring, and
// only has something to centre because the hero has a height (§3c).
export const Centered = {
  render: () => [
    hero([content(['<div class="max-w-md">', ...copy('Hello there'), cta(), '</div>'], 'text-center')]),
  ],
};

// 2. With a figure — `flex-col lg:flex-row` on the **content** is what stacks
// it on mobile. `hero-content` is a flex row by default and daisyUI has no prop
// for the breakpoint (§3c).
export const WithFigure = {
  render: () => [
    hero([
      content(
        [
          `<img src="${PHOTO}" class="max-w-sm rounded-lg shadow-2xl" alt="Tailwind CSS hero component" />`,
          '<div>',
          ...copy('Box Office News!'),
          cta(),
          '</div>',
        ],
        'flex-col lg:flex-row',
      ),
    ]),
  ],
};

// 3. Reversed — the same content class with `-reverse`.
export const WithFigureReversed = {
  render: () => [
    hero([
      content(
        [
          `<img src="${PHOTO}" class="max-w-sm rounded-lg shadow-2xl" alt="Tailwind CSS hero component" />`,
          '<div>',
          ...copy('Box Office News!'),
          cta(),
          '</div>',
        ],
        'flex-col lg:flex-row-reverse',
      ),
    ]),
  ],
};

// 4. With a form — composes the real `Card`, `Fieldset`, `Label`, `TextInput`,
// `Link` and `Button`.
export const WithForm = {
  render: () => [
    hero([
      content(
        [
          '<div class="text-center lg:text-left">',
          ...copy('Login now!'),
          '</div>',
          {
            component: Card,
            props: { class: 'shrink-0 w-full max-w-sm shadow-2xl bg-base-100' },
            slots: {
              default: {
                component: CardBody,
                slots: {
                  default: {
                    component: Fieldset,
                    slots: {
                      default: [
                        { component: Label, props: { as: 'label' }, slots: { default: 'Email' } },
                        { component: TextInput, props: { type: 'email', placeholder: 'Email' } },
                        { component: Label, props: { as: 'label' }, slots: { default: 'Password' } },
                        { component: TextInput, props: { type: 'password', placeholder: 'Password' } },
                        '<div>',
                        { component: Link, props: { as: 'span', hover: true }, slots: { default: 'Forgot password?' } },
                        '</div>',
                        { component: Button, props: { color: 'neutral', class: 'mt-4' }, slots: { default: 'Login' } },
                      ],
                    },
                  },
                },
              },
            },
          },
        ],
        'flex-col lg:flex-row-reverse',
      ),
    ]),
  ],
};

// 5. With an overlay image — the photo is an **inline style** on the hero,
// since daisyUI ships no class for it (§3b). The overlay dims it; the content
// stays readable because `hero-content` isolates itself above the tint with no
// `z-index` (§0).
export const WithOverlay = {
  render: () => [
    hero(
      [
        { component: HeroOverlay, props: { class: 'rounded' } },
        content(['<div class="max-w-md">', ...copy('Hello there', 'mb-5 text-5xl font-bold', 'mb-5'), cta(), '</div>'], 'text-center text-neutral-content'),
      ],
      { class: 'min-h-[30rem] rounded', style: `background-image: url(${BACKDROP});` },
    ),
  ],
};

// Beyond the doc page: **the same hero with the overlay written last.** Every
// child shares one grid cell, so this is identical to `WithOverlay` — worth
// seeing once, so nobody reorders a working hero trying to fix it (§3d).
export const OverlayOrder = {
  render: () => [
    hero(
      [
        content(['<div class="max-w-md">', ...copy('Overlay written last', 'mb-5 text-5xl font-bold', 'mb-5'), cta(), '</div>'], 'text-center text-neutral-content'),
        { component: HeroOverlay, props: { class: 'rounded' } },
      ],
      { class: 'min-h-[30rem] rounded', style: `background-image: url(${BACKDROP});` },
    ),
  ],
};

// Beyond the doc page: **no height.** daisyUI gives the hero a width and no
// height, so this one is exactly as tall as its content and the centring has
// nothing to centre. Correct rather than broken, and the first thing to check
// when a hero "does nothing" (§3c).
export const NoHeight = {
  render: () => [
    '<div class="flex flex-col gap-4"><div class="text-xs opacity-60">with min-h-[30rem]</div>',
    hero([content(['<div class="max-w-md">', ...copy('Hello there'), cta(), '</div>'], 'text-center')]),
    '<div class="text-xs opacity-60">no height — collapses to its content</div>',
    hero([content(['<div class="max-w-md">', ...copy('Hello there'), cta(), '</div>'], 'text-center')], {
      class: 'rounded bg-base-200',
    }),
    '</div>',
  ],
};

// Regression guard, at three levels: native attributes survive on the hero, the
// content and the overlay, and `class` merges on all three. The `style` here is
// also what carries a background image (§3b).
export const Passthrough = {
  render: () => [
    hero(
      [
        {
          component: HeroOverlay,
          props: { id: 'overlay-1', 'data-test': 'overlay', class: 'overlay-marker rounded' },
        },
        {
          component: HeroContent,
          props: { id: 'content-1', 'data-test': 'content', class: 'content-marker text-center text-neutral-content' },
          slots: { default: '<div class="max-w-md">Passthrough</div>' },
        },
      ],
      {
        id: 'hero-1',
        'data-test': 'yes',
        class: 'mine min-h-[30rem] rounded',
        style: `background-image: url(${BACKDROP}); letter-spacing:1px`,
      },
    ),
  ],
};

