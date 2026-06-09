import { Injectable, NotFoundException } from '@nestjs/common';

import { PlaybookCategoriesRepository } from '../repositories/playbook-categories.repository';

import { CreatePlaybookCategoryDto } from '../dto/create-playbook-category.dto';
import { UpdatePlaybookCategoryDto } from '../dto/update-playbook-category.dto';

@Injectable()
export class PlaybookCategoriesService {
  constructor(private readonly repository: PlaybookCategoriesRepository) {}

  async create(dto: CreatePlaybookCategoryDto) {
    return await this.repository.create(dto);
  }

  async findAll() {
    const categories = await this.repository.findMany();

    return categories.map(({ _count, ...category }) => ({
      ...category,
      playbooksCount: _count.playbooks,
    }));
  }

  async findListing() {
    const categories = await this.repository.findListing();

    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  }

  async update(id: string, dto: UpdatePlaybookCategoryDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook category not found');
    }

    return await this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook category not found');
    }

    return await this.repository.delete(id);
  }
}
