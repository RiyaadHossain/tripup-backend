import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaybookService } from '../services/playbooks.service';
import { QueryPlaybooksDto } from '../dto/query-playbooks.dto';

@Controller('playbooks')
export class PublicPlaybooksController {
  constructor(private readonly service: PlaybookService) {}

  @Get()
  async findAll(@Query() query: QueryPlaybooksDto) {
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
