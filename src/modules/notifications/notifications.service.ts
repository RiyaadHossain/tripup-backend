import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, NotificationType } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { CreateNotificationDto, SendBroadcastNotificationDto } from './dto/create-notification.dto';

export const NOTIFICATION_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  profileImgUrl: true,
} as const;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget notification creator.
   * Never throws — a failure to create a notification must never break the primary operation.
   */
  async create(input: CreateNotificationDto | CreateNotificationDto[]): Promise<void> {
    const list = Array.isArray(input) ? input : [input];
    if (list.length === 0) return;

    try {
      const records: Prisma.NotificationCreateManyInput[] = list.map((item) => ({
        userId: item.userId,
        title: item.title,
        message: item.message,
        type: item.type ?? NotificationType.GENERAL,
        module: item.module ?? 'system',
        resourceId: item.resourceId ?? null,
        metadata: item.metadata ? (item.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        triggeredById: item.triggeredById ?? null,
      }));

      await this.prisma.notification.createMany({
        data: records,
      });
    } catch (err) {
      console.error('[NotificationsService] Failed to create notifications:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Action Event Helpers
  // ---------------------------------------------------------------------------

  private async getActorName(actorId?: string | null): Promise<string> {
    if (!actorId) return 'Someone';
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true },
      });
      return user?.name || 'Someone';
    } catch {
      return 'Someone';
    }
  }

  /**
   * Action Trigger: Task assigned to user(s)
   */
  async notifyTaskAssigned(params: {
    taskId: string;
    taskTitle: string;
    assignerId?: string | null;
    assigneeIds: string[];
  }): Promise<void> {
    const { taskId, taskTitle, assignerId, assigneeIds } = params;
    // Specific rule: only notify assignees who are NOT the assigner themselves
    const recipients = assigneeIds.filter((uid) => uid && uid !== assignerId);
    if (recipients.length === 0) return;

    const actorName = await this.getActorName(assignerId);
    const notifications: CreateNotificationDto[] = recipients.map((uid) => ({
      userId: uid,
      title: 'Task Assigned',
      message: `${actorName} assigned you to task "${taskTitle}"`,
      type: NotificationType.TASK_ASSIGNED,
      module: 'tasks',
      resourceId: taskId,
      metadata: { taskId, taskTitle, assignerId },
      triggeredById: assignerId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Action Trigger: Task updated (status, details, etc.)
   */
  async notifyTaskUpdated(params: {
    taskId: string;
    taskTitle: string;
    updaterId?: string | null;
    assigneeIds?: string[];
    creatorId?: string | null;
    eventType?: string;
    statusFrom?: string;
    statusTo?: string;
  }): Promise<void> {
    const { taskId, taskTitle, updaterId, assigneeIds = [], creatorId, eventType, statusFrom, statusTo } = params;

    // Specific recipients: assignees + creator, excluding updater
    const recipientSet = new Set<string>();
    for (const uid of assigneeIds) {
      if (uid && uid !== updaterId) recipientSet.add(uid);
    }
    if (creatorId && creatorId !== updaterId) {
      recipientSet.add(creatorId);
    }

    if (recipientSet.size === 0) return;

    const actorName = await this.getActorName(updaterId);

    let title = 'Task Updated';
    let message = `${actorName} updated task "${taskTitle}"`;
    let type: NotificationType = NotificationType.TASK_UPDATED;

    if (eventType === 'STATUS_CHANGE' || statusTo) {
      type = NotificationType.TASK_STATUS_CHANGED;
      if (statusTo === 'DONE') {
        title = 'Task Completed';
        message = `${actorName} marked task "${taskTitle}" as completed`;
      } else {
        title = 'Task Status Changed';
        message = `${actorName} changed status of task "${taskTitle}" to ${statusTo}`;
      }
    }

    const notifications: CreateNotificationDto[] = Array.from(recipientSet).map((uid) => ({
      userId: uid,
      title,
      message,
      type,
      module: 'tasks',
      resourceId: taskId,
      metadata: { taskId, taskTitle, updaterId, statusFrom, statusTo },
      triggeredById: updaterId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Action Trigger: Task deleted
   */
  async notifyTaskDeleted(params: {
    taskId: string;
    taskTitle: string;
    deleterId?: string | null;
    assigneeIds?: string[];
    creatorId?: string | null;
  }): Promise<void> {
    const { taskId, taskTitle, deleterId, assigneeIds = [], creatorId } = params;
    const recipientSet = new Set<string>();
    for (const uid of assigneeIds) {
      if (uid && uid !== deleterId) recipientSet.add(uid);
    }
    if (creatorId && creatorId !== deleterId) {
      recipientSet.add(creatorId);
    }

    if (recipientSet.size === 0) return;

    const actorName = await this.getActorName(deleterId);
    const notifications: CreateNotificationDto[] = Array.from(recipientSet).map((uid) => ({
      userId: uid,
      title: 'Task Deleted',
      message: `${actorName} deleted task "${taskTitle}"`,
      type: NotificationType.TASK_DELETED,
      module: 'tasks',
      resourceId: taskId,
      metadata: { taskId, taskTitle, deleterId },
      triggeredById: deleterId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Action Trigger: Lead assigned to a team member
   */
  async notifyLeadAssigned(params: {
    leadId: string;
    businessName: string;
    assignerId?: string | null;
    assigneeId: string;
  }): Promise<void> {
    const { leadId, businessName, assignerId, assigneeId } = params;
    // Only notify if recipient is not the assigner themselves
    if (!assigneeId || assigneeId === assignerId) return;

    const actorName = await this.getActorName(assignerId);
    await this.create({
      userId: assigneeId,
      title: 'Lead Assigned',
      message: `${actorName} assigned lead "${businessName}" to you`,
      type: NotificationType.LEAD_ASSIGNED,
      module: 'leads',
      resourceId: leadId,
      metadata: { leadId, businessName, assignerId },
      triggeredById: assignerId ?? undefined,
    });
  }

  /**
   * Action Trigger: Lead created
   */
  async notifyLeadCreated(params: {
    leadId: string;
    businessName: string;
    creatorId?: string | null;
    assigneeId?: string | null;
  }): Promise<void> {
    const { leadId, businessName, creatorId, assigneeId } = params;
    // If the lead is assigned on creation to someone other than creator, notify the assignee!
    if (assigneeId && assigneeId !== creatorId) {
      await this.notifyLeadAssigned({
        leadId,
        businessName,
        assignerId: creatorId,
        assigneeId,
      });
    }
  }

  /**
   * Action Trigger: Lead updated (status, details, conversion)
   */
  async notifyLeadUpdated(params: {
    leadId: string;
    businessName: string;
    updaterId?: string | null;
    assigneeId?: string | null;
    creatorId?: string | null;
    statusChanged?: boolean;
    previousStatus?: string;
    newStatus?: string;
  }): Promise<void> {
    const { leadId, businessName, updaterId, assigneeId, creatorId, statusChanged, previousStatus, newStatus } = params;

    // Specific recipients: assigned member and creator, excluding updater
    const recipientSet = new Set<string>();
    if (assigneeId && assigneeId !== updaterId) recipientSet.add(assigneeId);
    if (creatorId && creatorId !== updaterId) recipientSet.add(creatorId);

    if (recipientSet.size === 0) return;

    const actorName = await this.getActorName(updaterId);

    let title = 'Lead Updated';
    let message = `${actorName} updated lead "${businessName}"`;
    let type: NotificationType = NotificationType.LEAD_UPDATED;

    if (statusChanged && newStatus) {
      type = NotificationType.LEAD_STATUS_CHANGED;
      if (newStatus === 'CONVERTED') {
        title = 'Lead Converted! 🎉';
        message = `${actorName} converted lead "${businessName}"`;
      } else {
        title = 'Lead Status Changed';
        message = `${actorName} updated lead "${businessName}" status from ${previousStatus || 'previous'} to ${newStatus}`;
      }
    }

    const notifications: CreateNotificationDto[] = Array.from(recipientSet).map((uid) => ({
      userId: uid,
      title,
      message,
      type,
      module: 'leads',
      resourceId: leadId,
      metadata: { leadId, businessName, updaterId, previousStatus, newStatus },
      triggeredById: updaterId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Action Trigger: Lead deleted
   */
  async notifyLeadDeleted(params: {
    leadId: string;
    businessName: string;
    deleterId?: string | null;
    assigneeId?: string | null;
    creatorId?: string | null;
  }): Promise<void> {
    const { leadId, businessName, deleterId, assigneeId, creatorId } = params;
    const recipientSet = new Set<string>();
    if (assigneeId && assigneeId !== deleterId) recipientSet.add(assigneeId);
    if (creatorId && creatorId !== deleterId) recipientSet.add(creatorId);

    if (recipientSet.size === 0) return;

    const actorName = await this.getActorName(deleterId);
    const notifications: CreateNotificationDto[] = Array.from(recipientSet).map((uid) => ({
      userId: uid,
      title: 'Lead Deleted',
      message: `${actorName} deleted lead "${businessName}"`,
      type: NotificationType.LEAD_DELETED,
      module: 'leads',
      resourceId: leadId,
      metadata: { leadId, businessName, deleterId },
      triggeredById: deleterId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Action Trigger: Monthly report / competition winner finalized
   */
  async notifyMonthlyReport(params: {
    month: string;
    reportTitle?: string;
    recipientUserIds?: string[];
    actorId?: string | null;
  }): Promise<void> {
    const { month, reportTitle, recipientUserIds, actorId } = params;

    let recipients = recipientUserIds;
    if (!recipients || recipients.length === 0) {
      // Notify all active users
      const allUsers = await this.prisma.user.findMany({ select: { id: true } });
      recipients = allUsers.map((u) => u.id);
    }

    const actorName = await this.getActorName(actorId);
    const title = reportTitle || `Monthly Report Available (${month})`;
    const message = `The monthly report and competition results for ${month} are now finalized.`;

    const notifications: CreateNotificationDto[] = recipients.map((uid) => ({
      userId: uid,
      title,
      message,
      type: NotificationType.MONTHLY_REPORT,
      module: 'reports',
      resourceId: month,
      metadata: { month, actorName },
      triggeredById: actorId ?? undefined,
    }));

    await this.create(notifications);
  }

  /**
   * Broadcast or custom admin notification
   */
  async broadcast(dto: SendBroadcastNotificationDto, actorId?: string): Promise<{ count: number }> {
    let targetUserIds = dto.userIds;
    if (!targetUserIds || targetUserIds.length === 0) {
      const allUsers = await this.prisma.user.findMany({ select: { id: true } });
      targetUserIds = allUsers.map((u) => u.id);
    }

    const notifications: CreateNotificationDto[] = targetUserIds.map((uid) => ({
      userId: uid,
      title: dto.title,
      message: dto.message,
      type: dto.type ?? NotificationType.GENERAL,
      module: dto.module ?? 'system',
      resourceId: dto.resourceId,
      metadata: dto.metadata,
      triggeredById: actorId,
    }));

    await this.create(notifications);
    return { count: notifications.length };
  }

  // ---------------------------------------------------------------------------
  // Queries & Management (User APIs)
  // ---------------------------------------------------------------------------

  async findMyNotifications(userId: string, query: QueryNotificationsDto) {
    const { page = 1, limit = 10, isRead, module, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead !== undefined ? { isRead } : {}),
      ...(module ? { module } : {}),
      ...(type ? { type } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          triggeredBy: {
            select: NOTIFICATION_USER_SELECT,
          },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        triggeredBy: {
          select: NOTIFICATION_USER_SELECT,
        },
      },
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const res = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: res.count };
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { id };
  }

  async removeAll(userId: string, readOnly?: boolean): Promise<{ count: number }> {
    const res = await this.prisma.notification.deleteMany({
      where: {
        userId,
        ...(readOnly ? { isRead: true } : {}),
      },
    });

    return { count: res.count };
  }
}
