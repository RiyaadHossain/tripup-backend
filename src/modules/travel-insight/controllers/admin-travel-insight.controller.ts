import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { TravelInsightService } from '../services/travel-insight.service';

import { CreateTravelInsightDto } from '../dto/create-travel-insight.dto';
import { UpdateTravelInsightDto } from '../dto/update-travel-insight.dto';
import { QueryTravelInsightsDto } from '../dto/query-travel-insights.dto';
import { BulkDeleteTravelInsightsDto } from '../dto/bulk-delete-travel-insights.dto';

@Controller('admin/travel-insights')
export class AdminTravelInsightController {
  constructor(private readonly service: TravelInsightService) {}

  @Post()
  async create(@Body() dto: CreateTravelInsightDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryTravelInsightsDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTravelInsightDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  async removeMany(@Body() dto: BulkDeleteTravelInsightsDto) {
    return this.service.removeMany(dto.ids);
  }
}
