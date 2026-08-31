import Tooltip from './Tooltip.astro';
import Button from '../Button/Button.astro';

// The trigger goes in the default slot; the bubble is `tip` (an attribute) or
// the `content` slot (markup). Most stories force `open` so the bubble is
// visible in a static canvas — hover still works, but a screenshot of a
// closed tooltip shows nothing (plan §0a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const POSITIONS = ['top', 'bottom', 'left', 'right'] as const;
const ALIGNS = ['start', 'center', 'end'] as const;
const COLORS = ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

const hoverMe = (label = 'Hover me'): Item => ({ component: Button, slots: { default: label } });

const tooltip = (props: Record<string, unknown>, trigger: Item = hoverMe()): Item => ({
  component: Tooltip,
  props,
  slots: { default: trigger },
});

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    tip: { control: 'text' },
    position: { control: 'inline-radio', options: [undefined, ...POSITIONS] },
    align: { control: 'inline-radio', options: [undefined, ...ALIGNS] },
    color: { control: 'select', options: [undefined, ...COLORS] },
    open: { control: 'boolean' },
  },
};

export const Playground = {
  args: { tip: 'hello', open: true, slots: { default: hoverMe() } },
};

// 1. Tooltip
export const Default = {
  args: { tip: 'hello', slots: { default: hoverMe() } },
};

// 2. Tooltip with a content div — markup instead of text. The wrapper is
// rendered only because this slot is filled; a tooltip using `tip` has no
// empty content div in its DOM (§0b).
export const WithContentSlot = {
  args: {
    open: true,
    slots: {
      content: '<div class="animate-bounce text-orange-400 -rotate-10 text-2xl font-black">Wow!</div>',
      default: hoverMe(),
    },
  },
};

// 3. Force open.
export const ForceOpen = {
  args: { tip: 'hello', open: true, slots: { default: hoverMe() } },
};

// 4–7. The four sides.
export const Positions = {
  render: () => [
    '<div class="flex flex-wrap items-center justify-center gap-8 p-16">',
    ...POSITIONS.map((position) => tooltip({ tip: position, position, open: true }, hoverMe(position))),
    '</div>',
  ],
};

// 8. Alignment on a horizontal side — `start` / `center` / `end` run left to
// right when the bubble is on top.
export const AlignTopSide = {
  render: () => [
    '<div class="flex flex-wrap items-center justify-center gap-8 p-16">',
    ...ALIGNS.map((align) =>
      tooltip({ tip: `top ${align}`, position: 'top', align, open: true }, hoverMe(align)),
    ),
    '</div>',
  ],
};

// 9. The same alignments on a vertical side, which is the point of §0c: with
// the bubble on the left, `start` means **top**, not left. The doc page lays
// these out in a column for exactly this reason.
export const AlignVerticalSide = {
  render: () => [
    '<div class="flex flex-col items-center gap-8 p-16">',
    ...ALIGNS.map((align) =>
      tooltip({ tip: `left ${align}`, position: 'left', align, open: true }, hoverMe(align)),
    ),
    '</div>',
  ],
};

// 10–16. The seven colours. There is no neutral, because neutral is the base
// colour and a `tooltip-neutral` class would be a no-op (§0d).
export const Colors = {
  render: () => [
    '<div class="flex flex-wrap items-center justify-center gap-8 p-16">',
    ...COLORS.map((color) => tooltip({ tip: color, color, open: true }, hoverMe(color))),
    '</div>',
  ],
};

// Beyond the doc page's prop coverage: `lg:tooltip` — a tooltip only above the
// `lg` breakpoint, which is daisyUI's answer to hover affordances on touch
// screens. **Not reachable from a prop**, since this component always emits
// `tooltip`, so it is written by hand here (§0e).
export const ResponsiveTooltipOnly = {
  render: () => [
    '<div class="p-16"><div class="lg:tooltip" data-tip="hello"><button class="btn">Hover me — only above lg</button></div></div>',
  ],
};

// Both axes overridden at one breakpoint, which is the clearest demonstration
// that they are independent (§0c, §0e).
export const ResponsiveAxes = {
  render: () => [
    '<div class="p-16">',
    tooltip({
      tip: 'hello',
      align: 'start',
      class: 'md:tooltip-right md:tooltip-center',
      open: true,
    }),
    '</div>',
  ],
};

// Beyond the doc page: an empty tip is meaningful. daisyUI gates visibility on
// a non-empty tip, so this renders no bubble and no tail rather than an empty
// box — which is why the component passes the empty string through instead of
// coercing it away (§0a).
export const EmptyTip = {
  render: () => [
    '<div class="flex items-center gap-8 p-16"><div>tip="" — no bubble at all:</div>',
    tooltip({ tip: '', open: true }, hoverMe('no tooltip')),
    '<div>tip="hello":</div>',
    tooltip({ tip: 'hello', open: true }),
    '</div>',
  ],
};

// Beyond the doc page, and the one this component owes its users: the bubble is
// generated content, so a screen reader gets nothing from `tip`. The accessible
// name belongs on the trigger — which is slot content the component cannot
// reach — so the left-hand trigger says nothing useful and the right-hand one
// carries its own label (§0f).
export const AccessibleTrigger = {
  render: () => [
    '<div class="flex items-center gap-8 p-16"><div>tip only — announced as "Hover me":</div>',
    tooltip({ tip: 'Delete this item' }, hoverMe()),
    '<div>trigger labelled:</div>',
    tooltip({ tip: 'Delete this item' }, {
      component: Button,
      props: { 'aria-label': 'Delete this item' },
      slots: { default: 'Hover me' },
    }),
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and `tip`
// reaches the DOM as `data-tip` rather than as a stray prop.
export const Passthrough = {
  args: {
    tip: 'Passthrough',
    position: 'bottom',
    align: 'end',
    color: 'accent',
    open: true,
    id: 'tooltip-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: hoverMe() },
  },
};
