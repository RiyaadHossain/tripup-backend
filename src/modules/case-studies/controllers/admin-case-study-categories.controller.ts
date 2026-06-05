import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CaseStudyCategoriesService } from '../services/case-study-categories.service';
import { CreateCaseStudyCategoryDto } from '../dto/create-case-study-category.dto';
import { UpdateCaseStudyCategoryDto } from '../dto/update-case-study-category.dto';

@Controller('admin/case-study-categories')
export class AdminCaseStudyCategoriesController {
  constructor(private readonly service: CaseStudyCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateCaseStudyCategoryDto) {
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
    @Body() dto: UpdateCaseStudyCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
