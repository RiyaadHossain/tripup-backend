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

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { TravelServicesService } from '../services/travel-services.service';
import { BulkDeleteTravelServicesDto } from '../dto/bulk-delete-travel-services.dto';
import { CreateTravelServiceDto } from '../dto/create-travel-service.dto';
import { QueryTravelServicesDto } from '../dto/query-travel-services.dto';
import { UpdateTravelServiceDto } from '../dto/update-travel-service.dto';

/**
 * Admin travel-services controller.
 *
 * Protected by JwtAuthGuard (must be authenticated) + PermissionGuard
 * (must hold the matching `services.*` permission, or be Super Admin).
 *
 * This controller serves as the canonical example of how to integrate
 * PBAC guards and the @Permission decorator across all admin controllers.
 */
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/travel-services')
export class AdminTravelServicesController {
  constructor(private readonly service: TravelServicesService) {}

  /** POST /admin/travel-services — requires services.create */
  @Post()
  @Permission(perm('services', 'CREATE'))
  async create(@Body() dto: CreateTravelServiceDto) {
    return this.service.create(dto);
  }

  /** GET /admin/travel-services — requires services.read */
  @Get()
  @Permission(perm('services', 'READ'))
  async findAll(@Query() query: QueryTravelServicesDto) {
    return this.service.findAll(query);
  }

  /** GET /admin/travel-services/:id — requires services.read */
  @Get(':id')
  @Permission(perm('services', 'READ'))
  async findOne(@Param('id') id: string) {
    return await this.service.findOnePublic(id);
  }

  /** GET /admin/travel-services/listing — requires services.read */
  @Get('listing')
  @Permission(perm('services', 'READ'))
  async findListing() {
    return await this.service.findListing();
  }

  /** PATCH /admin/travel-services/:id — requires services.update */
  @Patch(':id')
  @Permission(perm('services', 'UPDATE'))
  async update(@Param('id') id: string, @Body() dto: UpdateTravelServiceDto) {
    return this.service.update(id, dto);
  }

  /** DELETE /admin/travel-services/:id — requires services.delete */
  @Delete(':id')
  @Permission(perm('services', 'DELETE'))
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  /** DELETE /admin/travel-services (bulk) — requires services.delete */
  @Delete()
  @Permission(perm('services', 'DELETE'))
  async removeMany(@Body() dto: BulkDeleteTravelServicesDto) {
    return this.service.removeMany(dto.ids);
  }
}
