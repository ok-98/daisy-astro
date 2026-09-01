import Join from './Join.astro';
import Button from '../Button/Button.astro';
import Badge from '../Badge/Badge.astro';
import TextInput from '../TextInput/TextInput.astro';
import Select from '../Select/Select.astro';

// `join-item` is a caller class on components you already have — there is no
// `JoinItem` (plan §2). Items may be nested inside wrappers; the corner radii
// arrive as inherited custom properties (plan §3a).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

const button = (label = 'Button', cls = 'join-item'): Item => ({
  component: Button,
  props: { class: cls },
  slots: { default: label },
});

const THREE = [button(), button(), button()];

export default {
  title: 'Components/Join',
  component: Join,
  argTypes: {
    direction: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    class: { control: 'text' },
  },
};

export const Playground = {
  args: { slots: { default: THREE } },
};

// 1. Join — outer corners rounded, single-width borders between items.
export const Default = {
  args: { slots: { default: THREE } },
};

// 2. Vertical.
export const Vertical = {
  args: { direction: 'vertical', slots: { default: THREE } },
};

// 3. Responsive — vertical on small screens, horizontal from `lg`. The
// breakpoint half is a caller class; only the base half is a prop (§3c).
export const Responsive = {
  args: { direction: 'vertical', class: 'lg:join-horizontal', slots: { default: THREE } },
};

// 4. With extra elements in the group — **the point of this story is that it
// looks identical to a flat join.** The input is two wrappers deep, and the
// button is inside an `indicator`; both still get their outer corners, because
// the radii are inherited custom properties rather than direct-child styling
// (§3a).
export const NestedItems = {
  args: {
    slots: {
      default: [
        '<div><div>',
        { component: TextInput, props: { class: 'join-item w-[5.3rem] md:w-52', placeholder: 'Search' } },
        '</div></div>',
        {
          component: Select,
          props: { class: 'join-item w-[5.8rem] md:w-auto' },
          slots: {
            default: [
              '<option disabled selected>Filter</option>',
              '<option>Sci-fi</option>',
              '<option>Drama</option>',
              '<option>Action</option>',
            ],
          },
        },
        // TODO(daisy-astro): compose <Indicator> here once it is implemented — see plans/components/join.md §5
        '<div class="indicator">',
        { component: Badge, props: { color: 'secondary', class: 'indicator-item' }, slots: { default: 'new' } },
        button('Search'),
        '</div>',
      ],
    },
  },
};

// 5. Custom border radius — a plain utility on one item. `.join-item`'s radii
// come from low-specificity `:where()` rules, so `rounded-e-full` wins with no
// `!important` and no prop (§3d).
export const CustomRadius = {
  args: {
    slots: {
      default: [
        { component: TextInput, props: { type: 'email', class: 'join-item w-36 lg:w-52', placeholder: 'Email' } },
        button('Subscribe', 'join-item rounded-e-full'),
      ],
    },
  },
};

// 6. Radio inputs with button styling — one radio group that looks like a
// segmented control. `aria-label` is the visible text for an input-rooted
// button (plans/components/button.md §3c).
export const RadioButtons = {
  args: {
    slots: {
      default: ['Radio 1', 'Radio 2', 'Radio 3'].map((label) => ({
        component: Button,
        props: {
          as: 'input',
          type: 'radio',
          name: 'join-options',
          autocomplete: 'off',
          'aria-label': label,
          class: 'join-item',
        },
      })),
    },
  },
};

// Beyond the doc page: a disabled item in the middle. Disabled items are
// excluded from the negative border-collapsing margin and get explicit border
// widths instead, so this one keeps all its edges rather than losing one to its
// neighbour (§3d).
export const WithDisabledItem = {
  args: {
    slots: {
      default: [
        button('One'),
        { component: Button, props: { class: 'join-item', disabled: true }, slots: { default: 'Two (disabled)' } },
        button('Three'),
      ],
    },
  },
};

// Beyond the doc page: tab into this one. A focused item is raised to
// `z-index: 2` — through wrappers too, via `:has(:focus)` — so its focus ring
// is not clipped by the neighbour overlapping it (§3d).
export const FocusRaisesItem = {
  args: {
    slots: {
      default: [
        button('Before'),
        { component: TextInput, props: { class: 'join-item', placeholder: 'Focus me' } },
        button('After'),
      ],
    },
  },
};

// Regression guard: native attributes survive and caller `class` merges after
// the direction class.
export const Passthrough = {
  args: {
    direction: 'vertical',
    id: 'join-1',
    'data-test': 'yes',
    style: 'letter-spacing:1px',
    class: 'mine lg:join-horizontal',
    slots: { default: THREE },
  },
};
