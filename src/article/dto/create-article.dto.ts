import * as z from 'zod';

export const ArticlePayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
  tagList: z.array(z.string().min(1)).default([]),
});

export const CreateArticleDtoSchema = z.object({
  article: ArticlePayloadSchema,
});

export type ArticlePayload = z.infer<typeof ArticlePayloadSchema>;
export type CreateArticleDto = z.infer<typeof CreateArticleDtoSchema>;
