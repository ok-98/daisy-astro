import BrowserMockup from './BrowserMockup.astro';

// The frame, fill and width are caller classes (plan §3b), and the three dots
// belong to the toolbar — no toolbar slot, no dots (plan §3c). `NoToolbar`
// shows that.

const content = (extra = '') =>
  `<div class="grid place-content-center ${extra} h-80">Hello!</div>`;

const addressBar = (url = 'https://daisyui.com') => `<div class="input">${url}</div>`;

export default {
  title: 'Components/BrowserMockup',
  component: BrowserMockup,
  // No variant argTypes — this component has none (plan §1).
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  args: {
    class: 'border border-base-300 w-full',
    slots: { toolbar: addressBar(), default: content('border-t border-base-300') },
  },
};

// 1. Browser mockup with border.
export const WithBorder = {
  args: {
    class: 'border border-base-300 w-full',
    slots: { toolbar: addressBar(), default: content('border-t border-base-300') },
  },
};

// 2. Browser mockup with background color — fills, and drops the rule under
// the toolbar.
export const WithBackgroundColor = {
  args: {
    class: 'bg-base-100 border border-base-300 w-full',
    slots: { toolbar: addressBar(), default: content() },
  },
};

// Beyond the doc page: the toolbar is gated, and it is not inert when empty —
// it carries vertical margin and the `::before` that paints the dots. So a
// mockup with no toolbar slot has no dots at all, and rendering the wrapper
// unconditionally would give this caller an empty dotted strip (§2, §3c).
export const NoToolbar = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no toolbar slot — no strip, and no dots:</div>',
    {
      component: BrowserMockup,
      props: { class: 'border border-base-300 w-full' },
      slots: { default: '<div class="grid place-content-center h-20">Hello!</div>' },
    },
    '<div>with a toolbar:</div>',
    {
      component: BrowserMockup,
      props: { class: 'border border-base-300 w-full' },
      slots: {
        toolbar: addressBar(),
        default: '<div class="grid place-content-center border-t border-base-300 h-20">Hello!</div>',
      },
    },
    '</div>',
  ],
};

// Beyond the doc page: the address bar is a `div` carrying daisyUI's `input`
// class, not an input element — display-only text that daisyUI restyles,
// truncates and gives a magnifier icon inside this toolbar. A long URL
// ellipsises rather than wrapping (§3d).
export const LongUrl = {
  args: {
    class: 'border border-base-300 w-full max-w-sm',
    slots: {
      toolbar: addressBar('https://daisyui.com/components/mockup-browser/a/very/long/path/that/should/truncate'),
      default: content('border-t border-base-300'),
    },
  },
};

// Beyond the doc page: `overflow-y` is hidden, so tall content is cut off with
// no scrollbar — deliberate, since browser chrome should crop like a viewport
// (§3a).
export const OverflowClipping = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>content taller than the frame — silently clipped:</div>',
    {
      component: BrowserMockup,
      props: { class: 'border border-base-300 w-full h-40' },
      slots: {
        toolbar: addressBar(),
        default: '<div class="border-t border-base-300 p-4">' + Array.from({ length: 12 }).map((_, i) => `<p>line ${i + 1}</p>`).join('') + '</div>',
      },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges —
// load-bearing here, since the whole frame arrives that way (§3b).
export const Passthrough = {
  args: {
    id: 'browser-1',
    'data-test': 'yes',
    style: 'max-width:40rem',
    class: 'mine border border-base-300 w-full',
    slots: { toolbar: addressBar(), default: content('border-t border-base-300') },
  },
};
