import { Injectable, NotFoundException } from '@nestjs/common';

import { PlaybookTypesRepository } from '../repositories/playbook-types.repository';

import { CreatePlaybookTypeDto } from '../dto/create-playbook-type.dto';
import { UpdatePlaybookTypeDto } from '../dto/update-playbook-type.dto';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';

@Injectable()
export class PlaybookTypesService {
  constructor(
    private readonly repository: PlaybookTypesRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreatePlaybookTypeDto, userId: string) {
    const type = await this.repository.create({ ...dto, addedBy: userId ? { connect: { id: userId } } : undefined, });

    this.activityService.log('CREATE', 'playbook_types', userId, {
      id: type.id,
      name: type.name,
    });

    return type;
  }

  async findAll() {
    const types = await this.repository.findMany();

    return types.map(({ _count, ...type }) => ({
      ...type,
      playbooksCount: _count.playbooks,
    }));
  }

  async findListing() {
    const types = await this.repository.findListing();

    return types.map((type) => ({
      label: type.name,
      value: type.id,
    }));
  }

  async update(id: string, dto: UpdatePlaybookTypeDto, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook type not found');
    }

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'playbook_types', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook type not found');
    }

    this.activityService.log('DELETE', 'playbook_types', userId, {
      id: existing.id,
      name: existing.name,
    });

    return await this.repository.delete(id);
  }
}
