import TabContent from './TabContent.astro';
import Tab from './Tab.astro';
import Tabs from './Tabs.astro';

// A panel is shown by an adjacent-sibling rule off its tab's `:checked` state,
// so it only means anything immediately after a radio-shaped `Tab` (plan §3c).

const inTabs = (props: Record<string, unknown>) => [
  {
    component: Tabs,
    props: { variant: 'lift' },
    slots: {
      default: [
        { component: Tab, props: { as: 'input', type: 'radio', name: 'tabcontent-story', 'aria-label': 'Tab 1', checked: true } },
        { component: TabContent, props, slots: { default: 'Tab content 1' } },
        { component: Tab, props: { as: 'input', type: 'radio', name: 'tabcontent-story', 'aria-label': 'Tab 2' } },
        {
          component: TabContent,
          props: { class: 'bg-base-100 border-base-300 p-6' },
          slots: { default: 'Tab content 2' },
        },
      ],
    },
  },
];

export default {
  title: 'Components/Tabs/TabContent',
  component: TabContent,
  argTypes: { class: { control: 'text' } },
};

export const Playground = {
  render: () => inTabs({ class: 'bg-base-100 border-base-300 p-6' }),
};

// Regression guard: native attributes survive and caller `class` merges.
export const Passthrough = {
  render: () =>
    inTabs({
      id: 'tab-content-1',
      'data-test': 'yes',
      style: 'letter-spacing:2px',
      class: 'mine bg-base-100 border-base-300 p-6',
    }),
};
