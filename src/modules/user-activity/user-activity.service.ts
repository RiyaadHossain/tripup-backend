import { Injectable } from '@nestjs/common';
import { ActivityAction } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { QueryActivitiesDto } from './dto/query-activities.dto';

export interface ActivityObjectMeta {
  id: string;
  name: string;
  [key: string]: unknown;
}

@Injectable()
export class UserActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget activity logger.
   * Never throws — a failure to log must never break the primary operation.
   */
  async log(
    action: ActivityAction,
    module: string,
    userId?: string | null,
    objectMeta?: ActivityObjectMeta | null,
  ) {
     await this.prisma.userActivity
      .create({
        data: {
          action,
          module,
          objectId: objectMeta?.id ?? null,
          objectMeta: objectMeta ? (objectMeta as object) : undefined,
          userId: userId ?? null,
        },
      })
      .catch((err) =>
        console.error('[UserActivity] Failed to log activity:', err),
      );
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  async findMine(userId: string, query: QueryActivitiesDto) {
    return this.queryActivities({ userId }, query);
  }

  async findByUser(userId: string, query: QueryActivitiesDto) {
    return this.queryActivities({ userId }, query);
  }

  private async queryActivities(
    filter: { userId: string; module?: string },
    query: QueryActivitiesDto,
  ) {
    const { page, limit, module } = query;
    const skip = (page - 1) * limit;

    const where: {
      userId: string;
      module?: string;
    } = {
      userId: filter.userId,
    };

    if (module) {
      where.module = module;
    }

    const [data, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.userActivity.count({ where }),
    ]);

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
}
