import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { perm } from 'src/common/constants/permissions.constant';
import { DesignsService } from '../services/designs.service';
import { CreateDesignDto } from '../dto/create-design.dto';
import { UpdateDesignDto } from '../dto/update-design.dto';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  /**
   * 3.1 Public: Get all published designs (newest first).
   */
  @Get()
  async findAll() {
    const data = await this.designsService.findAllPublic();
    return {
      success: true,
      data,
    };
  }

  /**
   * 3.2 Public: Get single design by slug (case-insensitive).
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.designsService.findBySlugPublic(slug);
    return {
      success: true,
      data,
    };
  }

  /**
   * 4.1 Admin: Create design.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission(perm('designs', 'CREATE'))
  async create(@Body() dto: CreateDesignDto, @Req() req: Request) {
    const data = await this.designsService.create(dto, req.body);
    return {
      success: true,
      data,
    };
  }

  /**
   * 4.2 Admin: Partial update design.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission(perm('designs', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDesignDto,
    @Req() req: Request,
  ) {
    const data = await this.designsService.update(id, dto, req.body);
    return {
      success: true,
      data,
    };
  }

  /**
   * 4.3 Admin: Hard delete design.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission(perm('designs', 'DELETE'))
  async remove(@Param('id') id: string) {
    const data = await this.designsService.remove(id);
    return {
      success: true,
      data,
    };
  }
}
