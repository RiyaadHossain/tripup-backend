import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from '../dto/update-service-category.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateServiceCategoryDto, userId: string) {
    const category = await this.prisma.serviceCategory.create({
      data: dto,
    });

    this.activityService.log('CREATE', 'service_categories', userId, {
      id: category.id,
      name: category.name,
    });

    return category;
  }

  async findAll() {
    const categories = await this.prisma.serviceCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            travelServices: true,
          },
        },
      },
    });

    return categories.map(({ _count, ...category }) => ({
      ...category,
      travelServicesCount: _count.travelServices,
    }));
  }

  async findListing() {
    const categories = await this.prisma.serviceCategory.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }

  async update(id: string, dto: UpdateServiceCategoryDto, userId?: string) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service category not found');
    }

    const updated = await this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
    });

    this.activityService.log('UPDATE', 'service_categories', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service category not found');
    }

    this.activityService.log('DELETE', 'service_categories', userId, {
      id: existing.id,
      name: existing.name,
    });

    return this.prisma.serviceCategory.delete({
      where: { id },
    });
  }
}
