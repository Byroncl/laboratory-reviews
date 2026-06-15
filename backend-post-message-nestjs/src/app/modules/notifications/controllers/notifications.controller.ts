import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { ApiResponse as ApiRes } from '../../../core/dto/api.response';
import { Auth } from '../../../core/decorators/auth.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../core/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../../core/dto/pagination.dto';
import { FindOneDto } from '../../../core/dto/find-one.dto';
import { TranslationService } from '../../../core/utils/translation.service';
import {
  NOTIFICATIONS_SWAGGER,
  NOTIFICATIONS_RESPONSE_DESCRIPTIONS,
  NOTIFICATIONS_PARAM_DESCRIPTIONS,
  NOTIFICATIONS_MESSAGES,
} from '../constants/notifications.constants';

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
  @ApiOperation(NOTIFICATIONS_SWAGGER.GET_ALL)
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.LIST,
  })
  async getNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query() pagination: PaginationQueryDto,
  ) {
    const result = await this.notificationsService.getByUser(user.userId, pagination);
    return ApiRes.success(result);
  }

  @Get('unread')
  @ApiOperation(NOTIFICATIONS_SWAGGER.GET_UNREAD)
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.UNREAD,
  })
  async getUnreadNotifications(@CurrentUser() user: CurrentUserPayload) {
    const notifications = await this.notificationsService.getUnread(user.userId);
    const count = notifications.length;
    return ApiRes.success({ notifications, count });
  }

  @Get('unread-count')
  @ApiOperation(NOTIFICATIONS_SWAGGER.GET_UNREAD_COUNT)
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.UNREAD_COUNT,
  })
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return ApiRes.success({ count });
  }

  @Put(':id/read')
  @ApiOperation(NOTIFICATIONS_SWAGGER.MARK_AS_READ)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: NOTIFICATIONS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.MARKED_READ,
  })
  async markAsRead(@Param() findOneDto: FindOneDto) {
    const notification = await this.notificationsService.markAsRead(findOneDto.id);
    return ApiRes.success(
      notification,
      this.i18n.translate(NOTIFICATIONS_MESSAGES.MARKED_READ),
    );
  }

  @Put('read/all')
  @ApiOperation(NOTIFICATIONS_SWAGGER.MARK_ALL_AS_READ)
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.ALL_MARKED_READ,
  })
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.markAllAsRead(user.userId);
    return ApiRes.success(
      null,
      this.i18n.translate(NOTIFICATIONS_MESSAGES.ALL_MARKED_READ),
    );
  }

  @Delete(':id')
  @ApiOperation(NOTIFICATIONS_SWAGGER.DELETE)
  @ApiParam({
    name: 'id',
    type: 'string',
    description: NOTIFICATIONS_PARAM_DESCRIPTIONS.ID,
  })
  @ApiResponse({
    status: 200,
    description: NOTIFICATIONS_RESPONSE_DESCRIPTIONS.DELETED,
  })
  async deleteNotification(@Param() findOneDto: FindOneDto) {
    await this.notificationsService.deleteNotification(findOneDto.id);
    return ApiRes.success(null, this.i18n.translate(NOTIFICATIONS_MESSAGES.DELETED));
  }
}
