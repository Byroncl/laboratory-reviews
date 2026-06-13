import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiResponse } from '../../core/dto/api.response';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return ApiResponse.success(post, 'Post created successfully');
  }

  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    return ApiResponse.success(posts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    return ApiResponse.success(post);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePostDto: CreatePostDto,
  ) {
    const post = await this.postsService.update(id, updatePostDto);
    return ApiResponse.success(post, 'Post updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postsService.remove(id);
    return ApiResponse.success(null, 'Post deleted successfully');
  }

  @Post('bulk')
  async bulkCreate(
    @Body(new ValidationPipe()) createPostDtos: CreatePostDto[],
  ) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiResponse.success(result, 'Posts created successfully');
  }
}
