import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PlaybookTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlaybookTypeCreateInput) {
    return await this.prisma.playbookType.create({
      data,
    });
  }

  async findMany() {
    return await this.prisma.playbookType.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            playbooks: true,
          },
        },
      },
    });
  }

  async findListing() {
    return await this.prisma.playbookType.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.playbookType.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.PlaybookTypeUpdateInput) {
    return await this.prisma.playbookType.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.playbookType.delete({
      where: { id },
    });
  }
}
