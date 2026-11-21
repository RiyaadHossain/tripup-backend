import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { SendBroadcastNotificationDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller(['admin/notifications', 'notifications'])
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  /**
   * GET /notifications or GET /admin/notifications
   * Get all notifications for the authenticated user with pagination and filters.
   */
  @Get()
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.service.findMyNotifications(userId, query);
  }

  /**
   * GET /notifications/me or GET /admin/notifications/me
   * Alias to get authenticated user's notifications.
   */
  @Get('me')
  async findMe(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.service.findMyNotifications(userId, query);
  }

  /**
   * GET /notifications/unread-count
   * Quick endpoint to fetch unread notification count (e.g. for bell badge).
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    return this.service.getUnreadCount(userId);
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read.
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.markAsRead(id, userId);
  }

  /**
   * PATCH /notifications/read-all or POST /notifications/read-all
   * Mark all unread notifications of the current user as read.
   */
  @Patch('read-all')
  async markAllAsReadPatch(@CurrentUser('sub') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsReadPost(@CurrentUser('sub') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  /**
   * DELETE /notifications/:id
   * Delete a single notification.
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  /**
   * DELETE /notifications?readOnly=true
   * Clear notifications (all or only read ones).
   */
  @Delete()
  async removeAll(
    @CurrentUser('sub') userId: string,
    @Query('readOnly') readOnly?: string,
  ) {
    const isReadOnly = readOnly === 'true';
    return this.service.removeAll(userId, isReadOnly);
  }

  /**
   * POST /notifications/broadcast or POST /admin/notifications/broadcast
   * Send a system or broadcast notification (requires notifications.CREATE permission).
   */
  @Post('broadcast')
  @UseGuards(PermissionGuard)
  @Permission(perm('notifications', 'CREATE'))
  async broadcast(
    @Body() dto: SendBroadcastNotificationDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.service.broadcast(dto, actorId);
  }
}
