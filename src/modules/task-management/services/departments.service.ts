import { Injectable, NotFoundException } from '@nestjs/common';
import { UserActivityService } from 'src/modules/user-activity/user-activity.service';
import { DepartmentRepository } from '../repositories/department.repository';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly repository: DepartmentRepository,
    private readonly activityService: UserActivityService,
  ) {}

  async create(dto: CreateDepartmentDto, userId: string) {
    const department = await this.repository.create({
      ...dto,
      addedBy: userId ? { connect: { id: userId } } : undefined,
    });

    this.activityService.log('CREATE', 'departments', userId, {
      id: department.id,
      name: department.name,
    });

    return department;
  }

  async findAll() {
    const departments = await this.repository.findMany();

    return departments.map(({ _count, ...department }) => ({
      ...department,
      tasksCount: _count.tasks,
    }));
  }

  async findListing() {
    const departments = await this.repository.findListing();

    return departments.map((d) => ({
      label: d.name,
      value: d.id,
    }));
  }

  async update(id: string, dto: UpdateDepartmentDto, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Department not found');

    const updated = await this.repository.update(id, dto);

    this.activityService.log('UPDATE', 'departments', userId, {
      id: updated.id,
      name: updated.name,
    });

    return updated;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Department not found');

    this.activityService.log('DELETE', 'departments', userId, {
      id: existing.id,
      name: existing.name,
    });

    return this.repository.delete(id);
  }
}
