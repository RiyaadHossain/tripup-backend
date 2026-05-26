import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TravelInsightCategoriesService } from '../services/travel-insight-categories.service';
import { CreateTravelInsightCategoryDto } from '../dto/create-travel-insight-category.dto';
import { UpdateTravelInsightCategoryDto } from '../dto/update-travel-insight-category.dto';

@Controller('admin/travel-insight-categories')
export class AdminTravelInsightCategoriesController {
  constructor(private readonly service: TravelInsightCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateTravelInsightCategoryDto) {
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
    @Body() dto: UpdateTravelInsightCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
