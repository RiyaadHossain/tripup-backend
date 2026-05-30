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

import { TravelServicesService } from '../services/travel-services.service';

import { BulkDeleteTravelServicesDto } from '../dto/bulk-delete-travel-services.dto';
import { CreateTravelServiceDto } from '../dto/create-travel-service.dto';
import { QueryTravelServicesDto } from '../dto/query-travel-services.dto';
import { UpdateTravelServiceDto } from '../dto/update-travel-service.dto';

@Controller('admin/travel-services')
export class AdminTravelServicesController {
  constructor(private readonly service: TravelServicesService) {}

  @Post()
  async create(@Body() dto: CreateTravelServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryTravelServicesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOnePublic(id);
  }

  @Get('listing')
  async findListing() {
    return await this.service.findListing();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTravelServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  async removeMany(@Body() dto: BulkDeleteTravelServicesDto) {
    return this.service.removeMany(dto.ids);
  }
}
