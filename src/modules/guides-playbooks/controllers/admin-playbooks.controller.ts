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

import { PlaybookService } from '../services/playbooks.service';

import { CreatePlaybookDto } from '../dto/create-playbook.dto';
import { UpdatePlaybookDto } from '../dto/update-playbook.dto';
import { QueryPlaybooksDto } from '../dto/query-playbooks.dto';
import { BulkDeletePlaybooksDto } from '../dto/bulk-delete-playbooks.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/playbooks')
export class AdminPlaybooksController {
  constructor(private readonly service: PlaybookService) {}

  @Post()
  @Permission(perm('guides', 'CREATE'))
  async create(@Body() dto: CreatePlaybookDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('guides', 'READ'))
  async findAll(@Query() query: QueryPlaybooksDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permission(perm('guides', 'READ'))
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Patch(':id')
  @Permission(perm('guides', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('guides', 'DELETE'))
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  @Permission(perm('guides', 'DELETE'))
  async removeMany(
    @Body() dto: BulkDeletePlaybooksDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
