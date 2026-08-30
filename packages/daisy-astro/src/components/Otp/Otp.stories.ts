import Otp from './Otp.astro';

// Story shape and the sweep pattern: plans/README.md §4 and
// plans/IMPLEMENTATION-ORDER.md §2, Tier 0.3.

const COLORS = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// The doc page's input, verbatim. Both `maxlength` and `pattern` carry the
// digit count, so they are derived from one number here — the §3a mismatch is
// easy to write by hand and impossible to write this way.
const boxes = (n: number) => '<span></span>'.repeat(n);

const input = (n: number) =>
  '<input type="text" autocomplete="one-time-code" inputmode="numeric" maxlength="' +
  n +
  '" pattern="[0-9]{' +
  n +
  '}" required />';

const code = (n = 4) => boxes(n) + input(n);

const otp = (props: Record<string, unknown> = {}, n = 4): Item => ({
  component: Otp,
  props,
  slots: { default: code(n) },
});

const row = (...items: Item[]): Item[] => ['<div class="flex flex-wrap items-center gap-4">', ...items, '</div>'];

export default {
  title: 'Components/Otp',
  component: Otp,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    size: { control: 'select', options: [undefined, ...SIZES] },
    joined: { control: 'boolean' },
  },
};

export const Playground = {
  args: { slots: { default: code(4) } },
};

// 1. OTP
export const Default = {
  args: { slots: { default: code(4) } },
};

// 2. OTP with 6 digits — six spans and maxlength="6" move together (§3a).
export const SixDigits = {
  args: { slots: { default: code(6) } },
};

// 3. OTP joined
export const Joined = {
  args: { joined: true, slots: { default: code(4) } },
};

// 4. OTP with different sizes
export const Sizes = {
  render: () => row(...SIZES.map((size) => otp({ size }))),
};

// 5. OTP with different colors — each sets `--input-color`, the same seam the
// other form controls use.
export const Colors = {
  render: () => row(...COLORS.map((color) => otp({ color }))),
};

// Beyond the doc page: §3a's footgun made visible. Five boxes with
// maxlength="4" leaves a box that can never be filled; the matched pair below
// behaves. Nothing in the component can catch this — it would have to parse
// slot content.
export const MismatchedLength = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>5 spans, maxlength=4 — the last box is unreachable:</div>',
    { component: Otp, slots: { default: boxes(5) + input(4) } },
    '<div>4 spans, maxlength=4 — matched:</div>',
    otp(),
    '</div>',
  ],
};

// Beyond the doc page: daisyUI has box offsets for 1–8 only, so a ninth span
// gets none and stacks on top of the first (§3a).
export const NineBoxes = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>8 boxes — the documented maximum:</div>',
    otp({}, 8),
    '<div>9 boxes — the ninth stacks on the first:</div>',
    { component: Otp, slots: { default: boxes(9) + input(9) } },
    '</div>',
  ],
};

// Beyond the doc page, and the story that fails if the scaffold's div root ever
// comes back: the input is `pointer-events: none`, so clicking a box focuses
// the field **only** because the root is a label (§0).
export const ClickToFocus = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>click any box — the field should focus and the boxes should ring:</div>',
    otp({ color: 'primary' }),
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    color: 'accent',
    size: 'lg',
    joined: true,
    id: 'otp-1',
    'data-test': 'yes',
    style: 'opacity:.9',
    class: 'mine',
    slots: { default: code(4) },
  },
};
