import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ServiceCategoriesService } from '../services/service-categories.service';

import { CreateServiceCategoryDto } from '../dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from '../dto/update-service-category.dto';

@Controller('admin/service-categories')
export class AdminServiceCategoriesController {
  constructor(private readonly service: ServiceCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateServiceCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  async findListing() {
    return await this.service.findListing();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateServiceCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
