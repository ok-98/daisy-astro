import Hover3dCard from './Hover3dCard.astro';

// Pass exactly ONE element — everything after it is treated as a hover zone
// (plan §3a). `TwoChildren` shows what a second one does.

const IMG = 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp';

// A bare img tilts but cannot shine: the shine is a ::before on the card, and
// an img has none. Wrapping it restores the effect (plan §3c).
const wrapped = `<div class="w-64 overflow-hidden rounded-box"><img src="${IMG}" alt="Sunset" /></div>`;

export default {
  title: 'Components/Hover3dCard',
  component: Hover3dCard,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { slots: { default: wrapped } },
};

// 1. Hover 3D card — the card tilts toward the pointer, and lies flat when the
// pointer is in the middle, which is deliberate: there is no centre zone (§3b).
export const Default = {
  args: { slots: { default: wrapped } },
};

// Beyond the doc page: a bare image tilts but never shines, because the shine
// is a `::before` on the card and an `img` cannot have one (§3c).
export const BareImageHasNoShine = {
  render: () => [
    '<div class="flex flex-wrap items-start gap-8"><div><div class="mb-2">bare img — tilt, no shine:</div>',
    { component: Hover3dCard, slots: { default: `<img src="${IMG}" alt="Sunset" class="w-64 rounded-box" />` } },
    '</div><div><div class="mb-2">wrapped in a div — tilt and shine:</div>',
    { component: Hover3dCard, slots: { default: wrapped } },
    '</div></div>',
  ],
};

// Beyond the doc page: the failure §3a warns about. A second top-level element
// is silently taken for hover zone one — it gains a scale and a corner grid
// area, the tilt map shifts by one, and the bottom-right zone goes dead.
export const TwoChildren = {
  render: () => [
    '<div class="flex flex-wrap items-start gap-8"><div><div class="mb-2">two children — the second becomes a zone:</div>',
    {
      component: Hover3dCard,
      slots: { default: wrapped + '<p class="p-2">I am not a caption</p>' },
    },
    '</div><div><div class="mb-2">one child — correct:</div>',
    { component: Hover3dCard, slots: { default: wrapped } },
    '</div></div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges. Note
// the wrapper is `inline-grid` with no size of its own — the card inside is
// what carries the width (§3d).
export const Passthrough = {
  args: {
    id: 'hover3d-1',
    'data-test': 'yes',
    style: 'outline:1px dashed',
    class: 'mine',
    slots: { default: wrapped },
  },
};
