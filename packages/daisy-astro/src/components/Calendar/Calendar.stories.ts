import Calendar from './Calendar.astro';

// daisyUI's Calendar is theme CSS for third-party calendar libraries, not a
// daisyUI component (plan §0). These stories cover **Cally only**: React Day
// Picker is React-only, and Vanilla Calendar Pro needs an imperative
// `new Calendar(el).init()` per instance, which collides with this library's
// one-script-per-page rule. Both are out of scope by decision, not oversight
// (plan §0a).
//
// `.storybook/preview.ts` does `import 'cally'`. Without that every story here
// renders an **empty box with no error**, because an unregistered custom
// element is just an unknown inline tag (plan §3a).

const FRAME = 'bg-base-100 border border-base-300 shadow-lg rounded-box';

export default {
  title: 'Components/Calendar',
  component: Calendar,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: FRAME },
};

// 1. Cally calendar — the box classes are the caller's, and they work because
// they are **host-level** properties. Anything aimed at a day would not: those
// live in the shadow DOM and daisyUI reaches them through `::part()` (§3d).
//
// Today should be `--color-primary` and a selection `--color-base-content`,
// following the active theme with no prop of any kind.
export const Default = {
  args: { class: FRAME },
};

// 2. Cally date picker — **this is a Dropdown, not a calendar feature.** The
// doc page builds it from a `popovertarget` button plus a popover using the CSS
// Anchor Positioning API; none of it is calendar CSS, so this component offers
// no `picker` or `popover` prop (§3e). Reproduced, not extended — anchor
// positioning has real browser-support limits and the doc page does not paper
// over them either.
export const InDropdown = {
  render: () => [
    '<button popovertarget="cally-popover" class="input input-border" id="cally-input" style="anchor-name:--cally1">Pick a date</button>',
    '<div popover id="cally-popover" class="dropdown bg-base-100 rounded-box shadow-lg" style="position-anchor:--cally1">',
    { component: Calendar, props: { class: 'p-2' } },
    '</div>',
  ],
};

// Beyond the doc page: overriding the arrows. **`slot="previous"` here means
// two things at once** — Astro's named slot and the web component's shadow-DOM
// slot — and both are needed, which is a coincidence worth seeing at a real
// call site (§3b).
//
// If the arrows vanish, the attribute is being swallowed somewhere; check the
// rendered HTML before suspecting the component.
export const CustomArrows = {
  render: () => [
    {
      component: Calendar,
      props: { class: FRAME },
      slots: {
        previous: '<span slot="previous" class="px-1">←</span>',
        next: '<span slot="next" class="px-1">→</span>',
      },
    },
  ],
};

// Beyond the doc page: **the zero-dependency answer**, which daisyUI's own page
// leads with before naming any library. `<input type="date">` needs no
// dependency, no custom element and no registration, and `TextInput` already
// styles it (§0a).
export const NativeDateInput = {
  render: () => [
    '<div class="flex flex-col gap-4"><div class="text-xs opacity-60">native — no dependency</div>',
    '<input type="date" class="input" />',
    '<div class="text-xs opacity-60">Cally — needs the optional peer dependency</div>',
    { component: Calendar, props: { class: FRAME } },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges after
// the `cally` entry class.
export const Passthrough = {
  args: {
    id: 'cal-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: `mine ${FRAME}`,
    value: '2026-09-01',
    locale: 'en-GB',
  },
};
