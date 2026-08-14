import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';

import { TravelInsightRepository } from '../repositories/travel-insight.repository';

import { CreateTravelInsightDto } from '../dto/create-travel-insight.dto';
import { UpdateTravelInsightDto } from '../dto/update-travel-insight.dto';
import { QueryTravelInsightsDto } from '../dto/query-travel-insights.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class TravelInsightService {
  constructor(
    private readonly repository: TravelInsightRepository,
    private readonly activityService: UserActivityService,
  ) { }

  async create(dto: CreateTravelInsightDto, userId: string) {
    const { category, relatedServices, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured();
    }

    const insight = await this.repository.create({
      ...rest,
      seo: { ...rest.seo } as Prisma.InputJsonValue,
      category: category
        ? {
          connect: { id: category },
        }
        : undefined,
      relatedServices: relatedServices?.length
        ? {
          connect: relatedServices.map((id) => ({ id })),
        }
        : undefined,
    });

    this.activityService.log('CREATE', 'travel_insights', userId, {
      id: insight.id,
      name: insight.title,
    });

    return insight;
  }

  async findAll(query: QueryTravelInsightsDto) {
    const { page, limit, search, isPublished, categoryId } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const [data, total] = await Promise.all([
      this.repository.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
        },
      }),

      this.repository.count(where),
    ]);

    const formattedData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      timeReadMin: item.timeReadMin,
      author: item.author,
      createdAt: item.createdAt,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      category: item.category
        ? { id: item.category.id, name: item.category.name }
        : null,
    }));

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOnePublic(id: string) {
    const insight = await this.repository.findById(id);

    if (!insight || !insight.isPublished) {
      throw new NotFoundException('Travel insight not found');
    }

    return insight;
  }

  async findBySlugPublic(slug: string) {
    const insight = await this.repository.findBySlug(slug);

    if (!insight || !insight.isPublished) {
      throw new NotFoundException('Travel insight not found');
    }

    return insight;
  }

  async update(id: string, dto: UpdateTravelInsightDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Travel insight not found');
    }

    const { category, relatedServices, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured(id);
    }

    const updated = await this.repository.update(id, {
      ...rest,
      seo: rest.seo ? ({ ...rest.seo } as Prisma.InputJsonValue) : undefined,
      category:
        category !== undefined
          ? category
            ? {
              connect: { id: category },
            }
            : {
              disconnect: true,
            }
          : undefined,
      relatedServices: relatedServices
        ? {
          set: relatedServices.map((serviceId) => ({ id: serviceId })),
        }
        : undefined,
    });

    this.activityService.log('UPDATE', 'travel_insights', userId, {
      id: updated.id,
      name: updated.title,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing)
      throw new NotFoundException('Travel insight not found');

    this.activityService.log('DELETE', 'travel_insights', userId, {
      id: existing.id ?? '',
      name: existing.title ?? '',
    });

    return this.repository.delete(id);
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'travel_insights', userId, null);
    return this.repository.deleteMany(ids);
  }
}
