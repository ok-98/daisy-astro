import List from './List.astro';
import ListRow from './ListRow.astro';
import Avatar from '../Avatar/Avatar.astro';
import Button from '../Button/Button.astro';

// `list-col-grow` and `list-col-wrap` are caller classes on a row's own
// children, not props — they belong to markup the caller writes (plan §2).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const ICON = {
  play: '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M6 3L20 12 6 21 6 3z"></path></g></svg>',
  heart: '<svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></g></svg>',
} as const;

const SONGS: Array<[string, string, string, string]> = [
  ['1@94', 'Dio Lupa', 'Remaining Reason', '"Remaining Reason" became an instant hit, praised for its haunting sound and emotional depth. A viral performance brought it widespread recognition, making it one of Dio Lupa\'s most iconic tracks.'],
  ['4@94', 'Ellie Beilish', 'Bears of a fever', '"Bears of a Fever" captivated audiences with its intense energy and mysterious lyrics. Its popularity skyrocketed after fans shared it widely online, earning Ellie critical acclaim.'],
  ['3@94', 'Sabrino Gardener', 'Cappuccino', '"Cappuccino" quickly gained attention for its smooth melody and relatable themes. The song\'s success propelled Sabrino into the spotlight, solidifying their status as a rising star.'],
];

// The doc page writes the thumbnail as a bare div wrapping an img; Avatar's
// inner div does the same job, so the rows compose the real component.
const thumb = (id: string): Item => ({
  component: Avatar,
  props: { innerClass: 'size-10 rounded-box' },
  slots: {
    default: `<img alt="Tailwind CSS list item" src="https://img.daisyui.com/images/profile/demo/${id}.webp" />`,
  },
});

const text = (title: string, subtitle: string, cls = '') =>
  `<div${cls ? ` class="${cls}"` : ''}><div>${title}</div><div class="text-xs uppercase font-semibold opacity-60">${subtitle}</div></div>`;

const iconButton = (icon: keyof typeof ICON): Item => ({
  component: Button,
  props: { shape: 'square', variant: 'ghost' },
  slots: { default: ICON[icon] },
});

// A plain `<li>` header — a documented use, and the reason `List` cannot take
// an items array (§2). It must be an `li`, since the root is a `ul` (§3d).
const HEADER = '<li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>';

const FRAME = 'bg-base-100 rounded-box shadow-md';

export default {
  title: 'Components/List',
  component: List,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: FRAME,
    slots: {
      default: [
        HEADER,
        ...SONGS.map(([id, title, subtitle]) => ({
          component: ListRow,
          slots: { default: [thumb(id), text(title, subtitle), iconButton('play'), iconButton('heart')] },
        })),
      ],
    },
  },
};

// 1. List — the default, with **no modifier at all**: the second child grows,
// which is why avatar / text / buttons lays out correctly on its own (§3a).
export const Default = {
  args: {
    class: FRAME,
    slots: {
      default: [
        HEADER,
        ...SONGS.map(([id, title, subtitle]) => ({
          component: ListRow,
          slots: { default: [thumb(id), text(title, subtitle), iconButton('play'), iconButton('heart')] },
        })),
      ],
    },
  },
};

// 2. Third column grows — a track number is added in front, so the growth has
// to be moved off the second child with `list-col-grow` (§3a).
export const ThirdColumnGrows = {
  args: {
    class: FRAME,
    slots: {
      default: [
        HEADER,
        ...SONGS.map(([id, title, subtitle], i) => ({
          component: ListRow,
          slots: {
            default: [
              `<div class="text-4xl font-thin opacity-30 tabular-nums">0${i + 1}</div>`,
              thumb(id),
              text(title, subtitle, 'list-col-grow'),
              iconButton('play'),
            ],
          },
        })),
      ],
    },
  },
};

// 3. Third column wraps — the paragraph drops to a second row while keeping its
// column, so it starts under the text block rather than under the avatar. That
// is intended (§3b).
export const ThirdColumnWraps = {
  args: {
    class: FRAME,
    slots: {
      default: [
        HEADER,
        ...SONGS.map(([id, title, subtitle, blurb]) => ({
          component: ListRow,
          slots: {
            default: [
              thumb(id),
              text(title, subtitle),
              `<p class="list-col-wrap text-xs">${blurb}</p>`,
              iconButton('play'),
              iconButton('heart'),
            ],
          },
        })),
      ],
    },
  },
};

// Beyond the doc page: the growth rule is positional, so the wrong child order
// stretches the wrong element — with no error. The first row here puts the
// buttons second, so the button column takes all the space (§3a).
export const WrongChildOrder = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>buttons second — the button column grows:</div>',
    {
      component: List,
      props: { class: FRAME },
      slots: {
        default: {
          component: ListRow,
          slots: { default: [thumb('1@94'), iconButton('play'), text('Dio Lupa', 'Remaining Reason')] },
        },
      },
    },
    '<div>text second — correct:</div>',
    {
      component: List,
      props: { class: FRAME },
      slots: {
        default: {
          component: ListRow,
          slots: { default: [thumb('1@94'), text('Dio Lupa', 'Remaining Reason'), iconButton('play')] },
        },
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: `list-col-grow` has rules for the first six positions
// and nothing beyond, so on a seventh child it silently does nothing and the
// default second-column growth stays (§3a).
export const GrowBeyondSix = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>list-col-grow on the seventh child — ignored:</div>',
    {
      component: List,
      props: { class: FRAME },
      slots: {
        default: {
          component: ListRow,
          slots: {
            default: [
              ...Array.from({ length: 6 }).map((_, i) => `<div class="text-xs opacity-60">c${i + 1}</div>`),
              '<div class="list-col-grow">seventh, asked to grow</div>',
            ],
          },
        },
      },
    },
    '</div>',
  ],
};

// Regression guard, at two levels: a spread on the list says nothing about a
// row.
export const Passthrough = {
  args: {
    id: 'list-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: `mine ${FRAME}`,
    slots: {
      default: {
        component: ListRow,
        props: { id: 'list-row-1', 'data-test': 'row', class: 'row-marker' },
        slots: { default: [thumb('1@94'), text('Passthrough', 'Remaining Reason'), iconButton('play')] },
      },
    },
  },
};
