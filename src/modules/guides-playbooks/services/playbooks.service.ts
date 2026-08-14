import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';

import { PlaybookRepository } from '../repositories/playbooks.repository';

import { CreatePlaybookDto } from '../dto/create-playbook.dto';
import { UpdatePlaybookDto } from '../dto/update-playbook.dto';
import { QueryPlaybooksDto } from '../dto/query-playbooks.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class PlaybookService {
  constructor(
    private readonly repository: PlaybookRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreatePlaybookDto, userId: string) {
    const { category, type, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured();
    }

    const playbook = await this.repository.create({
      ...rest,
      frameworkSteps: rest.frameworkSteps as unknown as Prisma.InputJsonValue,
      samplePreviews: rest.samplePreviews as unknown as Prisma.InputJsonValue,
      relatedServices: rest.relatedServices as unknown as Prisma.InputJsonValue,
      category: category
        ? {
            connect: { id: category },
          }
        : undefined,
      type: type
        ? {
            connect: { id: type },
          }
        : undefined,
    });

    this.activityService.log('CREATE', 'guides_playbooks', userId, {
      id: playbook.id,
      name: playbook.title,
    });

    return playbook;
  }

  async findAll(query: QueryPlaybooksDto) {
    const { page, limit, search, isPublished, categoryId, typeId } = query;

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
          author: {
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
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          bestFor: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (typeId) {
      where.typeId = typeId;
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
          type: true,
        },
      }),

      this.repository.count(where),
    ]);

    const formattedData = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      author: item.author,
      readingTime: item.readingTime,
      bestFor: item.bestFor,
      ctaLabel: item.ctaLabel,
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      createdAt: item.createdAt,
      category: item.category
        ? { id: item.category.id, name: item.category.name }
        : null,
      type: item.type ? { id: item.type.id, name: item.type.name } : null,
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

  async findOnePublic(idOrSlug: string) {
    const playbook = await this.repository.findByIdOrSlug(idOrSlug);

    if (!playbook || !playbook.isPublished) {
      throw new NotFoundException('Playbook not found');
    }

    return playbook;
  }

  async update(id: string, dto: UpdatePlaybookDto, userId?: string) {
    const existing = await this.repository.findByIdOrSlug(id);

    if (!existing) {
      throw new NotFoundException('Playbook not found');
    }

    const { category, type, ...rest } = dto;

    if (rest.isFeatured) {
      await this.repository.clearFeatured(id);
    }

    const updated = await this.repository.update(id, {
      ...rest,
      frameworkSteps: rest.frameworkSteps
        ? (rest.frameworkSteps as unknown as Prisma.InputJsonValue)
        : undefined,
      samplePreviews: rest.samplePreviews
        ? (rest.samplePreviews as unknown as Prisma.InputJsonValue)
        : undefined,
      relatedServices: rest.relatedServices
        ? (rest.relatedServices as unknown as Prisma.InputJsonValue)
        : undefined,
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
      type:
        type !== undefined
          ? type
            ? {
                connect: { id: type },
              }
            : {
                disconnect: true,
              }
          : undefined,
    });

    this.activityService.log('UPDATE', 'guides_playbooks', userId, {
      id: updated.id,
      name: updated.title,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findByIdOrSlug(id);

    if (!existing) {
      throw new NotFoundException('Playbook not found');
    }

    this.activityService.log('DELETE', 'guides_playbooks', userId, {
      id: existing.id,
      name: existing.title,
    });

    return this.repository.delete(id);
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'guides_playbooks', userId, null);
    return this.repository.deleteMany(ids);
  }
}
