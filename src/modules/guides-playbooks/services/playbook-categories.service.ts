import { Injectable, NotFoundException } from '@nestjs/common';

import { PlaybookCategoriesRepository } from '../repositories/playbook-categories.repository';

import { CreatePlaybookCategoryDto } from '../dto/create-playbook-category.dto';
import { UpdatePlaybookCategoryDto } from '../dto/update-playbook-category.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class PlaybookCategoriesService {
  constructor(
    private readonly repository: PlaybookCategoriesRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreatePlaybookCategoryDto, userId: string) {
    const category = await this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined, });

    this.activityService.log('CREATE', 'playbook_categories', userId, {
      id: category.id,
      name: category.name,
    });

    return category;
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

  async update(id: string, dto: UpdatePlaybookCategoryDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook category not found');
    }

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'playbook_categories', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook category not found');
    }

    this.activityService.log('DELETE', 'playbook_categories', userId, {
      id: existing.id,
      name: existing.name,
    });

    return await this.repository.delete(id);
  }
}
