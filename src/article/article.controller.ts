import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDtoSchema } from './dto/create-article.dto';
import { parseWithSchema } from '../common/zod-validation';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  createArticle(@Body() body: unknown) {
    const createArticleDto = parseWithSchema(CreateArticleDtoSchema, body);

    return this.articleService.create(createArticleDto);
  }

  @Get()
  getAllArticles(){
    return this.articleService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string){
    return this.articleService.findArticleBySlug(slug);
  }
}
