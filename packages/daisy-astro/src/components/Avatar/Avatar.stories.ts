import Avatar from './Avatar.astro';

// Story shape and the sweep pattern: see plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const IMG = 'https://img.daisyui.com/images/profile/demo/batperson@192.webp';
const img = (src = IMG) => `<img src="${src}" alt="Tailwind-CSS-Avatar-component" />`;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-2">',
  ...items,
  '</div>',
];

const avatar = (props: Record<string, unknown>, slot: string = img()): Item => ({
  component: Avatar,
  props,
  slots: { default: slot },
});

export default {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    presence: { control: 'select', options: [undefined, 'online', 'offline'] },
    placeholder: { control: 'boolean' },
    innerClass: { control: 'text' },
  },
};

export const Playground = {
  args: { innerClass: 'w-24 rounded-full', slots: { default: img() } },
};

// 1. Avatar — a square with small rounding. daisyUI adds no border-radius of
// its own, so anything circular here would be this library inventing one.
export const Default = {
  args: { innerClass: 'w-24 rounded', slots: { default: img() } },
};

// 2. Avatar in custom sizes — the size axis is `innerClass`, not a prop (§1).
export const CustomSizes = {
  render: () =>
    row(
      avatar({ innerClass: 'w-32 rounded' }),
      avatar({ innerClass: 'w-20 rounded' }),
      avatar({ innerClass: 'w-16 rounded' }),
      avatar({ innerClass: 'w-8 rounded' }),
    ),
};

// 3. Avatar rounded
export const Rounded = {
  render: () =>
    row(avatar({ innerClass: 'w-24 rounded-xl' }), avatar({ innerClass: 'w-24 rounded-full' })),
};

// 4. Avatar with mask — the Mask component's shapes, reached through
// `innerClass` because that is the element daisyUI masks (§3a).
export const WithMask = {
  render: () =>
    row(
      avatar({ innerClass: 'w-24 mask mask-heart' }),
      avatar({ innerClass: 'w-24 mask mask-squircle' }),
      avatar({ innerClass: 'w-24 mask mask-hexagon-2' }),
    ),
};

// 5. Avatar with ring
export const WithRing = {
  args: {
    innerClass: 'w-24 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2',
    slots: { default: img() },
  },
};

// 6. Avatar with presence indicator
export const PresenceIndicator = {
  render: () =>
    row(
      avatar({ presence: 'online', innerClass: 'w-24 rounded-full' }),
      avatar({ presence: 'offline', innerClass: 'w-24 rounded-full' }),
    ),
};

// Beyond the doc page: the presence dot is a bare `:before` with no text and
// no ARIA, so a screen reader gets nothing from the left-hand avatar and
// everything from the right-hand one. The component does not inject a name of
// its own — that would be content this library made up (§3c).
export const PresenceAccessibleName = {
  render: () =>
    row(
      avatar({ presence: 'online', innerClass: 'w-24 rounded-full' }),
      avatar({
        presence: 'online',
        innerClass: 'w-24 rounded-full',
        'aria-label': 'Gordon, online',
      }),
    ),
};

// 7. Avatar placeholder — `avatar-placeholder` only centres the inner content.
// The `w-16` one carries `presence` too: the two modifiers are orthogonal.
const letters = (text: string) => `<span>${text}</span>`;

export const Placeholder = {
  render: () =>
    row(
      avatar(
        { placeholder: true, innerClass: 'bg-neutral text-neutral-content w-24 rounded-full' },
        letters('D'),
      ),
      avatar(
        {
          placeholder: true,
          presence: 'online',
          innerClass: 'bg-neutral text-neutral-content w-16 rounded-full',
        },
        letters('AI'),
      ),
      avatar(
        { placeholder: true, innerClass: 'bg-neutral text-neutral-content w-12 rounded-full' },
        letters('MX'),
      ),
      avatar(
        { placeholder: true, innerClass: 'bg-neutral text-neutral-content w-8 rounded-full' },
        letters('SY'),
      ),
    ),
};

// Regression guard for the §3a split: native attributes and caller `class`
// land on the ROOT, `innerClass` on the inner div — in that direction.
export const Passthrough = {
  args: {
    id: 'avatar-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    innerClass: 'w-24 rounded-full inner-marker',
    slots: { default: img() },
  },
};
