import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class MilestoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MilestoneCreateInput) {
    return this.prisma.milestone.create({ data });
  }

  async findMany() {
    return this.prisma.milestone.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async findListing() {
    return this.prisma.milestone.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async findById(id: string) {
    return this.prisma.milestone.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.MilestoneUpdateInput) {
    return this.prisma.milestone.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.milestone.delete({ where: { id } });
  }
}
