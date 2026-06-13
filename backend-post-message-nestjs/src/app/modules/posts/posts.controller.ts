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
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(createPostDto);
    return ApiResponse.success(post, 'Post created successfully');
  }

  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    return ApiResponse.success(posts);
  }

  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const post = await this.postsService.findOne(findOneDto.id);
    return ApiResponse.success(post);
  }

  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postsService.update(findOneDto.id, updatePostDto);
    return ApiResponse.success(post, 'Post updated successfully');
  }

  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.postsService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Post deleted successfully');
  }

  @Post('bulk')
  async bulkCreate(@Body() createPostDtos: CreatePostDto[]) {
    const result = await this.postsService.bulkCreate(createPostDtos);
    return ApiResponse.success(result, 'Posts created successfully');
  }
}
