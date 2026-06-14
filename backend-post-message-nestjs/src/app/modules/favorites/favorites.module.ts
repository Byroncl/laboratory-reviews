import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './schemas/favorite.schema';
import { FavoritesService } from './services/favorites.service';
import { FavoritesController } from './controllers/favorites.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Favorite.name, schema: FavoriteSchema }]),
    PostsModule,
  ],
  providers: [FavoritesService],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoritesModule {}
