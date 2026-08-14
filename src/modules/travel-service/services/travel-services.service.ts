import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/src/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { CreateTravelServiceDto } from '../dto/create-travel-service.dto';
import { QueryTravelServicesDto } from '../dto/query-travel-services.dto';
import { UpdateTravelServiceDto } from '../dto/update-travel-service.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class TravelServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateTravelServiceDto, userId: string) {
    const { serviceCategory, ...rest } = dto;

    const service = await this.prisma.travelService.create({ data: { addedBy: userId ? { connect: { id: userId } } : undefined,
        ...this.toCreateData(rest),
        serviceCategory: serviceCategory
          ? {
              connect: { id: serviceCategory },
            }
          : undefined,
      },
      include: {
        serviceCategory: true,
      },
    });

    this.activityService.log('CREATE', 'travel_services', userId, {
      id: service.id,
      name: service.title,
    });

    return service;
  }

  async findAll(query: QueryTravelServicesDto) {
    const { page, limit, search, isPublished, serviceCategory } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TravelServiceWhereInput = {};

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
      ];
    }

    if (serviceCategory) {
      where.serviceCategoryId = serviceCategory;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.travelService.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          displayOrder: 'asc',
        },
        include: {
          serviceCategory: true,
        },
      }),

      this.prisma.travelService.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOnePublic(id: string) {
    const service = await this.prisma.travelService.findUnique({
      where: { id },
      include: {
        serviceCategory: true,
      },
    });

    if (!service || !service.isPublished) {
      throw new NotFoundException('Travel service not found');
    }

    return service;
  }

  async findBySlugPublic(slug: string) {
    const service = await this.prisma.travelService.findFirst({
      where: { slug },
      include: {
        serviceCategory: true,
      },
    });

    if (!service || !service.isPublished) {
      throw new NotFoundException('Travel service not found');
    }

    return service;
  }

  async findNavItems() {
    const services = await this.prisma.travelService.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        title: true,
        navLinsDesc: true,
        description: true,
        icon: true,
        category: true,
        slug: true,
        displayOrder: true,
        comingSoon: true,
      },
    });

    return services.map((service) => ({
      title: service.title,
      description: service.navLinsDesc || service.description,
      icon: service.icon,
      category: service.category,
      slug: `/services/${service.slug}`,
      displayOrder: service.displayOrder,
      ...(service.comingSoon ? { comingSoon: true } : {}),
    }));
  }

  async findListing() {
    const services = await this.prisma.travelService.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
      },
    });

    return services.map((service) => ({
      label: service.title,
      value: service.id,
    }));
  }

  async update(id: string, dto: UpdateTravelServiceDto, userId?: string) {
    const existing = await this.prisma.travelService.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Travel service not found');
    }

    const { serviceCategory, ...rest } = dto;

    const updated = await this.prisma.travelService.update({
      where: { id },
      data: {
        ...this.toUpdateData(rest),
        serviceCategory:
          serviceCategory !== undefined
            ? serviceCategory
              ? {
                  connect: { id: serviceCategory },
                }
              : {
                  disconnect: true,
                }
            : undefined,
      },
      include: {
        serviceCategory: true,
      },
    });

    this.activityService.log('UPDATE', 'travel_services', userId, {
      id: updated.id,
      name: updated.title,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.travelService.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Travel service not found');
    }

    this.activityService.log('DELETE', 'travel_services', userId, {
      id: existing.id,
      name: existing.title,
    });

    return await this.prisma.travelService.delete({
      where: { id },
    });
  }

  async removeMany(ids: string[], userId?: string) {
    this.activityService.log('DELETE', 'travel_services', userId, null);
    return await this.prisma.travelService.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  private toCreateData(
    data: Omit<CreateTravelServiceDto, 'serviceCategory'>,
  ): Prisma.TravelServiceCreateInput {
    return {
      ...data,
      hero: { ...data.hero } as Prisma.InputJsonValue,
      problem: { ...data.problem } as Prisma.InputJsonValue,
      capabilities: { ...data.capabilities } as Prisma.InputJsonValue,
      process: { ...data.process } as Prisma.InputJsonValue,
      deliverables: { ...data.deliverables } as Prisma.InputJsonValue,
      outcomes: { ...data.outcomes } as Prisma.InputJsonValue,
      audience: { ...data.audience } as Prisma.InputJsonValue,
      whyUs: { ...data.whyUs } as Prisma.InputJsonValue,
      faq: { ...data.faq } as Prisma.InputJsonValue,
      cta: { ...data.cta } as Prisma.InputJsonValue,
    };
  }

  private toUpdateData(
    data: Omit<UpdateTravelServiceDto, 'serviceCategory'>,
  ): Prisma.TravelServiceUpdateInput {
    return {
      ...data,
      hero: data.hero ? ({ ...data.hero } as Prisma.InputJsonValue) : undefined,
      problem: data.problem
        ? ({ ...data.problem } as Prisma.InputJsonValue)
        : undefined,
      capabilities: data.capabilities
        ? ({ ...data.capabilities } as Prisma.InputJsonValue)
        : undefined,
      process: data.process
        ? ({ ...data.process } as Prisma.InputJsonValue)
        : undefined,
      deliverables: data.deliverables
        ? ({ ...data.deliverables } as Prisma.InputJsonValue)
        : undefined,
      outcomes: data.outcomes
        ? ({ ...data.outcomes } as Prisma.InputJsonValue)
        : undefined,
      audience: data.audience
        ? ({ ...data.audience } as Prisma.InputJsonValue)
        : undefined,
      whyUs: data.whyUs
        ? ({ ...data.whyUs } as Prisma.InputJsonValue)
        : undefined,
      faq: data.faq ? ({ ...data.faq } as Prisma.InputJsonValue) : undefined,
      cta: data.cta ? ({ ...data.cta } as Prisma.InputJsonValue) : undefined,
    };
  }
}
