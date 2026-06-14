import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PostsService } from '../services/posts.service';
import { PostsGateway } from '../gateways/posts.gateway';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostResponseDto } from '../dto/post-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { AuditActionDecorator } from '../../../core/decorators/audit-action.decorator';
import { AuditAction, EntityType } from '../../audit/schemas/audit-log.schema';
import {
  POSTS_SWAGGER,
  POSTS_RESPONSE_DESCRIPTIONS,
  POSTS_PARAM_DESCRIPTIONS,
  POSTS_MESSAGES,
} from '../constants/posts.constants';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsGateway: PostsGateway,
    private readonly i18n: TranslationService,
  ) {}

  @Auth()
  @AuditActionDecorator(AuditAction.CREATE, EntityType.POST)
  @ApiOperation(POSTS_SWAGGER.CREATE)
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: POSTS_RESPONSE_DESCRIPTIONS.CREATED,
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: POSTS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: POSTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const post = await this.postsService.create(createPostDto, currentUser.id);
    this.postsGateway.notifyPostCreated(post, 'System');
    return ApiRes.success(post, this.i18n.translate(POSTS_MESSAGES.CREATED));
  }

  @Auth()
  @ApiOperation(POSTS_SWAGGER.FIND_BY_AUTHOR)
  @ApiResponse({
    status: 200,
    description: POSTS_RESPONSE_DESCRIPTIONS.LIST,
  })
  @Get('my-posts')
  async getMyPosts(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    const isClient = (currentUser as any).type === 'client';
    const isAdmin =
      (currentUser as any).role === 'admin' ||
      (typeof (currentUser as any).role === 'object' && (currentUser as any).role?.name === 'admin');

    if (!isClient && !isAdmin) {
      throw new ForbiddenException(
        this.i18n.translate(POSTS_MESSAGES.UNAUTHORIZED_DELETE),
      );
    }
    const result = await this.postsService.findByAuthorId(
      currentUser.id,
      paginationDto.skip,
      paginationDto.limit,
    );
    return ApiRes.success(result);
  }

  @ApiOperation(POSTS_SWAGGER.FIND_ALL)
  @ApiResponse({
    status: 200,
    description: POSTS_RESPONSE_DESCRIPTIONS.LIST,
  })
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const result = await this.postsService.findAllPaginated(
      paginationDto.skip,
      paginationDto.limit,
      { categoryId, status, author, search, sortBy, sortOrder },
    );
    return ApiRes.success(result);
  }

  @ApiOperation(POSTS_SWAGGER.FIND_ONE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: POSTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: POSTS_RESPONSE_DESCRIPTIONS.FOUND,
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: POSTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const post = await this.postsService.findOne(findOneDto.id);
    return ApiRes.success(post);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.POST, {
    captureSnapshot: true,
  })
  @ApiOperation(POSTS_SWAGGER.UPDATE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: POSTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: POSTS_RESPONSE_DESCRIPTIONS.UPDATED,
    type: PostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: POSTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: POSTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const post = await this.postsService.update(findOneDto.id, updatePostDto);
    this.postsGateway.notifyPostUpdated(post, currentUser.username);
    return ApiRes.success(post, this.i18n.translate(POSTS_MESSAGES.UPDATED));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.POST)
  @ApiOperation(POSTS_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: POSTS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: POSTS_RESPONSE_DESCRIPTIONS.DELETED,
  })
  @ApiResponse({
    status: 404,
    description: POSTS_RESPONSE_DESCRIPTIONS.NOT_FOUND,
  })
  @ApiResponse({
    status: 401,
    description: POSTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Delete(':id')
  async remove(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.postsService.remove(findOneDto.id);
    this.postsGateway.notifyPostDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate(POSTS_MESSAGES.DELETED));
  }

  @Auth()
  @ApiOperation(POSTS_SWAGGER.CREATE)
  @ApiBody({ type: [CreatePostDto] })
  @ApiResponse({
    status: 201,
    description: POSTS_RESPONSE_DESCRIPTIONS.CREATED,
    type: [PostResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: POSTS_RESPONSE_DESCRIPTIONS.VALIDATION_FAILED,
  })
  @ApiResponse({
    status: 401,
    description: POSTS_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  })
  @Post('bulk')
  async bulkCreate(@Body() createPostDtos: CreatePostDto[]) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiRes.success(result, this.i18n.translate(POSTS_MESSAGES.CREATED));
  }
}
