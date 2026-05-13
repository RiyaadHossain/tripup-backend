import { Module } from '@nestjs/common';
import { PublicTeamMembersController } from './controllers/public-team-members.controller';
import { AdminTeamMembersController } from './controllers/admin-team-members.controller';
import { TeamMembersService } from './services/team-members.service';
import { TeamMembersRepository } from './repositories/team-members.repository';

@Module({
  imports: [],
  controllers: [PublicTeamMembersController, AdminTeamMembersController],
  providers: [TeamMembersService, TeamMembersRepository],
})
export class TeamMembersModule {}
