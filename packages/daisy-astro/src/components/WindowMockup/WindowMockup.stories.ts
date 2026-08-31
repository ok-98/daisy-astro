import WindowMockup from './WindowMockup.astro';

// The frame, background and width are caller classes — every story passes the
// doc page's, because a bare window mockup is three dots over nothing
// (plan §3a). `Unframed` shows that on purpose.

const content = (extra = '') =>
  `<div class="grid place-content-center ${extra} h-80">Hello!</div>`;

export default {
  title: 'Components/WindowMockup',
  component: WindowMockup,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: { class: 'border border-base-300 w-full', slots: { default: content('border-t border-base-300') } },
};

// 1. Window mockup with border — the rule under the title bar is on the
// content div, not the component.
export const WithBorder = {
  args: { class: 'border border-base-300 w-full', slots: { default: content('border-t border-base-300') } },
};

// 2. Window mockup with background color — fills, and drops the rule.
export const WithBackgroundColor = {
  args: { class: 'bg-base-100 border border-base-300 w-full', slots: { default: content() } },
};

// Beyond the doc page: no classes at all. daisyUI supplies the dots and the
// radius and nothing else, so this is three faint dots above unframed,
// content-width content — correct, and visibly incomplete (§3a).
export const Unframed = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no classes — dots over nothing:</div>',
    { component: WindowMockup, slots: { default: '<div class="grid place-content-center h-20">Hello!</div>' } },
    '<div>with the doc page\'s classes:</div>',
    {
      component: WindowMockup,
      props: { class: 'border border-base-300 w-full' },
      slots: { default: '<div class="grid place-content-center border-t border-base-300 h-20">Hello!</div>' },
    },
    '</div>',
  ],
};

// Beyond the doc page: `overflow-y` is hidden, so content taller than the box
// is cut off with **no scrollbar** — deliberate, since a window frame should
// crop like a viewport (§3c).
export const OverflowClipping = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>content taller than the frame — silently clipped:</div>',
    {
      component: WindowMockup,
      props: { class: 'border border-base-300 w-full h-40' },
      slots: { default: '<div class="border-t border-base-300 p-4">' + Array.from({ length: 12 }).map((_, i) => `<p>line ${i + 1}</p>`).join('') + '</div>' },
    },
    '</div>',
  ],
};

// Beyond the doc page: daisyUI ships the Code Mockup gutter rule for this
// component too, so a prefixed `pre` works in here for free (§3c).
export const WithPrefixedCode = {
  args: {
    class: 'border border-base-300 w-full',
    slots: {
      default:
        '<div class="border-t border-base-300 p-4"><pre data-prefix="$"><code>npm i daisyui</code></pre><pre data-prefix="$"><code>installing...</code></pre></div>',
    },
  },
};

// Regression guard: native attributes survive and caller `class` merges —
// load-bearing here, since the whole frame arrives that way (§3a).
export const Passthrough = {
  args: {
    id: 'window-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine border border-base-300 w-full',
    slots: { default: content('border-t border-base-300') },
  },
};
