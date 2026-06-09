import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PlaybookCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlaybookCategoryCreateInput) {
    return await this.prisma.playbookCategory.create({
      data,
    });
  }

  async findMany() {
    return await this.prisma.playbookCategory.findMany({
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
    return await this.prisma.playbookCategory.findMany({
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
    return await this.prisma.playbookCategory.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.PlaybookCategoryUpdateInput) {
    return await this.prisma.playbookCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.playbookCategory.delete({
      where: { id },
    });
  }
}
