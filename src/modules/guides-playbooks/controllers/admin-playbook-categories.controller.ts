import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PlaybookCategoriesService } from '../services/playbook-categories.service';
import { CreatePlaybookCategoryDto } from '../dto/create-playbook-category.dto';
import { UpdatePlaybookCategoryDto } from '../dto/update-playbook-category.dto';

@Controller('admin/playbook-categories')
export class AdminPlaybookCategoriesController {
  constructor(private readonly service: PlaybookCategoriesService) {}

  @Post()
  async create(@Body() dto: CreatePlaybookCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
