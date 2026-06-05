import { Controller, Get, Param, Query } from '@nestjs/common';
import { CaseStudyService } from '../services/case-study.service';
import { QueryCaseStudiesDto } from '../dto/query-case-studies.dto';

@Controller('case-studies')
export class PublicCaseStudiesController {
  constructor(private readonly service: CaseStudyService) {}

  @Get()
  async findAll(@Query() query: QueryCaseStudiesDto) {
    return this.service.findAll({
      ...query,
      isPublished: 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }
}
