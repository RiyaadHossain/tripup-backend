import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class TravelInsightCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TravelInsightCategoryCreateInput) {
    return await this.prisma.travelInsightCategory.create({
      data,
    });
  }

  async findMany() {
    return await this.prisma.travelInsightCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            travelInsights: true,
          },
        },
      },
    });
  }

  async findListing() {
    return await this.prisma.travelInsightCategory.findMany({
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
    return await this.prisma.travelInsightCategory.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.TravelInsightCategoryUpdateInput) {
    return await this.prisma.travelInsightCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.travelInsightCategory.delete({
      where: { id },
    });
  }
}
