import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PlaybookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlaybookCreateInput) {
    return await this.prisma.playbook.create({
      data,
      include: {
        category: true,
        type: true,
      },
    });
  }

  async clearFeatured(excludeId?: string) {
    const where: Prisma.PlaybookWhereInput = {
      isFeatured: true,
      ...(excludeId
        ? {
            id: {
              not: excludeId,
            },
          }
        : {}),
    };

    const data: Prisma.PlaybookUpdateManyMutationInput = {
      isFeatured: false,
    };

    return await this.prisma.playbook.updateMany({
      where,
      data,
    });
  }

  async findMany(params: Prisma.PlaybookFindManyArgs) {
    if (params.select) {
      return await this.prisma.playbook.findMany(params);
    }

    return await this.prisma.playbook.findMany({
      ...params,
      include: {
        ...(params.include ?? {}),
        category: true,
        type: true,
      },
    });
  }

  async count(where?: Prisma.PlaybookWhereInput) {
    return await this.prisma.playbook.count({ where });
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const data = await this.prisma.playbook.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        category: true,
        type: true,
      },
    });

    if (!data) return null;

    const relatedPlaybooks = await this.prisma.playbook.findMany({
      where: {
        categoryId: data.categoryId,
        id: { not: data.id },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        date: true,
        readingTime: true,
        bestFor: true,
        ctaLabel: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    return { ...data, relatedPlaybooks };
  }

  async update(id: string, data: Prisma.PlaybookUpdateInput) {
    return await this.prisma.playbook.update({
      where: { id },
      data,
      include: {
        category: true,
        type: true,
      },
    });
  }

  async delete(id: string) {
    return await this.prisma.playbook.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await this.prisma.playbook.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
