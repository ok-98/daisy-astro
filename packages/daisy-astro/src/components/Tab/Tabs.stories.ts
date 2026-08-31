import Tabs from './Tabs.astro';
import Tab from './Tab.astro';
import TabContent from './TabContent.astro';

// Every radio story uses a story-scoped `name`. Radios sharing a name are one
// group wherever they sit in the document, so unscoped names would make the
// seven radio stories on one docs page fight each other — daisyUI comments the
// same warning on every one of its own examples (plan §3d).

type Item = string | { component: unknown; props?: Record<string, unknown>; slots?: Record<string, unknown> };

// The link shape: label from the slot, selection managed by the caller.
const linkTabs = (): Item[] =>
  ['Tab 1', 'Tab 2', 'Tab 3'].map((label, i) => ({
    component: Tab,
    props: { as: 'a', role: 'tab', ...(i === 1 ? { active: true } : {}) },
    slots: { default: label },
  }));

// The radio shape: label from `aria-label`, selection from `:checked`, and each
// panel is the tab's immediate next sibling (§3c).
const radioTabs = (name: string, contentClass: string, count = 3): Item[] =>
  Array.from({ length: count }).flatMap((_, i) => [
    {
      component: Tab,
      props: {
        as: 'input',
        type: 'radio',
        name,
        'aria-label': `Tab ${i + 1}`,
        ...(i === 1 ? { checked: true } : {}),
      },
    },
    { component: TabContent, props: { class: contentClass }, slots: { default: `Tab content ${i + 1}` } },
  ]);

export default {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: [undefined, 'box', 'border', 'lift'] },
    placement: { control: 'radio', options: [undefined, 'top', 'bottom'] },
    size: { control: 'select', options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
};

export const Playground = {
  args: { role: 'tablist', slots: { default: linkTabs() } },
};

// 1–4. The four style examples, all in the link shape.
export const Default = { args: { role: 'tablist', slots: { default: linkTabs() } } };
export const Border = { args: { role: 'tablist', variant: 'border', slots: { default: linkTabs() } } };
export const Lift = { args: { role: 'tablist', variant: 'lift', slots: { default: linkTabs() } } };
export const Box = { args: { role: 'tablist', variant: 'box', slots: { default: linkTabs() } } };

// 5. Sizes.
export const Sizes = {
  render: () =>
    (['xs', 'sm', 'md', 'lg', 'xl'] as const).flatMap((size) => [
      { component: Tabs, props: { role: 'tablist', variant: 'lift', size }, slots: { default: linkTabs() } },
      '<div class="h-4"></div>',
    ]),
};

// 6. Radio tabs with content, border variant. Note the interleaving — tab,
// panel, tab, panel — which is what makes the panels work at all (§3c).
export const RadioBorderWithContent = {
  args: {
    variant: 'border',
    slots: { default: radioTabs('tabs-border-story', 'border-base-300 bg-base-100 p-10') },
  },
};

// 7. Radio tabs with content, lift variant.
export const RadioLiftWithContent = {
  args: {
    variant: 'lift',
    slots: { default: radioTabs('tabs-lift-story', 'bg-base-100 border-base-300 p-6') },
  },
};

// 8. Content at the bottom — the DOM order is unchanged, `tabs-bottom` reorders
// visually through daisyUI's `--tab-order` property (§3e).
export const RadioLiftContentBottom = {
  args: {
    variant: 'lift',
    placement: 'bottom',
    slots: { default: radioTabs('tabs-bottom-story', 'bg-base-100 border-base-300 p-6') },
  },
};

// 9. Horizontal scroll — the wrapper scrolls, the tab row is `min-w-max`, and
// each panel is sticky so it stays put while the tabs slide.
export const HorizontalScroll = {
  render: () => [
    '<div class="overflow-x-auto max-w-60">',
    {
      component: Tabs,
      props: { variant: 'lift', class: 'min-w-max' },
      slots: {
        default: Array.from({ length: 4 }).flatMap((_, i) => [
          {
            component: Tab,
            props: {
              as: 'input',
              type: 'radio',
              name: 'tabs-scroll-story',
              class: 'z-1',
              'aria-label': `Tab title ${i + 1}`,
              ...(i === 1 ? { checked: true } : {}),
            },
          },
          {
            component: TabContent,
            props: { class: 'sticky start-0 max-w-60 border-base-300 bg-base-100 p-6' },
            slots: { default: `Tab content ${i + 1}` },
          },
        ]),
      },
    },
    '</div>',
  ],
};

// 10. Custom colour — two custom properties plus a text utility, all on the
// tab. There is no colour prop because none of those is a daisyUI class (§3e).
export const CustomColor = {
  args: {
    role: 'tablist',
    variant: 'lift',
    slots: {
      default: [
        { component: Tab, props: { as: 'a', role: 'tab' }, slots: { default: 'Tab 1' } },
        {
          component: Tab,
          props: {
            as: 'a',
            role: 'tab',
            active: true,
            class: 'text-primary [--tab-bg:orange] [--tab-border-color:red]',
          },
          slots: { default: 'Tab 2' },
        },
        { component: Tab, props: { as: 'a', role: 'tab' }, slots: { default: 'Tab 3' } },
      ],
    },
  },
};

// Beyond the doc page: a radio tab draws its label from `aria-label` via
// generated content, so one without it is a blank tab — not a tab with missing
// text, a tab with nothing at all (§3a).
export const RadioWithoutAriaLabel = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>no aria-label — blank tabs:</div>',
    {
      component: Tabs,
      props: { variant: 'border' },
      slots: {
        default: [
          { component: Tab, props: { as: 'input', type: 'radio', name: 'tabs-noaria-story', checked: true } },
          { component: Tab, props: { as: 'input', type: 'radio', name: 'tabs-noaria-story' } },
        ],
      },
    },
    '<div>with aria-label:</div>',
    {
      component: Tabs,
      props: { variant: 'border' },
      slots: { default: radioTabs('tabs-witharia-story', 'bg-base-100 border-base-300 p-6', 2) },
    },
    '</div>',
  ],
};

// Beyond the doc page: the mistake the interleaved markup exists to prevent.
// The panel selector is adjacent-sibling, so all-tabs-then-all-panels hides
// every panel with no error (§3c).
export const PanelsAfterAllTabs = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>all tabs, then all panels — nothing shows:</div>',
    {
      component: Tabs,
      props: { variant: 'border' },
      slots: {
        default: [
          ...Array.from({ length: 2 }).map((_, i) => ({
            component: Tab,
            props: {
              as: 'input',
              type: 'radio',
              name: 'tabs-wrongorder-story',
              'aria-label': `Tab ${i + 1}`,
              ...(i === 0 ? { checked: true } : {}),
            },
          })),
          ...Array.from({ length: 2 }).map((_, i) => ({
            component: TabContent,
            props: { class: 'bg-base-100 border-base-300 p-6' },
            slots: { default: `Tab content ${i + 1}` },
          })),
        ],
      },
    },
    '<div>interleaved — correct:</div>',
    {
      component: Tabs,
      props: { variant: 'border' },
      slots: { default: radioTabs('tabs-rightorder-story', 'bg-base-100 border-base-300 p-6', 2) },
    },
    '</div>',
  ],
};

// Beyond the doc page: panels hang off `:checked`, and a button has no checked
// state — so button tabs plus TabContent shows nothing, however the markup is
// ordered. Those tab sets need the caller's own show/hide (§3c).
export const ButtonTabsWithPanels = {
  render: () => [
    '<div class="flex flex-col gap-4"><div>button tabs with panels — the panels never appear:</div>',
    {
      component: Tabs,
      props: { role: 'tablist', variant: 'border' },
      slots: {
        default: [
          { component: Tab, props: { role: 'tab', active: true }, slots: { default: 'Tab 1' } },
          { component: TabContent, props: { class: 'bg-base-100 border-base-300 p-6' }, slots: { default: 'Tab content 1' } },
          { component: Tab, props: { role: 'tab' }, slots: { default: 'Tab 2' } },
          { component: TabContent, props: { class: 'bg-base-100 border-base-300 p-6' }, slots: { default: 'Tab content 2' } },
        ],
      },
    },
    '</div>',
  ],
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  args: {
    role: 'tablist',
    variant: 'lift',
    placement: 'top',
    size: 'lg',
    id: 'tabs-1',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: linkTabs() },
  },
};
