import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from '../dto/update-service-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServiceCategoryDto) {
    return await this.prisma.serviceCategory.create({
      data: dto,
    });
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

  async update(id: string, dto: UpdateServiceCategoryDto) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service category not found');
    }

    return this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Service category not found');
    }

    return this.prisma.serviceCategory.delete({
      where: { id },
    });
  }
}
