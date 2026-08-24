import Button from './Button.astro';

// No Meta/StoryObj annotations: Storybook 10 ships those types from framework
// packages (@storybook/react etc.) and @storybook-astro doesn't provide an
// equivalent, so stories are plain objects — the shape its own docs use.
export default {
  title: 'Components/Button',
  component: Button,
};

export const Default = {
  args: {
    slots: { default: 'Click me' },
  },
};

export const Variants = {
  args: {
    color: 'primary',
    size: 'lg',
    variant: 'outline',
    slots: { default: 'Primary large outline' },
  },
};

// The <a> branch of the disabled handling — see plans/components/button.md §3b.
export const DisabledLink = {
  args: {
    as: 'a',
    href: '#',
    disabled: true,
    slots: { default: 'Disabled link' },
  },
};

// Regression guard: native `style` must survive, caller `class` must merge.
export const Passthrough = {
  args: {
    id: 'go',
    'data-test': 'yes',
    style: 'letter-spacing:2px',
    class: 'mine',
    slots: { default: 'Passthrough' },
  },
};

// Breakpoint prefixes ride the class passthrough, not a prop — see §4.
export const Responsive = {
  args: {
    size: 'xs',
    class: 'sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl',
    slots: { default: 'Responsive' },
  },
};
