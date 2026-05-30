import { Module } from '@nestjs/common';
import { PublicTeamMembersController } from './controllers/public-team-members.controller';
import { AdminTeamMembersController } from './controllers/admin-team-members.controller';
import { TeamMembersService } from './services/team-members.service';

@Module({
  imports: [],
  controllers: [PublicTeamMembersController, AdminTeamMembersController],
  providers: [TeamMembersService],
})
export class TeamMembersModule {}
