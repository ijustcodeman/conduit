import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { type Request } from 'express';
import { type UserModel } from '../../generated/prisma/models/User';
import { ArticleService } from './article.service';
import { type ArticleResponse } from './dto/article-response.dto';
import { CreateArticleDtoSchema } from './dto/create-article.dto';
import { ListArticlesQuerySchema } from './dto/list-articles-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { parseWithSchema } from '../common/zod-validation';

type AuthenticatedRequest = Request & {
  user: UserModel;
};

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createArticle(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<ArticleResponse> {
    const createArticleDto = parseWithSchema(CreateArticleDtoSchema, body);

    return this.articleService.create(createArticleDto, request.user.id);
  }

  @Get()
  getAllArticles(@Query() query: unknown) {
    const filters = parseWithSchema(ListArticlesQuerySchema, query);

    return this.articleService.findAll(filters);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findArticleBySlug(slug);
  }
}
