import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { FavoritesService } from './services/favorites.service';
import { FavoritesController } from './controllers/favorites.controller';
import { PostsModule } from '../posts/posts.module';
import { I18nService } from '../../core/i18n/i18n.service';
import { FavoriteRepository } from './domain/repositories/favorite.repository';
import { FavoriteMongoRepository } from './infrastructure/repositories/favorite-mongo.repository';
import { IsValidFavoritePostIdConstraint } from './validators/favorite-validators';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    PostsModule,
  ],
  providers: [
    FavoritesService,
    I18nService,
    IsValidFavoritePostIdConstraint,
    {
      provide: FavoriteRepository,
      useClass: FavoriteMongoRepository,
    },
  ],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoritesModule {}
