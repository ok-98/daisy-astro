import Link from './Link.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const link = (props: Record<string, unknown> = {}, label = 'Click me'): Item => ({
  component: Link,
  props,
  slots: { default: label },
});

const row = (...items: Item[]): Item[] => [
  '<div class="flex flex-wrap items-center gap-4">',
  ...items,
  '</div>',
];

export default {
  title: 'Components/Link',
  component: Link,
  argTypes: {
    as: { control: 'text' },
    color: { control: 'select', options: [undefined, ...COLORS] },
    hover: { control: 'boolean' },
  },
};

export const Playground = {
  args: { href: '#', color: 'primary', slots: { default: 'Click me' } },
};

// 1. Link — no colour of its own, so it inherits and shows only the underline.
export const Default = {
  args: { href: '#', slots: { default: 'Click me' } },
};

// 2. Link in a paragraph, which is what the class is for: Tailwind's preflight
// strips the underline from anchors and `.link` puts it back.
export const InParagraph = {
  render: () => [
    '<p>Tailwind CSS resets the style of links by default.<br />Add "link" class to make it look like a ',
    link({ href: '#' }, 'normal link'),
    ' again.</p>',
  ],
};

// 3–9. One story per colour example on the page.
export const Primary = { args: { href: '#', color: 'primary', slots: { default: 'Click me' } } };
export const Secondary = { args: { href: '#', color: 'secondary', slots: { default: 'Click me' } } };
export const Accent = { args: { href: '#', color: 'accent', slots: { default: 'Click me' } } };
export const Success = { args: { href: '#', color: 'success', slots: { default: 'Click me' } } };
export const Info = { args: { href: '#', color: 'info', slots: { default: 'Click me' } } };
export const Warning = { args: { href: '#', color: 'warning', slots: { default: 'Click me' } } };
export const Error = { args: { href: '#', color: 'error', slots: { default: 'Click me' } } };

// 10. Show underline only on hover. The class *removes* the base underline;
// the underline returns on hover, and only where hover exists (§3b).
export const LinkHover = {
  args: { href: '#', hover: true, slots: { default: 'Click me' } },
};

// Beyond the doc page: the page shows seven colours one at a time and never
// shows `neutral`, though the class exists. All eight, side by side — hover
// each to see the darkening, which inverts on dark themes (§3c).
export const Colors = {
  render: () => row(...COLORS.map((color) => link({ href: '#', color }, color))),
};

// Beyond the doc page: `as="button"` — a link-styled control that acts rather
// than navigates. This is what every rendered demo on the doc page actually
// is, even though its code blocks all show anchors (§3a).
export const AsButton = {
  render: () =>
    row(
      link({ href: '#', color: 'primary' }, 'Anchor'),
      { component: Link, props: { as: 'button', type: 'button', color: 'primary' }, slots: { default: 'Button' } },
    ),
};

// Beyond the doc page: `hover` with no colour is indistinguishable from the
// surrounding text until pointed at — and on a touch device, never (§3b).
export const HoverInText = {
  render: () => [
    '<p>A plain ',
    link({ href: '#' }, 'link'),
    ' is underlined at rest. A ',
    link({ href: '#', hover: true }, 'hover link'),
    ' is not, and on a touch device it never will be.</p>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and
// `href`/`target`/`rel` ride `...rest` rather than being props.
export const Passthrough = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noreferrer',
    color: 'accent',
    hover: true,
    id: 'link-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};
