import { Injectable, NotFoundException } from '@nestjs/common';

import { TravelInsightCategoriesRepository } from '../repositories/travel-insight-categories.repository';

import { CreateTravelInsightCategoryDto } from '../dto/create-travel-insight-category.dto';
import { UpdateTravelInsightCategoryDto } from '../dto/update-travel-insight-category.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class TravelInsightCategoriesService {
  constructor(
    private readonly repository: TravelInsightCategoriesRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateTravelInsightCategoryDto, userId: string) {
    const category = await this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined, });

    this.activityService.log('CREATE', 'travel_insight_categories', userId, {
      id: category.id,
      name: category.name,
    });

    return category;
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

  async update(id: string, dto: UpdateTravelInsightCategoryDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Travel insight category not found');
    }

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'travel_insight_categories', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Travel insight category not found');
    }

    this.activityService.log('DELETE', 'travel_insight_categories', userId, {
      id: existing.id,
      name: existing.name,
    });

    return await this.repository.delete(id);
  }
}
