import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PlaybookTypesService } from '../services/playbook-types.service';
import { CreatePlaybookTypeDto } from '../dto/create-playbook-type.dto';
import { UpdatePlaybookTypeDto } from '../dto/update-playbook-type.dto';

@Controller('admin/playbook-types')
export class AdminPlaybookTypesController {
  constructor(private readonly service: PlaybookTypesService) {}

  @Post()
  async create(@Body() dto: CreatePlaybookTypeDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('listing')
  async findListing() {
    return this.service.findListing();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
