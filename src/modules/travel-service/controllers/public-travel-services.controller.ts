import { Controller, Get, Param, Query } from '@nestjs/common';

import { TravelServicesService } from '../services/travel-services.service';

import { QueryTravelServicesDto } from '../dto/query-travel-services.dto';

@Controller('travel-services')
export class PublicTravelServicesController {
  constructor(private readonly service: TravelServicesService) {}

  @Get('nav-items')
  async findNavItems() {
    return this.service.findNavItems();
  }

  @Get()
  async findAll(@Query() query: QueryTravelServicesDto) {
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
