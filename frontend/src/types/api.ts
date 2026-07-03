import * as z from 'zod';

export const UserSchema = z.object({
  username: z.string(),
  email: z.email(),
  token: z.string(),
  bio: z.string(),
  image: z.string(),
});

export const ProfileSchema = z.object({
  username: z.string(),
  bio: z.string(),
  image: z.string(),
  following: z.boolean(),
});

export const ArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tagList: z.array(z.string()),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  favorited: z.boolean(),
  favoritesCount: z.number().int().nonnegative(),
  author: ProfileSchema,
});

export const CommentSchema = z.object({
  id: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  body: z.string(),
  author: ProfileSchema,
});

export const AuthResponseSchema = z.object({
  user: UserSchema,
});

export const ArticlesResponseSchema = z.object({
  articles: z.array(ArticleSchema),
  articlesCount: z.number().int().nonnegative(),
});

export const ArticleResponseSchema = z.object({
  article: ArticleSchema,
});

export const CommentsResponseSchema = z.object({
  comments: z.array(CommentSchema),
});

export const CommentResponseSchema = z.object({
  comment: CommentSchema,
});

export const ProfileResponseSchema = z.object({
  profile: ProfileSchema,
});

export const TagsResponseSchema = z.object({
  tags: z.array(z.string()),
});

export const ArticlePayloadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
  tagList: z.array(z.string().min(1)).default([]),
});

export const UpdateArticlePayloadSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
  })
  .refine(article => Object.values(article).some(value => value !== undefined), {
    message: 'At least one article field is required',
  });

export const LoginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const RegisterPayloadSchema = LoginPayloadSchema.extend({
  username: z.string().min(1),
});

export const UpdateUserPayloadSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    bio: z.string().optional(),
    image: z.string().optional(),
  })
  .refine(user => Object.values(user).some(value => value !== undefined), {
    message: 'At least one user field is required',
  });

export const CreateCommentPayloadSchema = z.object({
  body: z.string().min(1),
});

export const SpecErrorResponseSchema = z.object({
  errors: z.object({
    body: z.array(z.string()),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ArticlesResponse = z.infer<typeof ArticlesResponseSchema>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type CommentsResponse = z.infer<typeof CommentsResponseSchema>;
export type CommentResponse = z.infer<typeof CommentResponseSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type TagsResponse = z.infer<typeof TagsResponseSchema>;
export type ArticlePayload = z.infer<typeof ArticlePayloadSchema>;
export type UpdateArticlePayload = z.infer<typeof UpdateArticlePayloadSchema>;
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
export type CreateCommentPayload = z.infer<typeof CreateCommentPayloadSchema>;
