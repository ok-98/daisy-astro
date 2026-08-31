import Alert from './Alert.astro';
import Button from '../Button/Button.astro';

// The alert's layout is a function of its direct child count, so these stories
// pass icon / text / actions as separate children rather than wrapping them
// (plan §2). `WrappedChildren` shows what a single wrapper does.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// daisyUI's own icons, verbatim.
const ICON = {
  info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
  infoTinted: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current text-info shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
  success: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  warning: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
  error: '<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
} as const;

const MESSAGE = {
  info: 'New software update available.',
  success: 'Your purchase has been confirmed!',
  warning: 'Warning: Invalid email address!',
  error: 'Error! Task failed successfully.',
} as const;

const COLORS = ['info', 'success', 'warning', 'error'] as const;

const text = (s: string) => `<span>${s}</span>`;

const alert = (props: Record<string, unknown>, children: Item[]): Item => ({
  component: Alert,
  props: { class: 'w-full', ...props },
  slots: { default: children },
});

// One column of all four colours, which is how the style examples are shown.
const styleColumn = (variant: 'soft' | 'outline' | 'dash'): Item[] => [
  '<div class="flex flex-col gap-2 w-full">',
  ...COLORS.map((color) => alert({ color, variant }, [text(MESSAGE[color])])),
  '</div>',
];

export default {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    color: { control: 'select', options: [undefined, ...COLORS] },
    variant: { control: 'select', options: [undefined, 'outline', 'dash', 'soft'] },
    direction: { control: 'radio', options: [undefined, 'vertical', 'horizontal'] },
  },
};

export const Playground = {
  args: {
    color: 'info',
    class: 'w-full',
    slots: { default: [ICON.info, text(MESSAGE.info)] },
  },
};

// 1. Alert — no colour, and the icon carries its own `text-info` tint.
export const Default = {
  args: { class: 'w-full', slots: { default: [ICON.infoTinted, text('12 unread messages. Tap to see.')] } },
};

// 2–5. One story per colour example. The icon inherits the alert's colour
// through `stroke-current`, so it carries no tint of its own here.
export const Info = {
  args: { color: 'info', class: 'w-full', slots: { default: [ICON.info, text(MESSAGE.info)] } },
};
export const Success = {
  args: { color: 'success', class: 'w-full', slots: { default: [ICON.success, text(MESSAGE.success)] } },
};
export const Warning = {
  args: { color: 'warning', class: 'w-full', slots: { default: [ICON.warning, text(MESSAGE.warning)] } },
};
export const ErrorColor = {
  args: { color: 'error', class: 'w-full', slots: { default: [ICON.error, text(MESSAGE.error)] } },
};

// 6–8. The three styles, each across all four colours as the page shows them.
export const SoftStyle = { render: () => styleColumn('soft') };
export const OutlineStyle = { render: () => styleColumn('outline') };
export const DashStyle = { render: () => styleColumn('dash') };

// 9. Alert with buttons, and the responsive direction — `alert-vertical` with
// `sm:alert-horizontal` as a caller class, because daisyUI ships the prefixed
// variants itself and a prop would need an interpolated class name (§3c).
// The two buttons share one wrapper div deliberately: that div is the alert's
// third child, which is what the grid lays out.
export const WithButtons = {
  args: {
    direction: 'vertical',
    class: 'w-full sm:alert-horizontal',
    slots: {
      default: [
        ICON.infoTinted,
        text('we use cookies for no reason.'),
        '<div>',
        { component: Button, props: { size: 'sm' }, slots: { default: 'Deny' } },
        { component: Button, props: { size: 'sm', color: 'primary' }, slots: { default: 'Accept' } },
        '</div>',
      ],
    },
  },
};

// 10. Alert with title and description — the heading and body share a wrapper
// so they count as one child, with the button as the third. Plain Tailwind, not
// component structure: `alert-title` does not exist (§2).
export const WithTitleAndDescription = {
  args: {
    direction: 'vertical',
    class: 'w-full sm:alert-horizontal',
    slots: {
      default: [
        ICON.infoTinted,
        '<div><h3 class="font-bold">New message!</h3><div class="text-xs">You have 1 unread message</div></div>',
        { component: Button, props: { size: 'sm' }, slots: { default: 'See' } },
      ],
    },
  },
};

// Beyond the doc page: the failure §2 exists to prevent. The first alert wraps
// its icon and text in one div, so the grid sees a single child and lays out
// one centred column — the markup looks fine and the layout is wrong.
export const WrappedChildren = {
  render: () => [
    '<div class="flex flex-col gap-4 w-full"><div>children wrapped in one div — collapses to a single column:</div>',
    alert({ color: 'info' }, [`<div>${ICON.info}${text(MESSAGE.info)}</div>`]),
    '<div>children passed directly — icon and text as separate columns:</div>',
    alert({ color: 'info' }, [ICON.info, text(MESSAGE.info)]),
    '</div>',
  ],
};

// Beyond the doc page: `role` is defaulted, not hardcoded. An informational
// alert may prefer the polite live region, which is a caller override rather
// than something this component branches on by colour (§3b).
export const PoliteRole = {
  render: () => [
    '<div class="flex flex-col gap-4 w-full"><div>default — role="alert", an assertive live region:</div>',
    alert({ color: 'info' }, [ICON.info, text(MESSAGE.info)]),
    '<div>role="status" — polite:</div>',
    alert({ color: 'info', role: 'status' }, [ICON.info, text(MESSAGE.info)]),
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges, and the
// `role` default is overridable.
export const Passthrough = {
  args: {
    color: 'warning',
    variant: 'soft',
    id: 'alert-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine w-full',
    slots: { default: [ICON.warning, text('Passthrough')] },
  },
};
