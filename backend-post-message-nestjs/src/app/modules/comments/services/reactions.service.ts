import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reaction, ReactionDocument } from '../schemas/reaction.schema';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionCountDto } from '../dto/reaction-response.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<ReactionDocument>,
  ) {}

  async addReaction(createReactionDto: CreateReactionDto): Promise<Reaction> {
    const existing = await this.reactionModel
      .findOne({
        commentId: createReactionDto.commentId,
        userId: createReactionDto.userId,
        emoji: createReactionDto.emoji,
      })
      .exec();

    if (existing) {
      return existing;
    }

    const reaction = new this.reactionModel(createReactionDto);
    return reaction.save();
  }

  async removeReaction(
    commentId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    await this.reactionModel.deleteOne({ commentId, userId, emoji });
  }

  async getReactionsByComment(commentId: string): Promise<ReactionCountDto[]> {
    const reactions = await this.reactionModel
      .find({ commentId })
      .select('emoji userId')
      .exec();

    const grouped = new Map<string, Set<string>>();

    for (const r of reactions) {
      if (!grouped.has(r.emoji)) {
        grouped.set(r.emoji, new Set());
      }
      grouped.get(r.emoji)!.add(r.userId);
    }

    return Array.from(grouped.entries()).map(([emoji, users]) => ({
      emoji,
      count: users.size,
      users: Array.from(users),
    }));
  }

  async getUserReaction(
    commentId: string,
    userId: string,
  ): Promise<string | null> {
    const reaction = await this.reactionModel
      .findOne({ commentId, userId })
      .select('emoji')
      .exec();

    return reaction?.emoji ?? null;
  }

  async removeAllUserReactions(
    commentId: string,
    userId: string,
  ): Promise<void> {
    await this.reactionModel.deleteMany({ commentId, userId });
  }

  async getReactionsByComments(commentIds: string[]): Promise<Map<string, ReactionCountDto[]>> {
    if (commentIds.length === 0) return new Map();

    const reactions = await this.reactionModel
      .find({ commentId: { $in: commentIds } })
      .select('commentId emoji userId')
      .exec();

    const result = new Map<string, ReactionCountDto[]>();
    const grouped = new Map<string, Map<string, Set<string>>>();

    for (const reaction of reactions) {
      if (!grouped.has(reaction.commentId)) {
        grouped.set(reaction.commentId, new Map());
      }
      const emojiMap = grouped.get(reaction.commentId)!;
      if (!emojiMap.has(reaction.emoji)) {
        emojiMap.set(reaction.emoji, new Set());
      }
      emojiMap.get(reaction.emoji)!.add(reaction.userId);
    }

    for (const [commentId, emojiMap] of grouped.entries()) {
      result.set(
        commentId,
        Array.from(emojiMap.entries()).map(([emoji, users]) => ({
          emoji,
          count: users.size,
          users: Array.from(users),
        })),
      );
    }

    return result;
  }
}
