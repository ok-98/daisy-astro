import Stack from './Stack.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';
import CardTitle from '../Card/CardTitle.astro';

// The first child is the **front** of the pile, and only the first three get a
// position of their own (plan §3a, §3b). Every child is stretched to the
// container, so the size classes are on the `Stack` (plan §3c).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const card = (letter: string, cls: string): Item => ({
  component: Card,
  props: { class: cls },
  slots: { default: { component: CardBody, slots: { default: letter } } },
});

// The doc page's three bordered cards, used by four of its examples.
const CARDS = (cls = 'text-center border border-base-content bg-base-100'): Item[] =>
  ['A', 'B', 'C'].map((letter) => card(letter, cls));

const IMAGES = [
  'photo-1572635148818-ef6fd45eb394',
  'photo-1565098772267-60af42b81ef2',
  'photo-1559703248-dcaaec9fab78',
];

const stack = (props: Record<string, unknown>, children: Item[]): Item => ({
  component: Stack,
  props,
  slots: { default: children },
});

const label = (text: string) => `<div class="text-xs opacity-60 mb-2">${text}</div>`;

export default {
  title: 'Components/Stack',
  component: Stack,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'top', 'bottom', 'start', 'end'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'size-28',
    slots: { default: CARDS() },
  },
};

// 1. Three divs — the plainest case, and the one that shows the offsets. The
// first child is the front, so `1` is on top (§3b).
export const ThreeDivs = {
  args: {
    class: 'h-20 w-32',
    slots: {
      default: [
        '<div class="grid rounded-box bg-primary text-primary-content place-content-center">1</div>',
        '<div class="grid rounded-box bg-accent text-accent-content place-content-center">2</div>',
        '<div class="grid rounded-box bg-secondary text-secondary-content place-content-center">3</div>',
      ],
    },
  },
};

// 2. Stacked images — the width is on the stack; the images are stretched to it
// (§3c).
export const StackedImages = {
  args: {
    class: 'mb-4 w-48',
    slots: {
      default: IMAGES.map(
        (id, i) =>
          `<img src="https://img.daisyui.com/images/stock/${id}.webp" alt="Tailwind CSS example ${i + 1}" class="rounded-box" />`,
      ),
    },
  },
};

// 3. Stacked cards.
export const StackedCards = {
  args: { class: 'mb-4 size-28', slots: { default: CARDS() } },
};

// 4. Top direction — the peeking edges move above, so the **front** card moves
// to the bottom of the group. The name describes the edges, not the front card
// (§3d).
export const TopDirection = {
  args: { direction: 'top', class: 'mb-4 size-28', slots: { default: CARDS() } },
};

// 5. Start direction.
export const StartDirection = {
  args: { direction: 'start', class: 'mb-4 size-28', slots: { default: CARDS() } },
};

// 6. End direction.
export const EndDirection = {
  args: { direction: 'end', class: 'mb-4 size-28', slots: { default: CARDS() } },
};

// 7. Cards with shadow — and **no size class**, so the stack takes the size of
// its tallest child (§3c).
export const CardsWithShadow = {
  args: {
    class: 'mb-4',
    slots: {
      default: [
        card('A', 'text-center shadow-md bg-base-200'),
        card('B', 'text-center shadow bg-base-200'),
        card('C', 'text-center shadow-sm bg-base-200'),
      ],
    },
  },
};

// 8. Notifications — the page's own argument for §3b: the newest notification
// is written **first**, because first is front.
export const NotificationCards = {
  args: {
    class: 'mb-4',
    slots: {
      default: [1, 2, 3].map((n) => ({
        component: Card,
        props: { class: 'shadow-md bg-base-100' },
        slots: {
          default: {
            component: CardBody,
            slots: {
              default: [
                { component: CardTitle, slots: { default: `Notification ${n}` } },
                '<p>You have 3 unread messages. Tap here to see.</p>',
              ],
            },
          },
        },
      })),
    },
  },
};

// Beyond the doc page: all four directions together. The page shows three of
// them in separate sections and never `bottom` explicitly, which is the default
// and shares its rule block with the base class (§3d).
export const Directions = {
  render: () => [
    '<div class="flex flex-wrap gap-10">',
    ...(['bottom', 'top', 'start', 'end'] as const).flatMap((direction) => [
      '<div>',
      label(`direction="${direction}"`),
      stack({ direction, class: 'size-28' }, CARDS()),
      '</div>',
    ]),
    '</div>',
  ],
};

// Beyond the doc page: a fourth child. There is no `:nth-child(4)` rule, so it
// lands in exactly the third's grid area at the same opacity — the stack still
// looks like three layers, with no error and nothing missing from the DOM
// (§3a).
export const FourChildren = {
  render: () => [
    '<div class="flex flex-wrap gap-10">',
    label('three children'),
    stack({ class: 'size-28' }, CARDS()),
    label('four — the fourth is exactly behind the third'),
    stack({ class: 'size-28' }, [...CARDS(), card('D', 'text-center border border-error bg-base-100')]),
    '</div>',
  ],
};

// Beyond the doc page: a child that tries to size itself. `.stack > *` is
// `width: 100%; height: 100%`, so the `w-16` does nothing — which is what makes
// the pile read as one object rather than three loose boxes (§3c).
export const ChildTriesToSize = {
  render: () => [
    '<div class="flex flex-wrap gap-10">',
    label('the first card asks for w-16 — overridden'),
    stack({ class: 'size-28' }, [
      card('A', 'w-16 text-center border border-error bg-base-100'),
      card('B', 'text-center border border-base-content bg-base-100'),
      card('C', 'text-center border border-base-content bg-base-100'),
    ]),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges after
// the direction class.
export const Passthrough = {
  args: {
    direction: 'end',
    id: 'stack-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine size-28',
    slots: { default: CARDS() },
  },
};
