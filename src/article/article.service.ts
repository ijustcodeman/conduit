import { Injectable, NotFoundException } from '@nestjs/common';
import { type CreateArticleDto } from './dto/create-article.dto';
import { type ArticleResponse, type ArticlesResponse } from './dto/article-response.dto';
import { toArticlePayload } from './mappers/article.mapper';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}


  // creates an article
  async create(createArticleDto: CreateArticleDto): Promise<ArticleResponse>{
    const article = createArticleDto.article;

    const slug = slugify(article.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const createdArticle = await this.prisma.article.create({
      data: {
        slug,
        title: article.title,
        description: article.description,
        body: article.body,

        tags: {
          connectOrCreate: article.tagList?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },

      include: {
        tags: true,
      },
    });

    return {
      article: toArticlePayload(createdArticle),
    };
  }

  // returns all articles
  async findAll(): Promise<ArticlesResponse> {
  const articles = await this.prisma.article.findMany({
    include: {
      tags: true,
    },
  });

  if (!articles){
    throw new NotFoundException('No articles found');
  }

  return {
    articles: articles.map(toArticlePayload),
  };
  }

  // finds an article by a slug
  async findArticleBySlug(slug: string): Promise<ArticleResponse>{
    const article = await this.prisma.article.findUnique({
      where: {
        slug,
      },

      include: {
        tags: true,
      },
    });

    if (!article){
      throw new NotFoundException('Article not found');
    }

    return {
      article: toArticlePayload(article),
    };
  }
}
