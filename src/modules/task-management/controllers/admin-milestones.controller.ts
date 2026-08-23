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

import { MilestonesService } from '../services/milestones.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/milestones')
export class AdminMilestonesController {
  constructor(private readonly service: MilestonesService) {}

  @Post()
  @Permission(perm('milestones', 'CREATE'))
  async create(
    @Body() dto: CreateMilestoneDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('milestones', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  /**
   * Returns milestones formatted as select options: [{ label, value }]
   * Ready-to-use for frontend dropdowns — no transformation needed.
   */
  @Get('listing')
  @Permission(perm('milestones', 'READ'))
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('milestones', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('milestones', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
