import SwapIndeterminate from './SwapIndeterminate.astro';
import Swap from './Swap.astro';
import SwapOn from './SwapOn.astro';
import SwapOff from './SwapOff.astro';

// This state is only reachable from the caller's own code:
// `el.indeterminate = true`. There is no HTML attribute for it, which is
// why daisyUI's doc page never shows it (plan §3c).

// A state part is styled through its parent's selectors, so it only means
// anything as a direct child of a `Swap`, after the checkbox (plan §3d).

const inSwap = (props: Record<string, unknown>) => [
  {
    component: Swap,
    props: { class: 'text-4xl' },
    slots: {
      default: [
        '<input type="checkbox" autocomplete="off" />',
        { component: SwapIndeterminate, props, slots: { default: '—' } },
        { component: SwapOn, slots: { default: 'ON' } },
        { component: SwapOff, slots: { default: 'OFF' } },
      ],
    },
  },
];

export default {
  title: 'Components/Swap/SwapIndeterminate',
  component: SwapIndeterminate,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  render: () => inSwap({}),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inSwap({
      id: 'swap-indeterminate-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
