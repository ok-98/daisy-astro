import type { StorybookConfig } from '@storybook-astro/framework';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts)'],
  framework: {
    name: '@storybook-astro/framework',
    options: {
      // Slot HTML is sanitized by default with a conservative allowlist that has
      // no `svg`, `button`, `input`, `label`, `select` or `textarea` — which is
      // most of this library's story content (icons, joined controls, form
      // fields). Story slots are first-party source in this repo, not user
      // input, so there is no trust boundary to defend here.
      // See plans/README.md §4 and plans/IMPLEMENTATION-ORDER.md Tier 0.3.
      sanitization: { enabled: false },
    },
  },
  addons: ['@storybook/addon-docs'],
};

export default config;
