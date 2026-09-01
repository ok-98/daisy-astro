import Join from '../Join/Join.astro';
import Button from '../Button/Button.astro';

// **There is no Pagination component, deliberately** (plan §0).
//
// daisyUI's pagination page has no CSS of its own: its `source` link points at
// Join's stylesheet, its class list *is* Join's class list, and every example
// is a `join` wrapping `btn join-item` buttons. `grep -r pagination` across the
// installed package returns nothing. So a `Pagination.astro` would be an import
// and a second name for `Join`, and would have to re-export Join's direction
// plus Button's entire surface for the items.
//
// The stories stay, because these six compositions are the recipes a caller
// actually reaches for. There is no `Passthrough` story here: there is nothing
// to forward props through.

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// The active page is `btn-active`, which is **visual only**. A real pagination
// control also needs `aria-current="page"`, which daisyUI's examples omit and
// these stories add — the same conclusion breadcrumbs.md §3b and dock.md §3b
// reached for their own active states (plan §3a).
const page = (label: string, props: Record<string, unknown> = {}): Item => ({
  component: Button,
  props: { class: 'join-item', ...props },
  slots: { default: label },
});

const activePage = (label: string, props: Record<string, unknown> = {}): Item =>
  page(label, { active: true, 'aria-current': 'page', ...props });

const pages = (labels: string[], activeIndex = 1, props: Record<string, unknown> = {}) =>
  labels.map((label, i) => (i === activeIndex ? activePage(label, props) : page(label, props)));

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default {
  title: 'Components/Pagination',
  // `component` names `Join`, not a Pagination component — there isn't one.
  // The framework **requires** this field: without it the file indexes but
  // prerenders **zero** stories, with no warning (plan §0c).
  component: Join,
  argTypes: {
    count: { control: { type: 'number', min: 1, max: 12 } },
    activeIndex: { control: { type: 'number', min: 0, max: 11 } },
    size: { control: 'select', options: [undefined, ...SIZES] },
  },
};

// The two things a caller actually tunes.
export const Playground = {
  render: (args: Record<string, unknown>) => {
    const count = Number(args.count ?? 4);
    const activeIndex = Number(args.activeIndex ?? 1);
    const size = args.size as (typeof SIZES)[number] | undefined;
    return [
      {
        component: Join,
        slots: {
          default: pages(
            Array.from({ length: count }, (_, i) => String(i + 1)),
            activeIndex,
            size ? { size } : {},
          ),
        },
      },
    ];
  },
  args: { count: 4, activeIndex: 1 },
};

// 1. With an active button.
export const Default = {
  render: () => [{ component: Join, slots: { default: pages(['1', '2', '3', '4']) } }],
};

// 2. Sizes — Button's own size axis; Join adds nothing per size.
export const Sizes = {
  render: () => [
    '<div class="flex flex-col gap-2 items-center">',
    ...SIZES.map((size) => ({
      component: Join,
      slots: { default: pages(['1', '2', '3', '4'], 1, { size }) },
    })),
    '</div>',
  ],
};

// 3. With a disabled button — daisyUI writes the ellipsis as a **focusable
// `<button>` styled disabled**, reproduced here as published.
//
// Two notes rather than a silent divergence (plan §3b): on a real `<button>`
// the native `disabled` attribute is the right call, which is what `Button`'s
// `disabled` prop emits; and an ellipsis is a *label*, not a control, so a
// `<span class="join-item btn btn-disabled">` or plain text is better still.
export const WithEllipsis = {
  render: () => [
    {
      component: Join,
      slots: {
        default: [
          page('1'),
          page('2'),
          { component: Button, props: { class: 'join-item', disabled: true }, slots: { default: '...' } },
          page('99'),
          page('100'),
        ],
      },
    },
  ],
};

// 4. Previous / page / next. **Renamed from the doc page's own heading**,
// "Extra small buttons", which sits above an example with no size class at all
// — a stale heading in daisyUI's docs (plan §3c).
export const PrevPageNext = {
  render: () => [
    { component: Join, slots: { default: [page('«'), page('Page 22'), page('»')] } },
  ],
};

// 5. Equal-width prev/next — the one non-obvious trick on the page: a Tailwind
// grid **on the join** is what makes the two items equal width (plan §3c).
export const EqualWidthPrevNext = {
  render: () => [
    {
      component: Join,
      props: { class: 'grid grid-cols-2' },
      slots: {
        default: [
          { component: Button, props: { class: 'join-item', variant: 'outline' }, slots: { default: 'Previous page' } },
          { component: Button, props: { class: 'join-item', variant: 'outline' }, slots: { default: 'Next' } },
        ],
      },
    },
  ],
};

// 6. Radio inputs — one radio group that looks like a pager. `aria-label` is
// the **visible text** for an input-rooted button, so without it these render
// as four empty squares (plans/components/button.md §3c).
export const RadioInputs = {
  render: () => [
    {
      component: Join,
      slots: {
        default: ['1', '2', '3', '4'].map((label, i) => ({
          component: Button,
          props: {
            as: 'input',
            type: 'radio',
            name: 'pagination-options',
            autocomplete: 'off',
            'aria-label': label,
            shape: 'square',
            class: 'join-item',
            ...(i === 0 ? { checked: true } : {}),
          },
        })),
      },
    },
  ],
};
