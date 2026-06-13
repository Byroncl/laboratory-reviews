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
import { ApiResponse } from '../../core/dto/api.response';
import { Schema as MongooseSchema } from 'mongoose';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(createCommentDto);
    return ApiResponse.success(comment, 'Comment created successfully');
  }

  @Get()
  async findByPost(@Query('postId') postId: MongooseSchema.Types.ObjectId) {
    const comments = await this.commentsService.findByPost(postId);
    return ApiResponse.success(comments);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.commentsService.remove(id);
    return ApiResponse.success(null, 'Comment deleted successfully');
  }
}
