import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentMediaDto } from '../dto/comment-response.dto';

export interface CommentWithMedia {
  media: CommentMediaDto[];
  [key: string]: unknown;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
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

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment | null> {
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

  async remove(id: string): Promise<Comment | null> {
    return this.commentModel.findByIdAndDelete(id).exec();
  }

  getCommentWithMedia(comment: Comment & { toObject?: () => Record<string, unknown>; mediaUrls?: string[]; mediaTypes?: string[]; mediaFilenames?: string[] }): CommentWithMedia {
    const obj = typeof comment.toObject === 'function' ? comment.toObject() : { ...(comment as object) };
    const mediaUrls: string[] = (comment.mediaUrls as string[]) ?? (obj['mediaUrls'] as string[]) ?? [];
    const mediaTypes: string[] = (comment.mediaTypes as string[]) ?? (obj['mediaTypes'] as string[]) ?? [];
    const mediaFilenames: string[] = (comment.mediaFilenames as string[]) ?? (obj['mediaFilenames'] as string[]) ?? [];

    const media: CommentMediaDto[] = mediaUrls.map((url, idx) => ({
      url,
      type: mediaTypes[idx] ?? 'unknown',
      filename: mediaFilenames[idx] ?? `media-${idx}`,
    }));

    return { ...obj, media };
  }
}
