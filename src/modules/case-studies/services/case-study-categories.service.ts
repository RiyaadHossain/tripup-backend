import { Injectable, NotFoundException } from '@nestjs/common';

import { CaseStudyCategoriesRepository } from '../repositories/case-study-categories.repository';

import { CreateCaseStudyCategoryDto } from '../dto/create-case-study-category.dto';
import { UpdateCaseStudyCategoryDto } from '../dto/update-case-study-category.dto';

@Injectable()
export class CaseStudyCategoriesService {
  constructor(private readonly repository: CaseStudyCategoriesRepository) {}

  async create(dto: CreateCaseStudyCategoryDto) {
    return await this.repository.create(dto);
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

  async update(id: string, dto: UpdateCaseStudyCategoryDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study category not found');
    }

    return await this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Case study category not found');
    }

    return await this.repository.delete(id);
  }
}
