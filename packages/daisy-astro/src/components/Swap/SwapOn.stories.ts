import SwapOn from './SwapOn.astro';
import Swap from './Swap.astro';
import SwapOff from './SwapOff.astro';


// A state part is styled through its parent's selectors, so it only means
// anything as a direct child of a `Swap`, after the checkbox (plan §3d).

const inSwap = (props: Record<string, unknown>) => [
  {
    component: Swap,
    props: { class: 'text-4xl' },
    slots: {
      default: [
        '<input type="checkbox" autocomplete="off" />',
        { component: SwapOn, props, slots: { default: 'ON' } },
        { component: SwapOff, slots: { default: 'OFF' } },
      ],
    },
  },
];

export default {
  title: 'Components/Swap/SwapOn',
  component: SwapOn,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  render: () => inSwap({}),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inSwap({
      id: 'swap-on-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine',
    }),
};
