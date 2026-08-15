import { Injectable, NotFoundException } from '@nestjs/common';

import { CaseStudyCategoriesRepository } from '../repositories/case-study-categories.repository';

import { CreateCaseStudyCategoryDto } from '../dto/create-case-study-category.dto';
import { UpdateCaseStudyCategoryDto } from '../dto/update-case-study-category.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class CaseStudyCategoriesService {
  constructor(
    private readonly repository: CaseStudyCategoriesRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateCaseStudyCategoryDto, userId: string) {
    const category = await this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined, });

    this.activityService.log('CREATE', 'case_study_categories', userId, {
      id: category.id,
      name: category.name,
    });

    return category;
  }

  async findAll() {
    const categories = await this.repository.findMany();

    return categories.map(({ _count, ...category }) => ({
      ...category,
      caseStudiesCount: _count.caseStudies,
    }));
  }

  async findListing() {
    const categories = await this.repository.findListing();

    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }

  async update(id: string, dto: UpdateCaseStudyCategoryDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study category not found');
    }

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'case_study_categories', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study category not found');
    }

    this.activityService.log('DELETE', 'case_study_categories', userId, {
      id: existing.id,
      name: existing.name,
    });

    return await this.repository.delete(id);
  }
}
