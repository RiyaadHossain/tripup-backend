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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { LeadsService } from '../services/leads.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { QueryLeadsDto } from '../dto/query-leads.dto';
import { BulkDeleteLeadsDto } from '../dto/bulk-delete-leads.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/leads')
export class AdminLeadsController {
  constructor(private readonly service: LeadsService) {}

  @Post()
  @Permission(perm('leads', 'CREATE'))
  async create(
    @Body() dto: CreateLeadDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('leads', 'READ'))
  async findAll(@Query() query: QueryLeadsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permission(perm('leads', 'READ'))
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Permission(perm('leads', 'UPDATE'))
  async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permission(perm('leads', 'DELETE'))
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  @Permission(perm('leads', 'DELETE'))
  async removeMany(@Body() dto: BulkDeleteLeadsDto) {
    return this.service.removeMany(dto.ids);
  }
}
