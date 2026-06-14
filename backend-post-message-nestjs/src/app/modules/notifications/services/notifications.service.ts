import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }

  async getByUser(
    userId: string,
    pagination?: PaginationQueryDto,
  ): Promise<{ items: Notification[]; total: number; unread: number }> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.notificationModel.countDocuments({ userId }),
      this.notificationModel.countDocuments({ userId, read: false }),
    ]);

    return { items, total, unread };
  }

  async getUnread(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId);
  }

  async deleteByPost(postId: string): Promise<void> {
    await this.notificationModel.deleteMany({ postId });
  }

  async deleteByComment(commentId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      $or: [{ commentId }, { parentCommentId: commentId }],
    });
  }
}
