import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    image: z.string(),
    category: z.string(),
    author: z.string(),
    readTime: z.string(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blog,
};
