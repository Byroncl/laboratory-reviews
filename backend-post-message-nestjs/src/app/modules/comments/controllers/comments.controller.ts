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
  ForbiddenException,
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
import { NotificationsGateway } from '../../notifications/gateways/notifications.gateway';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CommentTreeNodeDto, CommentThreadDto } from '../dto/comment-tree.dto';
import { FindCommentsByPostDto } from '../dto/find-comments-by-post.dto';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionResponseDto } from '../dto/reaction-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth, OptionalAuth } from '../../../core/decorators/auth.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  COMMENTS_SWAGGER,
  COMMENTS_RESPONSE_DESCRIPTIONS,
  COMMENTS_PARAM_DESCRIPTIONS,
  COMMENTS_MESSAGES,
} from '../constants/comments.constants';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    @Optional() private readonly commentsGateway: CommentsGateway,
    @Optional() private readonly notificationsGateway: NotificationsGateway,
    private readonly i18n: TranslationService,
  ) {}

  @Auth()
  @AuditActionDecorator(AuditAction.CREATE, EntityType.COMMENT)
  @ApiOperation(COMMENTS_SWAGGER.CREATE)
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.CREATED,
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const comment = await this.commentsService.create({
      ...createCommentDto,
      userId: user.userId,
      author: user.username,
    } as any);

    if (this.notificationsGateway) {
      const post = await this.commentsService.getPostByCommentPostId(createCommentDto.postId);
      if (post && (post as any).authorId) {
        this.notificationsGateway.notifyCommentAdded(
          (post as any).authorId.toString(),
          user.username,
          post.title,
        );
      }
    }

    return ApiRes.success(comment, this.i18n.translate(COMMENTS_MESSAGES.CREATED));
  }

  @Auth()
  @ApiOperation(COMMENTS_SWAGGER.FIND_BY_USER)
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.LIST,
    type: [CommentResponseDto],
  })
  @Get('my-comments')
  async getMyComments(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const isClient = (user as any).type === 'client';
    const isAdmin =
      (user as any).role === 'admin' ||
      (typeof (user as any).role === 'object' && (user as any).role?.name === 'admin');

    if (!isClient && !isAdmin) {
      throw new ForbiddenException(this.i18n.translate(COMMENTS_MESSAGES.UNAUTHORIZED_DELETE));
    }
    const skip = (page - 1) * limit;
    const result = await this.commentsService.findByUserId(user.userId, skip, limit);
    return ApiRes.success(result);
  }

  @ApiOperation(COMMENTS_SWAGGER.FIND_ALL)
  @ApiQuery({
    name: 'postId',
    required: true,
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.POST_ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.LIST,
    type: [CommentResponseDto],
  })
  @Get()
  async findAll(@Query() findCommentsByPostDto: FindCommentsByPostDto) {
    const comments = await this.commentsService.findAll(
      findCommentsByPostDto.postId,
    );

    if (!findCommentsByPostDto.includeReactions) {
      return ApiRes.success(comments);
    }

    const commentIds = (comments || []).map((c: any) => c._id?.toString() || c.id);
    const reactionsMap = await this.reactionsService.getReactionsByComments(commentIds);

    const enrichedComments = (comments || []).map((c: any) => ({
      ...c,
      reactions: reactionsMap.get(c._id?.toString() || c.id) || [],
    }));

    return ApiRes.success(enrichedComments);
  }

  @ApiOperation(COMMENTS_SWAGGER.FIND_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.FOUND,
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const comment = await this.commentsService.findOne(findOneDto.id);
    return ApiRes.success(comment);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.COMMENT, { captureSnapshot: true })
  @ApiOperation(COMMENTS_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.UPDATED,
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.update(
      findOneDto.id,
      updateCommentDto,
    );
    return ApiRes.success(comment, this.i18n.translate(COMMENTS_MESSAGES.UPDATED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.COMMENT)
  @ApiOperation(COMMENTS_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.commentsService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate(COMMENTS_MESSAGES.DELETED));
  }

  // ─── Nested comments / Replies ────────────────────────────────────────────

  @Auth()
  @ApiOperation(COMMENTS_SWAGGER.CREATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.CREATED,
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 400,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @Post(':id/replies')
  async createReply(
    @Param() findOneDto: FindOneDto,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const reply = await this.commentsService.createReply({
      ...createCommentDto,
      userId: user.userId,
      parentCommentId: findOneDto.id,
      author: user.username,
    } as any);

    const formattedReply = this.commentsService.getCommentWithMedia(reply as any);

    this.commentsGateway?.server?.emit('comment:reply:created', {
      parentCommentId: findOneDto.id,
      reply: formattedReply,
    });

    return ApiRes.success(formattedReply, this.i18n.translate(COMMENTS_MESSAGES.CREATED));
  }

  @ApiOperation(COMMENTS_SWAGGER.GET_REPLIES)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiQuery({ name: 'skip', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.REPLIES,
    type: [CommentResponseDto],
  })
  @Get(':id/replies')
  async getReplies(
    @Param() findOneDto: FindOneDto,
    @Query() pagination: { skip?: number; limit?: number },
  ) {
    const { items, total } = await this.commentsService.getReplies(
      findOneDto.id,
      pagination,
    );

    return ApiRes.success({ items, total, parentCommentId: findOneDto.id });
  }

  @ApiOperation(COMMENTS_SWAGGER.GET_THREAD)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.THREAD,
    type: CommentThreadDto,
  })
  @Get(':id/thread')
  async getCommentThread(@Param() findOneDto: FindOneDto) {
    const thread = await this.commentsService.getCommentThread(findOneDto.id);
    return ApiRes.success(thread, this.i18n.translate(COMMENTS_MESSAGES.CREATED));
  }

  @ApiOperation({ summary: 'Get comment with immediate replies' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.FOUND,
    type: CommentTreeNodeDto,
  })
  @Get(':id/with-replies')
  async getCommentWithReplies(@Param() findOneDto: FindOneDto) {
    const tree = await this.commentsService.getCommentWithReplies(findOneDto.id);
    return ApiRes.success(tree);
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  @Auth()
  @ApiOperation(COMMENTS_SWAGGER.ADD_REACTION)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: CreateReactionDto })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.REACTION_ADDED,
  })
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

    return ApiRes.success(reaction, this.i18n.translate(COMMENTS_MESSAGES.REACTION_ADDED));
  }

  @Auth()
  @ApiOperation(COMMENTS_SWAGGER.REMOVE_REACTION)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiParam({ name: 'emoji', type: 'string', description: 'Emoji to remove' })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.REACTION_REMOVED,
  })
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

    return ApiRes.success(null, this.i18n.translate(COMMENTS_MESSAGES.REACTION_REMOVED));
  }

  @OptionalAuth()
  @ApiOperation({ summary: 'Get all reactions for a comment' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: COMMENTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: COMMENTS_RESPONSE_DESCRIPTIONS.FOUND,
    type: ReactionResponseDto,
  })
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
