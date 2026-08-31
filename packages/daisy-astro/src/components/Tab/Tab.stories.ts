import Tab from './Tab.astro';
import Tabs from './Tabs.astro';

// A `Tab` is styled by `.tabs > .tab`, a child selector, so it only means
// anything inside a `Tabs` (plan §3f.1). Names are story-scoped (plan §3d).

const inTabs = (props: Record<string, unknown>, label?: string) => [
  {
    component: Tabs,
    props: { role: 'tablist', variant: 'lift' },
    slots: {
      default: [
        { component: Tab, props, ...(label === undefined ? {} : { slots: { default: label } }) },
        { component: Tab, props: { role: 'tab' }, slots: { default: 'Other' } },
      ],
    },
  },
];

export default {
  title: 'Components/Tabs/Tab',
  component: Tab,
  argTypes: {
    as: { control: 'text' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export const Playground = {
  render: () => inTabs({ role: 'tab', active: true }, 'Tab 1'),
};

// The radio shape, where the label comes from `aria-label` rather than the
// slot — pass no children at all (§3a).
export const AsRadio = {
  render: () => [
    {
      component: Tabs,
      props: { variant: 'lift' },
      slots: {
        default: [
          { component: Tab, props: { as: 'input', type: 'radio', name: 'tab-story-radio', 'aria-label': 'Tab 1', checked: true } },
          { component: Tab, props: { as: 'input', type: 'radio', name: 'tab-story-radio', 'aria-label': 'Tab 2' } },
        ],
      },
    },
  ],
};

// The label shape, which wraps its own hidden radio and takes its text from
// the slot (§3a).
export const AsLabel = {
  render: () => [
    {
      component: Tabs,
      props: { variant: 'lift' },
      slots: {
        default: [
          {
            component: Tab,
            props: { as: 'label' },
            slots: { default: '<input type="radio" name="tab-story-label" checked />Live' },
          },
          {
            component: Tab,
            props: { as: 'label' },
            slots: { default: '<input type="radio" name="tab-story-label" />Draft' },
          },
        ],
      },
    },
  ],
};

// Disabled is visual; on a button, add the native attribute too.
export const Disabled = {
  render: () => inTabs({ role: 'tab', disabled: true }, 'Tab 1'),
};

// Regression guard: native attributes survive and caller `class` merges.
// `aria-selected` is the accessible counterpart to the visual `active` (§3b).
export const Passthrough = {
  render: () =>
    inTabs(
      {
        as: 'a',
        role: 'tab',
        href: '#tab-1',
        active: true,
        'aria-selected': 'true',
        id: 'tab-1',
        'data-test': 'yes',
        style: 'letter-spacing:2px',
        class: 'mine',
      },
      'Passthrough',
    ),
};
