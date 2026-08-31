import Stats from './Stats.astro';
import Stat from './Stat.astro';
import StatTitle from './StatTitle.astro';
import StatValue from './StatValue.astro';
import StatDesc from './StatDesc.astro';
import StatFigure from './StatFigure.astro';
import StatActions from './StatActions.astro';
import Avatar from '../Avatar/Avatar.astro';
import Button from '../Button/Button.astro';

// `stats` is the component and `stat` is one of its parts, so the container
// here is `Stats` (plan §0). It has no frame of its own — every doc example
// adds `shadow` or a border (plan §3c).
//
// The six parts are sub-components rather than named slots, because the doc
// page reorders title/value/desc freely (plan §3b) and the figure lands in
// column 2 wherever it is written (plan §3a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const ICON = {
  heart:
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
  bolt:
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
  info:
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
  share:
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>',
  box:
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>',
} as const;

const FRAME = 'shadow';

const part = (component: unknown, content: Item | Item[], cls?: string): Item => ({
  component,
  props: cls ? { class: cls } : {},
  slots: { default: content },
});

const title = (text: string, cls?: string) => part(StatTitle, text, cls);
const value = (text: string, cls?: string) => part(StatValue, text, cls);
const desc = (text: string, cls?: string) => part(StatDesc, text, cls);
const figure = (icon: keyof typeof ICON, cls: string) => part(StatFigure, ICON[icon], cls);

const stat = (children: Item[], props: Record<string, unknown> = {}): Item => ({
  component: Stat,
  props,
  slots: { default: children },
});

// The three blocks shared by the vertical and responsive examples.
const TRIO: Array<[string, string, string]> = [
  ['Downloads', '31K', 'Jan 1st - Feb 1st'],
  ['New Users', '4,200', '↗︎ 400 (22%)'],
  ['New Registers', '1,200', '↘︎ 90 (14%)'],
];

const trio = (statProps: Record<string, unknown> = {}) =>
  TRIO.map(([t, v, d]) => stat([title(t), value(v), desc(d)], statProps));

export default {
  title: 'Components/Stat',
  component: Stats,
  argTypes: {
    direction: { control: 'select', options: [undefined, 'horizontal', 'vertical'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: FRAME,
    slots: {
      default: stat([title('Total Page Views'), value('89,400'), desc('21% more than last month')]),
    },
  },
};

// 1. Stat — a single block.
export const Default = {
  args: {
    class: FRAME,
    slots: {
      default: stat([title('Total Page Views'), value('89,400'), desc('21% more than last month')]),
    },
  },
};

// 2. With icons or image. The third block is **value → title → desc**, which is
// the doc page's own evidence that order is the caller's (plan §3b). Its figure
// holds a real `Avatar` rather than the doc page's hand-written div.
export const WithIconsOrImage = {
  args: {
    class: FRAME,
    slots: {
      default: [
        stat([
          figure('heart', 'text-primary'),
          title('Total Likes'),
          value('25.6K', 'text-primary'),
          desc('21% more than last month'),
        ]),
        stat([
          figure('bolt', 'text-secondary'),
          title('Page Views'),
          value('2.6M', 'text-secondary'),
          desc('21% more than last month'),
        ]),
        stat([
          part(
            StatFigure,
            {
              component: Avatar,
              props: { presence: 'online', innerClass: 'w-16 rounded-full' },
              slots: {
                default:
                  '<img alt="Tailwind CSS stat example component" src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp" />',
              },
            },
            'text-secondary',
          ),
          value('86%'),
          title('Tasks done'),
          desc('31 tasks remaining', 'text-secondary'),
        ]),
      ],
    },
  },
};

// 3. Three stats, each with an icon.
export const ThreeStats = {
  args: {
    class: FRAME,
    slots: {
      default: [
        stat([figure('info', 'text-secondary'), title('Downloads'), value('31K'), desc('Jan 1st - Feb 1st')]),
        stat([figure('share', 'text-secondary'), title('New Users'), value('4,200'), desc('↗︎ 400 (22%)')]),
        stat([figure('box', 'text-secondary'), title('New Registers'), value('1,200'), desc('↘︎ 90 (14%)')]),
      ],
    },
  },
};

// 4. Centered items — `place-items-center` is a caller class on each block, not
// a prop, since it is plain Tailwind (plan §1).
export const CenteredItems = {
  args: {
    class: FRAME,
    slots: {
      default: [
        stat([title('Downloads'), value('31K'), desc('From January 1st to February 1st')], {
          class: 'place-items-center',
        }),
        stat([title('Users'), value('4,200', 'text-secondary'), desc('↗︎ 40 (2%)', 'text-secondary')], {
          class: 'place-items-center',
        }),
        stat([title('New Registers'), value('1,200'), desc('↘︎ 90 (14%)')], { class: 'place-items-center' }),
      ],
    },
  },
};

// 5. Vertical — the dashed divider moves from the trailing edge to the bottom
// on its own (plan §3c).
export const Vertical = {
  args: { direction: 'vertical', class: FRAME, slots: { default: trio() } },
};

// 6. Responsive — vertical on mobile, horizontal from `lg`. The breakpoint half
// is a caller class; only the base half is a prop (plan §3d).
export const Responsive = {
  args: {
    direction: 'vertical',
    class: `${FRAME} lg:stats-horizontal`,
    slots: { default: trio() },
  },
};

// 7. With custom colors and button — the only example using `StatActions`, and
// the only one framed with a border instead of a shadow.
export const WithCustomColorsAndButton = {
  args: {
    class: 'bg-base-100 border border-base-300',
    slots: {
      default: [
        stat([
          title('Account balance'),
          value('$89,400'),
          part(StatActions, {
            component: Button,
            props: { size: 'xs', color: 'success' },
            slots: { default: 'Add funds' },
          }),
        ]),
        stat([
          title('Current balance'),
          value('$89,400'),
          part(StatActions, [
            { component: Button, props: { size: 'xs' }, slots: { default: 'Withdrawal' } },
            { component: Button, props: { size: 'xs' }, slots: { default: 'Deposit' } },
          ]),
        ]),
      ],
    },
  },
};

// Beyond the doc page: the same block with the figure written **last**. It
// renders identically to the one beside it, because the figure is pinned to
// column 2 by CSS rather than by source order (plan §3a).
export const FigureLast = {
  args: {
    class: FRAME,
    slots: {
      default: [
        stat([
          figure('heart', 'text-primary'),
          title('Figure first'),
          value('25.6K', 'text-primary'),
          desc('21% more than last month'),
        ]),
        stat([
          title('Figure last'),
          value('25.6K', 'text-primary'),
          desc('21% more than last month'),
          figure('heart', 'text-primary'),
        ]),
      ],
    },
  },
};

// Beyond the doc page: value before title, on its own. Easy to miss in the
// icons example, and it is the whole reason the parts are not named slots
// (plan §3b).
export const ValueBeforeTitle = {
  args: {
    class: FRAME,
    slots: {
      default: [
        stat([title('Tasks done'), value('86%'), desc('31 tasks remaining')]),
        stat([value('86%'), title('Tasks done'), desc('31 tasks remaining')]),
      ],
    },
  },
};

// Beyond the doc page: no frame at all. daisyUI gives `stats` a border radius
// and nothing else, so this is correct rather than broken — and it is what you
// get if you forget the `shadow` every example carries (plan §3c).
export const Unframed = {
  args: { slots: { default: trio() } },
};

// Regression guard, at two levels: a spread on the container says nothing about
// a block or a part.
export const Passthrough = {
  args: {
    direction: 'horizontal',
    id: 'stats-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: `mine ${FRAME}`,
    slots: {
      default: {
        component: Stat,
        props: { id: 'stat-1', 'data-test': 'block', class: 'stat-marker' },
        slots: {
          default: [
            {
              component: StatFigure,
              props: { id: 'fig-1', class: 'text-primary figure-marker' },
              slots: { default: ICON.heart },
            },
            {
              component: StatTitle,
              props: { id: 'title-1', class: 'title-marker' },
              slots: { default: 'Passthrough' },
            },
            {
              component: StatValue,
              props: { id: 'value-1', class: 'value-marker' },
              slots: { default: '89,400' },
            },
            {
              component: StatDesc,
              props: { id: 'desc-1', class: 'desc-marker' },
              slots: { default: 'forwarded' },
            },
            {
              component: StatActions,
              props: { id: 'actions-1', class: 'actions-marker' },
              slots: {
                default: { component: Button, props: { size: 'xs' }, slots: { default: 'Act' } },
              },
            },
          ],
        },
      },
    },
  },
};
