import type { StorybookConfig } from '@storybook-astro/framework';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts)'],
  framework: {
    name: '@storybook-astro/framework',
    options: {},
  },
  addons: ['@storybook/addon-docs'],
};

export default config;
