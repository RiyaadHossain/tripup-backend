import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTasksDto } from '../dto/query-tasks.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { QueryTaskCommentsDto } from '../dto/query-task-comments.dto';
import {
  extractMentionsFromHtml,
  hasVisibleContent,
  sanitizeRichContent,
  validateMentionCorrespondence,
} from '../utils/task-html.util';

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly activityService: UserActivityService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Transforms raw database task into standard frontend response shape.
   */
  private formatTaskResponse(task: any) {
    if (!task) return null;

    let assignees: { id: string; name: string; email: string }[] = [];
    if (Array.isArray(task.assignees)) {
      assignees = task.assignees.map((a: any) => {
        if (a && a.user) {
          return {
            id: a.user.id,
            name: a.user.name,
            email: a.user.email,
          };
        }
        return {
          id: a.id || a.userId,
          name: a.name || '',
          email: a.email || '',
        };
      });
    }

    const subTasks = task.children || [];
    const parentTask = task.parent || null;
    const createdBy = task.addedBy
      ? {
          id: task.addedBy.id,
          name: task.addedBy.name,
          email: task.addedBy.email,
        }
      : null;

    return {
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      descriptionFormat: task.descriptionFormat || 'plain',
      mentionedUserIds: task.mentionedUserIds || [],
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
      attachment: task.attachment ?? null,
      assignees,
      milestoneId: task.milestoneId ?? null,
      milestone: task.milestone ?? null,
      departmentId: task.departmentId ?? null,
      department: task.department ?? null,
      parentId: task.parentId ?? null,
      parentTask,
      subTasks,
      subTaskCount: subTasks.length,
      createdBy,
      createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : null,
      updatedAt: task.updatedAt ? new Date(task.updatedAt).toISOString() : null,
      // Backward-compatible properties
      parent: parentTask,
      children: subTasks,
      addedBy: createdBy,
    };
  }

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateTaskDto, userId: string) {
    const {
      assigneeIds,
      milestoneId,
      departmentId,
      parentId,
      deadline,
      attachment,
      description,
      descriptionFormat,
      mentionedUserIds,
      ...rest
    } = dto;

    const format = descriptionFormat === 'html' ? 'html' : 'plain';
    let sanitizedDescription = description ?? null;
    let verifiedMentionIds: string[] = [];

    if (format === 'html' && description) {
      sanitizedDescription = sanitizeRichContent(description);
      const htmlMentions = extractMentionsFromHtml(sanitizedDescription);
      verifiedMentionIds = validateMentionCorrespondence(mentionedUserIds, htmlMentions);

      if (verifiedMentionIds.length > 0) {
        const count = await this.prisma.user.count({
          where: { id: { in: verifiedMentionIds } },
        });
        if (count !== verifiedMentionIds.length) {
          throw new BadRequestException('Invalid mention target');
        }
      }
    }

    const data: Prisma.TaskCreateInput = {
      ...rest,
      description: sanitizedDescription,
      descriptionFormat: format,
      mentionedUserIds: verifiedMentionIds,
      ...(deadline && { deadline: new Date(deadline) }),
      ...(attachment && { attachment: attachment as Prisma.InputJsonValue }),
      ...(milestoneId && { milestone: { connect: { id: milestoneId } } }),
      ...(departmentId && { department: { connect: { id: departmentId } } }),
      ...(parentId && { parent: { connect: { id: parentId } } }),
      addedBy: userId ? { connect: { id: userId } } : undefined,
      ...(assigneeIds?.length && {
        assignees: {
          create: assigneeIds.map((uid) => ({ user: { connect: { id: uid } } })),
        },
      }),
    };

    const task = await this.repository.create(data);

    this.activityService.log('CREATE', 'tasks', userId, {
      id: task.id,
      name: task.title,
    });

    // Notify assignees (excluding creator)
    if (assigneeIds?.length) {
      this.notificationsService.notifyTaskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assignerId: userId,
        assigneeIds,
      }).catch((err) => console.error('[TasksService] Notification error:', err));
    }

    // Trigger mention notifications if present
    if (verifiedMentionIds.length > 0) {
      this.notificationsService.notifyTaskMention({
        taskId: task.id,
        taskTitle: task.title,
        actorId: userId,
        commentId: null,
        mentionedUserIds: verifiedMentionIds,
        creatorId: userId,
        assigneeIds,
      }).catch((err) => console.error('[TasksService] Mention notification error:', err));
    }

    return this.formatTaskResponse(task);
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async findAll(query: QueryTasksDto) {
    const { page, limit, search, status, priority, milestoneId, departmentId, assigneeId, parentId } = query;
    const skip = (page - 1) * limit;

    const { data, total } = await this.repository.findMany(
      { search, status, priority, milestoneId, departmentId, assigneeId, parentId },
      skip,
      limit,
    );

    return {
      data: data.map((t) => this.formatTaskResponse(t)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    return this.formatTaskResponse(task);
  }

  async findListing() {
    const tasks = await this.repository.findListing();

    return tasks.map((t) => ({
      label: t.title,
      value: t.id,
    }));
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  async update(id: string, dto: UpdateTaskDto, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Task not found');

    const {
      assigneeIds,
      milestoneId,
      departmentId,
      parentId,
      deadline,
      attachment,
      description,
      descriptionFormat,
      mentionedUserIds,
      ...rest
    } = dto;

    let finalDescription = existing.description;
    let finalFormat = existing.descriptionFormat || 'plain';
    let finalMentionedUserIds = existing.mentionedUserIds || [];
    let newlyAddedMentions: string[] = [];

    if (description !== undefined) {
      finalFormat = descriptionFormat !== undefined ? descriptionFormat : (existing.descriptionFormat || 'plain');

      if (finalFormat === 'html' && description) {
        finalDescription = sanitizeRichContent(description);
        const htmlMentions = extractMentionsFromHtml(finalDescription);
        finalMentionedUserIds = validateMentionCorrespondence(mentionedUserIds, htmlMentions);

        if (finalMentionedUserIds.length > 0) {
          const count = await this.prisma.user.count({
            where: { id: { in: finalMentionedUserIds } },
          });
          if (count !== finalMentionedUserIds.length) {
            throw new BadRequestException('Invalid mention target');
          }
        }
      } else {
        finalDescription = description;
        finalFormat = 'plain';
        finalMentionedUserIds = [];
      }

      const previouslyStoredMentions = new Set(existing.mentionedUserIds || []);
      newlyAddedMentions = finalMentionedUserIds.filter((uid) => !previouslyStoredMentions.has(uid));
    } else if (mentionedUserIds !== undefined) {
      if (mentionedUserIds.length === 0) {
        finalMentionedUserIds = [];
      } else {
        const htmlMentions = extractMentionsFromHtml(existing.description || '');
        finalMentionedUserIds = validateMentionCorrespondence(mentionedUserIds, htmlMentions);
        const previouslyStoredMentions = new Set(existing.mentionedUserIds || []);
        newlyAddedMentions = finalMentionedUserIds.filter((uid) => !previouslyStoredMentions.has(uid));
      }
    }

    const data: Prisma.TaskUpdateInput = {
      ...rest,
      ...(description !== undefined && { description: finalDescription }),
      ...(descriptionFormat !== undefined || description !== undefined ? { descriptionFormat: finalFormat } : {}),
      ...(mentionedUserIds !== undefined || description !== undefined ? { mentionedUserIds: finalMentionedUserIds } : {}),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(attachment !== undefined && { attachment: (attachment as Prisma.InputJsonValue) ?? Prisma.JsonNull }),
      ...(milestoneId !== undefined && {
        milestone: milestoneId ? { connect: { id: milestoneId } } : { disconnect: true },
      }),
      ...(departmentId !== undefined && {
        department: departmentId ? { connect: { id: departmentId } } : { disconnect: true },
      }),
      ...(parentId !== undefined && {
        parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
      }),
      ...(assigneeIds !== undefined && {
        assignees: {
          deleteMany: {},
          create: assigneeIds.map((uid) => ({ user: { connect: { id: uid } } })),
        },
      }),
    };

    const updated = await this.repository.update(id, data);

    // Log assignee change separately for clarity
    if (assigneeIds !== undefined) {
      this.activityService.log('ASSIGN', 'tasks', userId, {
        id: updated.id,
        name: updated.title,
        assigneeIds,
      });

      // Notify new assignees
      const existingAssigneeIds = new Set(existing.assignees.map((a) => a.user.id));
      const newlyAssignedIds = assigneeIds.filter((uid) => !existingAssigneeIds.has(uid));
      if (newlyAssignedIds.length > 0) {
        this.notificationsService.notifyTaskAssigned({
          taskId: updated.id,
          taskTitle: updated.title,
          assignerId: userId,
          assigneeIds: newlyAssignedIds,
        }).catch((err) => console.error('[TasksService] Notification error:', err));
      }
    } else {
      this.activityService.log('UPDATE', 'tasks', userId, {
        id: updated.id,
        name: updated.title,
      });
    }

    // Notify all active assignees & creator of the update
    const currentAssigneeIds = updated.assignees.map((a) => a.user.id);
    this.notificationsService.notifyTaskUpdated({
      taskId: updated.id,
      taskTitle: updated.title,
      updaterId: userId,
      assigneeIds: currentAssigneeIds,
      creatorId: existing.addedBy?.id,
    }).catch((err) => console.error('[TasksService] Notification error:', err));

    // Trigger mention notifications ONLY for newly added mention IDs
    if (newlyAddedMentions.length > 0 && userId) {
      this.notificationsService.notifyTaskMention({
        taskId: updated.id,
        taskTitle: updated.title,
        actorId: userId,
        commentId: null,
        mentionedUserIds: newlyAddedMentions,
        creatorId: existing.addedBy?.id,
        assigneeIds: currentAssigneeIds,
      }).catch((err) => console.error('[TasksService] Mention notification error:', err));
    }

    return this.formatTaskResponse(updated);
  }

  // ---------------------------------------------------------------------------
  // Status change (dedicated — produces a targeted activity log)
  // ---------------------------------------------------------------------------

  async updateStatus(id: string, dto: UpdateTaskStatusDto, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Task not found');

    const updated = await this.repository.update(id, { status: dto.status });

    this.activityService.log('UPDATE', 'tasks', userId, {
      id: updated.id,
      name: updated.title,
      event: 'STATUS_CHANGE',
      statusFrom: existing.status,
      statusTo: dto.status,
    });

    const currentAssigneeIds = existing.assignees.map((a) => a.user.id);
    this.notificationsService.notifyTaskUpdated({
      taskId: updated.id,
      taskTitle: updated.title,
      updaterId: userId,
      assigneeIds: currentAssigneeIds,
      creatorId: existing.addedBy?.id,
      eventType: 'STATUS_CHANGE',
      statusFrom: existing.status,
      statusTo: dto.status,
    }).catch((err) => console.error('[TasksService] Notification error:', err));

    return this.formatTaskResponse(updated);
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Task not found');

    this.activityService.log('DELETE', 'tasks', userId, {
      id: existing.id,
      name: existing.title,
    });

    const currentAssigneeIds = existing.assignees.map((a) => a.user.id);
    this.notificationsService.notifyTaskDeleted({
      taskId: existing.id,
      taskTitle: existing.title,
      deleterId: userId,
      assigneeIds: currentAssigneeIds,
      creatorId: existing.addedBy?.id,
    }).catch((err) => console.error('[TasksService] Notification error:', err));

    return this.repository.delete(id);
  }

  // ---------------------------------------------------------------------------
  // Task Comments
  // ---------------------------------------------------------------------------

  async createComment(taskId: string, dto: CreateTaskCommentDto, userId: string) {
    const task = await this.repository.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Reject empty visible content (e.g. <p><br></p>)
    if (!hasVisibleContent(dto.content)) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const sanitized = sanitizeRichContent(dto.content);
    if (!hasVisibleContent(sanitized)) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const htmlMentions = extractMentionsFromHtml(sanitized);
    const verifiedMentionIds = validateMentionCorrespondence(dto.mentionedUserIds, htmlMentions);

    // Verify mentioned users exist in current account / DB
    if (verifiedMentionIds.length > 0) {
      const count = await this.prisma.user.count({
        where: { id: { in: verifiedMentionIds } },
      });
      if (count !== verifiedMentionIds.length) {
        throw new BadRequestException('Invalid mention target');
      }
    }

    const comment = await this.repository.createComment({
      content: sanitized,
      contentFormat: dto.contentFormat || 'html',
      mentions: htmlMentions as unknown as Prisma.InputJsonValue,
      mentionedUserIds: verifiedMentionIds,
      task: { connect: { id: taskId } },
      author: { connect: { id: userId } },
    });

    this.activityService.log('CREATE', 'task_comments', userId, {
      id: comment.id,
      name: `Comment on ${task.title}`,
      taskId,
    });

    // Notify mentioned users and associated users (creator + assignees), excluding actor
    if (verifiedMentionIds.length > 0) {
      const currentAssigneeIds = task.assignees.map((a) => a.user.id);
      this.notificationsService.notifyTaskMention({
        taskId: task.id,
        taskTitle: task.title,
        actorId: userId,
        commentId: comment.id,
        mentionedUserIds: verifiedMentionIds,
        creatorId: task.addedBy?.id,
        assigneeIds: currentAssigneeIds,
      }).catch((err) => console.error('[TasksService] Comment mention notification error:', err));
    }

    return {
      id: comment.id,
      taskId: comment.taskId,
      content: comment.content,
      contentFormat: comment.contentFormat,
      mentions: (comment.mentions as any) || [],
      author: {
        id: comment.author.id,
        name: comment.author.name,
        email: comment.author.email,
      },
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }

  async findComments(taskId: string, query: QueryTaskCommentsDto) {
    const task = await this.repository.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const skip = (page - 1) * limit;

    const { items, total } = await this.repository.findComments(taskId, skip, limit);

    const formattedItems = items.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      content: c.content,
      contentFormat: c.contentFormat,
      mentions: (c.mentions as any) || [],
      author: {
        id: c.author.id,
        name: c.author.name,
        email: c.author.email,
      },
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
