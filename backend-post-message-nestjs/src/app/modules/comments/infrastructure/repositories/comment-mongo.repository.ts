import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentRepository } from '../../domain/repositories/comment.repository';
import { Comment, CommentDocument } from '../../schemas/comment.schema';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentResponseDto } from '../../dto/comment-response.dto';
import { CommentTreeNodeDto, CommentThreadDto } from '../../dto/comment-tree.dto';
import { Post, PostDocument } from '../../../posts/schemas/post.schema';
import { I18nService } from '../../../../core/i18n/i18n.service';

/**
 * Concrete implementation of CommentRepository using MongoDB.
 * Handles all comment-specific data access operations.
 */
@Injectable()
export class CommentMongoRepository implements CommentRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly i18nService: I18nService,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      mediaUrls: createCommentDto.mediaUrls ?? [],
      mediaTypes: createCommentDto.mediaTypes ?? [],
      mediaFilenames: createCommentDto.mediaFilenames ?? [],
    });
    return createdComment.save();
  }

  async findAll(postId?: string): Promise<Comment[]> {
    const filter = postId ? { postId } : {};
    return this.commentModel.find(filter as any).exec();
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.commentModel.findById(id).exec();
  }

  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Comment[]; total: number }> {
    const [data, total] = await Promise.all([
      this.commentModel
        .find({ userId, isDeleted: false, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commentModel.countDocuments({
        userId,
        isDeleted: false,
        isActive: true,
      }).exec(),
    ]);

    return { data, total };
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment | null> {
    const updateData: Record<string, unknown> = {};

    if (updateCommentDto.content !== undefined) {
      updateData['content'] = updateCommentDto.content;
    }

    if (updateCommentDto.mediaUrls !== undefined) {
      updateData['mediaUrls'] = updateCommentDto.mediaUrls;
      updateData['mediaTypes'] = updateCommentDto.mediaTypes ?? [];
      updateData['mediaFilenames'] = updateCommentDto.mediaFilenames ?? [];
    }

    return this.commentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException(
        this.i18nService.translate('comments.not_found'),
      );
    }

    // Cascade delete: remove all direct replies first
    if ((comment as any).childCommentIds?.length > 0) {
      await this.commentModel.deleteMany({
        _id: { $in: (comment as any).childCommentIds },
      });
    }

    // If this is a reply, remove its ID from the parent's childCommentIds
    if ((comment as any).parentCommentId) {
      await this.commentModel.findByIdAndUpdate(
        (comment as any).parentCommentId,
        { $pull: { childCommentIds: id } },
      );
    }

    await this.commentModel.findByIdAndDelete(id);
  }

  async createReply(createCommentDto: CreateCommentDto): Promise<Comment> {
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentModel.findById(
        createCommentDto.parentCommentId,
      );
      if (!parentComment) {
        throw new NotFoundException(
          this.i18nService.translate('comments.parent_not_found'),
        );
      }

      // Enforce max 2 levels: root comment only can receive replies
      if ((parentComment as any).parentCommentId) {
        throw new BadRequestException(
          this.i18nService.translate('comments.max_nesting_level'),
        );
      }
    }

    const comment = await this.create(createCommentDto);

    if (createCommentDto.parentCommentId) {
      await this.commentModel.findByIdAndUpdate(
        createCommentDto.parentCommentId,
        { $push: { childCommentIds: (comment as any)._id } },
      );
    }

    return comment;
  }

  async getCommentWithReplies(commentId: string): Promise<CommentTreeNodeDto> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException(
        this.i18nService.translate('comments.not_found'),
      );
    }

    return this.buildCommentTree(comment);
  }

  async getCommentThread(commentId: string): Promise<CommentThreadDto> {
    let rootComment = await this.commentModel.findById(commentId).exec();
    if (!rootComment) {
      throw new NotFoundException(
        this.i18nService.translate('comments.not_found'),
      );
    }

    // If it is a reply, walk up to the root
    if ((rootComment as any).parentCommentId) {
      const parent = await this.commentModel
        .findById((rootComment as any).parentCommentId)
        .exec();
      if (parent) {
        rootComment = parent;
      }
    }

    const tree = await this.buildCommentTree(rootComment);
    const totalInThread = this.countCommentsInTree(tree);

    return { root: tree, totalInThread };
  }

  async getReplies(
    parentCommentId: string,
    pagination?: { skip?: number; limit?: number },
  ): Promise<{ items: CommentResponseDto[]; total: number }> {
    const skip = pagination?.skip ?? 0;
    const limit = pagination?.limit ?? 10;

    const [items, total] = await Promise.all([
      this.commentModel
        .find({ parentCommentId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.commentModel.countDocuments({ parentCommentId }),
    ]);

    return {
      items: items.map((item) => this.commentToResponseDto(item)),
      total,
    };
  }

  async getPostByCommentPostId(postId: string): Promise<Post | null> {
    return this.postModel.findById(postId).exec();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async buildCommentTree(
    comment: CommentDocument,
  ): Promise<CommentTreeNodeDto> {
    const replies = await this.commentModel
      .find({ parentCommentId: (comment as any)._id.toString() })
      .sort({ createdAt: 1 })
      .exec();

    const dto = this.commentToResponseDto(comment);

    return {
      ...dto,
      replies: replies.map((r) => ({
        ...this.commentToResponseDto(r as any),
        replies: [],
        replyCount: 0,
      })),
      replyCount: replies.length,
    };
  }

  private countCommentsInTree(node: CommentTreeNodeDto): number {
    let count = 1;
    if (node.replies && node.replies.length > 0) {
      count += node.replies.length;
      for (const reply of node.replies) {
        if (reply.replies && reply.replies.length > 0) {
          count += reply.replies.length;
        }
      }
    }
    return count;
  }

  private commentToResponseDto(comment: CommentDocument | any): CommentResponseDto {
    const raw = comment as any;
    return {
      id: raw._id?.toString(),
      content: raw.content,
      author: raw.author,
      post: raw.postId,
      isActive: raw.isActive,
      parentCommentId: raw.parentCommentId ?? null,
      childCommentIds: raw.childCommentIds ?? [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      media:
        (raw.mediaUrls ?? []).map((url: string, idx: number) => ({
          url,
          type: (raw.mediaTypes ?? [])[idx] ?? 'unknown',
          filename: (raw.mediaFilenames ?? [])[idx] ?? `media-${idx}`,
        })),
    };
  }
}
