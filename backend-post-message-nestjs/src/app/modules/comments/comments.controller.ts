import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
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
  async findAll(@Query() findCommentsByPostDto: FindCommentsByPostDto) {
    const comments = await this.commentsService.findAll(
      findCommentsByPostDto.postId,
    );
    return ApiResponse.success(comments);
  }

  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const comment = await this.commentsService.findOne(findOneDto.id);
    return ApiResponse.success(comment);
  }

  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.update(
      findOneDto.id,
      updateCommentDto,
    );
    return ApiResponse.success(comment, 'Comment updated successfully');
  }

  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.commentsService.remove(findOneDto.id);
    return ApiResponse.success(null, 'Comment deleted successfully');
  }
}
