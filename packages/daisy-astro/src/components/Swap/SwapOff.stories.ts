import SwapOff from './SwapOff.astro';
import Swap from './Swap.astro';
import SwapOn from './SwapOn.astro';


// A state part is styled through its parent's selectors, so it only means
// anything as a direct child of a `Swap`, after the checkbox (plan §3d).

const inSwap = (props: Record<string, unknown>) => [
  {
    component: Swap,
    props: { class: 'text-4xl' },
    slots: {
      default: [
        '<input type="checkbox" autocomplete="off" />',
        { component: SwapOff, props, slots: { default: 'OFF' } },
        { component: SwapOn, slots: { default: 'ON' } },
      ],
    },
  },
];

export default {
  title: 'Components/Swap/SwapOff',
  component: SwapOff,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  render: () => inSwap({}),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inSwap({
      id: 'swap-off-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
