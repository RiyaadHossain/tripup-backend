import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

export const USER_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  profileImgUrl: true,
} as const;

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({
      data,
      include: {
        addedBy: { select: USER_SELECT_FIELDS },
        assignedTo: { select: USER_SELECT_FIELDS },
      },
    });
  }

  async createMany(data: Prisma.LeadCreateManyInput[]) {
    return this.prisma.lead.createMany({ data });
  }

  async findMany(params: Prisma.LeadFindManyArgs) {
    return this.prisma.lead.findMany({
      ...params,
      include: {
        addedBy: { select: USER_SELECT_FIELDS },
        assignedTo: { select: USER_SELECT_FIELDS },
        ...(params.include || {}),
      },
    });
  }

  async count(where?: Prisma.LeadWhereInput) {
    return this.prisma.lead.count({ where });
  }

  async findById(id: string, includeActivities = true) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        addedBy: { select: USER_SELECT_FIELDS },
        assignedTo: { select: USER_SELECT_FIELDS },
        ...(includeActivities
          ? {
              activities: {
                orderBy: { createdAt: 'desc' },
                include: {
                  user: { select: USER_SELECT_FIELDS },
                },
              },
            }
          : {}),
      },
    });
  }

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({
      where: { id },
      data,
      include: {
        addedBy: { select: USER_SELECT_FIELDS },
        assignedTo: { select: USER_SELECT_FIELDS },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return this.prisma.lead.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  // Activity methods
  async createActivity(data: Prisma.LeadActivityCreateInput) {
    return this.prisma.leadActivity.create({
      data,
      include: {
        user: { select: USER_SELECT_FIELDS },
      },
    });
  }

  async createManyActivities(data: Prisma.LeadActivityCreateManyInput[]) {
    return this.prisma.leadActivity.createMany({ data });
  }

  async findActivities(params: Prisma.LeadActivityFindManyArgs) {
    return this.prisma.leadActivity.findMany({
      ...params,
      include: {
        user: { select: USER_SELECT_FIELDS },
        ...(params.include || {}),
      },
    });
  }
}
