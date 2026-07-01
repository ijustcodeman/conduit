export type User = {
  username: string;
  email: string;
  token: string;
  bio: string;
  image: string;
};

export type Profile = {
  username: string;
  bio: string;
  image: string;
  following: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
};

export type Comment = {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
};

export type AuthResponse = {
  user: User;
};

export type ArticlesResponse = {
  articles: Article[];
  articlesCount: number;
};

export type ArticleResponse = {
  article: Article;
};

export type CommentsResponse = {
  comments: Comment[];
};

export type CommentResponse = {
  comment: Comment;
};

export type ProfileResponse = {
  profile: Profile;
};

export type TagsResponse = {
  tags: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  username: string;
};

export type UpdateUserPayload = Partial<{
  username: string;
  email: string;
  password: string;
  bio: string;
  image: string;
}>;

export type SpecErrorResponse = {
  errors?: {
    body?: string[];
  };
};
