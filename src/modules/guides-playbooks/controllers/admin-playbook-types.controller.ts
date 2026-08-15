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

import { PlaybookTypesService } from '../services/playbook-types.service';
import { CreatePlaybookTypeDto } from '../dto/create-playbook-type.dto';
import { UpdatePlaybookTypeDto } from '../dto/update-playbook-type.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/playbook-types')
export class AdminPlaybookTypesController {
  constructor(private readonly service: PlaybookTypesService) {}

  @Post()
  @Permission(perm('guides', 'CREATE'))
  async create(@Body() dto: CreatePlaybookTypeDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('guides', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  @Permission(perm('guides', 'READ'))
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('guides', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookTypeDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('guides', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
