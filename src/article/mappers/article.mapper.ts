import { type ArticleResponsePayload } from '../dto/article-response.dto';

type ArticleWithTags = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: { name: string }[];
};

export function toArticlePayload(article: ArticleWithTags): ArticleResponsePayload {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tags.map(tag => tag.name),
  };
}