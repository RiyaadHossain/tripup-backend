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

import { TeamMembersService } from '../services/team-members.service';

import { CreateTeamMemberDto } from '../dto/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { QueryTeamMembersDto } from '../dto/query-team-members.dto';
import { BulkDeleteTeamMembersDto } from '../dto/bulk-delete-team-members.dto';

@Controller('admin/team-members')
export class AdminTeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @Post()
  async create(@Body() dto: CreateTeamMemberDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  async findAll(@Query() query: QueryTeamMembersDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Delete()
  async removeMany(@Body() dto: BulkDeleteTeamMembersDto) {
    return this.service.removeMany(dto.ids);
  }
}
