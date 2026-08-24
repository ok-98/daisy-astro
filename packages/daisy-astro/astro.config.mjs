import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// @storybook-astro/framework picks up this config's vite.plugins automatically,
// which is how Tailwind + daisyUI reach the Storybook preview.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
