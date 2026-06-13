import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { ReactionsService } from '../services/reactions.service';
import { CommentsGateway } from '../gateways/comments.gateway';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { FindCommentsByPostDto } from '../dto/find-comments-by-post.dto';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionResponseDto } from '../dto/reaction-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    @Optional() private readonly commentsGateway: CommentsGateway,
    private readonly i18n: TranslationService,
  ) {}

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(createCommentDto);
    return ApiRes.success(comment, this.i18n.translate('comments.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all comments (optionally filtered by post)' })
  @ApiQuery({ name: 'postId', required: true, type: 'string', description: 'MongoDB ObjectId of the post' })
  @ApiResponse({ status: 200, description: 'List of comments', type: [CommentResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(@Query() findCommentsByPostDto: FindCommentsByPostDto) {
    const comments = await this.commentsService.findAll(
      findCommentsByPostDto.postId,
    );
    return ApiRes.success(comments);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Comment found', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const comment = await this.commentsService.findOne(findOneDto.id);
    return ApiRes.success(comment);
  }

  @Auth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.update(
      findOneDto.id,
      updateCommentDto,
    );
    return ApiRes.success(comment, this.i18n.translate('comments.updated'));
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.commentsService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('comments.deleted'));
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  @Auth()
  @ApiOperation({ summary: 'Add reaction to comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiBody({ type: CreateReactionDto })
  @ApiResponse({ status: 200, description: 'Reaction added successfully' })
  @Post(':id/reactions')
  async addReaction(
    @Param() findOneDto: FindOneDto,
    @Body() createReactionDto: CreateReactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const reaction = await this.reactionsService.addReaction({
      ...createReactionDto,
      commentId: findOneDto.id,
      userId: user.userId,
    });

    const reactionsSummary = await this.reactionsService.getReactionsByComment(
      findOneDto.id,
    );

    this.commentsGateway?.server?.emit('comment:reaction:added', {
      commentId: findOneDto.id,
      emoji: reaction.emoji,
      userId: user.userId,
      reactions: reactionsSummary,
    });

    return ApiRes.success(reaction, this.i18n.translate('comments.reaction_added'));
  }

  @Auth()
  @ApiOperation({ summary: 'Remove reaction from comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiParam({ name: 'emoji', type: 'string', description: 'Emoji to remove' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  @Delete(':id/reactions/:emoji')
  async removeReaction(
    @Param() params: { id: string; emoji: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.reactionsService.removeReaction(params.id, user.userId, params.emoji);

    const reactionsSummary = await this.reactionsService.getReactionsByComment(
      params.id,
    );

    this.commentsGateway?.server?.emit('comment:reaction:removed', {
      commentId: params.id,
      emoji: params.emoji,
      userId: user.userId,
      reactions: reactionsSummary,
    });

    return ApiRes.success(null, this.i18n.translate('comments.reaction_removed'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all reactions for a comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Reactions summary', type: ReactionResponseDto })
  @Get(':id/reactions')
  async getReactions(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    const reactionData = await this.reactionsService.getReactionsByComment(
      findOneDto.id,
    );

    const userReaction = user
      ? await this.reactionsService.getUserReaction(findOneDto.id, user.userId)
      : null;

    const response: ReactionResponseDto = {
      commentId: findOneDto.id,
      reactions: reactionData,
      total: reactionData.reduce((sum, r) => sum + r.count, 0),
      userReacted: !!userReaction,
      userReaction,
    };

    return ApiRes.success(response);
  }
}
