import { defineCollection, z } from 'astro:content';
import type { BlogSchema } from 'types/blog';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    link: z.string().optional(),
    date: z.date(),
    updated: z.date().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Compatible with old Hexo blogs
    subtitle: z.string().optional(),
    catalog: z.boolean().optional().default(true),
    categories: z
      .array(z.string())
      .or(z.array(z.array(z.string())))
      .optional(),
    sticky: z.boolean().optional(),
    draft: z.boolean().optional(),
    // Table of contents numbering control
    tocNumbering: z.boolean().optional().default(true),
    // Exclude from AI summary generation
    excludeFromSummary: z.boolean().optional(),
  }) satisfies z.ZodType<BlogSchema>,
});

export const collections = {
  blog: blogCollection,
};
