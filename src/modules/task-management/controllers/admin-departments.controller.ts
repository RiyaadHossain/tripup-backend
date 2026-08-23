import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';

import { DepartmentsService } from '../services/departments.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/departments')
export class AdminDepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Post()
  @Permission(perm('departments', 'CREATE'))
  async create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('departments', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  /**
   * Returns departments formatted as select options: [{ label, value }]
   * Ready-to-use for frontend dropdowns — no transformation needed.
   */
  @Get('listing')
  @Permission(perm('departments', 'READ'))
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('departments', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('departments', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
