import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import { FindOneDto } from '../../../core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';

@ApiTags('notifications')
@ApiHeader({
  name: 'Accept-Language',
  description: 'Language preference: en (English) or es (Spanish)',
  required: false,
  example: 'es',
})
@Auth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly i18n: TranslationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination' })
  async getNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query() pagination: PaginationQueryDto,
  ) {
    const result = await this.notificationsService.getByUser(user.userId, pagination);
    return ApiRes.success(result);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnreadNotifications(@CurrentUser() user: CurrentUserPayload) {
    const notifications = await this.notificationsService.getUnread(user.userId);
    const count = notifications.length;
    return ApiRes.success({ notifications, count });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return ApiRes.success({ count });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param() findOneDto: FindOneDto) {
    const notification = await this.notificationsService.markAsRead(findOneDto.id);
    return ApiRes.success(notification, this.i18n.translate('notifications.marked_read'));
  }

  @Put('read/all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.markAllAsRead(user.userId);
    return ApiRes.success(null, this.i18n.translate('notifications.all_marked_read'));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param() findOneDto: FindOneDto) {
    await this.notificationsService.deleteNotification(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate('notifications.deleted'));
  }
}
