import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { CommentsGateway } from './gateways/comments.gateway';
import { ReactionsService } from './services/reactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Reaction, ReactionSchema } from './schemas/reaction.schema';
import { TranslationService } from '../../core/utils/translation.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsGateway, ReactionsService, TranslationService],
  exports: [CommentsService, ReactionsService],
})
export class CommentsModule {}
