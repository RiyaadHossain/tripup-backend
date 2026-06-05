import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class CaseStudyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CaseStudyCreateInput) {
    return await this.prisma.caseStudy.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async clearFeatured(excludeId?: string) {
    const where: Prisma.CaseStudyWhereInput = {
      isFeatured: true,
      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    };

    const data: Prisma.CaseStudyUpdateManyMutationInput = {
      isFeatured: false,
    };

    return await this.prisma.caseStudy.updateMany({
      where,
      data,
    });
  }

  async findMany(params: Prisma.CaseStudyFindManyArgs) {
    if (params.select) {
      return await this.prisma.caseStudy.findMany(params);
    }

    return await this.prisma.caseStudy.findMany({
      ...params,
      include: {
        ...(params.include ?? {}),
        category: true,
      },
    });
  }

  async count(where?: Prisma.CaseStudyWhereInput) {
    return await this.prisma.caseStudy.count({ where });
  }

  async findById(id: string) {
    const data = await this.prisma.caseStudy.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    const relatedCaseStudies = await this.prisma.caseStudy.findMany({
      where: {
        categoryId: data?.categoryId,
        id: { not: id },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        date: true,
        readingTime: true,
        createdAt: true,
      },
    });

    return { ...data, relatedCaseStudies };
  }

  async update(id: string, data: Prisma.CaseStudyUpdateInput) {
    return await this.prisma.caseStudy.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.caseStudy.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await this.prisma.caseStudy.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
