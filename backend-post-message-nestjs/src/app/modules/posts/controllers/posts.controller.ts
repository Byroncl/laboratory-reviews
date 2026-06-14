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
  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const post = await this.postsService.create(createPostDto, currentUser.id);
    this.postsGateway.notifyPostCreated(post, 'System');
    return ApiRes.success(post, this.i18n.translate('posts.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get my posts (client only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of my posts' })
  @Get('my-posts')
  async getMyPosts(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    if ((currentUser as any).type !== 'client') {
      throw new ForbiddenException('Solo los clientes pueden acceder a sus posts');
    }
    const result = await this.postsService.findByAuthorId(
      currentUser.id,
      paginationDto.skip,
      paginationDto.limit,
    );
    return ApiRes.success(result);
  }

  @ApiOperation({ summary: 'Get all posts (paginated with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts' })
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

  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Post MongoDB ObjectId',
  })
  @ApiResponse({
    status: 200,
    description: 'Post found',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const post = await this.postsService.findOne(findOneDto.id);
    return ApiRes.success(post);
  }

  @Auth()
  @AuditActionDecorator(AuditAction.UPDATE, EntityType.POST, {
    captureSnapshot: true,
  })
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Post MongoDB ObjectId',
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const post = await this.postsService.update(findOneDto.id, updatePostDto);
    this.postsGateway.notifyPostUpdated(post, currentUser.username);
    return ApiRes.success(post, this.i18n.translate('posts.updated'));
  }

  @Auth()
  @AuditActionDecorator(AuditAction.DELETE, EntityType.POST)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Post MongoDB ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(
    @Param() findOneDto: FindOneDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    await this.postsService.remove(findOneDto.id);
    this.postsGateway.notifyPostDeleted(findOneDto.id, currentUser.username);
    return ApiRes.success(null, this.i18n.translate('posts.deleted'));
  }

  @Auth()
  @ApiOperation({ summary: 'Bulk create posts' })
  @ApiBody({ type: [CreatePostDto] })
  @ApiResponse({
    status: 201,
    description: 'Posts created successfully',
    type: [PostResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('bulk')
  async bulkCreate(@Body() createPostDtos: CreatePostDto[]) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiRes.success(result, this.i18n.translate('posts.created'));
  }
}
