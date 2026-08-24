import { Injectable } from '@nestjs/common';
import { Prisma, TaskStatus, TaskPriority } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

/** Default include shape — used consistently across find operations. */
const TASK_INCLUDE = {
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  milestone: { select: { id: true, name: true } },
  department: { select: { id: true, name: true } },
  parent: { select: { id: true, title: true } },
  children: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      deadline: true,
    },
  },
  addedBy: { select: { id: true, name: true } },
} satisfies Prisma.TaskInclude;

export interface TaskQueryFilter {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  milestoneId?: string;
  departmentId?: string;
  assigneeId?: string;
  parentId?: string;
}

@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({ data, include: TASK_INCLUDE });
  }

  async findMany(
    filter: TaskQueryFilter,
    skip: number,
    take: number,
  ) {
    const where = this.buildWhere(filter);

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: TASK_INCLUDE,
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
  }

  async findListing() {
    return this.prisma.task.findMany({
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private buildWhere(filter: TaskQueryFilter): Prisma.TaskWhereInput {
    const where: Prisma.TaskWhereInput = {};

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.milestoneId) where.milestoneId = filter.milestoneId;
    if (filter.departmentId) where.departmentId = filter.departmentId;
    if (filter.parentId !== undefined) where.parentId = filter.parentId ?? null;
    if (filter.assigneeId) {
      where.assignees = { some: { userId: filter.assigneeId } };
    }

    return where;
  }
}
