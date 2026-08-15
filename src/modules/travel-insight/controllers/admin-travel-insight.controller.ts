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

import { TravelInsightService } from '../services/travel-insight.service';

import { CreateTravelInsightDto } from '../dto/create-travel-insight.dto';
import { UpdateTravelInsightDto } from '../dto/update-travel-insight.dto';
import { QueryTravelInsightsDto } from '../dto/query-travel-insights.dto';
import { BulkDeleteTravelInsightsDto } from '../dto/bulk-delete-travel-insights.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/travel-insights')
export class AdminTravelInsightController {
  constructor(private readonly service: TravelInsightService) {}

  @Post()
  @Permission(perm('travel_insights', 'CREATE'))
  async create(@Body() dto: CreateTravelInsightDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('travel_insights', 'READ'))
  async findAll(@Query() query: QueryTravelInsightsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permission(perm('travel_insights', 'READ'))
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Patch(':id')
  @Permission(perm('travel_insights', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelInsightDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('travel_insights', 'DELETE'))
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  @Permission(perm('travel_insights', 'DELETE'))
  async removeMany(
    @Body() dto: BulkDeleteTravelInsightsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
