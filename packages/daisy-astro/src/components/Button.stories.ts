import type { Meta, StoryObj } from '@storybook/html-vite';
import { renderAstroComponent } from '../../.storybook/astro-story';

const meta: Meta = {
  title: 'Components/Button',
  render: (args) => {
    const container = document.createElement('div');
    renderAstroComponent('/src/components/Button.astro', args).then((html) => {
      container.innerHTML = html;
    });
    return container;
  },
  argTypes: {
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Click me',
  },
};
