import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTasksDto } from '../dto/query-tasks.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TaskRepository,
    private readonly activityService: UserActivityService,
  ) {}

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateTaskDto, userId: string) {
    const { assigneeIds, milestoneId, departmentId, parentId, deadline, attachment, ...rest } = dto;

    const data: Prisma.TaskCreateInput = {
      ...rest,
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

    return task;
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
      data,
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
    return task;
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

    const { assigneeIds, milestoneId, departmentId, parentId, deadline, attachment, ...rest } = dto;

    const data: Prisma.TaskUpdateInput = {
      ...rest,
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(attachment !== undefined && { attachment: attachment as Prisma.InputJsonValue ?? Prisma.JsonNull }),
      ...(milestoneId !== undefined && {
        milestone: milestoneId ? { connect: { id: milestoneId } } : { disconnect: true },
      }),
      ...(departmentId !== undefined && {
        department: departmentId ? { connect: { id: departmentId } } : { disconnect: true },
      }),
      ...(parentId !== undefined && {
        parent: parentId ? { connect: { id: parentId } } : { disconnect: true },
      }),
      // Reconcile assignees: replace all existing with the new set
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
    } else {
      this.activityService.log('UPDATE', 'tasks', userId, {
        id: updated.id,
        name: updated.title,
      });
    }

    return updated;
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

    return updated;
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

    return this.repository.delete(id);
  }
}
