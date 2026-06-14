import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { PostsGateway } from './gateways/posts.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { FilesModule } from '../files/files.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    FilesModule,
    CategoriesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsGateway],
  exports: [PostsService, PostsGateway],
})
export class PostsModule {}
