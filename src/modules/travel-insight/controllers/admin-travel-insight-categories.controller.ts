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

import { TravelInsightCategoriesService } from '../services/travel-insight-categories.service';
import { CreateTravelInsightCategoryDto } from '../dto/create-travel-insight-category.dto';
import { UpdateTravelInsightCategoryDto } from '../dto/update-travel-insight-category.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/travel-insight-categories')
export class AdminTravelInsightCategoriesController {
  constructor(private readonly service: TravelInsightCategoriesService) {}

  @Post()
  @Permission(perm('travel_insights', 'CREATE'))
  async create(@Body() dto: CreateTravelInsightCategoryDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('travel_insights', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  @Permission(perm('travel_insights', 'READ'))
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('travel_insights', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelInsightCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('travel_insights', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
