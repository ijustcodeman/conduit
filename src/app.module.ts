import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ArticleModule, AuthModule, UserModule],
})
export class AppModule {}
