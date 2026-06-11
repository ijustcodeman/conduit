import * as z from 'zod';

export const ListArticlesQuerySchema = z.object({
  tag: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  favorited: z.string().min(1).optional(),
});

export type ListArticlesQuery = z.infer<typeof ListArticlesQuerySchema>;
