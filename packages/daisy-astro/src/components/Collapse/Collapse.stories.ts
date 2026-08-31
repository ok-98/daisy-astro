import Collapse from './Collapse.astro';

// One component covers Collapse and Accordion items — the same seven daisyUI
// classes (plan §0a). Group behaviour lives in Accordion's stories.
//
// `font-semibold` / `text-sm` are the doc page's own caller styling, passed
// through `titleClass` / `contentClass` rather than baked in (plan §3d).

const TITLE = 'How do I create an account?';
const BODY = 'Click the "Sign Up" button in the top right corner and follow the registration process.';

const FRAME = 'bg-base-100 border border-base-300';
const SLOTS = { title: TITLE, default: BODY };
const TEXT = { titleClass: 'font-semibold', contentClass: 'text-sm' };

const collapse = (props: Record<string, unknown>) => ({
  component: Collapse,
  props: { class: FRAME, ...TEXT, ...props },
  slots: SLOTS,
});

const label = (text: string) => `<div class="text-xs opacity-60 mt-4 mb-1">${text}</div>`;

export default {
  title: 'Components/Collapse',
  component: Collapse,
  argTypes: {
    trigger: { control: 'radio', options: ['focus', 'checkbox', 'radio', 'details'] },
    icon: { control: 'select', options: [undefined, 'arrow', 'plus'] },
    force: { control: 'select', options: [undefined, 'open', 'close'] },
    open: { control: 'boolean' },
    name: { control: 'text' },
    titleClass: { control: 'text' },
    contentClass: { control: 'text' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: FRAME, ...TEXT, slots: SLOTS },
};

// 1. With focus — the default. `tabindex="0"` comes from the component, since
// daisyUI's open rule for this mode is gated on the attribute and without it
// the collapse never opens (§3a).
export const WithFocus = {
  args: { class: FRAME, ...TEXT, slots: SLOTS },
};

// 2. With checkbox — click to open, click again to close.
export const WithCheckbox = {
  args: { trigger: 'checkbox', class: FRAME, ...TEXT, slots: SLOTS },
};

// 3. With checkbox and close on click outside — **raw markup on purpose**.
// The trick is a `<label>` sitting between the input and the title, as a
// following sibling of the `peer` input, and named slots leave nowhere to put
// an arbitrary direct child of `.collapse`. Documented limitation, not an
// oversight: the fix would be a `before-title` slot, added deliberately if
// anyone needs it (§3f).
export const CloseOnClickOutside = {
  render: () => [
    `<div class="collapse ${FRAME}">
      <input id="collapse-1-toggle" type="checkbox" class="peer" autocomplete="off" />
      <label for="collapse-1-toggle" class="fixed inset-0 hidden peer-checked:block"></label>
      <div class="collapse-title font-semibold">${TITLE}</div>
      <div class="collapse-content text-sm z-1">${BODY}</div>
    </div>`,
  ],
};

// 4. Using details and summary — the title becomes a `<summary>`, daisyUI
// hides the disclosure triangle itself, and the content stays findable by the
// browser's find-in-page while closed (§3a, §3b).
export const WithDetails = {
  args: { trigger: 'details', class: FRAME, ...TEXT, slots: SLOTS },
};

// 5. Without border and background color — daisyUI supplies neither, so this
// is what a bare `Collapse` is (§1).
export const Unstyled = {
  args: { ...TEXT, slots: SLOTS },
};

// 6. With arrow icon.
export const WithArrowIcon = {
  args: { icon: 'arrow', class: FRAME, ...TEXT, slots: SLOTS },
};

// 7. With plus/minus icon.
export const WithPlusIcon = {
  args: { icon: 'plus', class: FRAME, ...TEXT, slots: SLOTS },
};

// 8. Moving the icon to the start — the icon is an `::after` on the title, so
// only a title class can move it, and the padding has to be mirrored by hand
// (§3d).
export const IconAtStart = {
  args: {
    icon: 'arrow',
    class: FRAME,
    titleClass: 'font-semibold after:start-5 after:end-auto pe-4 ps-12',
    contentClass: 'text-sm',
    slots: SLOTS,
  },
};

// 9. Force open — stays open, whatever the input says.
export const ForceOpen = {
  args: { force: 'open', class: FRAME, ...TEXT, slots: SLOTS },
};

// 10. Force close — will not open when clicked.
export const ForceClose = {
  args: { force: 'close', class: FRAME, ...TEXT, slots: SLOTS },
};

// 11. Custom colors that work with focus — the whole root changes colour on
// `:focus`, so plain Tailwind on `class` is enough.
export const CustomColorsFocus = {
  args: {
    class: 'bg-primary text-primary-content focus:bg-secondary focus:text-secondary-content',
    ...TEXT,
    slots: SLOTS,
  },
};

// 12. Custom colors that work with checkbox — this one needs `peer-checked:`
// on the title *and* the content, which only works because the component
// stamps `class="peer"` on the input it renders (§3h). Without that the
// utilities would compile and silently never match.
export const CustomColorsCheckbox = {
  args: {
    trigger: 'checkbox',
    class: FRAME,
    titleClass: 'bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content',
    contentClass: 'bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content',
    slots: SLOTS,
  },
};

// Beyond the doc page: all four triggers together, since no doc page shows
// them side by side and picking one is the main decision a caller makes (§3a).
export const Triggers = {
  render: () => [
    '<div class="flex flex-col">',
    label('focus — opens on tab-in, closes on tab-out; cannot hold anything clickable'),
    collapse({}),
    label('checkbox — click to toggle'),
    collapse({ trigger: 'checkbox' }),
    label('radio — one open at a time within the name; two here share "triggers-demo"'),
    collapse({ trigger: 'radio', name: 'triggers-demo' }),
    collapse({ trigger: 'radio', name: 'triggers-demo' }),
    label('details — native, and findable by find-in-page while closed'),
    collapse({ trigger: 'details' }),
    '</div>',
  ],
};

// Beyond the doc page: `force="close"` on a details collapse, which visibly
// does nothing. daisyUI's open rule for that branch is a bare `[open]` with no
// `collapse-close` guard, so the class is inert here — the doc page says so in
// its own heading, and this makes it observable (§3e).
export const ForceWithDetails = {
  render: () => [
    '<div class="flex flex-col">',
    label('div + force="close" — will not open'),
    collapse({ trigger: 'checkbox', force: 'close' }),
    label('details + force="close" + open — opens anyway, the class is ignored'),
    collapse({ trigger: 'details', force: 'close', open: true }),
    '</div>',
  ],
};

// Regression guard: native attributes survive, caller `class` merges onto the
// root, and the part classes reach their own wrappers (§3d).
export const Passthrough = {
  args: {
    trigger: 'checkbox',
    id: 'collapse-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: `mine ${FRAME}`,
    titleClass: 'title-marker',
    contentClass: 'content-marker',
    slots: SLOTS,
  },
};
