import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentModel(createCommentDto);
    return createdComment.save();
  }

  async findByPost(postId: MongooseSchema.Types.ObjectId): Promise<Comment[]> {
    return this.commentModel.find({ postId }).exec();
  }

  async remove(id: string): Promise<Comment> {
    return this.commentModel.findByIdAndDelete(id).exec();
  }
}
