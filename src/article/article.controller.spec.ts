import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppController', () => {
  let articleController: ArticleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        ArticleService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    articleController = app.get<ArticleController>(ArticleController);
  });

  it('should be defined', () => {
    expect(articleController).toBeDefined();
  });
});
