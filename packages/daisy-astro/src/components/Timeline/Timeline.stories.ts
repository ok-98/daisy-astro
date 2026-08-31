import Timeline from './Timeline.astro';
import TimelineItem from './TimelineItem.astro';
import TimelineStart from './TimelineStart.astro';
import TimelineMiddle from './TimelineMiddle.astro';
import TimelineEnd from './TimelineEnd.astro';

// These stories compose the real sub-components through `args.slots`, nested
// several levels deep. plan §5 assumed that was impossible and prescribed
// wrapper .astro story components; that limitation is gone — see
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// daisyUI's check icon, used in twelve of the fourteen examples.
const ICON = (cls = 'w-5 h-5') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="${cls}"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>`;

const EVENTS: Array<[string, string]> = [
  ['1984', 'First Macintosh computer'],
  ['1998', 'iMac'],
  ['2001', 'iPod'],
  ['2007', 'iPhone'],
  ['2015', 'Apple Watch'],
];

const start = (text: string, props: Record<string, unknown> = {}): Item => ({
  component: TimelineStart,
  props,
  slots: { default: text },
});

const middle = (icon = ICON()): Item => ({ component: TimelineMiddle, slots: { default: icon } });

const end = (text: string, props: Record<string, unknown> = {}): Item => ({
  component: TimelineEnd,
  props,
  slots: { default: text },
});

// `lineBefore` is off on the first item and `lineAfter` on the last, or the
// strip overhangs its own ends (§0a). Building the items from one list keeps
// that correct by construction rather than by hand.
const item = (i: number, parts: Item[], props: Record<string, unknown> = {}, total = EVENTS.length): Item => ({
  component: TimelineItem,
  props: {
    ...(i === 0 ? { lineBefore: false } : {}),
    ...(i === total - 1 ? { lineAfter: false } : {}),
    ...props,
  },
  slots: { default: parts },
});

// Both sides plus an icon, which is the shape of the first doc example.
const bothSides = () =>
  EVENTS.map(([year, event], i) => item(i, [start(year), middle(), end(event, { box: true })]));

export default {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    compact: { control: 'boolean' },
    snapIcon: { control: 'boolean' },
    class: { control: 'text' },
  },
};

// All three container props together, because they are compound rather than
// independent — `compact` and `snapIcon` each behave differently once
// `direction` is vertical (§0f).
export const Playground = {
  args: { slots: { default: bothSides() } },
};

// 1. Timeline with text on both sides and icon
export const BothSides = { args: { slots: { default: bothSides() } } };

// 2. Timeline with bottom side only
export const BottomOnly = {
  args: {
    slots: {
      default: EVENTS.map(([, event], i) => item(i, [middle(), end(event, { box: true })])),
    },
  },
};

// 3. Timeline with top side only
export const TopOnly = {
  args: {
    slots: {
      default: EVENTS.map(([, event], i) => item(i, [start(event, { box: true }), middle()])),
    },
  },
};

// 4. Timeline with different sides — alternating start and end.
export const AlternatingSides = {
  args: {
    slots: {
      default: EVENTS.map(([, event], i) =>
        item(i, i % 2 === 0 ? [middle(), end(event, { box: true })] : [start(event, { box: true }), middle()]),
      ),
    },
  },
};

// 5. Timeline with colorful lines. The asymmetry is the point and is
// reproduced exactly: the first item has no leading line and a coloured
// trailing one, the second has a coloured leading line, and so on — this is
// the only story that exercises `lineBeforeClass` / `lineAfterClass`, which are
// the only route to the generated connectors (§0g).
export const ColorfulLines = {
  args: {
    slots: {
      default: EVENTS.map(([, event], i) =>
        item(
          i,
          [start(event, { box: true }), middle(ICON('w-5 h-5 text-primary'))],
          {
            ...(i > 0 ? { lineBeforeClass: 'bg-primary' } : {}),
            ...(i < EVENTS.length - 1 && i < 2 ? { lineAfterClass: 'bg-primary' } : {}),
          },
        ),
      ),
    },
  },
};

// 6. Timeline without icons — the one horizontal example with no SVG at all.
export const WithoutIcons = {
  args: {
    slots: {
      default: EVENTS.map(([, event], i) => item(i, [start(event, { box: true })])),
    },
  },
};

// 7–12. The same six shapes, vertical.
export const VerticalBothSides = {
  args: { direction: 'vertical', slots: { default: bothSides() } },
};

export const VerticalRightOnly = {
  args: {
    direction: 'vertical',
    slots: { default: EVENTS.map(([, event], i) => item(i, [middle(), end(event, { box: true })])) },
  },
};

export const VerticalLeftOnly = {
  args: {
    direction: 'vertical',
    slots: { default: EVENTS.map(([, event], i) => item(i, [start(event, { box: true }), middle()])) },
  },
};

export const VerticalAlternatingSides = {
  args: {
    direction: 'vertical',
    slots: {
      default: EVENTS.map(([, event], i) =>
        item(i, i % 2 === 0 ? [middle(), end(event, { box: true })] : [start(event, { box: true }), middle()]),
      ),
    },
  },
};

export const VerticalColorfulLines = {
  args: {
    direction: 'vertical',
    slots: {
      default: EVENTS.map(([, event], i) =>
        item(
          i,
          [start(event, { box: true }), middle(ICON('w-5 h-5 text-primary'))],
          {
            ...(i > 0 ? { lineBeforeClass: 'bg-primary' } : {}),
            ...(i < EVENTS.length - 1 && i < 2 ? { lineAfterClass: 'bg-primary' } : {}),
          },
        ),
      ),
    },
  },
};

export const VerticalWithoutIcons = {
  args: {
    direction: 'vertical',
    slots: { default: EVENTS.map(([, event], i) => item(i, [start(event, { box: true })])) },
  },
};

// 13. Responsive — vertical below `lg`, horizontal above. The class is the
// whole feature and one canvas width shows only half of it, so **resize the
// canvas** rather than trusting a screenshot (§0e).
export const Responsive = {
  args: {
    direction: 'vertical',
    class: 'lg:timeline-horizontal',
    slots: { default: bothSides() },
  },
};

// 14. Icon snapped to the start, folding to one side below `md`. Two
// responsive behaviours in one class string — `max-md:timeline-compact` is a
// max-width variant, the only one in daisyUI's examples (§0e).
export const SnapIconCompact = {
  args: {
    direction: 'vertical',
    snapIcon: true,
    class: 'max-md:timeline-compact',
    slots: {
      default: EVENTS.map(([year, event], i) =>
        item(i, [
          middle(ICON('h-5 w-5')),
          start(
            `<time class="font-mono italic">${year}</time><div class="text-lg font-black">${event}</div>`,
            { class: 'md:text-end mb-10' },
          ),
        ]),
      ),
    },
  },
};

// Regression guard, at three levels: a spread that works on the container says
// nothing about the parts, so this checks `Timeline`, `TimelineItem` and
// `TimelineStart` at once.
export const Passthrough = {
  args: {
    id: 'timeline-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: {
      default: [
        {
          component: TimelineItem,
          props: {
            lineBefore: false,
            lineAfterClass: 'bg-primary',
            id: 'timeline-item-1',
            'data-test': 'item',
            class: 'item-marker',
          },
          slots: {
            default: [
              start('1984', { box: true, id: 'timeline-start-1', 'data-test': 'start', class: 'start-marker' }),
              middle(),
              end('First Macintosh computer', { box: true }),
            ],
          },
        },
        item(1, [start('1998'), middle(), end('iMac', { box: true })], {}, 2),
      ],
    },
  },
};
