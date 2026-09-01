import Indicator from './Indicator.astro';
import IndicatorItem from './IndicatorItem.astro';
import Button from '../Button/Button.astro';
import Card from '../Card/Card.astro';
import CardBody from '../Card/CardBody.astro';
import CardTitle from '../Card/CardTitle.astro';
import TextInput from '../TextInput/TextInput.astro';
import Avatar from '../Avatar/Avatar.astro';
import Tabs from '../Tab/Tabs.astro';
import Tab from '../Tab/Tab.astro';

// `indicator-item` is a positioning mixin, and that decides how it composes
// (plan §3g). Where daisyUI puts two component classes on **one** element —
// `indicator-item badge badge-secondary`, `indicator-item status status-success`
// — the partner arrives as a **class on the item**, because nesting a `Badge`
// inside would produce two spans where daisyUI has one. Where daisyUI nests — a
// Button, a Card, an input, an avatar — the real components are composed.
//
// The placement props live on the **item**, never on the container (plan §3a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const BOX = '<div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>';
const ROUNDED_BOX = '<div class="grid w-32 h-32 rounded bg-base-300 place-items-center">content</div>';

const badgeItem = (props: Record<string, unknown>, text = ''): Item => ({
  component: IndicatorItem,
  props: { class: 'badge badge-secondary', ...props },
  slots: text ? { default: text } : {},
});

const decorated = (item: Item, child: Item = BOX, props: Record<string, unknown> = {}): Item => ({
  component: Indicator,
  props,
  slots: { default: [item, child] },
});

const ALIGNS = ['start', 'center', 'end'] as const;
const POSITIONS = ['top', 'middle', 'bottom'] as const;

export default {
  title: 'Components/Indicator',
  component: Indicator,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    slots: {
      default: [
        { component: IndicatorItem, props: { class: 'badge badge-primary' }, slots: { default: 'New' } },
        ROUNDED_BOX,
      ],
    },
  },
};

// 1. Status as an indicator — an **empty** item, which is a documented use and
// why the slot has no fallback content (§3c).
export const StatusIndicator = {
  render: () => [
    decorated({ component: IndicatorItem, props: { class: 'status status-success' } }, ROUNDED_BOX),
  ],
};

// 2. Badge as an indicator.
export const BadgeAsIndicator = {
  render: () => [
    decorated(
      { component: IndicatorItem, props: { class: 'badge badge-primary' }, slots: { default: 'New' } },
      ROUNDED_BOX,
    ),
  ],
};

// 3. For a button — the container is `width: max-content`, so wrapping changes
// nothing about the button's size (§3d).
export const ForButton = {
  render: () => [
    decorated(badgeItem({}, '12'), { component: Button, slots: { default: 'inbox' } }),
  ],
};

// 4. For a tab — **`indicator` on another component's root**, not a wrapper.
// The class only sets `position: relative` and `inline-flex`, so it composes
// onto `Tab` directly (§3f).
export const ForTab = {
  render: () => [
    {
      component: Tabs,
      props: { variant: 'lift' },
      slots: {
        default: [
          { component: Tab, slots: { default: 'Messages' } },
          {
            component: Tab,
            props: { active: true, class: 'indicator' },
            slots: {
              default: [
                'Notifications',
                { component: IndicatorItem, props: { class: 'badge' }, slots: { default: '8' } },
              ],
            },
          },
          { component: Tab, slots: { default: 'Requests' } },
        ],
      },
    },
  ],
};

// 5. For an avatar — the same mixin usage, this time on `Avatar`'s root (§3f).
export const ForAvatar = {
  render: () => [
    {
      component: Avatar,
      props: { class: 'indicator', innerClass: 'w-20 h-20 rounded-lg' },
      slots: {
        default: [
          badgeItem({}, 'Justice'),
          '<img alt="Tailwind CSS examples" src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />',
        ],
      },
    },
  ],
};

// 6. For an input.
export const ForInput = {
  render: () => [
    decorated(
      { component: IndicatorItem, props: { class: 'badge' }, slots: { default: 'Required' } },
      { component: TextInput, props: { placeholder: 'Your email address' } },
    ),
  ],
};

// 7. A button as an indicator for a card — the item **wraps** a Button rather
// than being styled as one, which is the other way to use the mixin.
export const ButtonForCard = {
  render: () => [
    decorated(
      {
        component: IndicatorItem,
        props: { position: 'bottom' },
        slots: { default: { component: Button, props: { color: 'primary' }, slots: { default: 'Apply' } } },
      },
      {
        component: Card,
        props: { class: 'border border-base-300 shadow-sm bg-base-100' },
        slots: {
          default: {
            component: CardBody,
            slots: {
              default: [
                { component: CardTitle, slots: { default: 'Job Title' } },
                '<p>Rerum reiciendis beatae tenetur excepturi</p>',
              ],
            },
          },
        },
      },
      { class: 'my-6 mx-10' },
    ),
  ],
};

// 8. Centred on an image — `white-space: nowrap` is what keeps this long label
// on one line instead of wrapping back over the picture (§3c).
export const CenterOfImage = {
  render: () => [
    decorated(
      {
        component: IndicatorItem,
        props: { align: 'center', position: 'middle', class: 'badge' },
        slots: { default: 'Only available for Pro users' },
      },
      '<img alt="Tailwind CSS examples" class="rounded" src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" />',
      { class: 'max-w-xs' },
    ),
  ],
};

// 9–17. The nine placements, one story each as the doc page lists them. Both
// axes default — `end` and `top` — so `TopEnd` passes no props at all.
export const TopStart = { render: () => [decorated(badgeItem({ align: 'start' }))] };
export const TopCenter = { render: () => [decorated(badgeItem({ align: 'center' }))] };
export const TopEnd = { render: () => [decorated(badgeItem({}))] };
export const MiddleStart = { render: () => [decorated(badgeItem({ position: 'middle', align: 'start' }))] };
export const MiddleCenter = { render: () => [decorated(badgeItem({ position: 'middle', align: 'center' }))] };
export const MiddleEnd = { render: () => [decorated(badgeItem({ position: 'middle' }))] };
export const BottomStart = { render: () => [decorated(badgeItem({ position: 'bottom', align: 'start' }))] };
export const BottomCenter = { render: () => [decorated(badgeItem({ position: 'bottom', align: 'center' }))] };
export const BottomEnd = { render: () => [decorated(badgeItem({ position: 'bottom' }))] };

// 18. Multiple indicators — all nine at once, which is the at-a-glance version
// of the nine stories above and the reason `align` and `position` are separate
// props: a single nine-value union could not express this grid without listing
// every combination (§3b).
export const MultipleIndicators = {
  render: () => [
    {
      component: Indicator,
      slots: {
        default: [
          ...POSITIONS.flatMap((position, row) =>
            ALIGNS.map((align, col) => ({
              component: IndicatorItem,
              props: { position, align, class: 'badge' },
              slots: { default: ['↖︎', '↑', '↗︎', '←', '●', '→', '↙︎', '↓', '↘︎'][row * 3 + col] },
            })),
          ),
          '<div class="grid w-60 h-32 bg-base-300 place-items-center">Box</div>',
        ],
      },
    },
  ],
};

// 19. Responsive — five placements across five breakpoints, all caller classes.
// Only the base value could ever be a prop, and here even that is written as a
// class to keep the ladder in one place (§3d).
export const Responsive = {
  render: () => [
    decorated(
      badgeItem({
        class: 'badge badge-secondary indicator-start sm:indicator-middle md:indicator-bottom lg:indicator-center xl:indicator-end',
      }),
      ROUNDED_BOX,
    ),
  ],
};

// Beyond the doc page: the mistake the props prevent. The placement classes are
// written on the **container** here, so their custom properties cascade to both
// items and stack them in one corner. With a single item it would look correct,
// which is what makes it worth a story (§3a).
//
// It has to be done with a raw `class`, because `<Indicator align="start">` is a
// type error.
export const PlacementOnContainer = {
  render: () => [
    '<div class="flex gap-10 items-start"><div><div class="text-xs opacity-60 mb-2">placement on the items — correct</div>',
    {
      component: Indicator,
      slots: {
        default: [
          badgeItem({ align: 'start' }, 'A'),
          badgeItem({ align: 'end', position: 'bottom' }, 'B'),
          BOX,
        ],
      },
    },
    '</div><div><div class="text-xs opacity-60 mb-2">placement on the container — both stack</div>',
    {
      component: Indicator,
      props: { class: 'indicator-start indicator-bottom' },
      slots: { default: [badgeItem({}, 'A'), badgeItem({}, 'B'), BOX] },
    },
    '</div></div>',
  ],
};

// Regression guard, at two levels: native attributes survive on the container
// and on the item, and `class` merges after the placement classes.
export const Passthrough = {
  args: {
    id: 'indicator-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine',
    slots: {
      default: [
        {
          component: IndicatorItem,
          props: {
            align: 'center',
            position: 'bottom',
            id: 'item-1',
            'data-test': 'item',
            class: 'badge item-marker',
          },
          slots: { default: 'Passthrough' },
        },
        BOX,
      ],
    },
  },
};
