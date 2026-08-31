import Card from './Card.astro';
import CardBody from './CardBody.astro';
import CardTitle from './CardTitle.astro';
import CardActions from './CardActions.astro';
import Badge from '../Badge/Badge.astro';
import Button from '../Button/Button.astro';

// Composition happens at the call site (plan §0a): these stories write the
// <figure> themselves, because daisyUI styles the bare element and there is no
// card-figure class to wrap (plan §0b). Buttons and badges compose the real
// components.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const IMG = {
  shoes: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
  movie: 'https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp',
  album: 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp',
};

const figure = (src: string, alt: string) => `<figure><img src="${src}" alt="${alt}" /></figure>`;

const BODY_TEXT =
  '<p>A card component has a figure, a body part, and inside body there are title and actions parts</p>';

const title = (text: string, extra: Item[] = []): Item => ({
  component: CardTitle,
  slots: { default: [text, ...extra] },
});

const actions = (...children: Item[]): Item => ({
  component: CardActions,
  props: { class: 'justify-end' },
  slots: { default: children },
});

const buyNow = { component: Button, props: { color: 'primary' }, slots: { default: 'Buy Now' } };

const body = (...children: Item[]): Item => ({ component: CardBody, slots: { default: children } });

export default {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    as: { control: 'text' },
    variant: { control: 'radio', options: [undefined, 'border', 'dash'] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
    side: { control: 'boolean' },
    imageFull: { control: 'boolean' },
  },
};

export const Playground = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: [figure(IMG.shoes, 'Shoes'), body(title('Card Title'), BODY_TEXT, actions(buyNow))],
    },
  },
};

// 1. Card
export const Default = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: [figure(IMG.shoes, 'Shoes'), body(title('Card Title'), BODY_TEXT, actions(buyNow))],
    },
  },
};

// 3. Card sizes — the size class goes on the card and reaches the body's
// padding and the title's font size through daisyUI's descendant rules, which
// is why neither sub-component has a size prop (§1).
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-4">',
    ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => ({
      component: Card,
      props: { size, variant: 'border', class: 'w-96 bg-base-100' },
      slots: { default: body(title(`Card ${size}`), '<p>A card with a size modifier.</p>') },
    })),
    '</div>',
  ],
};

// 4–5. The two border styles.
export const Border = {
  args: {
    variant: 'border',
    class: 'w-96 bg-base-100',
    slots: { default: body(title('Card Title'), BODY_TEXT, actions(buyNow)) },
  },
};

export const Dash = {
  args: {
    variant: 'dash',
    class: 'w-96 bg-base-100',
    slots: { default: body(title('Card Title'), BODY_TEXT, actions(buyNow)) },
  },
};

// 6. Card with badge — a Badge inside the title, and two more as the actions.
export const WithBadge = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: [
        figure(IMG.shoes, 'Shoes'),
        body(
          title('Card Title ', [{ component: Badge, props: { color: 'secondary' }, slots: { default: 'NEW' } }]),
          BODY_TEXT,
          actions(
            { component: Badge, props: { variant: 'outline' }, slots: { default: 'Fashion' } },
            { component: Badge, props: { variant: 'outline' }, slots: { default: 'Products' } },
          ),
        ),
      ],
    },
  },
};

// 7. Card with bottom image — the same figure, moved after the body. Its
// corners round at the bottom instead of the top, purely from where it sits
// (§3b).
export const BottomImage = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: [
        body(title('Card Title'), BODY_TEXT, actions(buyNow)),
        figure(IMG.shoes, 'Shoes'),
      ],
    },
  },
};

// 9. Card with image overlay — `imageFull` emits the **unprefixed**
// `image-full` class, which is why a prefix-based audit of this component
// misses it (§3c).
export const ImageFull = {
  args: {
    imageFull: true,
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: [figure(IMG.shoes, 'Shoes'), body(title('Card Title'), BODY_TEXT, actions(buyNow))],
    },
  },
};

// 10. Card with no image.
export const NoImage = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: { default: body(title('Card Title'), BODY_TEXT, actions(buyNow)) },
  },
};

// 11. Card with custom color — plain Tailwind on the card, since there is no
// colour axis at all (§1).
export const CustomColor = {
  args: {
    class: 'w-96 bg-primary text-primary-content',
    slots: {
      default: body(title('Card Title'), BODY_TEXT, actions({ component: Button, slots: { default: 'Buy Now' } })),
    },
  },
};

// 13. Card with action on top — the actions row before the title.
export const ActionsOnTop = {
  args: {
    class: 'w-96 bg-base-100 shadow-sm',
    slots: {
      default: body(
        actions({ component: Button, props: { color: 'primary' }, slots: { default: 'Buy Now' } }),
        title('Card Title'),
        BODY_TEXT,
      ),
    },
  },
};

// 14. Card with image on side.
export const Side = {
  args: {
    side: true,
    class: 'bg-base-100 shadow-sm',
    slots: {
      default: [
        figure(IMG.movie, 'Movie'),
        body(
          title('New movie is released!'),
          '<p>Click the button to watch on Jetflix app.</p>',
          actions({ component: Button, props: { color: 'primary' }, slots: { default: 'Watch' } }),
        ),
      ],
    },
  },
};

// 15. Responsive side card — a caller class rather than the prop, because
// daisyUI ships the prefixed variants itself (§3e).
export const ResponsiveSide = {
  args: {
    class: 'lg:card-side bg-base-100 shadow-sm',
    slots: {
      default: [
        figure(IMG.album, 'Album'),
        body(
          title('New album is released!'),
          '<p>Click the button to listen on Spotiwhy app.</p>',
          actions({ component: Button, props: { color: 'primary' }, slots: { default: 'Listen' } }),
        ),
      ],
    },
  },
};

// 16. Selectable cards — `as="label"` with a bare input as a **direct child**
// of the card, a sibling of the body rather than inside it, because every rule
// daisyUI uses for this is a child selector. The input is hidden with
// `appearance: none`, which keeps it focusable and in the accessibility tree —
// swapping that for `sr-only` or `hidden` would break it (§3d).
export const Selectable = {
  render: () => [
    '<div class="flex flex-wrap items-start gap-3">',
    {
      component: Card,
      props: { as: 'label', class: 'bg-accent text-accent-content' },
      slots: {
        default: [
          '<input type="checkbox" name="card-urgent-1" />',
          body(title('Urgent'), '<p>Same day delivery</p>'),
        ],
      },
    },
    '<div class="join bg-base-300 rounded-selector">',
    ...[
      ['sm', 'Size SM', 'Available', false],
      ['md', 'Size MD', 'Not available', true],
      ['lg', 'Size LG', 'Short supply', false],
    ].map(([value, label, note, disabled]) => ({
      component: Card,
      props: { as: 'label', class: 'join-item' },
      slots: {
        default: [
          `<input type="radio" value="${value}" name="card-size-1"${disabled ? ' disabled' : ''} />`,
          {
            component: CardBody,
            ...(disabled ? { props: { class: 'opacity-60' } } : {}),
            slots: { default: [title(label as string), `<p>${note}</p>`] },
          },
        ],
      },
    })),
    '</div></div>',
  ],
};

// Beyond the doc page: the heading level is the caller's call. `CardTitle`
// defaults to `h2`, matching every doc example, but a card inside a section
// that already has one needs `h3` — and hardcoding the tag would bake a
// document-outline decision into a visual component (§3a).
export const TitleLevels = {
  render: () => [
    '<div class="flex flex-col gap-4">',
    {
      component: Card,
      props: { variant: 'border', class: 'w-96' },
      slots: { default: body(title('Default — h2'), '<p>Matches the doc page.</p>') },
    },
    {
      component: Card,
      props: { variant: 'border', class: 'w-96' },
      slots: {
        default: body(
          { component: CardTitle, props: { as: 'h3' }, slots: { default: 'as="h3"' } },
          '<p>For a card nested under an existing h2.</p>',
        ),
      },
    },
    '</div>',
  ],
};

// Regression guard, at three levels: a spread that works on the card says
// nothing about the body or the title.
export const Passthrough = {
  args: {
    variant: 'border',
    size: 'lg',
    id: 'card-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine w-96 bg-base-100',
    slots: {
      default: {
        component: CardBody,
        props: { id: 'card-body-1', 'data-test': 'body', class: 'body-marker' },
        slots: {
          default: [
            {
              component: CardTitle,
              props: { as: 'h3', id: 'card-title-1', 'data-test': 'title', class: 'title-marker' },
              slots: { default: 'Passthrough' },
            },
            BODY_TEXT,
            actions(buyNow),
          ],
        },
      },
    },
  },
};
