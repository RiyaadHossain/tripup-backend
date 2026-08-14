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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { PlaybookService } from '../services/playbooks.service';

import { CreatePlaybookDto } from '../dto/create-playbook.dto';
import { UpdatePlaybookDto } from '../dto/update-playbook.dto';
import { QueryPlaybooksDto } from '../dto/query-playbooks.dto';
import { BulkDeletePlaybooksDto } from '../dto/bulk-delete-playbooks.dto';

@Controller('admin/playbooks')
export class AdminPlaybooksController {
  constructor(private readonly service: PlaybookService) {}

  @Post()
  async create(@Body() dto: CreatePlaybookDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  async findAll(@Query() query: QueryPlaybooksDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOnePublic(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  async removeMany(
    @Body() dto: BulkDeletePlaybooksDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
