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

import { PlaybookCategoriesService } from '../services/playbook-categories.service';
import { CreatePlaybookCategoryDto } from '../dto/create-playbook-category.dto';
import { UpdatePlaybookCategoryDto } from '../dto/update-playbook-category.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/playbook-categories')
export class AdminPlaybookCategoriesController {
  constructor(private readonly service: PlaybookCategoriesService) {}

  @Post()
  @Permission(perm('guides', 'CREATE'))
  async create(@Body() dto: CreatePlaybookCategoryDto, @CurrentUser('sub') userId: string) {
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
    @Body() dto: UpdatePlaybookCategoryDto,
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
