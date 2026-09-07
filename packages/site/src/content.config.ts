import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// title/category/order live in src/lib/registry.ts, not here — one source of
// truth for sidebar structure. A content entry only adds prose.
const components = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/components' }),
  schema: z.object({
    description: z.string(),
    referenceUrl: z.url(),
    referenceLabel: z.string(),
  }),
});

export const collections = { components };
