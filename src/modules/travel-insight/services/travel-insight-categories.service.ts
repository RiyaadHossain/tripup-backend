import { Injectable, NotFoundException } from '@nestjs/common';

import { TravelInsightCategoriesRepository } from '../repositories/travel-insight-categories.repository';

import { CreateTravelInsightCategoryDto } from '../dto/create-travel-insight-category.dto';
import { UpdateTravelInsightCategoryDto } from '../dto/update-travel-insight-category.dto';

@Injectable()
export class TravelInsightCategoriesService {
  constructor(
    private readonly repository: TravelInsightCategoriesRepository,
  ) {}

  async create(dto: CreateTravelInsightCategoryDto) {
    return await this.repository.create(dto);
  }

  async findAll() {
    const categories = await this.repository.findMany();

    return categories.map(({ _count, ...category }) => ({
      ...category,
      travelInsightsCount: _count.travelInsights,
    }));
  }

  async findListing() {
    const categories = await this.repository.findListing();

    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }

  async update(id: string, dto: UpdateTravelInsightCategoryDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Travel insight category not found');
    }

    return await this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Travel insight category not found');
    }

    return await this.repository.delete(id);
  }
}
