import Aura from './Aura.astro';
import Button from '../Button/Button.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';

// Both children compose the real components now that Card is implemented.

const card = (text: string, extra = '') => ({
  component: Card,
  props: { class: `bg-base-100 ${extra}`.trim() },
  slots: { default: { component: CardBody, slots: { default: `<p>${text}</p>` } } },
});

const button = (label = 'button with aura') => ({
  component: Button,
  slots: { default: label },
});

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const aura = (props: Record<string, unknown>, child: Item): Item => ({
  component: Aura,
  props,
  slots: { default: child },
});

const row = (...items: Item[]): Item[] => ['<div class="flex flex-wrap items-center gap-6">', ...items, '</div>'];

export default {
  title: 'Components/Aura',
  component: Aura,
  argTypes: {
    variant: {
      control: 'select',
      options: [undefined, 'dual', 'rainbow', 'holo', 'gold', 'silver', 'glow'],
    },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export const Playground = {
  args: { variant: 'rainbow', slots: { default: card('This card has aura') } },
};

// 1. Aura around a card
export const AroundACard = {
  args: { slots: { default: card('This card has aura') } },
};

// 2. Aura around a button — the story that matters for the radius check: the
// wrapped element's own corner radius is picked up by daisyUI, and a button
// makes a mismatch obvious where a card would look fine either way (§3b).
export const AroundAButton = {
  args: { slots: { default: button() } },
};

// 3–8. The six style variants.
export const Dual = { args: { variant: 'dual', slots: { default: card('This card has aura') } } };
export const Rainbow = { args: { variant: 'rainbow', slots: { default: card('This card has aura') } } };
export const Holo = { args: { variant: 'holo', slots: { default: card('This card has aura') } } };
export const Glow = { args: { variant: 'glow', slots: { default: card('This card has aura') } } };
export const Gold = { args: { variant: 'gold', slots: { default: card('This card has aura') } } };
export const Silver = { args: { variant: 'silver', slots: { default: card('This card has aura') } } };

// 9. Aura with custom color — a text utility, not a prop, because the gradient
// is drawn from `currentColor` (§3a).
export const CustomColor = {
  args: { class: 'text-orange-600', slots: { default: card('This card has aura', 'text-base-content') } },
};

// 10. Aura with custom color and background — the pseudo-elements inherit the
// background colour, so a second caller class fills behind the glow.
export const CustomColorAndBackground = {
  args: {
    class: 'text-orange-600 bg-yellow-200',
    slots: { default: card('This card has aura', 'text-base-content') },
  },
};

// 11. Aura rainbow around a pricing card — the doc page's own wide example,
// and the one that shows why the inline-block caveat rarely bites there: the
// card carries an explicit width (§3c).
export const PricingCard = {
  args: {
    variant: 'rainbow',
    slots: {
      default: {
        component: Card,
        props: { class: 'bg-base-100 w-96' },
        slots: {
          default: {
            component: CardBody,
            slots: {
              default:
                '<h2 class="card-title">Premium</h2><p class="text-4xl font-bold">$29<span class="text-base font-normal">/mo</span></p><ul class="my-4 space-y-2"><li>Unlimited projects</li><li>Priority support</li><li>Custom domains</li></ul><div class="card-actions"><button class="btn btn-primary btn-block">Subscribe</button></div>',
            },
          },
        },
      },
    },
  },
};

// 12. Aura sizes — the ring thickness grows while the buttons stay the same
// size, because the size classes set a padding variable and nothing else (§1).
export const Sizes = {
  render: () =>
    row(
      aura({ size: 'xs' }, button('xs')),
      aura({ size: 'sm' }, button('sm')),
      aura({}, button('default')),
      aura({ size: 'lg' }, button('lg')),
      aura({ size: 'xl' }, button('xl')),
    ),
};

// 13. Aura with custom animation duration — Tailwind's duration utility feeds
// daisyUI's animation, so there is no `duration` prop (§1a).
export const CustomDuration = {
  args: {
    variant: 'rainbow',
    class: 'duration-2000',
    slots: { default: card('This card has aura') },
  },
};

// Beyond the doc page: only some variants follow `currentColor`. Both of these
// carry `text-primary`; `dual` picks it up and `gold` ignores it completely,
// which is the kind of claim that should be visible rather than documented
// (§3a).
export const ColorRespect = {
  render: () =>
    row(
      aura({ variant: 'dual', class: 'text-primary' }, button('dual — tinted')),
      aura({ variant: 'gold', class: 'text-primary' }, button('gold — ignores text-*')),
    ),
};

// Beyond the doc page: the component is `inline-block`, so a full-width card
// inside one shrinks to its content. That reads as a bug and is not one — the
// second copy restores the old flow with `block w-full` (§3c).
export const BlockLayout = {
  render: () => [
    '<div class="w-full max-w-2xl flex flex-col gap-6"><div>default — inline-block, so the card shrinks:</div>',
    aura({}, card('This card has aura')),
    '<div>with class="block w-full":</div>',
    aura({ class: 'block w-full' }, card('This card has aura')),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges —
// `class` matters more than usual here, since colour, background and animation
// duration all arrive that way (§1a).
export const Passthrough = {
  args: {
    id: 'aura-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine text-primary',
    slots: { default: button('Passthrough') },
  },
};
