import { Controller, Get, Param, Query } from '@nestjs/common';
import { TravelInsightService } from '../services/travel-insight.service';
import { QueryTravelInsightsDto } from '../dto/query-travel-insights.dto';

@Controller('travel-insights')
export class PublicTravelInsightController {
  constructor(private readonly service: TravelInsightService) {}

  @Get()
  async findAll(@Query() query: QueryTravelInsightsDto) {
    return this.service.findAll({
      ...query,
      isPublished: 'true',
    });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlugPublic(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }
}
