import Accordion from './Accordion.astro';
import Collapse from '../Collapse/Collapse.astro';

// An accordion is N `Collapse`s sharing a radio `name` — daisyUI has no
// accordion class, and there is no `AccordionItem` component
// (plans/components/collapse.md §0a). This wrapper only does the grouping.
//
// `name` repeats on every item because a wrapper cannot reach into its own
// slot content (plan §0a). Intended, and the reason these stories build the
// items from an array rather than by hand.

const ITEMS: Array<[string, string]> = [
  ['How do I create an account?', 'Click the "Sign Up" button in the top right corner and follow the registration process.'],
  ['I forgot my password. What should I do?', 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.'],
  ['How do I update my profile information?', 'Go to "My Account" settings and select "Edit Profile" to make changes.'],
];

const FRAME = 'bg-base-100 border border-base-300';

const items = (name: string, props: Record<string, unknown> = {}, frame = FRAME) =>
  ITEMS.map(([title, body], i) => ({
    component: Collapse,
    props: {
      trigger: 'radio',
      name,
      open: i === 0,
      class: frame,
      titleClass: 'font-semibold',
      contentClass: 'text-sm',
      ...props,
    },
    slots: { title, default: body },
  }));

export default {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    join: { control: 'boolean' },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { class: 'flex flex-col gap-2', slots: { default: items('playground') } },
};

// 1. Using radio inputs — the shared `name` is the whole mechanism: opening one
// closes the others. Get it wrong and each item opens independently, which
// looks correct until you click a second one (plan §0a).
export const UsingRadioInputs = {
  args: { class: 'flex flex-col gap-2', slots: { default: items('my-accordion-1') } },
};

// 2. Using details — native exclusive behaviour from `<details name>`, which
// additionally allows **all** closed; a checked radio cannot be unchecked by
// clicking it (plans/components/collapse.md §3c).
export const UsingDetails = {
  args: {
    class: 'flex flex-col gap-2',
    slots: { default: items('my-accordion-det-1', { trigger: 'details' }) },
  },
};

// 3. With arrow icon.
export const WithArrowIcon = {
  args: {
    class: 'flex flex-col gap-2',
    slots: { default: items('my-accordion-2', { icon: 'arrow' }) },
  },
};

// 4. With plus/minus icon.
export const WithPlusMinusIcon = {
  args: {
    class: 'flex flex-col gap-2',
    slots: { default: items('my-accordion-3', { icon: 'plus' }) },
  },
};

// 5. Accordion and Join together — one bordered stack rather than three
// separately-rounded boxes. `join-item` on each child comes from the
// `[&>*]:join-item` variant on the wrapper, so the items pass nothing extra
// (plan §3c).
export const WithJoin = {
  args: {
    join: true,
    class: 'bg-base-100',
    slots: { default: items('my-accordion-4', { icon: 'arrow' }, 'border-base-300 border') },
  },
};

// Regression guard, at two levels: the wrapper's own attributes survive, and
// the items keep theirs.
export const Passthrough = {
  args: {
    join: true,
    id: 'accordion-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine bg-base-100',
    slots: {
      default: [
        {
          component: Collapse,
          props: {
            trigger: 'radio',
            name: 'passthrough',
            open: true,
            id: 'item-1',
            'data-test': 'item',
            class: 'item-marker border-base-300 border',
          },
          slots: { title: 'Passthrough', default: 'Body' },
        },
        {
          component: Collapse,
          props: { trigger: 'radio', name: 'passthrough', class: 'border-base-300 border' },
          slots: { title: 'Second', default: 'Body' },
        },
      ],
    },
  },
};
