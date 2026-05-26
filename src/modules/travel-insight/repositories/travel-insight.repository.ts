import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class TravelInsightRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TravelInsightCreateInput) {
    return await this.prisma.travelInsight.create({
      data,
      include: {
        category: true,
        relatedServices: true,
      },
    });
  }

  async clearFeatured(excludeId?: string) {
    const where: Prisma.TravelInsightWhereInput = {
      isFeatured: true,
      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    };

    const data: Prisma.TravelInsightUpdateManyMutationInput = {
      isFeatured: false,
    };

    return await this.prisma.travelInsight.updateMany({
      where,
      data,
    });
  }

  async findMany(params: Prisma.TravelInsightFindManyArgs) {
    if (params.select) {
      return await this.prisma.travelInsight.findMany(params);
    }

    return await this.prisma.travelInsight.findMany({
      ...params,
      include: {
        ...(params.include ?? {}),
        category: true,
        relatedServices: true,
      },
    });
  }

  async count(where?: Prisma.TravelInsightWhereInput) {
    return await this.prisma.travelInsight.count({ where });
  }

  async findById(id: string) {
    const data = await this.prisma.travelInsight.findUnique({
      where: { id },
      include: {
        category: true,
        relatedServices: true,
      },
    });

    const relatedInsights = await this.prisma.travelInsight.findMany({
      where: {
        categoryId: data?.categoryId,
        id: { not: id },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        author: true,
        createdAt: true,
        timeReadMin: true,
      },
    });

    return { ...data, relatedInsights };
  }

  async update(id: string, data: Prisma.TravelInsightUpdateInput) {
    return await this.prisma.travelInsight.update({
      where: { id },
      data,
      include: {
        category: true,
        relatedServices: true,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.travelInsight.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await this.prisma.travelInsight.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
