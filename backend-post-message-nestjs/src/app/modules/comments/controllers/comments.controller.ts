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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { FindCommentsByPostDto } from '../dto/find-comments-by-post.dto';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { FindOneDto } from 'src/app/core/dto/find-one.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: CommentResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.create(createCommentDto);
    return ApiRes.success(comment, 'Comment created successfully');
  }

  @Auth()
  @ApiOperation({ summary: 'Get all comments (optionally filtered by post)' })
  @ApiQuery({ name: 'postId', required: true, type: 'string', description: 'MongoDB ObjectId of the post' })
  @ApiResponse({ status: 200, description: 'List of comments', type: [CommentResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  async findAll(@Query() findCommentsByPostDto: FindCommentsByPostDto) {
    const comments = await this.commentsService.findAll(
      findCommentsByPostDto.postId,
    );
    return ApiRes.success(comments);
  }

  @Auth()
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Comment found', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get(':id')
  async findOne(@Param() findOneDto: FindOneDto) {
    const comment = await this.commentsService.findOne(findOneDto.id);
    return ApiRes.success(comment);
  }

  @Auth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  async update(
    @Param() findOneDto: FindOneDto,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.update(
      findOneDto.id,
      updateCommentDto,
    );
    return ApiRes.success(comment, 'Comment updated successfully');
  }

  @Auth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', type: 'string', description: 'Comment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Delete(':id')
  async remove(@Param() findOneDto: FindOneDto) {
    await this.commentsService.remove(findOneDto.id);
    return ApiRes.success(null, 'Comment deleted successfully');
  }
}
