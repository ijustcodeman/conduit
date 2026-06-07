import * as z from 'zod';
import { ArticlePayloadSchema } from './create-article.dto';

export const ArticleResponsePayloadSchema = ArticlePayloadSchema.extend({
  slug: z.string(),
});

export const ArticleResponseSchema = z.object({
  article: ArticleResponsePayloadSchema,
});

export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleResponsePayloadSchema),
});

export type ArticleResponsePayload = z.infer<
  typeof ArticleResponsePayloadSchema
>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type ArticlesResponse = z.infer<typeof ArticlesResponseSchema>;
