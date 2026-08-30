import Countdown from './Countdown.astro';
import CountdownValue from './CountdownValue.astro';

// daisyUI's Countdown is a transition effect, not a timer — every story here
// renders a fixed number, which is correct rather than inert. See
// plans/components/countdown.md §0, and the `Animated` story for the recipe.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const val = (value: number, props: Record<string, unknown> = {}): Item => ({
  component: CountdownValue,
  props: { value, ...props },
});

// One labelled cell, as the last three doc examples build them.
const cell = (value: number, label: string, wrapper: string, size = 'text-5xl'): Item[] => [
  `<div class="${wrapper}">`,
  { component: Countdown, props: { class: `font-mono ${size}` }, slots: { default: val(value) } },
  `${label}</div>`,
];

const UNITS: Array<[number, string]> = [
  [15, 'days'],
  [10, 'hours'],
  [24, 'min'],
  [59, 'sec'],
];

export default {
  title: 'Components/Countdown',
  component: Countdown,
  // No variant argTypes — this component has none (§1). The knobs are `class`
  // here, and `value`/`digits` on CountdownValue.
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: 'font-mono text-2xl', slots: { default: val(59) } },
};

// 1. Countdown
export const Default = {
  args: { slots: { default: val(59) } },
};

// 2. Large text with 2 digits
export const LargeTwoDigits = {
  args: { class: 'font-mono text-6xl', slots: { default: val(59, { digits: 2 }) } },
};

// 3. Clock countdown — the separators are bare text between the value spans,
// exactly as the doc page writes them. No separator prop (§2).
export const Clock = {
  args: {
    class: 'font-mono text-2xl',
    slots: { default: [val(10), 'h ', val(24), 'm ', val(59), 's'] },
  },
};

// 4. Clock countdown with colons — the last two pin their width with
// `digits`, which is what stops a clock jittering past 9 (§3c).
export const ClockWithColons = {
  args: {
    class: 'font-mono text-2xl',
    slots: { default: [val(10), ' : ', val(24, { digits: 2 }), ' : ', val(59, { digits: 2 })] },
  },
};

// 5. Large text with labels
export const WithLabels = {
  render: () => [
    '<div class="flex gap-5">',
    ...UNITS.flatMap(([v, label]) => cell(v, label, '', 'text-4xl')),
    '</div>',
  ],
};

// 6. Large text with labels under
export const WithLabelsUnder = {
  render: () => [
    '<div class="grid auto-cols-max grid-flow-col gap-5 text-center">',
    ...UNITS.flatMap(([v, label]) => cell(v, label, 'flex flex-col')),
    '</div>',
  ],
};

// 7. In boxes
export const InBoxes = {
  render: () => [
    '<div class="grid auto-cols-max grid-flow-col gap-5 text-center">',
    ...UNITS.flatMap(([v, label]) =>
      cell(v, label, 'bg-neutral rounded-box text-neutral-content flex flex-col p-2'),
    ),
    '</div>',
  ],
};

// Beyond the doc page: every other story is static by design, so nothing here
// demonstrates the rolling transition. This one carries the caller-side recipe
// from §3e — note it updates three things together, because updating only
// `--value` leaves the accessible name stale.
//
// Whether the story's inline script runs in the canvas is a framework question
// (plans/README.md §7); if the digits sit still, check that before suspecting
// the component.
export const Animated = {
  render: () => [
    { component: Countdown, props: { class: 'font-mono text-6xl' }, slots: { default: val(59, { id: 'cd-secs', digits: 2 }) } },
    `<script>
      (() => {
        const el = document.getElementById('cd-secs');
        if (!el) return;
        setInterval(() => {
          const n = (Number(el.style.getPropertyValue('--value')) + 59) % 60;
          el.style.setProperty('--value', String(n));
          el.setAttribute('aria-label', String(n));
          el.textContent = String(n);
        }, 1000);
      })();
    </script>`,
  ],
};

// Beyond the doc page: the width grows with the digit count, so the left-hand
// pair changes width across the 9→10 boundary and the right-hand pair does not
// (§3c).
export const DigitsJitter = {
  render: () => [
    '<div class="flex flex-col gap-2"><div>no digits — widths differ:</div>',
    { component: Countdown, props: { class: 'font-mono text-4xl' }, slots: { default: [val(9), ' / ', val(10)] } },
    '<div>digits=2 — widths pinned:</div>',
    {
      component: Countdown,
      props: { class: 'font-mono text-4xl' },
      slots: { default: [val(9, { digits: 2 }), ' / ', val(10, { digits: 2 })] },
    },
    '</div>',
  ],
};

// Beyond the doc page, and the one thing the canvas cannot show: the visible
// digits are CSS generated content and the text node is `visibility: hidden`,
// so `aria-label` is the only accessible name. Inspect these in devtools — the
// label is derived from `value`, so the two cannot disagree (§3a).
export const AccessibleName = {
  render: () => [
    { component: Countdown, props: { class: 'font-mono text-2xl' }, slots: { default: val(42) } },
    ' — inspect the inner span: aria-label="42", aria-live="polite", text node hidden by CSS',
  ],
};

// Regression guard: native attributes survive and caller `class` merges on the
// container; on the value span, a caller's own `style` must survive alongside
// the custom properties (§3b).
export const Passthrough = {
  args: {
    id: 'cd-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine font-mono text-2xl',
    slots: { default: val(59, { class: 'value-marker', style: 'color:red', 'data-test': 'inner' }) },
  },
};
