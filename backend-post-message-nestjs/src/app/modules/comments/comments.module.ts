import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { CommentsGateway } from './gateways/comments.gateway';
import { ReactionsService } from './services/reactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Reaction, ReactionSchema } from './schemas/reaction.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { TranslationService } from '../../core/utils/translation.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentRepository } from './domain/repositories/comment.repository';
import { CommentMongoRepository } from './infrastructure/repositories/comment-mongo.repository';
import {
  IsValidCommentContentConstraint,
  IsValidPostIdConstraint,
  IsValidEmojiConstraint,
} from './validators/comment-validators';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Reaction.name, schema: ReactionSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsGateway,
    ReactionsService,
    TranslationService,
    I18nService,
    IsValidCommentContentConstraint,
    IsValidPostIdConstraint,
    IsValidEmojiConstraint,
    {
      provide: CommentRepository,
      useClass: CommentMongoRepository,
    },
  ],
  exports: [CommentsService, ReactionsService],
})
export class CommentsModule {}
