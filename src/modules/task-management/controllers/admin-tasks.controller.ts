import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';

import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTasksDto } from '../dto/query-tasks.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/tasks')
export class AdminTasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  @Permission(perm('tasks', 'CREATE'))
  async create(@Body() dto: CreateTaskDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('tasks', 'READ'))
  async findAll(@Query() query: QueryTasksDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permission(perm('tasks', 'READ'))
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permission(perm('tasks', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  /**
   * Dedicated status-change endpoint.
   * Produces a targeted activity log entry including statusFrom and statusTo.
   */
  @Patch(':id/status')
  @Permission(perm('tasks', 'UPDATE'))
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.updateStatus(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('tasks', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
