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

import { ServiceCategoriesService } from '../services/service-categories.service';
import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from '../dto/update-service-category.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/service-categories')
export class AdminServiceCategoriesController {
  constructor(private readonly service: ServiceCategoriesService) {}

  @Post()
  @Permission(perm('services', 'CREATE'))
  async create(@Body() dto: CreateServiceCategoryDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('services', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  @Permission(perm('services', 'READ'))
  async findListing() {
    return await this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('services', 'UPDATE'))
  async update(@Param('id') id: string, @Body() dto: UpdateServiceCategoryDto, @CurrentUser('sub') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('services', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
