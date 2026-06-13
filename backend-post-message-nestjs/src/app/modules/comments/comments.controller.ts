import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FindCommentsByPostDto } from './dto/find-comments-by-post.dto';
import { ApiResponse } from '../../core/dto/api.response';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(createCommentDto);
    return ApiResponse.success(comment, 'Comment created successfully');
  }

  @Get()
  async findByPost(@Query() findCommentsByPostDto: FindCommentsByPostDto) {
    const comments = await this.commentsService.findByPost(
      findCommentsByPostDto.postId,
    );
    return ApiResponse.success(comments);
  }

  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.commentsService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Comment deleted successfully');
  }
}
