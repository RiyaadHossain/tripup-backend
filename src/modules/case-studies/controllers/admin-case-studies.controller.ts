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

import { CaseStudyService } from '../services/case-study.service';

import { CreateCaseStudyDto } from '../dto/create-case-study.dto';
import { UpdateCaseStudyDto } from '../dto/update-case-study.dto';
import { QueryCaseStudiesDto } from '../dto/query-case-studies.dto';
import { BulkDeleteCaseStudiesDto } from '../dto/bulk-delete-case-studies.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/case-studies')
export class AdminCaseStudiesController {
  constructor(private readonly service: CaseStudyService) {}

  @Post()
  @Permission(perm('case_studies', 'CREATE'))
  async create(@Body() dto: CreateCaseStudyDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('case_studies', 'READ'))
  async findAll(@Query() query: QueryCaseStudiesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permission(perm('case_studies', 'READ'))
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Patch(':id')
  @Permission(perm('case_studies', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseStudyDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('case_studies', 'DELETE'))
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  @Permission(perm('case_studies', 'DELETE'))
  async removeMany(
    @Body() dto: BulkDeleteCaseStudiesDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
