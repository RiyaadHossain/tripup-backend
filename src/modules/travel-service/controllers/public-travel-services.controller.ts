import { Controller, Get, Param, Query } from '@nestjs/common';

import { TravelServicesService } from '../services/travel-services.service';

import { QueryTravelServicesDto } from '../dto/query-travel-services.dto';

@Controller('travel-services')
export class PublicTravelServicesController {
  constructor(private readonly service: TravelServicesService) {}

  @Get()
  async findAll(@Query() query: QueryTravelServicesDto) {
    return this.service.findAll({
      ...query,
      isPublished: 'true',
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    return this.service.findOnePublic(slug);
  }
}
