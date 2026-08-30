import Diff from './Diff.astro';

// The divider is native CSS `resize`, not JS — the split position cannot be
// read or set (plan §0). Every story passes an aspect ratio or a height, or the
// grid collapses to a strip (plan §3c) — `NoAspectRatio` shows that on purpose.

const SHARP = 'https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp';
const BLUR = 'https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a-blur.webp';

const photos = {
  item1: `<img alt="daisy" src="${SHARP}" />`,
  item2: `<img alt="daisy" src="${BLUR}" />`,
};

const TEXT_CLASSES = 'text-4xl lg:text-9xl font-black grid place-content-center';
const words = {
  item1: `<div class="bg-primary text-primary-content ${TEXT_CLASSES}">DAISY</div>`,
  item2: `<div class="bg-base-200 ${TEXT_CLASSES}">DAISY</div>`,
};

export default {
  title: 'Components/Diff',
  component: Diff,
  // No variant argTypes — this component has none (plan §1).
  argTypes: {
    class: { control: 'text' },
    item1Label: { control: 'text' },
    item2Label: { control: 'text' },
  },
};

export const Playground = {
  args: {
    class: 'aspect-16/9 rounded-field',
    item1Label: 'Sharp version',
    item2Label: 'Blurred version',
    slots: photos,
  },
};

// 1. Diff — item 1 is the sharp photo and item 2 the blur, so dragging left
// reveals the blur (§3a).
export const Default = {
  args: {
    class: 'rounded-field aspect-16/9',
    item1Label: 'Sharp version',
    item2Label: 'Blurred version',
    slots: photos,
  },
};

// 2. Diff text — the same structure with styled divs instead of images. Note
// all the styling is on the content, not on the item wrappers, which is why
// there are no item class props (§2).
export const DiffText = {
  args: {
    class: 'rounded-field aspect-16/9',
    item1Label: 'Primary',
    item2Label: 'Muted',
    slots: words,
  },
};

// Beyond the doc page: the most likely first-use failure. No aspect ratio and
// no height leaves the two 1fr rows with nothing to distribute, so only the
// 1.8rem resizer row remains — a thin strip. Correct behaviour, broken-looking
// result (§3c).
export const NoAspectRatio = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no aspect ratio — collapses to a strip:</div>',
    { component: Diff, props: { class: 'rounded-field' }, slots: photos },
    '<div>with aspect-16/9:</div>',
    { component: Diff, props: { class: 'rounded-field aspect-16/9' }, slots: photos },
    '</div>',
  ],
};

// Beyond the doc page: the keyboard behaviour is a two-position toggle rather
// than an adjustable slider, and it is only discoverable by trying it. Tab to
// the figure — the split jumps to ~95%. Tab again into the first item — it
// jumps to ~5%. No arrow keys are involved (§3d).
export const KeyboardToggle = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>tab here, then tab again — the divider toggles between the two extremes:</div>',
    {
      component: Diff,
      props: { class: 'rounded-field aspect-16/9', item1Label: 'Sharp version', item2Label: 'Blurred version' },
      slots: photos,
    },
    '</div>',
  ],
};

// Beyond the doc page: every child of an item is `pointer-events: none`,
// because the whole surface is a drag target. The button below is real and
// completely inert — worth seeing once, so it is not filed as a bug (§3a).
export const InertContent = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>the button inside cannot be clicked:</div>',
    {
      component: Diff,
      props: { class: 'rounded-field aspect-16/9', item1Label: 'With a button', item2Label: 'Blurred version' },
      slots: {
        item1: `<div class="bg-primary text-primary-content ${TEXT_CLASSES}"><button class="btn">Try me</button></div>`,
        item2: photos.item2,
      },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, the
// `tabindex` default is overridable, and both labels reach their wrappers.
export const Passthrough = {
  args: {
    id: 'diff-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine aspect-16/9',
    item1Label: 'After',
    item2Label: 'Before',
    slots: photos,
  },
};
