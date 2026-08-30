import Skeleton from './Skeleton.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const box = (cls: string): Item => ({ component: Skeleton, props: { class: cls } });

export default {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    as: { control: 'text' },
    text: { control: 'boolean' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'w-32 h-32' },
};

// 1. Skeleton — the size comes entirely from the caller's classes (§3c).
export const Default = {
  args: { class: 'w-32 h-32' },
};

// 2. Skeleton - circle with content
export const CircleWithContent = {
  render: () => [
    '<div class="flex w-52 flex-col gap-4"><div class="flex items-center gap-4">',
    box('h-16 w-16 shrink-0 rounded-full'),
    '<div class="flex flex-col gap-4">',
    box('h-4 w-20'),
    box('h-4 w-28'),
    '</div></div>',
    box('h-32 w-full'),
    '</div>',
  ],
};

// 3. Skeleton - rectangle with content
export const RectangleWithContent = {
  render: () => [
    '<div class="flex w-52 flex-col gap-4">',
    box('h-32 w-full'),
    box('h-4 w-28'),
    box('h-4 w-full'),
    box('h-4 w-full'),
    '</div>',
  ],
};

// 4. skeleton-text — the shimmer moves through the glyphs rather than a box,
// so this mode needs content and takes an inline root (§3a, §3b). The text
// stays selectable and in the accessibility tree: it is real copy being
// animated, not a placeholder shape.
export const SkeletonText = {
  args: { as: 'span', text: true, slots: { default: 'AI is thinking harder...' } },
};

// Beyond the doc page, and the most useful story here: the left-hand skeleton
// has no size classes, so it is a zero-height block and renders nothing at all.
// That is daisyUI's behaviour, and the usual cause of "the component is
// broken" (§3c).
export const NoSize = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no size classes, renders nothing:</div>',
    { component: Skeleton },
    '<div>with h-8 w-40:</div>',
    box('h-8 w-40'),
    '</div>',
  ],
};

// Beyond the doc page: `text` with no children renders nothing either — the
// background is painted behind text-clipped glyphs that do not exist (§3a).
export const EmptyTextMode = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>text mode, no content:</div>',
    { component: Skeleton, props: { as: 'span', text: true } },
    '<div>text mode, with content:</div>',
    { component: Skeleton, props: { as: 'span', text: true }, slots: { default: 'AI is thinking harder...' } },
    '</div>',
  ],
};

// Beyond the doc page: under `prefers-reduced-motion: reduce` daisyUI declares
// no animation at all, so this box goes completely static — the fourth
// distinct reduced-motion policy in the library (§3d). Toggle the setting in
// the OS or browser to check; it cannot be seen otherwise.
export const ReducedMotion = {
  args: { class: 'h-32 w-full' },
};

// Regression guard: native attributes survive, caller `class` merges, and `as`
// changes the tag.
export const Passthrough = {
  args: {
    as: 'span',
    text: true,
    id: 'skeleton-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};
