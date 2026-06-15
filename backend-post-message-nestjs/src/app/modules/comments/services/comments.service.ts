import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentMediaDto, CommentResponseDto } from '../dto/comment-response.dto';
import { CommentTreeNodeDto, CommentThreadDto } from '../dto/comment-tree.dto';
import { I18nService } from '../../../core/i18n/i18n.service';
import { Post, PostDocument } from '../../posts/schemas/post.schema';
import { CommentRepository } from '../domain/repositories/comment.repository';

export interface CommentWithMedia {
  media: CommentMediaDto[];
  [key: string]: unknown;
}

/**
 * CommentsService acts as an orchestrator that delegates to the repository.
 * All business logic is now handled by the repository layer.
 */
@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly i18nService: I18nService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentRepository.create(createCommentDto);
  }

  async findAll(postId?: string): Promise<Comment[]> {
    return this.commentRepository.findAll(postId);
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.commentRepository.findOne(id);
  }

  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Comment[]; total: number }> {
    return this.commentRepository.findByUserId(userId, skip, limit);
  }

  async getPostByCommentPostId(postId: string): Promise<Post | null> {
    return this.commentRepository.getPostByCommentPostId(postId);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    return this.commentRepository.update(id, updateCommentDto);
  }

  async remove(id: string): Promise<void> {
    return this.commentRepository.remove(id);
  }

  async createReply(createCommentDto: CreateCommentDto): Promise<Comment> {
    return this.commentRepository.createReply(createCommentDto);
  }

  async getCommentWithReplies(commentId: string): Promise<CommentTreeNodeDto> {
    return this.commentRepository.getCommentWithReplies(commentId);
  }

  async getCommentThread(commentId: string): Promise<CommentThreadDto> {
    return this.commentRepository.getCommentThread(commentId);
  }

  async getReplies(
    parentCommentId: string,
    pagination?: { skip?: number; limit?: number },
  ): Promise<{ items: CommentResponseDto[]; total: number }> {
    return this.commentRepository.getReplies(parentCommentId, pagination);
  }

  /**
   * Helper method to extract and format media from comment
   */
  getCommentWithMedia(
    comment: Comment & {
      toObject?: () => Record<string, unknown>;
      mediaUrls?: string[];
      mediaTypes?: string[];
      mediaFilenames?: string[];
    },
  ): CommentWithMedia {
    const obj =
      typeof comment.toObject === 'function'
        ? comment.toObject()
        : { ...(comment as object) };
    const mediaUrls: string[] =
      (comment.mediaUrls as string[]) ??
      (obj['mediaUrls'] as string[]) ??
      [];
    const mediaTypes: string[] =
      (comment.mediaTypes as string[]) ??
      (obj['mediaTypes'] as string[]) ??
      [];
    const mediaFilenames: string[] =
      (comment.mediaFilenames as string[]) ??
      (obj['mediaFilenames'] as string[]) ??
      [];

    const media: CommentMediaDto[] = mediaUrls.map((url, idx) => ({
      url,
      type: mediaTypes[idx] ?? 'unknown',
      filename: mediaFilenames[idx] ?? `media-${idx}`,
    }));

    return { ...obj, media };
  }
}
