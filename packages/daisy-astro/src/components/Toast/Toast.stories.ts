import Toast from './Toast.astro';
import Alert from '../Alert/Alert.astro';

// `.toast` is `position: fixed`, so every story is framed the way daisyUI's own
// live demos are — a `relative` box of fixed height, with `absolute` passed to
// the Toast. Without it all thirteen would pin themselves to the same corner of
// the Storybook viewport, on top of each other and outside their canvases. The
// component keeps emitting daisyUI's published markup, which is bare (plan §0a).
//
// The content is real `Alert`s: `.toast` gives its children no class of their
// own, so there is no `ToastItem` (plan §0e).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const alert = (color: 'info' | 'success', text: string): Item => ({
  component: Alert,
  props: { color },
  slots: { default: `<span>${text}</span>` },
});

// Two alerts, as nine of the ten doc examples have — one cannot show the
// `.5rem` column gap or that stacking follows document order regardless of
// placement (plan §0e).
const PAIR: Item[] = [alert('info', 'New mail arrived.'), alert('success', 'Message sent successfully.')];

const framed = (props: Record<string, unknown>, children: Item[] = PAIR): Item[] => [
  '<div class="w-full h-64 relative">',
  { component: Toast, props: { class: 'absolute', ...props }, slots: { default: children } },
  '</div>',
];

export default {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    align: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end'] },
    position: { control: 'inline-radio', options: [undefined, 'top', 'middle', 'bottom'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  render: (args: Record<string, unknown>) => framed(args),
  args: { align: 'end', position: 'bottom' },
};

// 1. Toast with an alert inside — bare, so `end` / `bottom` come from `.toast`
// itself rather than from a class. Identical in place to `BottomEnd` below
// (plan §0b).
//
// This is also the story to watch the entrance animation in: it is
// `.toast > *`, direct children only, and OS reduced motion removes it
// entirely (plan §0c).
export const Default = {
  render: () => framed({}, [alert('info', 'New message arrived.')]),
};

// 2. Top start.
export const TopStart = {
  render: () => framed({ position: 'top', align: 'start' }),
};

// 3. Top center.
export const TopCenter = {
  render: () => framed({ position: 'top', align: 'center' }),
};

// 4. Top end.
export const TopEnd = {
  render: () => framed({ position: 'top', align: 'end' }),
};

// 5. Middle start.
export const MiddleStart = {
  render: () => framed({ align: 'start', position: 'middle' }),
};

// 6. Middle center — centred on both axes, which is the `-50%` translate pair
// doing its job (plan §0b).
export const MiddleCenter = {
  render: () => framed({ align: 'center', position: 'middle' }),
};

// 7. Middle end.
export const MiddleEnd = {
  render: () => framed({ align: 'end', position: 'middle' }),
};

// 8. Bottom start — `bottom` is the default, so only `align` is passed.
export const BottomStart = {
  render: () => framed({ align: 'start' }),
};

// 9. Bottom center.
export const BottomCenter = {
  render: () => framed({ align: 'center' }),
};

// 10. Bottom end — both values are the defaults, so this emits `toast-end` and
// lands exactly where `Default`'s bare toast does.
export const BottomEnd = {
  render: () => framed({ align: 'end' }),
};

// Beyond the doc page: the accessibility recommendation, made concrete. daisyUI
// ships no live region and neither does this component — `aria-live` reaches
// the root through `...rest`, and it is worth adding when toasts are injected
// client-side, where the insertion is the change a live region announces
// (plan §0f).
export const WithLiveRegion = {
  render: () => framed({ 'aria-live': 'polite', 'aria-atomic': 'false', align: 'center', position: 'top' }),
};

// Regression guard: native attributes survive, caller `class` merges after both
// placement classes.
export const Passthrough = {
  render: () =>
    framed({
      align: 'center',
      position: 'middle',
      id: 'toast-1',
      'data-test': 'yes',
      style: 'letter-spacing:1px',
      class: 'absolute mine',
    }),
};
