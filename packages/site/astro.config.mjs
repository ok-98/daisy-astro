import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Project page, not a <user>.github.io repo — base must match the repo name
// or every internal link/asset 404s once deployed (astro-docs: Deploy to
// GitHub Pages > base).
export default defineConfig({
  site: 'https://ok-98.github.io',
  base: '/daisy-astro',
  vite: {
    plugins: [tailwindcss()],
  },
});
