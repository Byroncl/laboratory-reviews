import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsModule } from './modules/comments/comments.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { FilesModule } from './modules/files/files.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { TranslationService } from './core/utils/translation.service';
import { AuthGuard } from './core/guards/auth.guard';
import { I18nMiddleware } from './core/middleware/i18n.middleware';
import { I18nModule } from './modules/i18n/i18n.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017'),
    PostsModule,
    CommentsModule,
    UsersModule,
    ClientsModule,
    FilesModule,
    AuthModule,
    I18nModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TranslationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(I18nMiddleware).forRoutes('*');
  }
}
