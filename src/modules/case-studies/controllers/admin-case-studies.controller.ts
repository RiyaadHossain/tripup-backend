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

import { CaseStudyService } from '../services/case-study.service';

import { CreateCaseStudyDto } from '../dto/create-case-study.dto';
import { UpdateCaseStudyDto } from '../dto/update-case-study.dto';
import { QueryCaseStudiesDto } from '../dto/query-case-studies.dto';
import { BulkDeleteCaseStudiesDto } from '../dto/bulk-delete-case-studies.dto';

@Controller('admin/case-studies')
export class AdminCaseStudiesController {
  constructor(private readonly service: CaseStudyService) {}

  @Post()
  async create(@Body() dto: CreateCaseStudyDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryCaseStudiesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCaseStudyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  async removeMany(@Body() dto: BulkDeleteCaseStudiesDto) {
    return this.service.removeMany(dto.ids);
  }
}
