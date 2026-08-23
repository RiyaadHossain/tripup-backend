import { Injectable, NotFoundException } from '@nestjs/common';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';
import { MilestoneRepository } from '../repositories/milestone.repository';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly repository: MilestoneRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateMilestoneDto, userId: string) {
    const { dueDate, ...rest } = dto;

    const milestone = await this.repository.create({
      ...rest,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      addedBy: userId ? { connect: { id: userId } } : undefined,
    });

    this.activityService.log('CREATE', 'milestones', userId, {
      id: milestone.id,
      name: milestone.name,
    });

    return milestone;
  }

  async findAll() {
    const milestones = await this.repository.findMany();

    return milestones.map(({ _count, ...milestone }) => ({
      ...milestone,
      tasksCount: _count.tasks,
    }));
  }

  async findListing() {
    const milestones = await this.repository.findListing();

    return milestones.map((m) => ({
      label: m.name,
      value: m.id,
    }));
  }

  async update(id: string, dto: UpdateMilestoneDto, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Milestone not found');

    const { dueDate, ...rest } = dto;

    const updated = await this.repository.update(id, {
      ...rest,
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    });

    this.activityService.log('UPDATE', 'milestones', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Milestone not found');

    this.activityService.log('DELETE', 'milestones', userId, {
      id: existing.id,
      name: existing.name,
    });

    return this.repository.delete(id);
  }
}
