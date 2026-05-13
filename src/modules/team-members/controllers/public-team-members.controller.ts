import { Controller, Get, Query } from '@nestjs/common';

import { TeamMembersService } from '../services/team-members.service';

import { QueryTeamMembersDto } from '../dto/query-team-members.dto';

@Controller('team-members')
export class PublicTeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @Get()
  async findAll(@Query() query: QueryTeamMembersDto) {
    return this.service.findAll({
      ...query,
      isPublished: 'true',
    });
  }
}
