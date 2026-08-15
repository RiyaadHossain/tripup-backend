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

import { TeamMembersService } from '../services/team-members.service';

import { CreateTeamMemberDto } from '../dto/create-team-member.dto';
import { UpdateTeamMemberDto } from '../dto/update-team-member.dto';
import { QueryTeamMembersDto } from '../dto/query-team-members.dto';
import { BulkDeleteTeamMembersDto } from '../dto/bulk-delete-team-members.dto';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('admin/team-members')
export class AdminTeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @Post()
  @Permission(perm('team_members', 'CREATE'))
  async create(@Body() dto: CreateTeamMemberDto, @CurrentUser('sub') userId: string) {
    return this.service.create(dto, userId);
  }

  @Get()
  @Permission(perm('team_members', 'READ'))
  async findAll(@Query() query: QueryTeamMembersDto) {
    return this.service.findAll(query);
  }

  @Patch(':id')
  @Permission(perm('team_members', 'UPDATE'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @Permission(perm('team_members', 'DELETE'))
  async remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.remove(id, userId);
  }

  @Delete()
  @Permission(perm('team_members', 'DELETE'))
  async removeMany(
    @Body() dto: BulkDeleteTeamMembersDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.removeMany(dto.ids, userId);
  }
}
