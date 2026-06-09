import { Injectable, NotFoundException } from '@nestjs/common';

import { PlaybookTypesRepository } from '../repositories/playbook-types.repository';

import { CreatePlaybookTypeDto } from '../dto/create-playbook-type.dto';
import { UpdatePlaybookTypeDto } from '../dto/update-playbook-type.dto';

@Injectable()
export class PlaybookTypesService {
  constructor(private readonly repository: PlaybookTypesRepository) {}

  async create(dto: CreatePlaybookTypeDto) {
    return await this.repository.create(dto);
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

  async update(id: string, dto: UpdatePlaybookTypeDto) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook type not found');
    }

    return await this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundException('Playbook type not found');
    }

    return await this.repository.delete(id);
  }
}
