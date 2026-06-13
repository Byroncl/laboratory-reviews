import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
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
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostResponseDto } from '../dto/post-response.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly i18n: TranslationService,
  ) {}

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return ApiRes.success(post, this.i18n.translate('posts.created'));
  }

  @Auth()
  @ApiOperation({ summary: 'Get all posts (paginated with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(
    @Query() paginationDto: PaginationQueryDto,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('author') author?: string
  ) {
    const result = await this.postsService.findAllPaginated(
      paginationDto.skip,
      paginationDto.limit,
      { categoryId, status, author }
    );
    return ApiRes.success(result);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Post MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const post = await this.postsService.findOne(findOneDto.id);
    return ApiRes.success(post);
  }

  @Auth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', type: 'string', description: 'Post MongoDB ObjectId' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postsService.update(findOneDto.id, updatePostDto);
    return ApiRes.success(post, this.i18n.translate('posts.updated'));
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', type: 'string', description: 'Post MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.postsService.remove(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('posts.deleted'));
  }

  @ApiOperation({ summary: 'Bulk create posts' })
  @ApiBody({ type: [CreatePostDto] })
  @ApiResponse({ status: 201, description: 'Posts created successfully', type: [PostResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post('bulk')
  async bulkCreate(@Body() createPostDtos: CreatePostDto[]) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiRes.success(result, this.i18n.translate('posts.created'));
  }
}
