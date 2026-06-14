import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { RequestLoggerMiddleware } from './core/middleware/request-logger.middleware';
import { I18nModule } from './modules/i18n/i18n.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { AuditInterceptor } from './core/interceptors/audit.interceptor';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditModule } from './modules/audit/audit.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017'),
    PostsModule,
    CommentsModule,
    UsersModule,
    ClientsModule,
    FilesModule,
    AuthModule,
    I18nModule,
    NotificationsModule,
    CategoriesModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
    FavoritesModule,
    SeederModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TranslationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestLoggerMiddleware, I18nMiddleware)
      .forRoutes('*');
  }
}
