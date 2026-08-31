import Rating from './Rating.astro';

// Every story scopes its `name`: radios sharing a name are one group wherever
// they sit, so unscoped names would make eleven ratings on a docs page fight
// each other — the same hazard as Radio (plan §3f.3).
//
// The items are raw inputs on purpose. They are radios carrying per-item
// aria-labels, colours and mask classes, which is exactly why there is no
// value/max API and no item component (plan §2).

const star = (
  name: string,
  label: string,
  { checked = false, cls = 'mask mask-star' } = {},
) => `<input type="radio" name="${name}" class="${cls}" aria-label="${label}"${checked ? ' checked' : ''} />`;

// Five stars, the third checked, as most doc examples show.
const five = (name: string, cls?: string) =>
  [1, 2, 3, 4, 5]
    .map((n) => star(name, `${n} star`, { checked: n === 2, ...(cls ? { cls } : {}) }))
    .join('');

const clearItem = (name: string) =>
  `<input type="radio" name="${name}" class="rating-hidden" aria-label="clear" />`;

export default {
  title: 'Components/Rating',
  component: Rating,
  argTypes: {
    half: { control: 'boolean' },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export const Playground = {
  args: { slots: { default: five('rating-play') } },
};

// 1. Rating.
export const Default = {
  args: { slots: { default: five('rating-1') } },
};

// 2. Read-only rating — the same component with divs instead of radios, marked
// with `aria-current`. There is no `readonly` prop, though it is the first
// thing a caller reaches for (§3e).
export const ReadOnly = {
  args: {
    slots: {
      default: [1, 2, 3, 4, 5]
        .map(
          (n) =>
            `<div class="mask mask-star" aria-label="${n} star"${n === 3 ? ' aria-current="true"' : ''}></div>`,
        )
        .join(''),
    },
  },
};

// 3. mask-star-2 with a warning colour — one `bg-*` per item covers both
// states, since unselected items are the same colour at 20% opacity (§3d).
export const WarningColor = {
  args: { slots: { default: five('rating-3', 'mask mask-star-2 bg-orange-400') } },
};

// 4. mask-heart with multiple colours — the case no single `color` prop could
// express, which is why there is none (§3d).
export const MultipleColors = {
  args: {
    class: 'gap-1',
    slots: {
      default: ['red', 'orange', 'yellow', 'lime', 'green']
        .map((c, i) =>
          star('rating-4', `${i + 1} star`, {
            checked: i === 1,
            cls: `mask mask-heart bg-${c}-400`,
          }),
        )
        .join(''),
    },
  },
};

// 5. mask-star-2 with a green colour.
export const GreenColor = {
  args: { slots: { default: five('rating-5', 'mask mask-star-2 bg-green-500') } },
};

// 6. Sizes.
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-2">',
    ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => ({
      component: Rating,
      props: { size },
      slots: { default: five(`rating-size-${size}`, 'mask mask-star-2') },
    })),
    '</div>',
  ],
};

// 7. With `rating-hidden` — an invisible but clickable first item, which is the
// only way a radio group can return to "no selection". It must come first,
// because the fill rule lights up everything *before* the checked item (§3b).
export const WithClearItem = {
  args: {
    size: 'lg',
    slots: { default: clearItem('rating-7') + five('rating-7', 'mask mask-star-2') },
  },
};

// 8. Half stars — ten items alternating the two mask halves, plus `half` on the
// container. Both halves of the behaviour are needed, and they live in two
// different components (§3c, and Mask's own plan).
export const HalfStars = {
  args: {
    size: 'lg',
    half: true,
    slots: {
      default:
        clearItem('rating-8') +
        Array.from({ length: 10 })
          .map((_, i) =>
            star('rating-8', `${(i + 1) / 2} star`, {
              checked: i === 2,
              cls: `bg-green-500 mask mask-star-2 mask-half-${(i % 2) + 1}`,
            }),
          )
          .join(''),
    },
  },
};

// Beyond the doc page: `half` and the per-item mask classes are two halves of
// one behaviour, and setting either alone fails visibly but confusingly (§3c).
export const HalfMismatch = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>mask-half-* without `half` — full-width boxes, each showing half a star:</div>',
    {
      component: Rating,
      props: { size: 'lg' },
      slots: {
        default: Array.from({ length: 10 })
          .map((_, i) =>
            star('rating-mismatch-a', `${(i + 1) / 2} star`, {
              checked: i === 2,
              cls: `bg-green-500 mask mask-star-2 mask-half-${(i % 2) + 1}`,
            }),
          )
          .join(''),
      },
    },
    '<div>both — correct:</div>',
    {
      component: Rating,
      props: { size: 'lg', half: true },
      slots: {
        default: Array.from({ length: 10 })
          .map((_, i) =>
            star('rating-mismatch-b', `${(i + 1) / 2} star`, {
              checked: i === 2,
              cls: `bg-green-500 mask mask-star-2 mask-half-${(i % 2) + 1}`,
            }),
          )
          .join(''),
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: the radios are `appearance: none`, so `aria-label` is
// the only name each item has. Without it a screen reader announces five
// unlabelled radios — invisible in the canvas, and the reason the JSDoc leads
// with it (§3a).
export const MissingAriaLabel = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no aria-labels — five unnamed radios:</div>',
    {
      component: Rating,
      slots: {
        default: [1, 2, 3, 4, 5]
          .map(
            (n) =>
              `<input type="radio" name="rating-noaria" class="mask mask-star-2"${n === 2 ? ' checked' : ''} />`,
          )
          .join(''),
      },
    },
    '<div>labelled:</div>',
    { component: Rating, slots: { default: five('rating-witharia', 'mask mask-star-2') } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    size: 'lg',
    id: 'rating-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine gap-1',
    slots: { default: five('rating-pass', 'mask mask-star-2') },
  },
};
