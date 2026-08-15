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

import { CaseStudyCategoriesService } from '../services/case-study-categories.service';
import { CreateCaseStudyCategoryDto } from '../dto/create-case-study-category.dto';
import { UpdateCaseStudyCategoryDto } from '../dto/update-case-study-category.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/case-study-categories')
export class AdminCaseStudyCategoriesController {
  constructor(private readonly service: CaseStudyCategoriesService) {}

  @Post()
  @Permission(perm('case_studies', 'CREATE'))
  async create(@Body() dto: CreateCaseStudyCategoryDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('case_studies', 'READ'))
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  @Permission(perm('case_studies', 'READ'))
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  @Permission(perm('case_studies', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStudyCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('case_studies', 'DELETE'))
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.service.remove(id, userId);
  }
}
