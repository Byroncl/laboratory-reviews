import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { ApiResponse as ApiRes } from '../../core/dto/api.response';
import { Auth } from '../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return ApiRes.success(post, 'Post created successfully');
  }

  @Auth()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of posts', type: [PostResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    return ApiRes.success(posts);
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
    return ApiRes.success(post, 'Post updated successfully');
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
    return ApiRes.success(null, 'Post deleted successfully');
  }

  @ApiOperation({ summary: 'Bulk create posts' })
  @ApiBody({ type: [CreatePostDto] })
  @ApiResponse({ status: 201, description: 'Posts created successfully', type: [PostResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post('bulk')
  async bulkCreate(@Body() createPostDtos: CreatePostDto[]) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiRes.success(result, 'Posts created successfully');
  }
}
